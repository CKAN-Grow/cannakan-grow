-- Community source promotion rules for Source Directory autocomplete.
-- Tracks per-user custom source usage while keeping curated/verified sources global.

alter table public.source_directory
  add column if not exists distinct_user_count integer not null default 0,
  add column if not exists first_used_at timestamptz,
  add column if not exists last_used_at timestamptz,
  add column if not exists needs_admin_review boolean not null default false,
  add column if not exists review_status text not null default 'none',
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'source_directory_review_status_check'
  ) then
    alter table public.source_directory
      add constraint source_directory_review_status_check
      check (review_status in ('none', 'pending', 'promoted', 'dismissed'));
  end if;
end;
$$;

create table if not exists public.source_directory_user_usage (
  source_directory_id uuid not null references public.source_directory(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_count integer not null default 0,
  first_used_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  primary key (source_directory_id, user_id)
);

create index if not exists source_directory_user_usage_user_idx
  on public.source_directory_user_usage (user_id, last_used_at desc);

create index if not exists source_directory_user_usage_source_idx
  on public.source_directory_user_usage (source_directory_id);

create index if not exists source_directory_review_queue_idx
  on public.source_directory (needs_admin_review, distinct_user_count desc, usage_count desc, name)
  where active = true and verified = false and source_type = 'community';

alter table public.source_directory_user_usage enable row level security;

drop policy if exists "Users can read their own source directory usage"
  on public.source_directory_user_usage;

create policy "Users can read their own source directory usage"
  on public.source_directory_user_usage
  for select
  to authenticated
  using (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists "Authenticated users can view active source directory rows"
  on public.source_directory;

drop policy if exists "Authenticated users can view visible source directory rows"
  on public.source_directory;

create policy "Authenticated users can view visible source directory rows"
  on public.source_directory
  for select
  to authenticated
  using (
    active = true
    and (
      verified = true
      or coalesce(source_type, 'other') <> 'community'
      or coalesce(distinct_user_count, 0) >= 3
      or public.current_user_is_admin()
      or exists (
        select 1
        from public.source_directory_user_usage user_usage
        where user_usage.source_directory_id = source_directory.id
          and user_usage.user_id = auth.uid()
      )
    )
  );

create or replace function public.refresh_source_directory_usage_stats(target_source_id uuid)
returns public.source_directory
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_source public.source_directory;
begin
  update public.source_directory source_row
  set
    usage_count = usage_totals.total_usage_count,
    distinct_user_count = usage_totals.distinct_user_count,
    first_used_at = usage_totals.first_used_at,
    last_used_at = usage_totals.last_used_at,
    needs_admin_review = case
      when source_row.verified then false
      when source_row.source_type = 'community' and usage_totals.distinct_user_count >= 5 then true
      else false
    end,
    review_status = case
      when source_row.verified then 'promoted'
      when source_row.source_type = 'community'
        and usage_totals.distinct_user_count >= 5
        and coalesce(source_row.review_status, 'none') in ('none', 'dismissed')
        then 'pending'
      when source_row.source_type = 'community'
        and usage_totals.distinct_user_count < 5
        and coalesce(source_row.review_status, 'none') = 'pending'
        then 'none'
      else coalesce(source_row.review_status, 'none')
    end,
    updated_at = now()
  from (
    select
      count(*)::integer as distinct_user_count,
      coalesce(sum(user_usage.usage_count), 0)::integer as total_usage_count,
      min(user_usage.first_used_at) as first_used_at,
      max(user_usage.last_used_at) as last_used_at
    from public.source_directory_user_usage user_usage
    where user_usage.source_directory_id = target_source_id
  ) usage_totals
  where source_row.id = target_source_id
  returning source_row.* into saved_source;

  return saved_source;
end;
$$;

revoke all on function public.refresh_source_directory_usage_stats(uuid) from public;

create or replace function public.record_source_directory_usage(source_name text)
returns public.source_directory
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned_name text := regexp_replace(btrim(coalesce(source_name, '')), '\s+', ' ', 'g');
  actor_id uuid := auth.uid();
  saved_source public.source_directory;
begin
  if cleaned_name = '' then
    return null;
  end if;

  if actor_id is null then
    raise exception 'Authentication is required to record source usage.' using errcode = '42501';
  end if;

  insert into public.source_directory (
    name,
    aliases,
    source_type,
    verified,
    active,
    usage_count,
    distinct_user_count,
    first_used_at,
    last_used_at
  )
  values (
    cleaned_name,
    '{}',
    'community',
    false,
    true,
    1,
    1,
    now(),
    now()
  )
  on conflict (normalized_name) do update
  set
    name = case
      when public.source_directory.verified then public.source_directory.name
      else excluded.name
    end,
    source_type = case
      when public.source_directory.verified then public.source_directory.source_type
      when coalesce(public.source_directory.source_type, '') in ('', 'other') then 'community'
      else public.source_directory.source_type
    end,
    active = case
      when public.source_directory.verified then public.source_directory.active
      else true
    end,
    updated_at = now()
  returning * into saved_source;

  insert into public.source_directory_user_usage (
    source_directory_id,
    user_id,
    usage_count,
    first_used_at,
    last_used_at
  )
  values (
    saved_source.id,
    actor_id,
    1,
    now(),
    now()
  )
  on conflict (source_directory_id, user_id) do update
  set
    usage_count = public.source_directory_user_usage.usage_count + 1,
    last_used_at = now();

  return public.refresh_source_directory_usage_stats(saved_source.id);
end;
$$;

revoke all on function public.record_source_directory_usage(text) from public;
grant execute on function public.record_source_directory_usage(text) to authenticated;

create or replace function public.review_source_directory_community_source(
  target_source_id uuid,
  promote boolean
)
returns public.source_directory
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_source public.source_directory;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access is required to review community sources.' using errcode = '42501';
  end if;

  if promote then
    update public.source_directory
    set
      verified = true,
      active = true,
      needs_admin_review = false,
      review_status = 'promoted',
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      updated_at = now()
    where id = target_source_id
      and source_type = 'community'
    returning * into saved_source;
  else
    update public.source_directory
    set
      needs_admin_review = false,
      review_status = 'dismissed',
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      updated_at = now()
    where id = target_source_id
      and source_type = 'community'
      and verified = false
    returning * into saved_source;
  end if;

  if saved_source.id is null then
    raise exception 'Community source not found.' using errcode = 'P0002';
  end if;

  return saved_source;
end;
$$;

revoke all on function public.review_source_directory_community_source(uuid, boolean) from public;
grant execute on function public.review_source_directory_community_source(uuid, boolean) to authenticated;

update public.source_directory
set
  source_type = 'community',
  active = true
where verified = false
  and source_type = 'other'
  and coalesce(usage_count, 0) > 0;

update public.source_directory
set
  distinct_user_count = greatest(distinct_user_count, case when coalesce(usage_count, 0) > 0 then 1 else 0 end),
  first_used_at = coalesce(first_used_at, case when coalesce(usage_count, 0) > 0 then created_at else null end),
  last_used_at = coalesce(last_used_at, case when coalesce(usage_count, 0) > 0 then updated_at else null end),
  needs_admin_review = case
    when verified then false
    when source_type = 'community' and distinct_user_count >= 5 then true
    else needs_admin_review
  end,
  review_status = case
    when verified and review_status = 'none' then 'promoted'
    when source_type = 'community' and distinct_user_count >= 5 and review_status in ('none', 'dismissed') then 'pending'
    else review_status
  end;

revoke all on public.source_directory_user_usage from anon;
grant usage on schema public to authenticated;
grant select on public.source_directory to authenticated;
grant select on public.source_directory_user_usage to authenticated;

notify pgrst, 'reload schema';
