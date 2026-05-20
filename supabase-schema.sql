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
  session_started_at timestamptz,
  soak_started_at timestamptz,
  germination_started_at timestamptz,
  first_planted_at timestamptz,
  completed_at timestamptz,
  timer_start_at timestamptz,
  seed_age_tracking_enabled boolean not null default false,
  seed_age_mode text,
  session_seed_age_years numeric,
  is_mock boolean not null default false,
  is_test boolean not null default false,
  excluded_from_analytics boolean not null default false,
  analytics_excluded_reason text not null default '',
  analytics_excluded_at timestamptz,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  visibility_status text not null default 'active',
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
  push_notifications_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_notification_preferences
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create table if not exists public.user_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_key text not null,
  endpoint text not null default '',
  subscription jsonb not null default '{}'::jsonb,
  p256dh_key text not null default '',
  auth_key text not null default '',
  permission_state text not null default 'default',
  push_enabled boolean not null default false,
  user_agent text not null default '',
  device_label text not null default '',
  last_seen_at timestamptz,
  last_tested_at timestamptz,
  last_delivery_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_push_subscriptions_user_device_key unique (user_id, device_key)
);

create unique index if not exists user_push_subscriptions_endpoint_unique_idx
  on public.user_push_subscriptions (endpoint)
  where endpoint <> '';

create table if not exists public.push_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  device_key text not null,
  session_id uuid references public.grow_sessions(id) on delete set null,
  category text not null default '',
  endpoint text not null default '',
  status text not null default 'queued',
  notification_payload jsonb not null default '{}'::jsonb,
  failure_code text not null default '',
  failure_reason text not null default '',
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint push_notification_deliveries_user_event_device_key unique (user_id, event_key, device_key)
);

create index if not exists push_notification_deliveries_user_event_idx
  on public.push_notification_deliveries (user_id, event_key, created_at desc);

create table if not exists public.grow_session_reminder_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  reminder_key text not null,
  reminder_type text not null default '',
  category text not null default '',
  event_key text not null default '',
  session_status text not null default '',
  status text not null default 'queued',
  skip_reason text not null default '',
  scheduled_for timestamptz,
  due_at timestamptz,
  sent_at timestamptz,
  postponed_until timestamptz,
  last_evaluated_at timestamptz,
  attempt_count integer not null default 0,
  delivery_count integer not null default 0,
  postpone_count integer not null default 0,
  notification_payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_reminder_events_user_session_key unique (user_id, session_id, reminder_key)
);

create index if not exists grow_session_reminder_events_session_status_idx
  on public.grow_session_reminder_events (session_id, status, due_at desc);

create index if not exists grow_session_reminder_events_user_status_idx
  on public.grow_session_reminder_events (user_id, status, created_at desc);

