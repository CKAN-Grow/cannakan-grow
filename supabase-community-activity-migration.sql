create extension if not exists pgcrypto;

create table if not exists public.community_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  session_id text not null default '',
  snapshot_id text not null default '',
  title text default '',
  summary text default '',
  metadata jsonb not null default '{}'::jsonb,
  visibility text not null default 'public',
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists community_activity_user_type_session_snapshot_idx
  on public.community_activity (user_id, activity_type, session_id, snapshot_id);

create index if not exists community_activity_visibility_created_idx
  on public.community_activity (visibility, created_at desc);

create index if not exists community_activity_user_visibility_created_idx
  on public.community_activity (user_id, visibility, created_at desc);

create or replace function public.record_community_activity(
  activity_user_id uuid,
  activity_type text,
  activity_session_id text default '',
  activity_snapshot_id text default '',
  activity_title text default '',
  activity_summary text default '',
  activity_metadata jsonb default '{}'::jsonb,
  activity_visibility text default 'public'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_activity_type text := lower(coalesce(activity_type, ''));
  normalized_session_id text := coalesce(activity_session_id, '');
  normalized_snapshot_id text := coalesce(activity_snapshot_id, '');
  normalized_visibility text := case
    when lower(coalesce(activity_visibility, 'public')) = 'public' then 'public'
    else 'private'
  end;
  resulting_id uuid;
begin
  if activity_user_id is null or normalized_activity_type = '' then
    return null;
  end if;

  insert into public.community_activity (
    user_id,
    activity_type,
    session_id,
    snapshot_id,
    title,
    summary,
    metadata,
    visibility
  )
  values (
    activity_user_id,
    normalized_activity_type,
    normalized_session_id,
    normalized_snapshot_id,
    coalesce(activity_title, ''),
    coalesce(activity_summary, ''),
    coalesce(activity_metadata, '{}'::jsonb),
    normalized_visibility
  )
  on conflict (user_id, activity_type, session_id, snapshot_id)
  do update set
    title = excluded.title,
    summary = excluded.summary,
    metadata = excluded.metadata,
    visibility = excluded.visibility
  returning id into resulting_id;

  return resulting_id;
end;
$$;

revoke all on function public.record_community_activity(uuid, text, text, text, text, text, jsonb, text) from public;
grant execute on function public.record_community_activity(uuid, text, text, text, text, text, jsonb, text) to authenticated;

create or replace function public.clear_community_activity_for_snapshot(activity_snapshot_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer := 0;
begin
  if nullif(btrim(coalesce(activity_snapshot_id, '')), '') is null then
    return 0;
  end if;

  delete from public.community_activity
  where snapshot_id = activity_snapshot_id;

  get diagnostics deleted_count = row_count;
  return coalesce(deleted_count, 0);
end;
$$;

revoke all on function public.clear_community_activity_for_snapshot(text) from public;
grant execute on function public.clear_community_activity_for_snapshot(text) to authenticated;

create or replace function public.backfill_community_activity_snapshot_posts()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.community_activity (
    user_id,
    activity_type,
    session_id,
    snapshot_id,
    title,
    summary,
    metadata,
    visibility,
    created_at
  )
  select
    grow_gallery_snapshots.user_id,
    'snapshot_posted',
    coalesce(grow_gallery_snapshots.session_id::text, ''),
    grow_gallery_snapshots.id::text,
    coalesce(nullif(btrim(grow_gallery_snapshots.snapshot_title), ''), 'Grow Snapshot'),
    'Approved public Community Grow snapshot.',
    jsonb_build_object(
      'activityTypeLabel', 'New approved Community Grow snapshot',
      'germinationRate', greatest(0, coalesce(grow_gallery_snapshots.success_percent, 0)),
      'germinationRateLabel', concat(greatest(0, coalesce(grow_gallery_snapshots.success_percent, 0))::text, '%'),
      'sourceLabel', coalesce(nullif(btrim(grow_gallery_snapshots.source_name), ''), 'Not shared'),
      'sessionDateLabel', coalesce(
        to_char(grow_gallery_snapshots.session_date::timestamp, 'Mon FMDD, YYYY'),
        to_char(coalesce(grow_gallery_snapshots.published_at, grow_gallery_snapshots.created_at), 'Mon FMDD, YYYY')
      ),
      'systemLabel', case
        when upper(coalesce(grow_gallery_snapshots.system_type, 'KAN')) = 'TRA' then 'TRā™'
        else 'KAN®'
      end
    ),
    'public',
    coalesce(grow_gallery_snapshots.published_at, grow_gallery_snapshots.created_at, timezone('utc', now()))
  from public.grow_gallery_snapshots
  where grow_gallery_snapshots.status = 'approved'
    and coalesce(grow_gallery_snapshots.is_published, false) = true
    and not exists (
      select 1
      from public.community_activity
      where community_activity.snapshot_id = grow_gallery_snapshots.id::text
        and lower(coalesce(community_activity.activity_type, '')) in ('snapshot_posted', 'snapshot_approved')
    );

  get diagnostics inserted_count = row_count;
  return coalesce(inserted_count, 0);
end;
$$;

revoke all on function public.backfill_community_activity_snapshot_posts() from public;

select public.backfill_community_activity_snapshot_posts();

alter table public.community_activity enable row level security;

drop policy if exists "Anyone can view public community activity" on public.community_activity;
create policy "Anyone can view public community activity"
on public.community_activity
for select
using (
  visibility = 'public'
  or auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
