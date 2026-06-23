-- Variety Directory foundation for Seed Vault and session variety autocomplete.
-- Mirrors Source Directory visibility, usage tracking, and community promotion rules.

create extension if not exists pgcrypto;

create table if not exists public.variety_directory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text generated always as (
    lower(regexp_replace(trim(name), '\s+', ' ', 'g'))
  ) stored,
  aliases text[] default '{}',
  source_id uuid references public.source_directory(id) on delete set null,
  source_name text,
  variety_type text default 'unknown',
  verified boolean default false,
  active boolean default true,
  usage_count integer default 0,
  distinct_user_count integer default 0,
  first_used_at timestamptz,
  last_used_at timestamptz,
  needs_admin_review boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists variety_directory_normalized_name_uidx
  on public.variety_directory (normalized_name);

create index if not exists variety_directory_aliases_gin_idx
  on public.variety_directory using gin (aliases);

create index if not exists variety_directory_source_id_idx
  on public.variety_directory (source_id);

create index if not exists variety_directory_active_type_name_idx
  on public.variety_directory (active, variety_type, name);

create index if not exists variety_directory_review_queue_idx
  on public.variety_directory (needs_admin_review, distinct_user_count desc, usage_count desc, name)
  where active = true and verified = false;

create table if not exists public.variety_directory_user_usage (
  variety_directory_id uuid not null references public.variety_directory(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_count integer not null default 0,
  first_used_at timestamptz not null default now(),
  last_used_at timestamptz not null default now(),
  primary key (variety_directory_id, user_id)
);

create index if not exists variety_directory_user_usage_user_idx
  on public.variety_directory_user_usage (user_id, last_used_at desc);

create index if not exists variety_directory_user_usage_variety_idx
  on public.variety_directory_user_usage (variety_directory_id);

create or replace function public.set_variety_directory_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists variety_directory_set_updated_at
  on public.variety_directory;

create trigger variety_directory_set_updated_at
  before update on public.variety_directory
  for each row
  execute function public.set_variety_directory_updated_at();

alter table public.variety_directory enable row level security;
alter table public.variety_directory_user_usage enable row level security;

drop policy if exists "Authenticated users can view visible variety directory rows"
  on public.variety_directory;

create policy "Authenticated users can view visible variety directory rows"
  on public.variety_directory
  for select
  to authenticated
  using (
    active = true
    and (
      verified = true
      or coalesce(distinct_user_count, 0) >= 3
      or public.current_user_is_admin()
      or exists (
        select 1
        from public.variety_directory_user_usage user_usage
        where user_usage.variety_directory_id = variety_directory.id
          and user_usage.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Users can read their own variety directory usage"
  on public.variety_directory_user_usage;

create policy "Users can read their own variety directory usage"
  on public.variety_directory_user_usage
  for select
  to authenticated
  using (user_id = auth.uid() or public.current_user_is_admin());

create or replace function public.refresh_variety_directory_usage_stats(target_variety_id uuid)
returns public.variety_directory
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_variety public.variety_directory;
begin
  update public.variety_directory variety_row
  set
    usage_count = usage_totals.total_usage_count,
    distinct_user_count = usage_totals.distinct_user_count,
    first_used_at = usage_totals.first_used_at,
    last_used_at = usage_totals.last_used_at,
    needs_admin_review = case
      when variety_row.verified then false
      when usage_totals.distinct_user_count >= 5 then true
      else false
    end,
    updated_at = now()
  from (
    select
      count(*)::integer as distinct_user_count,
      coalesce(sum(user_usage.usage_count), 0)::integer as total_usage_count,
      min(user_usage.first_used_at) as first_used_at,
      max(user_usage.last_used_at) as last_used_at
    from public.variety_directory_user_usage user_usage
    where user_usage.variety_directory_id = target_variety_id
  ) usage_totals
  where variety_row.id = target_variety_id
  returning variety_row.* into saved_variety;

  return saved_variety;
end;
$$;

revoke all on function public.refresh_variety_directory_usage_stats(uuid) from public;

create or replace function public.record_variety_directory_usage(
  variety_name text,
  source_name text default null
)
returns public.variety_directory
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned_name text := regexp_replace(btrim(coalesce(variety_name, '')), '\s+', ' ', 'g');
  cleaned_source_name text := nullif(regexp_replace(btrim(coalesce(source_name, '')), '\s+', ' ', 'g'), '');
  actor_id uuid := auth.uid();
  matched_source_id uuid;
  matched_source_name text;
  saved_variety public.variety_directory;
begin
  if cleaned_name = '' then
    return null;
  end if;

  if actor_id is null then
    raise exception 'Authentication is required to record variety usage.' using errcode = '42501';
  end if;

  if cleaned_source_name is not null then
    select source_directory.id, source_directory.name
    into matched_source_id, matched_source_name
    from public.source_directory
    where source_directory.normalized_name = lower(regexp_replace(trim(cleaned_source_name), '\s+', ' ', 'g'))
    limit 1;
  end if;

  insert into public.variety_directory (
    name,
    aliases,
    source_id,
    source_name,
    variety_type,
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
    matched_source_id,
    coalesce(matched_source_name, cleaned_source_name),
    'unknown',
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
      when public.variety_directory.verified then public.variety_directory.name
      else excluded.name
    end,
    source_id = coalesce(public.variety_directory.source_id, excluded.source_id),
    source_name = coalesce(public.variety_directory.source_name, excluded.source_name),
    active = case
      when public.variety_directory.verified then public.variety_directory.active
      else true
    end,
    updated_at = now()
  returning * into saved_variety;

  insert into public.variety_directory_user_usage (
    variety_directory_id,
    user_id,
    usage_count,
    first_used_at,
    last_used_at
  )
  values (
    saved_variety.id,
    actor_id,
    1,
    now(),
    now()
  )
  on conflict (variety_directory_id, user_id) do update
  set
    usage_count = public.variety_directory_user_usage.usage_count + 1,
    last_used_at = now();

  return public.refresh_variety_directory_usage_stats(saved_variety.id);
end;
$$;

revoke all on function public.record_variety_directory_usage(text, text) from public;
grant execute on function public.record_variety_directory_usage(text, text) to authenticated;

create or replace function public.review_variety_directory_community_variety(
  target_variety_id uuid,
  promote boolean
)
returns public.variety_directory
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_variety public.variety_directory;
begin
  if not public.current_user_is_admin() then
    raise exception 'Admin access is required to review community varieties.' using errcode = '42501';
  end if;

  update public.variety_directory
  set
    verified = case when promote then true else verified end,
    active = true,
    needs_admin_review = false,
    updated_at = now()
  where id = target_variety_id
  returning * into saved_variety;

  if saved_variety.id is null then
    raise exception 'Community variety not found.' using errcode = 'P0002';
  end if;

  return saved_variety;
end;
$$;

revoke all on function public.review_variety_directory_community_variety(uuid, boolean) from public;
grant execute on function public.review_variety_directory_community_variety(uuid, boolean) to authenticated;

revoke all on public.variety_directory from anon;
revoke all on public.variety_directory_user_usage from anon;
grant usage on schema public to authenticated;
grant select on public.variety_directory to authenticated;
grant select on public.variety_directory_user_usage to authenticated;

notify pgrst, 'reload schema';
