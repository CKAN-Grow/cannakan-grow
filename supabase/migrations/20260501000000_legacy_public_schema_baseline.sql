-- Legacy public-schema baseline captured immediately before timestamped migrations began.
-- All table creation is additive/idempotent so existing remote schemas remain unchanged.
-- Source: repository schema at 5f0e605^ (pre-CSTP).

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
  timer_start_at timestamptz,
  seed_age_tracking_enabled boolean not null default false,
  seed_age_mode text,
  session_seed_age_years numeric,
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

-- These Source Directory snapshot fields predate the timestamped migration
-- chain but were historically added through the monolithic schema file.
alter table public.grow_gallery_snapshots
  add column if not exists unit_id text default '',
  add column if not exists total_seeds integer not null default 0,
  add column if not exists total_planted integer not null default 0,
  add column if not exists source_id uuid references public.sources(id) on delete set null,
  add column if not exists source_name text default '',
  add column if not exists source_logo_url text default '',
  add column if not exists seed_variety_name text default '';