create table if not exists public.grow_session_cleanup_audit (
  id uuid primary key default gen_random_uuid(),
  action_type text not null default 'founder_test_grow_session_cleanup',
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text not null default '',
  target_user_id uuid references auth.users(id) on delete set null,
  dry_run boolean not null default true,
  confirmation_matched boolean not null default false,
  include_explicit_unmarked boolean not null default false,
  legacy_created_before timestamptz,
  requested_session_ids uuid[] not null default '{}'::uuid[],
  candidate_session_ids uuid[] not null default '{}'::uuid[],
  deleted_counts jsonb not null default '{}'::jsonb,
  reason text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.grow_session_time_edit_audit (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.grow_sessions(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  previous_values jsonb not null default '{}'::jsonb,
  next_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists grow_session_time_edit_audit_session_created_idx
  on public.grow_session_time_edit_audit (session_id, created_at desc);

create index if not exists grow_session_time_edit_audit_actor_created_idx
  on public.grow_session_time_edit_audit (actor_user_id, created_at desc);

create index if not exists grow_session_cleanup_audit_target_created_idx
  on public.grow_session_cleanup_audit (target_user_id, created_at desc);

create index if not exists grow_session_cleanup_audit_actor_created_idx
  on public.grow_session_cleanup_audit (actor_user_id, created_at desc);

-- Replaces the old view-based public_member_profiles surface with a writable table
-- so the app can preserve Community Grow lookups while saving Grow Network settings.
create table if not exists public.public_member_profiles (
  id uuid primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text default '',
  joined_at timestamptz not null default timezone('utc', now()),
  notify_community_activity boolean not null default true,
  show_profile_in_community_grow boolean not null default true,
  allow_followers boolean not null default true,
  show_grow_stats_publicly boolean not null default true,
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
  is_mock boolean not null default false,
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
  seed_age_tracking_enabled boolean not null default false,
  seed_age_mode text,
  session_seed_age_years numeric,
  submitted_by text default '',
  include_profile_in_gallery boolean not null default false,
  submitted_profile_name text default '',
  submitted_profile_avatar_url text default '',
  usage_consent boolean not null default false,
  status text not null default 'private',
  is_published boolean not null default true,
  include_notes boolean not null default false,
  is_mock boolean not null default false,
  analytics_excluded boolean not null default false,
  analytics_excluded_reason text not null default '',
  analytics_excluded_at timestamptz,
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
  is_mock boolean not null default false,
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

alter table public.grow_gallery_snapshots
  add column if not exists image_hash text;

-- Backfill newer columns on legacy tables before any indexes, functions, or
-- policies reference them. `create table if not exists` does not add missing
-- columns on existing databases.
alter table public.admin_reports
  add column if not exists status text not null default 'new';

alter table public.admin_reports
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.sources
  add column if not exists status text not null default 'active';

alter table public.sources
  add column if not exists is_mock boolean not null default false;

alter table public.sources
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.sources
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.announcements
  add column if not exists status text not null default 'inactive';

alter table public.announcements
  add column if not exists caption text default '';

alter table public.announcements
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.announcements
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

alter table public.grow_gallery_snapshots
  add column if not exists status text not null default 'private';

alter table public.grow_gallery_snapshots
  add column if not exists snapshot_title text not null default '';

alter table public.grow_gallery_snapshots
  add column if not exists session_date date;

alter table public.grow_gallery_snapshots
  add column if not exists system_type text not null default 'KAN';

alter table public.grow_gallery_snapshots
  add column if not exists success_percent integer not null default 0;

alter table public.grow_gallery_snapshots
  add column if not exists is_published boolean not null default true;

alter table public.grow_gallery_snapshots
  add column if not exists is_mock boolean not null default false;

alter table public.grow_gallery_snapshots
  add column if not exists published_at timestamptz not null default timezone('utc', now());

alter table public.grow_gallery_snapshots
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.grow_gallery_snapshots
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

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

alter table public.community_activity
  add column if not exists is_mock boolean not null default false;

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

create unique index if not exists public_member_profiles_user_id_idx
  on public.public_member_profiles (user_id);

create index if not exists public_member_profiles_display_name_idx
  on public.public_member_profiles (lower(coalesce(display_name, '')));

alter table public.user_notification_preferences
  add column if not exists notify_snapshot boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_completion boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_follow boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_like boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists push_notifications_enabled boolean not null default false;

alter table public.user_notification_preferences
  add column if not exists email_notifications boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists session_reminders boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists community_updates boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists low_filter_alerts boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists grow_reminders_enabled boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists soaking_reminders boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists germination_reminders boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists snapshot_reminders boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists supply_reminders boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists community_activity_notifications boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists email_notifications_enabled boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists reminder_notifications_enabled boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists marketing_notifications_enabled boolean not null default false;

alter table public.user_notification_preferences
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.user_notification_preferences
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

delete from public.user_notification_preferences existing_preferences
using (
  select duplicate_ctid
  from (
    select
      ctid as duplicate_ctid,
      row_number() over (
        partition by user_id
        order by updated_at desc nulls last, created_at desc nulls last, ctid::text desc
      ) as duplicate_rank
    from public.user_notification_preferences
    where user_id is not null
  ) ranked_preferences
  where duplicate_rank > 1
) duplicate_preferences
where existing_preferences.ctid = duplicate_preferences.duplicate_ctid;

create unique index if not exists user_notification_preferences_user_id_key
  on public.user_notification_preferences (user_id);

alter table public.public_member_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.public_member_profiles
  add column if not exists display_name text;

alter table public.public_member_profiles
  add column if not exists avatar_url text default '';

alter table public.public_member_profiles
  add column if not exists joined_at timestamptz not null default timezone('utc', now());

alter table public.public_member_profiles
  add column if not exists notify_community_activity boolean not null default true;

alter table public.public_member_profiles
  add column if not exists show_profile_in_community_grow boolean not null default true;

alter table public.public_member_profiles
  add column if not exists allow_followers boolean not null default true;

alter table public.public_member_profiles
  add column if not exists show_grow_stats_publicly boolean not null default true;

alter table public.public_member_profiles
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.public_member_profiles
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

alter table public.grow_sessions
  add column if not exists is_deleted boolean not null default false;

alter table public.grow_sessions
  add column if not exists deleted_at timestamptz;

alter table public.grow_sessions
  add column if not exists visibility_status text not null default 'active';

alter table public.grow_sessions
  add column if not exists seed_age_tracking_enabled boolean not null default false;

alter table public.grow_sessions
  add column if not exists seed_age_mode text;

alter table public.grow_sessions
  add column if not exists session_seed_age_years numeric;

alter table public.grow_sessions
  add column if not exists is_mock boolean not null default false;

alter table public.grow_sessions
  add column if not exists is_test boolean not null default false;

alter table public.grow_sessions
  add column if not exists excluded_from_analytics boolean not null default false;

alter table public.grow_sessions
  add column if not exists analytics_excluded_reason text not null default '';

alter table public.grow_sessions
  add column if not exists analytics_excluded_at timestamptz;

alter table public.grow_sessions
  add column if not exists session_started_at timestamptz;

alter table public.grow_sessions
  add column if not exists soak_started_at timestamptz;

alter table public.grow_sessions
  add column if not exists timer_start_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'grow_sessions_owner_time_order_chk'
      and conrelid = 'public.grow_sessions'::regclass
  ) then
    alter table public.grow_sessions
      add constraint grow_sessions_owner_time_order_chk
      check (
        (session_started_at is null or soak_started_at is null or soak_started_at >= session_started_at)
        and (soak_started_at is null or germination_started_at is null or soak_started_at <= germination_started_at)
        and (germination_started_at is null or completed_at is null or germination_started_at <= completed_at)
        and (session_started_at is null or completed_at is null or completed_at >= session_started_at)
      )
      not valid;
  end if;
end;
$$;

alter table public.grow_session_reminder_events
  add column if not exists reminder_type text not null default '';

alter table public.grow_session_reminder_events
  add column if not exists category text not null default '';

alter table public.grow_session_reminder_events
  add column if not exists event_key text not null default '';

alter table public.grow_session_reminder_events
  add column if not exists session_status text not null default '';

alter table public.grow_session_reminder_events
  add column if not exists status text not null default 'queued';

alter table public.grow_session_reminder_events
  add column if not exists skip_reason text not null default '';

alter table public.grow_session_reminder_events
  add column if not exists scheduled_for timestamptz;

alter table public.grow_session_reminder_events
  add column if not exists due_at timestamptz;

alter table public.grow_session_reminder_events
  add column if not exists sent_at timestamptz;

alter table public.grow_session_reminder_events
  add column if not exists postponed_until timestamptz;

alter table public.grow_session_reminder_events
  add column if not exists last_evaluated_at timestamptz;

alter table public.grow_session_reminder_events
  add column if not exists attempt_count integer not null default 0;

alter table public.grow_session_reminder_events
  add column if not exists delivery_count integer not null default 0;

alter table public.grow_session_reminder_events
  add column if not exists postpone_count integer not null default 0;

alter table public.grow_session_reminder_events
  add column if not exists notification_payload jsonb not null default '{}'::jsonb;

alter table public.grow_session_reminder_events
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.grow_session_reminder_events
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.grow_session_reminder_events
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

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
  add column if not exists seed_age_tracking_enabled boolean not null default false;

alter table public.grow_gallery_snapshots
  add column if not exists seed_age_mode text;

alter table public.grow_gallery_snapshots
  add column if not exists session_seed_age_years numeric;

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

alter table public.grow_gallery_snapshots
  add column if not exists analytics_excluded boolean not null default false;

alter table public.grow_gallery_snapshots
  add column if not exists analytics_excluded_reason text not null default '';

alter table public.grow_gallery_snapshots
  add column if not exists analytics_excluded_at timestamptz;

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

comment on table public.public_member_profiles is
  'Writable replacement for the old public_member_profiles view. Stores public profile and Grow Network preference fields while keeping Community Grow lookups on the same surface.';

revoke all on table public.public_member_profiles from public;
grant select on table public.public_member_profiles to anon;
grant select, insert, update on table public.public_member_profiles to authenticated;

create or replace function public.get_public_member_follow_summary(target_user_id uuid)
returns table (
  follower_count bigint,
  following_count bigint
)
language sql
security definer
set search_path = public
as $$
  with visible_public_member_profiles as (
    select
      public_member_profiles.id,
      public_member_profiles.display_name,
      public_member_profiles.avatar_url,
      public_member_profiles.joined_at
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.id
    where coalesce(public_member_profiles.show_profile_in_community_grow, true) = true
      and nullif(btrim(coalesce(public_member_profiles.display_name, '')), '') is not null
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  )
  select
    (
      select count(*)::bigint
      from public.grow_follows
      inner join visible_public_member_profiles
        on visible_public_member_profiles.id = grow_follows.follower_id
      where grow_follows.following_id = target_user_id
    ) as follower_count,
    (
      select count(*)::bigint
      from public.grow_follows
      inner join visible_public_member_profiles
        on visible_public_member_profiles.id = grow_follows.following_id
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
  with visible_public_member_profiles as (
    select
      public_member_profiles.id,
      public_member_profiles.display_name,
      public_member_profiles.avatar_url,
      public_member_profiles.joined_at
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.id
    where coalesce(public_member_profiles.show_profile_in_community_grow, true) = true
      and nullif(btrim(coalesce(public_member_profiles.display_name, '')), '') is not null
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  ),
  requested_users as (
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
    inner join visible_public_member_profiles
      on visible_public_member_profiles.id = grow_follows.follower_id
    where grow_follows.following_id = any (coalesce(target_user_ids, '{}'::uuid[]))
    group by grow_follows.following_id
  ) as follower_counts
    on follower_counts.user_id = requested_users.user_id
  left join (
    select
      grow_follows.follower_id as user_id,
      count(*)::bigint as following_count
    from public.grow_follows
    inner join visible_public_member_profiles
      on visible_public_member_profiles.id = grow_follows.following_id
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
  with visible_public_member_profiles as (
    select
      public_member_profiles.id,
      public_member_profiles.display_name,
      public_member_profiles.avatar_url,
      public_member_profiles.joined_at
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.id
    where coalesce(public_member_profiles.show_profile_in_community_grow, true) = true
      and nullif(btrim(coalesce(public_member_profiles.display_name, '')), '') is not null
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  ),
  normalized_relationship as (
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
    visible_public_member_profiles.display_name,
    visible_public_member_profiles.avatar_url,
    visible_public_member_profiles.joined_at,
    requested_members.relationship_type,
    requested_members.created_at
  from requested_members
  inner join visible_public_member_profiles
    on visible_public_member_profiles.id = requested_members.member_id
  order by requested_members.created_at desc, lower(visible_public_member_profiles.display_name) asc;
$$;

revoke all on function public.get_public_member_follow_members(uuid, text) from public;
grant execute on function public.get_public_member_follow_members(uuid, text) to anon;
grant execute on function public.get_public_member_follow_members(uuid, text) to authenticated;

create or replace function public.get_grow_session_analytics_exclusion_reason(p_session_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when grow_sessions.id is null then 'missing_session'
    when coalesce(grow_sessions.is_mock, false) = true then 'mock_session'
    when coalesce(grow_sessions.is_test, false) = true then 'test_session'
    when coalesce(grow_sessions.excluded_from_analytics, false) = true then coalesce(nullif(grow_sessions.analytics_excluded_reason, ''), 'analytics_excluded')
    when coalesce(grow_sessions.is_deleted, false) = true
      or lower(coalesce(grow_sessions.visibility_status, '')) in ('deleted', 'archived', 'archived_test') then 'deleted_session'
    when lower(coalesce(grow_sessions.session_status, '')) in ('abandoned', 'failed', 'canceled', 'cancelled') then 'abandoned_session'
    when lower(coalesce(grow_sessions.session_status, '')) <> 'completed' then 'incomplete_session'
    when grow_sessions.completed_at is null then 'missing_completed_at'
    when grow_sessions.session_started_at is not null
      and grow_sessions.soak_started_at is not null
      and grow_sessions.soak_started_at < grow_sessions.session_started_at then 'invalid_timeline'
    when grow_sessions.soak_started_at is not null
      and grow_sessions.germination_started_at is not null
      and grow_sessions.soak_started_at > grow_sessions.germination_started_at then 'invalid_timeline'
    when grow_sessions.germination_started_at is not null
      and grow_sessions.completed_at is not null
      and grow_sessions.germination_started_at > grow_sessions.completed_at then 'invalid_timeline'
    when grow_sessions.session_started_at is not null
      and grow_sessions.completed_at is not null
      and grow_sessions.completed_at < grow_sessions.session_started_at then 'invalid_timeline'
    else ''
  end
  from public.grow_sessions
  where grow_sessions.id = p_session_id;
$$;

create or replace function public.is_grow_session_analytics_eligible(p_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_grow_session_analytics_exclusion_reason(p_session_id), 'missing_session') = '';
$$;

revoke all on function public.get_grow_session_analytics_exclusion_reason(uuid) from public;
revoke all on function public.is_grow_session_analytics_eligible(uuid) from public;
grant execute on function public.get_grow_session_analytics_exclusion_reason(uuid) to authenticated;
grant execute on function public.is_grow_session_analytics_eligible(uuid) to authenticated;

create or replace function public.sync_gallery_snapshot_analytics_exclusion_for_session(p_session_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  exclusion_reason text := coalesce(public.get_grow_session_analytics_exclusion_reason(p_session_id), 'missing_session');
  affected_count integer := 0;
begin
  if p_session_id is null then
    return 0;
  end if;

  update public.grow_gallery_snapshots
  set
    analytics_excluded = exclusion_reason <> '',
    analytics_excluded_reason = exclusion_reason,
    analytics_excluded_at = case when exclusion_reason <> '' then timezone('utc', now()) else null end,
    updated_at = timezone('utc', now())
  where session_id = p_session_id
    and coalesce(is_mock, false) = false;

  get diagnostics affected_count = row_count;

  if exclusion_reason <> '' then
    delete from public.community_activity
    where session_id = p_session_id::text;

    if to_regclass('public.cstp_report_sessions') is not null then
      execute
        'update public.cstp_report_sessions
         set
           included_in_report = false,
           frozen_session_summary = coalesce(frozen_session_summary, ''{}''::jsonb)
             || jsonb_build_object(
               ''analyticsEligible'', false,
               ''analyticsExcludedReason'', $2,
               ''includedInReportRequested'', true
             )
         where grow_session_id = $1
           and included_in_report = true'
      using p_session_id, exclusion_reason;
    end if;
  end if;

  return coalesce(affected_count, 0);
end;
$$;

revoke all on function public.sync_gallery_snapshot_analytics_exclusion_for_session(uuid) from public;
grant execute on function public.sync_gallery_snapshot_analytics_exclusion_for_session(uuid) to authenticated;

create or replace function public.enforce_cstp_report_session_analytics_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  exclusion_reason text := '';
begin
  if new.grow_session_id is null then
    return new;
  end if;

  exclusion_reason := coalesce(public.get_grow_session_analytics_exclusion_reason(new.grow_session_id), 'missing_session');
  new.frozen_session_summary = coalesce(new.frozen_session_summary, '{}'::jsonb)
    || jsonb_build_object(
      'analyticsEligible', exclusion_reason = '',
      'analyticsExcludedReason', exclusion_reason
    );

  if coalesce(new.included_in_report, false) = true
    and exclusion_reason <> '' then
    new.included_in_report := false;
    new.frozen_session_summary = coalesce(new.frozen_session_summary, '{}'::jsonb)
      || jsonb_build_object('includedInReportRequested', true);
  end if;

  return new;
end;
$$;

do $$
begin
  if to_regclass('public.cstp_report_sessions') is not null then
    execute 'drop trigger if exists cstp_report_sessions_analytics_eligibility on public.cstp_report_sessions';
    execute 'create trigger cstp_report_sessions_analytics_eligibility
      before insert or update of grow_session_id, included_in_report
      on public.cstp_report_sessions
      for each row
      execute function public.enforce_cstp_report_session_analytics_eligibility()';
  end if;
end $$;

create or replace function public.enforce_grow_session_analytics_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_gallery_snapshot_analytics_exclusion_for_session(new.id);
  return new;
end;
$$;

drop trigger if exists grow_sessions_analytics_eligibility_sync on public.grow_sessions;
create trigger grow_sessions_analytics_eligibility_sync
after insert or update of session_status, completed_at, session_started_at, soak_started_at, germination_started_at, is_mock, is_test, excluded_from_analytics, is_deleted, visibility_status, deleted_at
on public.grow_sessions
for each row
execute function public.enforce_grow_session_analytics_eligibility();

create or replace function public.enforce_gallery_snapshot_analytics_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  exclusion_reason text := '';
begin
  if coalesce(new.is_mock, false) = true then
    new.analytics_excluded := true;
    new.analytics_excluded_reason := 'mock_snapshot';
    new.analytics_excluded_at := coalesce(new.analytics_excluded_at, timezone('utc', now()));
    return new;
  end if;

  if new.session_id is not null then
    exclusion_reason := coalesce(public.get_grow_session_analytics_exclusion_reason(new.session_id), 'missing_session');
    new.analytics_excluded := exclusion_reason <> '';
    new.analytics_excluded_reason := exclusion_reason;
    new.analytics_excluded_at := case when exclusion_reason <> '' then coalesce(new.analytics_excluded_at, timezone('utc', now())) else null end;
  end if;

  return new;
end;
$$;

drop trigger if exists grow_gallery_snapshots_analytics_eligibility on public.grow_gallery_snapshots;
create trigger grow_gallery_snapshots_analytics_eligibility
before insert or update of session_id, is_mock, status, is_published
on public.grow_gallery_snapshots
for each row
execute function public.enforce_gallery_snapshot_analytics_eligibility();

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
  normalized_session_id text := btrim(coalesce(activity_session_id, ''));
  normalized_snapshot_id text := btrim(coalesce(activity_snapshot_id, ''));
  normalized_session_uuid uuid;
  normalized_snapshot_uuid uuid;
  normalized_visibility text := case
    when lower(coalesce(activity_visibility, 'public')) = 'public' then 'public'
    else 'private'
  end;
  resulting_id uuid;
begin
  if activity_user_id is null or normalized_activity_type = '' then
    return null;
  end if;

  if normalized_session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_session_uuid := normalized_session_id::uuid;
  end if;

  if normalized_snapshot_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_snapshot_uuid := normalized_snapshot_id::uuid;
  end if;

  if normalized_session_uuid is not null
    and not public.is_grow_session_analytics_eligible(normalized_session_uuid) then
    return null;
  end if;

  if normalized_snapshot_uuid is not null
    and exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id = normalized_snapshot_uuid
        and coalesce(grow_gallery_snapshots.analytics_excluded, false) = true
    ) then
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

create or replace function public.clear_community_activity_for_session(activity_session_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_session_id text := btrim(coalesce(activity_session_id, ''));
  normalized_session_uuid uuid;
  deleted_count integer := 0;
begin
  if normalized_session_id = '' then
    return 0;
  end if;

  if normalized_session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    normalized_session_uuid := normalized_session_id::uuid;
  end if;

  if normalized_session_uuid is not null
    and not (
      exists (
        select 1
        from public.grow_sessions
        where grow_sessions.id = normalized_session_uuid
          and grow_sessions.user_id = auth.uid()
      )
      or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
      or exists (
        select 1
        from public.admin_users
        where admin_users.user_id = auth.uid()
      )
    ) then
    raise exception 'You can only clear activity for your own grow sessions.' using errcode = '42501';
  end if;

  delete from public.community_activity
  where session_id = normalized_session_id;

  get diagnostics deleted_count = row_count;
  return coalesce(deleted_count, 0);
end;
$$;

revoke all on function public.clear_community_activity_for_session(text) from public;
grant execute on function public.clear_community_activity_for_session(text) to authenticated;

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
    is_mock,
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
      end,
      'seedAgeTrackingEnabled', coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false),
      'seedAgeMode', coalesce(grow_gallery_snapshots.seed_age_mode, ''),
      'sessionSeedAgeYears', grow_gallery_snapshots.session_seed_age_years,
      'seedAgeSummaryKey', case
        when coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false) = true
          and lower(coalesce(grow_gallery_snapshots.seed_age_mode, '')) = 'same'
          and grow_gallery_snapshots.session_seed_age_years is not null then 'same'
        when coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false) = true
          and lower(coalesce(grow_gallery_snapshots.seed_age_mode, '')) = 'mixed' then 'mixed'
        else 'unknown'
      end,
      'seedAgeSummaryLabel', case
        when coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false) = true
          and lower(coalesce(grow_gallery_snapshots.seed_age_mode, '')) = 'same'
          and grow_gallery_snapshots.session_seed_age_years is not null
          then concat(
            'Same age: ',
            trim(trailing '.' from trim(trailing '0' from grow_gallery_snapshots.session_seed_age_years::text)),
            ' years'
          )
        when coalesce(grow_gallery_snapshots.seed_age_tracking_enabled, false) = true
          and lower(coalesce(grow_gallery_snapshots.seed_age_mode, '')) = 'mixed' then 'Mixed ages'
        else 'Unknown'
      end
    ),
    'public',
    coalesce(grow_gallery_snapshots.is_mock, false),
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

create or replace function public.set_user_push_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_push_notification_deliveries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_grow_session_reminder_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.sync_public_member_profiles_identity()
returns trigger
language plpgsql
as $$
begin
  if new.id is null and new.user_id is not null then
    new.id = new.user_id;
  elsif new.user_id is null and new.id is not null then
    new.user_id = new.id;
  elsif new.id is not null and new.user_id is not null and new.id is distinct from new.user_id then
    new.user_id = new.id;
  end if;

  if new.created_at is null then
    new.created_at = timezone('utc', now());
  end if;

  if new.joined_at is null then
    new.joined_at = coalesce(new.created_at, timezone('utc', now()));
  end if;

  return new;
end;
$$;

create or replace function public.set_public_member_profiles_updated_at()
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

drop trigger if exists user_push_subscriptions_set_updated_at on public.user_push_subscriptions;
create trigger user_push_subscriptions_set_updated_at
before update on public.user_push_subscriptions
for each row
execute procedure public.set_user_push_subscriptions_updated_at();

drop trigger if exists push_notification_deliveries_set_updated_at on public.push_notification_deliveries;
create trigger push_notification_deliveries_set_updated_at
before update on public.push_notification_deliveries
for each row
execute procedure public.set_push_notification_deliveries_updated_at();

drop trigger if exists grow_session_reminder_events_set_updated_at on public.grow_session_reminder_events;
create trigger grow_session_reminder_events_set_updated_at
before update on public.grow_session_reminder_events
for each row
execute procedure public.set_grow_session_reminder_events_updated_at();

drop trigger if exists public_member_profiles_identity_sync on public.public_member_profiles;
create trigger public_member_profiles_identity_sync
before insert or update on public.public_member_profiles
for each row
execute procedure public.sync_public_member_profiles_identity();

drop trigger if exists public_member_profiles_set_updated_at on public.public_member_profiles;
create trigger public_member_profiles_set_updated_at
before update on public.public_member_profiles
for each row
execute procedure public.set_public_member_profiles_updated_at();

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
alter table public.grow_session_time_edit_audit enable row level security;
alter table public.profiles enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.user_push_subscriptions enable row level security;
alter table public.push_notification_deliveries enable row level security;
alter table public.grow_session_reminder_events enable row level security;
alter table public.public_member_profiles enable row level security;
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

drop policy if exists "Visible public member profiles can be read" on public.public_member_profiles;
create policy "Visible public member profiles can be read"
on public.public_member_profiles
for select
to public
using (
  auth.uid() = user_id
  or lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
  or (
    coalesce(show_profile_in_community_grow, true) = true
    and nullif(btrim(coalesce(display_name, '')), '') is not null
    and exists (
      select 1
      from public.profiles
      where profiles.id = public_member_profiles.user_id
        and coalesce(profiles.account_status, 'active') = 'active'
        and coalesce(profiles.deletion_status, '') <> 'deleted'
    )
  )
);

drop policy if exists "Users can create their own public member profile" on public.public_member_profiles;
create policy "Users can create their own public member profile"
on public.public_member_profiles
for insert
to authenticated
with check (
  auth.uid() = coalesce(user_id, id)
);

drop policy if exists "Users can update their own public member profile" on public.public_member_profiles;
create policy "Users can update their own public member profile"
on public.public_member_profiles
for update
to authenticated
using (
  auth.uid() = user_id
  or auth.uid() = id
)
with check (
  auth.uid() = coalesce(user_id, id)
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

drop policy if exists "Users can view their own push subscriptions" on public.user_push_subscriptions;
create policy "Users can view their own push subscriptions"
on public.user_push_subscriptions
for select
using (
  auth.uid() = user_id
);

drop policy if exists "Users can view their own grow reminder events" on public.grow_session_reminder_events;
create policy "Users can view their own grow reminder events"
on public.grow_session_reminder_events
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

drop policy if exists "Users can create their own push subscriptions" on public.user_push_subscriptions;
create policy "Users can create their own push subscriptions"
on public.user_push_subscriptions
for insert
with check (
  auth.uid() = user_id
);

drop policy if exists "Users can update their own push subscriptions" on public.user_push_subscriptions;
create policy "Users can update their own push subscriptions"
on public.user_push_subscriptions
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

drop policy if exists "Users can delete their own push subscriptions" on public.user_push_subscriptions;
create policy "Users can delete their own push subscriptions"
on public.user_push_subscriptions
for delete
using (
  auth.uid() = user_id
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
  (status = 'approved' and coalesce(analytics_excluded, false) = false)
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
        (grow_gallery_snapshots.status = 'approved' and coalesce(grow_gallery_snapshots.analytics_excluded, false) = false)
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
        (grow_gallery_snapshots.status = 'approved' and coalesce(grow_gallery_snapshots.analytics_excluded, false) = false)
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

comment on column public.grow_sessions.is_mock is
  'True only for seeded/dev/demo Grow sessions. Real logged-in user sessions default to false and are preserved by demo resets.';

comment on column public.grow_sessions.is_test is
  'True for founder/admin personal test grow sessions. Test sessions must not count in production analytics.';

comment on column public.grow_sessions.excluded_from_analytics is
  'Internal analytics guardrail. True sessions are hidden from production germination rates, rankings, leaderboards, Community Grow analytics, and CSTP calculations.';

comment on column public.grow_gallery_snapshots.is_mock is
  'True only for seeded/dev/demo Community Grow snapshots. Real user snapshots default to false and are preserved by demo resets.';

comment on column public.grow_sessions.session_status is
  'Grow session lifecycle input. Analytics state is normalized as draft, active, completed, abandoned, or deleted; only completed eligible sessions count in production metrics.';

comment on column public.grow_gallery_snapshots.analytics_excluded is
  'True when the linked grow session is mock, incomplete, abandoned, deleted, or has an invalid timeline. Excluded snapshots must not count in Community Grow analytics or leaderboards.';

comment on column public.community_activity.is_mock is
  'True only for seeded/dev/demo Community Grow activity rows. Real user activity defaults to false and is preserved by demo resets.';

comment on column public.sources.is_mock is
  'True only for seeded/dev/demo Source Directory records. Real/admin-managed sources default to false and are preserved by demo resets.';

create index if not exists grow_sessions_is_mock_idx
  on public.grow_sessions (is_mock, created_at desc);

create index if not exists grow_sessions_analytics_exclusion_idx
  on public.grow_sessions (excluded_from_analytics, is_test, is_deleted, session_status, created_at desc);

create index if not exists grow_gallery_snapshots_is_mock_idx
  on public.grow_gallery_snapshots (is_mock, created_at desc);

create index if not exists grow_gallery_snapshots_analytics_idx
  on public.grow_gallery_snapshots (analytics_excluded, status, is_published, published_at desc);

create index if not exists community_activity_is_mock_idx
  on public.community_activity (is_mock, created_at desc);

create index if not exists sources_is_mock_idx
  on public.sources (is_mock, created_at desc);

update public.grow_gallery_snapshots
set
  analytics_excluded = true,
  analytics_excluded_reason = 'mock_snapshot',
  analytics_excluded_at = coalesce(analytics_excluded_at, timezone('utc', now()))
where coalesce(is_mock, false) = true;

update public.grow_gallery_snapshots
set
  analytics_excluded = coalesce(public.get_grow_session_analytics_exclusion_reason(session_id), 'missing_session') <> '',
  analytics_excluded_reason = coalesce(public.get_grow_session_analytics_exclusion_reason(session_id), 'missing_session'),
  analytics_excluded_at = case
    when coalesce(public.get_grow_session_analytics_exclusion_reason(session_id), 'missing_session') <> ''
      then coalesce(analytics_excluded_at, timezone('utc', now()))
    else null
  end
where session_id is not null
  and coalesce(is_mock, false) = false;

delete from public.community_activity
where session_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and not public.is_grow_session_analytics_eligible(session_id::uuid);

do $$
begin
  if to_regclass('public.cstp_report_sessions') is not null then
    execute
      'update public.cstp_report_sessions
       set
         included_in_report = false,
         frozen_session_summary = coalesce(frozen_session_summary, ''{}''::jsonb)
           || jsonb_build_object(
             ''analyticsEligible'', false,
             ''analyticsExcludedReason'', coalesce(public.get_grow_session_analytics_exclusion_reason(grow_session_id), ''missing_session''),
             ''includedInReportRequested'', true
           )
       where included_in_report = true
         and not public.is_grow_session_analytics_eligible(grow_session_id)';
  end if;
end $$;

create or replace function public.cleanup_mock_grow_data(dry_run boolean default true)
returns table (
  table_name text,
  deleted_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
  source_cleanup_sql text := '';
begin
  if not (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  ) then
    raise exception 'Only admins can clean up mock grow data.' using errcode = '42501';
  end if;

  if coalesce(dry_run, true) then
    return query
      select 'grow_gallery_snapshot_likes'::text, count(*)::integer
      from public.grow_gallery_snapshot_likes
      where exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
          and coalesce(grow_gallery_snapshots.is_mock, false) = true
      )
      union all
      select 'community_activity'::text, count(*)::integer
      from public.community_activity
      where coalesce(community_activity.is_mock, false) = true
        or exists (
          select 1
          from public.grow_gallery_snapshots
          where grow_gallery_snapshots.id::text = community_activity.snapshot_id
            and coalesce(grow_gallery_snapshots.is_mock, false) = true
        )
        or exists (
          select 1
          from public.grow_sessions
          where grow_sessions.id::text = community_activity.session_id
            and coalesce(grow_sessions.is_mock, false) = true
        )
      union all
      select 'grow_gallery_snapshots'::text, count(*)::integer
      from public.grow_gallery_snapshots
      where coalesce(grow_gallery_snapshots.is_mock, false) = true
      union all
      select 'grow_session_reminder_events'::text, count(*)::integer
      from public.grow_session_reminder_events
      where exists (
        select 1
        from public.grow_sessions
        where grow_sessions.id = grow_session_reminder_events.session_id
          and coalesce(grow_sessions.is_mock, false) = true
      )
      union all
      select 'grow_sessions'::text, count(*)::integer
      from public.grow_sessions
      where coalesce(grow_sessions.is_mock, false) = true;

    source_cleanup_sql := $source_sql$
      select count(*)::integer
      from public.sources
      where coalesce(sources.is_mock, false) = true
        and not exists (
          select 1
          from public.grow_gallery_snapshots
          where grow_gallery_snapshots.source_id = sources.id
            and coalesce(grow_gallery_snapshots.is_mock, false) = false
        )
    $source_sql$;

    if to_regclass('public.cstp_requests') is not null then
      source_cleanup_sql := source_cleanup_sql || '
        and not exists (
          select 1
          from public.cstp_requests
          where cstp_requests.source_id = sources.id
        )';
    end if;

    if to_regclass('public.cstp_tests') is not null then
      source_cleanup_sql := source_cleanup_sql || '
        and not exists (
          select 1
          from public.cstp_tests
          where cstp_tests.source_id = sources.id
        )';
    end if;

    execute source_cleanup_sql into affected_count;
    table_name := 'sources';
    deleted_count := affected_count;
    return next;
    return;
  end if;

  delete from public.grow_gallery_snapshot_likes
  where exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
      and coalesce(grow_gallery_snapshots.is_mock, false) = true
  );
  get diagnostics affected_count = row_count;
  table_name := 'grow_gallery_snapshot_likes';
  deleted_count := affected_count;
  return next;

  delete from public.community_activity
  where coalesce(community_activity.is_mock, false) = true
    or exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id::text = community_activity.snapshot_id
        and coalesce(grow_gallery_snapshots.is_mock, false) = true
    )
    or exists (
      select 1
      from public.grow_sessions
      where grow_sessions.id::text = community_activity.session_id
        and coalesce(grow_sessions.is_mock, false) = true
    );
  get diagnostics affected_count = row_count;
  table_name := 'community_activity';
  deleted_count := affected_count;
  return next;

  delete from public.grow_gallery_snapshots
  where coalesce(grow_gallery_snapshots.is_mock, false) = true;
  get diagnostics affected_count = row_count;
  table_name := 'grow_gallery_snapshots';
  deleted_count := affected_count;
  return next;

  delete from public.grow_session_reminder_events
  where exists (
    select 1
    from public.grow_sessions
    where grow_sessions.id = grow_session_reminder_events.session_id
      and coalesce(grow_sessions.is_mock, false) = true
  );
  get diagnostics affected_count = row_count;
  table_name := 'grow_session_reminder_events';
  deleted_count := affected_count;
  return next;

  delete from public.grow_sessions
  where coalesce(grow_sessions.is_mock, false) = true;
  get diagnostics affected_count = row_count;
  table_name := 'grow_sessions';
  deleted_count := affected_count;
  return next;

  source_cleanup_sql := $source_sql$
    delete from public.sources
    where coalesce(sources.is_mock, false) = true
      and not exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.source_id = sources.id
          and coalesce(grow_gallery_snapshots.is_mock, false) = false
      )
  $source_sql$;

  if to_regclass('public.cstp_requests') is not null then
    source_cleanup_sql := source_cleanup_sql || '
      and not exists (
        select 1
        from public.cstp_requests
        where cstp_requests.source_id = sources.id
      )';
  end if;

  if to_regclass('public.cstp_tests') is not null then
    source_cleanup_sql := source_cleanup_sql || '
      and not exists (
        select 1
        from public.cstp_tests
        where cstp_tests.source_id = sources.id
      )';
  end if;

  execute source_cleanup_sql;
  get diagnostics affected_count = row_count;
  table_name := 'sources';
  deleted_count := affected_count;
  return next;
end;
$$;

revoke all on function public.cleanup_mock_grow_data(boolean) from public;
grant execute on function public.cleanup_mock_grow_data(boolean) to authenticated;

comment on function public.cleanup_mock_grow_data(boolean) is
  'Admin-only cleanup for mock Grow data. Defaults to dry-run. Never deletes users, non-mock sessions/snapshots/sources, or CSTP/admin records.';

comment on table public.grow_session_cleanup_audit is
  'Append-only audit log for admin grow-session cleanup previews and executions. This table records cleanup intent and counts without deleting account, admin, settings, config, or CSTP data.';

create or replace function public.cleanup_founder_test_grow_sessions(
  target_user_id uuid default null,
  candidate_session_ids uuid[] default null,
  include_explicit_unmarked boolean default false,
  confirmation_phrase text default '',
  dry_run boolean default true,
  reason text default '',
  legacy_created_before timestamptz default '2026-05-19 09:30:00+00'::timestamptz
)
returns table (
  table_name text,
  deleted_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  required_confirmation constant text := 'DELETE OLD FOUNDER TEST SESSIONS';
  actor_id uuid := auth.uid();
  actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  normalized_target_user_id uuid := coalesce(target_user_id, auth.uid());
  requested_ids uuid[] := coalesce(candidate_session_ids, '{}'::uuid[]);
  confirmation_matches boolean := btrim(coalesce(confirmation_phrase, '')) = required_confirmation;
  normalized_legacy_created_before timestamptz := coalesce(legacy_created_before, '2026-05-19 09:30:00+00'::timestamptz);
  is_authorized_admin boolean := false;
  has_requested_ids boolean := cardinality(coalesce(candidate_session_ids, '{}'::uuid[])) > 0;
  candidate_ids uuid[] := '{}'::uuid[];
  sessions_count integer := 0;
  snapshots_count integer := 0;
  likes_count integer := 0;
  activity_count integer := 0;
  reminder_events_count integer := 0;
  push_deliveries_count integer := 0;
  audit_counts jsonb := '{}'::jsonb;
begin
  is_authorized_admin := (
    actor_email = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = actor_id
    )
  );

  if not is_authorized_admin then
    raise exception 'Only admins can clean up founder test grow sessions.' using errcode = '42501';
  end if;

  if normalized_target_user_id is null then
    raise exception 'A target user id is required for founder test grow session cleanup.' using errcode = '22023';
  end if;

  if coalesce(dry_run, true) = false and not confirmation_matches then
    raise exception 'Confirmation phrase mismatch. Use DELETE OLD FOUNDER TEST SESSIONS to execute cleanup.' using errcode = '22023';
  end if;

  drop table if exists pg_temp.cleanup_founder_test_session_candidates;
  create temporary table cleanup_founder_test_session_candidates (
    session_id uuid primary key
  ) on commit drop;

  insert into cleanup_founder_test_session_candidates (session_id)
  select grow_sessions.id
  from public.grow_sessions
  where grow_sessions.user_id = normalized_target_user_id
    and (
      coalesce(grow_sessions.is_mock, false) = true
      or coalesce(grow_sessions.is_test, false) = true
      or coalesce(grow_sessions.excluded_from_analytics, false) = true
      or coalesce(grow_sessions.is_deleted, false) = true
      or lower(coalesce(grow_sessions.visibility_status, '')) in ('deleted', 'archived', 'archived_test')
      or (
        coalesce(include_explicit_unmarked, false) = true
        and has_requested_ids
        and grow_sessions.id = any (requested_ids)
        and coalesce(grow_sessions.created_at, 'infinity'::timestamptz) < normalized_legacy_created_before
      )
    )
    and (
      not has_requested_ids
      or grow_sessions.id = any (requested_ids)
    );

  if to_regclass('public.cstp_test_sessions') is not null then
    execute $sql$
      delete from pg_temp.cleanup_founder_test_session_candidates candidates
      where exists (
        select 1
        from public.cstp_test_sessions
        where cstp_test_sessions.session_id = candidates.session_id
      )
    $sql$;
  end if;

  if to_regclass('public.cstp_report_sessions') is not null then
    execute $sql$
      delete from pg_temp.cleanup_founder_test_session_candidates candidates
      where exists (
        select 1
        from public.cstp_report_sessions
        where cstp_report_sessions.grow_session_id = candidates.session_id
      )
    $sql$;
  end if;

  select coalesce(array_agg(session_id order by session_id), '{}'::uuid[])
  into candidate_ids
  from pg_temp.cleanup_founder_test_session_candidates;

  select count(*)::integer
  into sessions_count
  from pg_temp.cleanup_founder_test_session_candidates;

  select count(*)::integer
  into snapshots_count
  from public.grow_gallery_snapshots
  where grow_gallery_snapshots.session_id = any (candidate_ids)
    and (
      coalesce(grow_gallery_snapshots.is_mock, false) = true
      or coalesce(include_explicit_unmarked, false) = true
    );

  select count(*)::integer
  into likes_count
  from public.grow_gallery_snapshot_likes
  where exists (
    select 1
    from public.grow_gallery_snapshots
    where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
      and grow_gallery_snapshots.session_id = any (candidate_ids)
      and (
        coalesce(grow_gallery_snapshots.is_mock, false) = true
        or coalesce(include_explicit_unmarked, false) = true
      )
  );

  select count(*)::integer
  into activity_count
  from public.community_activity
  where community_activity.session_id in (select session_id::text from pg_temp.cleanup_founder_test_session_candidates)
    or exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id::text = community_activity.snapshot_id
        and grow_gallery_snapshots.session_id = any (candidate_ids)
        and (
          coalesce(grow_gallery_snapshots.is_mock, false) = true
          or coalesce(include_explicit_unmarked, false) = true
        )
    );

  select count(*)::integer
  into reminder_events_count
  from public.grow_session_reminder_events
  where grow_session_reminder_events.session_id = any (candidate_ids);

  select count(*)::integer
  into push_deliveries_count
  from public.push_notification_deliveries
  where push_notification_deliveries.session_id = any (candidate_ids);

  if coalesce(dry_run, true) = false then
    update public.grow_sessions
    set
      session_status = 'archived_test',
      visibility_status = 'archived_test',
      is_mock = true,
      is_test = true,
      excluded_from_analytics = true,
      analytics_excluded_reason = 'founder_personal_test_cleanup',
      analytics_excluded_at = timezone('utc', now()),
      is_deleted = true,
      deleted_at = coalesce(deleted_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
    where grow_sessions.id = any (candidate_ids);

    update public.grow_gallery_snapshots
    set
      is_mock = true,
      analytics_excluded = true,
      analytics_excluded_reason = 'founder_personal_test_cleanup',
      analytics_excluded_at = coalesce(analytics_excluded_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
    where grow_gallery_snapshots.session_id = any (candidate_ids);

    delete from public.grow_gallery_snapshot_likes
    where exists (
      select 1
      from public.grow_gallery_snapshots
      where grow_gallery_snapshots.id = grow_gallery_snapshot_likes.snapshot_id
        and grow_gallery_snapshots.session_id = any (candidate_ids)
        and (
          coalesce(grow_gallery_snapshots.is_mock, false) = true
          or coalesce(include_explicit_unmarked, false) = true
        )
    );
    get diagnostics likes_count = row_count;

    delete from public.community_activity
    where community_activity.session_id in (select session_id::text from pg_temp.cleanup_founder_test_session_candidates)
      or exists (
        select 1
        from public.grow_gallery_snapshots
        where grow_gallery_snapshots.id::text = community_activity.snapshot_id
          and grow_gallery_snapshots.session_id = any (candidate_ids)
          and (
            coalesce(grow_gallery_snapshots.is_mock, false) = true
            or coalesce(include_explicit_unmarked, false) = true
          )
      );
    get diagnostics activity_count = row_count;

    delete from public.grow_gallery_snapshots
    where grow_gallery_snapshots.session_id = any (candidate_ids)
      and (
        coalesce(grow_gallery_snapshots.is_mock, false) = true
        or coalesce(include_explicit_unmarked, false) = true
      );
    get diagnostics snapshots_count = row_count;

    delete from public.grow_session_reminder_events
    where grow_session_reminder_events.session_id = any (candidate_ids);
    get diagnostics reminder_events_count = row_count;

    delete from public.push_notification_deliveries
    where push_notification_deliveries.session_id = any (candidate_ids);
    get diagnostics push_deliveries_count = row_count;

    delete from public.grow_sessions
    where grow_sessions.id = any (candidate_ids);
    get diagnostics sessions_count = row_count;
  end if;

  audit_counts := jsonb_build_object(
    'grow_sessions', sessions_count,
    'grow_gallery_snapshots', snapshots_count,
    'grow_gallery_snapshot_likes', likes_count,
    'community_activity', activity_count,
    'grow_session_reminder_events', reminder_events_count,
    'push_notification_deliveries', push_deliveries_count
  );

  insert into public.grow_session_cleanup_audit (
    actor_user_id,
    actor_email,
    target_user_id,
    dry_run,
    confirmation_matched,
    include_explicit_unmarked,
    legacy_created_before,
    requested_session_ids,
    candidate_session_ids,
    deleted_counts,
    reason
  )
  values (
    actor_id,
    actor_email,
    normalized_target_user_id,
    coalesce(dry_run, true),
    confirmation_matches,
    coalesce(include_explicit_unmarked, false),
    normalized_legacy_created_before,
    requested_ids,
    candidate_ids,
    audit_counts,
    left(coalesce(reason, ''), 500)
  );

  return query
    select 'grow_sessions'::text, sessions_count
    union all select 'grow_gallery_snapshots'::text, snapshots_count
    union all select 'grow_gallery_snapshot_likes'::text, likes_count
    union all select 'community_activity'::text, activity_count
    union all select 'grow_session_reminder_events'::text, reminder_events_count
    union all select 'push_notification_deliveries'::text, push_deliveries_count;
end;
$$;

alter table public.grow_session_cleanup_audit enable row level security;

drop policy if exists "Admins can view grow session cleanup audit" on public.grow_session_cleanup_audit;
create policy "Admins can view grow session cleanup audit"
on public.grow_session_cleanup_audit
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

revoke all on table public.grow_session_cleanup_audit from public;
grant select on table public.grow_session_cleanup_audit to authenticated;

revoke all on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text, timestamptz) from public;
grant execute on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text, timestamptz) to authenticated;

comment on function public.cleanup_founder_test_grow_sessions(uuid, uuid[], boolean, text, boolean, text, timestamptz) is
  'Admin-only grow-session cleanup for founder personal test/mock data. Defaults to dry-run and requires exact confirmation before deletion. Marks candidates as archived_test, is_test, is_mock, and excluded_from_analytics before removal, excludes CSTP-linked sessions, caps explicit unmarked cleanup to the legacy cutoff, and never deletes auth, admin, settings, config, source, or CSTP records.';

comment on table public.grow_session_time_edit_audit is
  'Private audit log for founder/admin grow session timestamp edits. Not exposed to public app surfaces.';

drop policy if exists "Admins can view grow session time edit audit" on public.grow_session_time_edit_audit;
create policy "Admins can view grow session time edit audit"
on public.grow_session_time_edit_audit
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

create or replace function public.is_grow_session_timestamp_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    );
$$;

