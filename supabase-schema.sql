create extension if not exists pgcrypto;

create table if not exists public.grow_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time text not null,
  system_type text not null,
  unit_id text not null,
  session_name text not null,
  custom_session_name text default '',
  session_notes text default '',
  session_images jsonb not null default '[]'::jsonb,
  snapshot_state jsonb not null default '{}'::jsonb,
  session_status text default '',
  germination_started_at timestamptz,
  first_planted_at timestamptz,
  completed_at timestamptz,
  partitions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default '',
  email text default '',
  avatar_url text default '',
  avatar_path text default '',
  account_status text not null default 'active',
  last_active_at timestamptz,
  deletion_requested_at timestamptz,
  deletion_scheduled_for timestamptz,
  deletion_status text default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notify_snapshot boolean not null default true,
  notify_completion boolean not null default true,
  notify_follow boolean not null default true,
  notify_like boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text not null default '',
  issue_type text not null default 'Other',
  message text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text default '',
  logo_path text default '',
  website_url text default '',
  description text default '',
  contact_name text default '',
  contact_email text default '',
  notes text default '',
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text default '',
  body text default '',
  image_url text default '',
  image_path text default '',
  caption text default '',
  instagram_post_url text default '',
  button_text text default 'View on Instagram →',
  status text not null default 'inactive',
  publish_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.grow_gallery_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid references public.grow_sessions(id) on delete cascade,
  snapshot_title text not null,
  snapshot_image_url text not null,
  snapshot_image_path text not null default '',
  image_hash text,
  session_date date,
  system_type text not null default 'KAN',
  success_percent integer not null default 0,
  submitted_by text default '',
  include_profile_in_gallery boolean not null default false,
  submitted_profile_name text default '',
  submitted_profile_avatar_url text default '',
  usage_consent boolean not null default false,
  status text not null default 'private',
  is_published boolean not null default true,
  include_notes boolean not null default false,
  published_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.grow_gallery_snapshot_likes (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.grow_gallery_snapshots(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.grow_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

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

create table if not exists public.site_analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text,
  page text,
  session_id text,
  created_at timestamptz default timezone('utc', now())
);

alter table public.site_analytics_events
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.site_analytics_events
  add column if not exists event_type text;

alter table public.site_analytics_events
  add column if not exists page text;

alter table public.site_analytics_events
  add column if not exists session_id text;

alter table public.site_analytics_events
  add column if not exists created_at timestamptz default timezone('utc', now());

create unique index if not exists grow_gallery_snapshots_user_session_idx
  on public.grow_gallery_snapshots (user_id, session_id)
  where session_id is not null;

create index if not exists grow_gallery_snapshots_image_hash_idx
  on public.grow_gallery_snapshots (image_hash);

create index if not exists admin_reports_created_at_idx
  on public.admin_reports (created_at desc);

create index if not exists admin_reports_status_created_at_idx
  on public.admin_reports (status, created_at desc);

create unique index if not exists sources_name_lower_idx
  on public.sources (lower(name));

create unique index if not exists grow_gallery_snapshot_likes_snapshot_user_idx
  on public.grow_gallery_snapshot_likes (snapshot_id, user_id);

create index if not exists grow_gallery_snapshot_likes_snapshot_idx
  on public.grow_gallery_snapshot_likes (snapshot_id, created_at desc);

create unique index if not exists grow_follows_follower_following_idx
  on public.grow_follows (follower_id, following_id);

create index if not exists grow_follows_following_created_idx
  on public.grow_follows (following_id, created_at desc);

create index if not exists grow_follows_follower_created_idx
  on public.grow_follows (follower_id, created_at desc);

create unique index if not exists community_activity_user_type_session_snapshot_idx
  on public.community_activity (user_id, activity_type, session_id, snapshot_id);

create index if not exists community_activity_visibility_created_idx
  on public.community_activity (visibility, created_at desc);

create index if not exists community_activity_user_visibility_created_idx
  on public.community_activity (user_id, visibility, created_at desc);

create index if not exists site_analytics_events_created_at_idx
  on public.site_analytics_events (created_at desc);

create index if not exists site_analytics_events_event_type_created_at_idx
  on public.site_analytics_events (event_type, created_at desc);

create index if not exists site_analytics_events_page_created_at_idx
  on public.site_analytics_events (page, created_at desc);

create index if not exists site_analytics_events_session_idx
  on public.site_analytics_events (session_id, created_at desc);

create index if not exists site_analytics_events_user_idx
  on public.site_analytics_events (user_id, created_at desc);

alter table public.profiles
  add column if not exists username text not null default '';

alter table public.profiles
  add column if not exists deletion_requested_at timestamptz;

alter table public.profiles
  add column if not exists deletion_scheduled_for timestamptz;

alter table public.profiles
  add column if not exists deletion_status text default '';

alter table public.profiles
  add column if not exists email text default '';

alter table public.profiles
  add column if not exists avatar_url text default '';

alter table public.profiles
  add column if not exists avatar_path text default '';

alter table public.profiles
  add column if not exists account_status text not null default 'active';

alter table public.profiles
  add column if not exists last_active_at timestamptz;

alter table public.profiles
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.profiles
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create index if not exists grow_sessions_user_created_idx
  on public.grow_sessions (user_id, created_at desc);

create index if not exists profiles_account_status_idx
  on public.profiles (account_status, created_at desc);

create index if not exists profiles_last_active_idx
  on public.profiles (last_active_at desc);

alter table public.user_notification_preferences
  add column if not exists notify_snapshot boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_completion boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_follow boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_like boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.user_notification_preferences
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.announcements
  add column if not exists title text default '';

alter table public.announcements
  add column if not exists body text default '';

alter table public.announcements
  add column if not exists button_text text default 'View on Instagram →';

alter table public.announcements
  add column if not exists publish_at timestamptz not null default timezone('utc', now());

alter table public.announcements
  add column if not exists expires_at timestamptz;

update public.announcements
set body = caption
where coalesce(body, '') = ''
  and coalesce(caption, '') <> '';

create index if not exists announcements_status_publish_updated_idx
  on public.announcements (status, publish_at desc, updated_at desc, created_at desc);

alter table public.grow_sessions
  add column if not exists session_images jsonb not null default '[]'::jsonb;

alter table public.grow_sessions
  add column if not exists snapshot_state jsonb not null default '{}'::jsonb;

alter table public.grow_gallery_snapshots
  add column if not exists submitted_by text default '';

alter table public.grow_gallery_snapshots
  add column if not exists include_profile_in_gallery boolean not null default false;

alter table public.grow_gallery_snapshots
  add column if not exists submitted_profile_name text default '';

alter table public.grow_gallery_snapshots
  add column if not exists submitted_profile_avatar_url text default '';

alter table public.grow_gallery_snapshots
  add column if not exists usage_consent boolean not null default false;

alter table public.grow_gallery_snapshots
  add column if not exists status text not null default 'private';

alter table public.grow_gallery_snapshots
  add column if not exists unit_id text default '';

alter table public.grow_gallery_snapshots
  add column if not exists total_seeds integer not null default 0;

alter table public.grow_gallery_snapshots
  add column if not exists total_planted integer not null default 0;

alter table public.grow_gallery_snapshots
  add column if not exists source_id uuid references public.sources(id) on delete set null;

alter table public.grow_gallery_snapshots
  add column if not exists source_name text default '';

alter table public.grow_gallery_snapshots
  add column if not exists source_logo_url text default '';

alter table public.grow_gallery_snapshots
  add column if not exists seed_variety_name text default '';

alter table public.grow_gallery_snapshots
  add column if not exists image_hash text;

update public.grow_gallery_snapshots
set status = case
  when coalesce(is_published, false) then 'approved'
  else 'private'
end
where status is null or status = '' or status = 'private';

create or replace function public.find_duplicate_grow_gallery_snapshot_by_hash(candidate_hash text, candidate_session_id uuid default null)
returns table (
  id uuid,
  status text,
  session_id uuid
)
language sql
security definer
set search_path = public
as $$
  select
    grow_gallery_snapshots.id,
    grow_gallery_snapshots.status,
    grow_gallery_snapshots.session_id
  from public.grow_gallery_snapshots
  where coalesce(candidate_hash, '') <> ''
    and grow_gallery_snapshots.image_hash = candidate_hash
    and grow_gallery_snapshots.status in ('pending_review', 'approved')
    and (
      candidate_session_id is null
      or grow_gallery_snapshots.session_id is distinct from candidate_session_id
    )
  order by grow_gallery_snapshots.created_at desc
  limit 1;
$$;

revoke all on function public.find_duplicate_grow_gallery_snapshot_by_hash(text, uuid) from public;
grant execute on function public.find_duplicate_grow_gallery_snapshot_by_hash(text, uuid) to authenticated;

create or replace view public.public_member_profiles as
select
  profiles.id,
  nullif(btrim(profiles.username), '') as display_name,
  coalesce(profiles.avatar_url, '') as avatar_url,
  profiles.created_at as joined_at
from public.profiles
where coalesce(profiles.account_status, 'active') = 'active'
  and coalesce(profiles.deletion_status, '') <> 'deleted'
  and nullif(btrim(profiles.username), '') is not null;

revoke all on table public.public_member_profiles from public;
grant select on table public.public_member_profiles to anon;
grant select on table public.public_member_profiles to authenticated;

create or replace function public.get_public_member_follow_summary(target_user_id uuid)
returns table (
  follower_count bigint,
  following_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (
      select count(*)::bigint
      from public.grow_follows
      inner join public.public_member_profiles
        on public_member_profiles.id = grow_follows.follower_id
      where grow_follows.following_id = target_user_id
    ) as follower_count,
    (
      select count(*)::bigint
      from public.grow_follows
      inner join public.public_member_profiles
        on public_member_profiles.id = grow_follows.following_id
      where grow_follows.follower_id = target_user_id
    ) as following_count;
$$;

revoke all on function public.get_public_member_follow_summary(uuid) from public;
grant execute on function public.get_public_member_follow_summary(uuid) to anon;
grant execute on function public.get_public_member_follow_summary(uuid) to authenticated;

create or replace function public.get_public_member_follow_summaries(target_user_ids uuid[])
returns table (
  user_id uuid,
  follower_count bigint,
  following_count bigint
)
language sql
security definer
set search_path = public
as $$
  with requested_users as (
    select distinct unnest(coalesce(target_user_ids, '{}'::uuid[])) as user_id
  )
  select
    requested_users.user_id,
    coalesce(follower_counts.follower_count, 0)::bigint as follower_count,
    coalesce(following_counts.following_count, 0)::bigint as following_count
  from requested_users
  left join (
    select
      grow_follows.following_id as user_id,
      count(*)::bigint as follower_count
    from public.grow_follows
    inner join public.public_member_profiles
      on public_member_profiles.id = grow_follows.follower_id
    where grow_follows.following_id = any (coalesce(target_user_ids, '{}'::uuid[]))
    group by grow_follows.following_id
  ) as follower_counts
    on follower_counts.user_id = requested_users.user_id
  left join (
    select
      grow_follows.follower_id as user_id,
      count(*)::bigint as following_count
    from public.grow_follows
    inner join public.public_member_profiles
      on public_member_profiles.id = grow_follows.following_id
    where grow_follows.follower_id = any (coalesce(target_user_ids, '{}'::uuid[]))
    group by grow_follows.follower_id
  ) as following_counts
    on following_counts.user_id = requested_users.user_id;
$$;

revoke all on function public.get_public_member_follow_summaries(uuid[]) from public;
grant execute on function public.get_public_member_follow_summaries(uuid[]) to anon;
grant execute on function public.get_public_member_follow_summaries(uuid[]) to authenticated;

create or replace function public.get_public_member_follow_members(target_user_id uuid, relationship_type text default 'followers')
returns table (
  member_id uuid,
  display_name text,
  avatar_url text,
  joined_at timestamptz,
  relationship_type text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  with normalized_relationship as (
    select case
      when lower(coalesce(relationship_type, '')) = 'following' then 'following'
      else 'followers'
    end as relationship_type
  ),
  requested_members as (
    select
      case
        when normalized_relationship.relationship_type = 'following' then grow_follows.following_id
        else grow_follows.follower_id
      end as member_id,
      normalized_relationship.relationship_type,
      grow_follows.created_at
    from public.grow_follows
    cross join normalized_relationship
    where (
      normalized_relationship.relationship_type = 'following'
      and grow_follows.follower_id = target_user_id
    ) or (
      normalized_relationship.relationship_type = 'followers'
      and grow_follows.following_id = target_user_id
    )
  )
  select
    requested_members.member_id,
    public_member_profiles.display_name,
    public_member_profiles.avatar_url,
    public_member_profiles.joined_at,
    requested_members.relationship_type,
    requested_members.created_at
  from requested_members
  inner join public.public_member_profiles
    on public_member_profiles.id = requested_members.member_id
  order by requested_members.created_at desc, lower(public_member_profiles.display_name) asc;
$$;

revoke all on function public.get_public_member_follow_members(uuid, text) from public;
grant execute on function public.get_public_member_follow_members(uuid, text) to anon;
grant execute on function public.get_public_member_follow_members(uuid, text) to authenticated;

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

create or replace function public.set_grow_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_user_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_sources_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_announcements_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_grow_gallery_snapshots_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists grow_sessions_set_updated_at on public.grow_sessions;
create trigger grow_sessions_set_updated_at
before update on public.grow_sessions
for each row
execute procedure public.set_grow_sessions_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_profiles_updated_at();

drop trigger if exists user_notification_preferences_set_updated_at on public.user_notification_preferences;
create trigger user_notification_preferences_set_updated_at
before update on public.user_notification_preferences
for each row
execute procedure public.set_user_notification_preferences_updated_at();

drop trigger if exists sources_set_updated_at on public.sources;
create trigger sources_set_updated_at
before update on public.sources
for each row
execute procedure public.set_sources_updated_at();

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
before update on public.announcements
for each row
execute procedure public.set_announcements_updated_at();

drop trigger if exists grow_gallery_snapshots_set_updated_at on public.grow_gallery_snapshots;
create trigger grow_gallery_snapshots_set_updated_at
before update on public.grow_gallery_snapshots
for each row
execute procedure public.set_grow_gallery_snapshots_updated_at();

alter table public.grow_sessions enable row level security;
alter table public.profiles enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.admin_users enable row level security;
alter table public.admin_reports enable row level security;
alter table public.sources enable row level security;
alter table public.announcements enable row level security;
alter table public.grow_gallery_snapshots enable row level security;
alter table public.grow_gallery_snapshot_likes enable row level security;
alter table public.grow_follows enable row level security;
alter table public.community_activity enable row level security;
alter table public.site_analytics_events enable row level security;

drop policy if exists "Users can view their own grow sessions" on public.grow_sessions;
create policy "Users can view their own grow sessions"
on public.grow_sessions
for select
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own grow sessions" on public.grow_sessions;
create policy "Users can create their own grow sessions"
on public.grow_sessions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own grow sessions" on public.grow_sessions;
create policy "Users can update their own grow sessions"
on public.grow_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own grow sessions" on public.grow_sessions;
create policy "Users can delete their own grow sessions"
on public.grow_sessions
for delete
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
on public.profiles
for select
using (
  auth.uid() = id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (
  auth.uid() = id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  auth.uid() = id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles
for delete
using (
  auth.uid() = id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can view their own notification preferences" on public.user_notification_preferences;
create policy "Users can view their own notification preferences"
on public.user_notification_preferences
for select
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own notification preferences" on public.user_notification_preferences;
create policy "Users can create their own notification preferences"
on public.user_notification_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notification preferences" on public.user_notification_preferences;
create policy "Users can update their own notification preferences"
on public.user_notification_preferences
for update
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can view their own admin membership" on public.admin_users;
create policy "Users can view their own admin membership"
on public.admin_users
for select
to authenticated
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
);

drop policy if exists "Anyone can insert admin reports" on public.admin_reports;
create policy "Anyone can insert admin reports"
on public.admin_reports
for insert
to anon, authenticated
with check (
  user_id is null
  or auth.uid() = user_id
);

drop policy if exists "Admins can read admin reports" on public.admin_reports;
create policy "Admins can read admin reports"
on public.admin_reports
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update admin reports" on public.admin_reports;
create policy "Admins can update admin reports"
on public.admin_reports
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can insert site analytics events" on public.site_analytics_events;
create policy "Anyone can insert site analytics events"
on public.site_analytics_events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Admins can read site analytics events" on public.site_analytics_events;
create policy "Admins can read site analytics events"
on public.site_analytics_events
for select
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can view active sources" on public.sources;
create policy "Anyone can view active sources"
on public.sources
for select
using (
  status = 'active'
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can create sources" on public.sources;
create policy "Admins can create sources"
on public.sources
for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update sources" on public.sources;
create policy "Admins can update sources"
on public.sources
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete sources" on public.sources;
create policy "Admins can delete sources"
on public.sources
for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can view active announcements" on public.announcements;
create policy "Anyone can view active announcements"
on public.announcements
for select
using (
  (
    status = 'active'
    and coalesce(publish_at, created_at, updated_at) <= timezone('utc', now())
    and (
      expires_at is null
      or expires_at > timezone('utc', now())
    )
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can create announcements" on public.announcements;
create policy "Admins can create announcements"
on public.announcements
for insert
to authenticated
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update announcements" on public.announcements;
create policy "Admins can update announcements"
on public.announcements
for update
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Admins can delete announcements" on public.announcements;
create policy "Admins can delete announcements"
on public.announcements
for delete
to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Anyone can view published gallery snapshots" on public.grow_gallery_snapshots;
create policy "Anyone can view published gallery snapshots"
on public.grow_gallery_snapshots
for select
using (
  status = 'approved'
  or auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can create their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can create their own gallery snapshots"
on public.grow_gallery_snapshots
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can update their own gallery snapshots"
on public.grow_gallery_snapshots
for update
to authenticated
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete their own gallery snapshots" on public.grow_gallery_snapshots;
create policy "Users can delete their own gallery snapshots"
on public.grow_gallery_snapshots
for delete
to authenticated
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Visible grow gallery likes can be read" on public.grow_gallery_snapshot_likes;
create policy "Visible grow gallery likes can be read"
on public.grow_gallery_snapshot_likes
for select
using (
  exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = snapshot_id
      and (
        grow_gallery_snapshots.status = 'approved'
        or auth.uid() = grow_gallery_snapshots.user_id
        or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
        or exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "Users can like visible gallery snapshots" on public.grow_gallery_snapshot_likes;
create policy "Users can like visible gallery snapshots"
on public.grow_gallery_snapshot_likes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = snapshot_id
      and (
        grow_gallery_snapshots.status = 'approved'
        or auth.uid() = grow_gallery_snapshots.user_id
        or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
        or exists (
          select 1
          from public.admin_users
          where admin_users.user_id = auth.uid()
        )
      )
  )
);

drop policy if exists "Users can remove their own gallery likes" on public.grow_gallery_snapshot_likes;
create policy "Users can remove their own gallery likes"
on public.grow_gallery_snapshot_likes
for delete
to authenticated
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can view their own follow relationships" on public.grow_follows;
create policy "Users can view their own follow relationships"
on public.grow_follows
for select
to authenticated
using (
  auth.uid() = follower_id
  or auth.uid() = following_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "Users can follow other members" on public.grow_follows;
create policy "Users can follow other members"
on public.grow_follows
for insert
to authenticated
with check (
  auth.uid() = follower_id
  and follower_id is distinct from following_id
);

drop policy if exists "Users can unfollow members" on public.grow_follows;
create policy "Users can unfollow members"
on public.grow_follows
for delete
to authenticated
using (
  auth.uid() = follower_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

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

-- Keep this email allowlist in sync with ADMIN_EMAILS in app.js before production.

insert into storage.buckets (id, name, public)
values ('session-images', 'session-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('grow-gallery', 'grow-gallery', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('source-logos', 'source-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('announcements', 'announcements', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can read session images" on storage.objects;
create policy "Authenticated users can read session images"
on storage.objects
for select
to authenticated
using (bucket_id = 'session-images');

drop policy if exists "Authenticated users can upload their own session images" on storage.objects;
create policy "Authenticated users can upload their own session images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'session-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update their own session images" on storage.objects;
create policy "Authenticated users can update their own session images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'session-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'session-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete their own session images" on storage.objects;
create policy "Authenticated users can delete their own session images"
on storage.objects
for delete
to authenticated
using (
  (
    bucket_id = 'session-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  or (
    bucket_id = 'session-images'
    and (
      lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
      or exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Authenticated users can read profile avatars" on storage.objects;
create policy "Authenticated users can read profile avatars"
on storage.objects
for select
to authenticated
using (bucket_id = 'profile-avatars');

drop policy if exists "Authenticated users can upload their own profile avatars" on storage.objects;
create policy "Authenticated users can upload their own profile avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update their own profile avatars" on storage.objects;
create policy "Authenticated users can update their own profile avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete their own profile avatars" on storage.objects;
create policy "Authenticated users can delete their own profile avatars"
on storage.objects
for delete
to authenticated
using (
  (
    bucket_id = 'profile-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  or (
    bucket_id = 'profile-avatars'
    and (
      lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
      or exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Anyone can read grow gallery images" on storage.objects;
create policy "Anyone can read grow gallery images"
on storage.objects
for select
using (bucket_id = 'grow-gallery');

drop policy if exists "Anyone can read source logos" on storage.objects;
create policy "Anyone can read source logos"
on storage.objects
for select
using (bucket_id = 'source-logos');

drop policy if exists "Anyone can read announcement images" on storage.objects;
create policy "Anyone can read announcement images"
on storage.objects
for select
using (bucket_id = 'announcements');

drop policy if exists "Authenticated users can upload their own grow gallery images" on storage.objects;
create policy "Authenticated users can upload their own grow gallery images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'grow-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update their own grow gallery images" on storage.objects;
create policy "Authenticated users can update their own grow gallery images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'grow-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'grow-gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete their own grow gallery images" on storage.objects;
create policy "Authenticated users can delete their own grow gallery images"
on storage.objects
for delete
to authenticated
using (
  (
    bucket_id = 'grow-gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  or (
    bucket_id = 'grow-gallery'
    and (
      lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
      or exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
      )
    )
  )
);

drop policy if exists "Admins can upload source logos" on storage.objects;
create policy "Admins can upload source logos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'source-logos'
  and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
);

drop policy if exists "Admins can update source logos" on storage.objects;
create policy "Admins can update source logos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'source-logos'
  and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
)
with check (
  bucket_id = 'source-logos'
  and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
);

drop policy if exists "Admins can delete source logos" on storage.objects;
create policy "Admins can delete source logos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'source-logos'
  and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
);

drop policy if exists "Admins can upload announcement images" on storage.objects;
create policy "Admins can upload announcement images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'announcements'
  and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
);

drop policy if exists "Admins can update announcement images" on storage.objects;
create policy "Admins can update announcement images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'announcements'
  and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
)
with check (
  bucket_id = 'announcements'
  and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
);

drop policy if exists "Admins can delete announcement images" on storage.objects;
create policy "Admins can delete announcement images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'announcements'
  and (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
);