revoke all on function public.is_grow_session_timestamp_admin() from public;
grant execute on function public.is_grow_session_timestamp_admin() to authenticated;

create or replace function public.enforce_grow_session_timestamp_edit_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_is_timestamp_admin boolean := public.is_grow_session_timestamp_admin();
  manual_edit_allowed boolean := coalesce(current_setting('app.allow_manual_grow_time_edit', true), '') = 'true';
  action_at timestamptz := now();
begin
  if tg_op = 'INSERT' then
    if not actor_is_timestamp_admin then
      new.date := (action_at at time zone 'UTC')::date;
      new.time := to_char(action_at at time zone 'UTC', 'HH24:MI');
      new.session_started_at := action_at;
      new.soak_started_at := action_at;
      new.timer_start_at := action_at;

      if lower(coalesce(new.session_status, '')) in ('germinating', 'completed')
        or new.germination_started_at is not null then
        new.germination_started_at := action_at;
      end if;

      if lower(coalesce(new.session_status, '')) = 'completed'
        or new.completed_at is not null then
        new.completed_at := action_at;
      end if;
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if (
      new.date is distinct from old.date
      or new.time is distinct from old.time
      or new.session_started_at is distinct from old.session_started_at
      or new.soak_started_at is distinct from old.soak_started_at
      or new.timer_start_at is distinct from old.timer_start_at
    ) and not (actor_is_timestamp_admin and manual_edit_allowed) then
      raise exception 'Manual grow session timestamp editing is restricted to founder/admin accounts.' using errcode = '42501';
    end if;

    if not actor_is_timestamp_admin then
      if new.germination_started_at is distinct from old.germination_started_at then
        if old.germination_started_at is not null then
          raise exception 'Manual grow session timestamp editing is restricted to founder/admin accounts.' using errcode = '42501';
        end if;
        if new.germination_started_at is not null then
          new.germination_started_at := action_at;
        end if;
      elsif lower(coalesce(new.session_status, '')) in ('germinating', 'completed')
        and lower(coalesce(old.session_status, '')) not in ('germinating', 'completed')
        and new.germination_started_at is null then
        new.germination_started_at := action_at;
      end if;

      if new.completed_at is distinct from old.completed_at then
        if old.completed_at is not null then
          raise exception 'Manual grow session timestamp editing is restricted to founder/admin accounts.' using errcode = '42501';
        end if;
        if new.completed_at is not null then
          new.completed_at := action_at;
        end if;
      elsif lower(coalesce(new.session_status, '')) = 'completed'
        and lower(coalesce(old.session_status, '')) <> 'completed'
        and new.completed_at is null then
        new.completed_at := action_at;
      end if;
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists grow_sessions_timestamp_edit_policy on public.grow_sessions;
create trigger grow_sessions_timestamp_edit_policy
before insert or update on public.grow_sessions
for each row
execute function public.enforce_grow_session_timestamp_edit_policy();

create or replace function public.update_owner_grow_session_times(
  p_session_id uuid,
  p_session_started_at timestamptz,
  p_soak_started_at timestamptz,
  p_germination_started_at timestamptz default null,
  p_completed_at timestamptz default null,
  p_session_date date default null,
  p_session_time text default null
)
returns public.grow_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_session public.grow_sessions%rowtype;
  updated_session public.grow_sessions%rowtype;
  normalized_session_date date := coalesce(p_session_date, (p_session_started_at at time zone 'UTC')::date);
  normalized_session_time text := coalesce(nullif(btrim(p_session_time), ''), to_char(p_session_started_at at time zone 'UTC', 'HH24:MI'));
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to edit grow session times.' using errcode = '42501';
  end if;

  if not public.is_grow_session_timestamp_admin() then
    raise exception 'Manual grow session timestamp editing is restricted to founder/admin accounts.' using errcode = '42501';
  end if;

  if p_session_id is null then
    raise exception 'A session id is required.' using errcode = '22023';
  end if;

  if p_session_started_at is null then
    raise exception 'Session start time is required.' using errcode = '22023';
  end if;

  if p_soak_started_at is null then
    raise exception 'Soak start time is required.' using errcode = '22023';
  end if;

  select *
  into existing_session
  from public.grow_sessions
  where id = p_session_id
  for update;

  if not found then
    raise exception 'Grow session not found.' using errcode = 'P0002';
  end if;

  if existing_session.user_id is distinct from auth.uid() then
    raise exception 'You can only edit timestamps for your own grow sessions.' using errcode = '42501';
  end if;

  if p_soak_started_at < p_session_started_at then
    raise exception 'Soak start cannot be before session start.' using errcode = '22023';
  end if;

  if p_germination_started_at is not null and p_soak_started_at > p_germination_started_at then
    raise exception 'Soak start cannot be after germination start.' using errcode = '22023';
  end if;

  if p_completed_at is not null and p_germination_started_at is not null and p_germination_started_at > p_completed_at then
    raise exception 'Germination start cannot be after completed time.' using errcode = '22023';
  end if;

  if p_completed_at is not null and p_completed_at < p_session_started_at then
    raise exception 'Completed time cannot be before session start.' using errcode = '22023';
  end if;

  perform set_config('app.allow_manual_grow_time_edit', 'true', true);

  update public.grow_sessions
  set
    date = normalized_session_date,
    time = normalized_session_time,
    session_started_at = p_session_started_at,
    soak_started_at = p_soak_started_at,
    timer_start_at = p_soak_started_at,
    germination_started_at = p_germination_started_at,
    completed_at = p_completed_at,
    updated_at = timezone('utc', now())
  where id = p_session_id
    and user_id = auth.uid()
  returning *
  into updated_session;

  if not found then
    raise exception 'Grow session timestamp update was not applied.' using errcode = '42501';
  end if;

  insert into public.grow_session_time_edit_audit (
    session_id,
    actor_user_id,
    owner_user_id,
    previous_values,
    next_values
  )
  values (
    p_session_id,
    auth.uid(),
    existing_session.user_id,
    jsonb_build_object(
      'session_started_at', existing_session.session_started_at,
      'soak_started_at', existing_session.soak_started_at,
      'timer_start_at', existing_session.timer_start_at,
      'germination_started_at', existing_session.germination_started_at,
      'completed_at', existing_session.completed_at,
      'date', existing_session.date,
      'time', existing_session.time
    ),
    jsonb_build_object(
      'session_started_at', updated_session.session_started_at,
      'soak_started_at', updated_session.soak_started_at,
      'timer_start_at', updated_session.timer_start_at,
      'germination_started_at', updated_session.germination_started_at,
      'completed_at', updated_session.completed_at,
      'date', updated_session.date,
      'time', updated_session.time
    )
  );

  return updated_session;
end;
$$;

revoke all on table public.grow_session_time_edit_audit from public;
grant select on table public.grow_session_time_edit_audit to authenticated;

revoke all on function public.update_owner_grow_session_times(uuid, timestamptz, timestamptz, timestamptz, timestamptz, date, text) from public;
grant execute on function public.update_owner_grow_session_times(uuid, timestamptz, timestamptz, timestamptz, timestamptz, date, text) to authenticated;

comment on function public.update_owner_grow_session_times(uuid, timestamptz, timestamptz, timestamptz, timestamptz, date, text) is
  'Founder/admin-only grow session timestamp editor. Requires auth.uid() = grow_sessions.user_id, validates timeline order, and writes a private audit record.';

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

-- End of Cannakan Grow Supabase schema.
