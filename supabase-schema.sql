create extension if not exists pgcrypto;

create table if not exists public.grow_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_path text,
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
  user_deleted boolean not null default false,
  user_deleted_at timestamptz,
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

create table if not exists public.seed_vault_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text,
  seed_variety text,
  seed_name text,
  seed_type text,
  sex text,
  seed_sex text,
  seed_age_years numeric,
  seed_count integer,
  quantity integer,
  remaining_count integer,
  year_acquired integer,
  acquired_at date,
  storage_location text,
  storage_notes text,
  notes text,
  visibility text not null default 'private',
  is_favorite boolean default false,
  is_archived boolean default false,
  archived_at timestamptz,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  is_mock boolean default false,
  dev_mode_only boolean default false,
  mock_source text,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

alter table public.seed_vault_entries
  add column if not exists acquired_at date,
  add column if not exists storage_notes text,
  add column if not exists visibility text not null default 'private',
  add column if not exists archived_at timestamptz,
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seed_vault_entries'::regclass
      and conname = 'seed_vault_entries_visibility_check'
  ) then
    alter table public.seed_vault_entries
      add constraint seed_vault_entries_visibility_check
      check (visibility in ('private', 'public'));
  end if;
end;
$$;

create index if not exists seed_vault_entries_user_updated_idx
  on public.seed_vault_entries (user_id, is_archived, is_favorite desc, updated_at desc);

create index if not exists seed_vault_entries_user_visibility_idx
  on public.seed_vault_entries (user_id, visibility, is_archived, is_deleted);

alter table public.seed_vault_entries enable row level security;

create policy "Users can view their own seed vault entries"
  on public.seed_vault_entries
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own seed vault entries"
  on public.seed_vault_entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own seed vault entries"
  on public.seed_vault_entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own seed vault entries"
  on public.seed_vault_entries
  for delete
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'Other',
  name text not null default '',
  email text not null default '',
  company text,
  website text,
  subject text,
  message text not null default '',
  routed_to text not null default 'growsupport@cannakan.com',
  status text not null default 'new',
  internal_notes text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contact_messages
  add column if not exists type text not null default 'Other',
  add column if not exists name text not null default '',
  add column if not exists email text not null default '',
  add column if not exists company text,
  add column if not exists website text,
  add column if not exists subject text,
  add column if not exists message text not null default '',
  add column if not exists routed_to text not null default 'growsupport@cannakan.com',
  add column if not exists status text not null default 'new',
  add column if not exists internal_notes text,
  add column if not exists submitted_at timestamptz not null default now(),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.contact_messages
  alter column status set default 'new',
  alter column submitted_at set default now(),
  alter column created_at set default now(),
  alter column updated_at set default now();

create index if not exists contact_messages_submitted_at_idx
  on public.contact_messages (submitted_at desc);

create index if not exists contact_messages_status_submitted_at_idx
  on public.contact_messages (status, submitted_at desc);

create or replace function public.set_contact_messages_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row
execute function public.set_contact_messages_updated_at();

alter table public.contact_messages enable row level security;

create policy "Anyone can insert contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "Founder admins can read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (
      array['don@cannakan.com', 'growsupport@cannakan.com']
    )
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Founder admins can update contact messages"
  on public.contact_messages
  for update
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (
      array['don@cannakan.com', 'growsupport@cannakan.com']
    )
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  )
  with check (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (
      array['don@cannakan.com', 'growsupport@cannakan.com']
    )
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
  );

create policy "Founder admins can delete contact messages"
  on public.contact_messages
  for delete
  to authenticated
  using (
    lower(coalesce(auth.jwt() ->> 'email', '')) = any (
      array['don@cannakan.com', 'growsupport@cannakan.com']
    )
    or exists (
      select 1
      from public.admin_users
      where admin_users.user_id = auth.uid()
    )
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
  bio text default '',
  public_handle text,
  location_region text default '',
  country_code text,
  profile_visibility text not null default 'public',
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

create or replace function public.sync_growsupport_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if lower(coalesce(new.email, '')) = 'growsupport@cannakan.com' then
    insert into public.admin_users (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do update
    set email = excluded.email;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_growsupport_admin_user() from public;

drop trigger if exists sync_growsupport_admin_user on auth.users;
create trigger sync_growsupport_admin_user
after insert or update of email on auth.users
for each row
execute function public.sync_growsupport_admin_user();

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

create unique index if not exists public_member_profiles_public_handle_unique_idx
  on public.public_member_profiles (lower(public_handle))
  where public_handle is not null and btrim(public_handle) <> '';

create index if not exists public_member_profiles_public_handle_lookup_idx
  on public.public_member_profiles (lower(public_handle), profile_visibility, show_profile_in_community_grow);

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
  add column if not exists bio text default '';

alter table public.public_member_profiles
  add column if not exists public_handle text;

alter table public.public_member_profiles
  add column if not exists location_region text default '';

alter table public.public_member_profiles
  add column if not exists country_code text;

alter table public.public_member_profiles
  add column if not exists profile_visibility text not null default 'public';

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

update public.public_member_profiles
set country_code = case
    when country_code is not null and btrim(country_code) ~* '^[a-z]{2}$' then upper(btrim(country_code))
    when btrim(coalesce(location_region, '')) ~* '^[a-z]{2}$' then upper(btrim(location_region))
    when lower(btrim(coalesce(location_region, ''))) in ('america', 'usa', 'u.s.a.', 'u.s.', 'us', 'united states', 'united states of america') then 'US'
    when lower(btrim(coalesce(location_region, ''))) in ('canada', 'ca') then 'CA'
    when lower(btrim(coalesce(location_region, ''))) in ('germany', 'deutschland', 'de') then 'DE'
    when lower(btrim(coalesce(location_region, ''))) in ('austria', 'osterreich', 'at') then 'AT'
    when lower(btrim(coalesce(location_region, ''))) in ('united kingdom', 'uk', 'great britain', 'england', 'scotland', 'wales', 'gb') then 'GB'
    when lower(btrim(coalesce(location_region, ''))) in ('ireland', 'ie') then 'IE'
    when lower(btrim(coalesce(location_region, ''))) in ('france', 'fr') then 'FR'
    when lower(btrim(coalesce(location_region, ''))) in ('spain', 'es') then 'ES'
    when lower(btrim(coalesce(location_region, ''))) in ('italy', 'it') then 'IT'
    when lower(btrim(coalesce(location_region, ''))) in ('netherlands', 'holland', 'nl') then 'NL'
    when lower(btrim(coalesce(location_region, ''))) in ('belgium', 'be') then 'BE'
    when lower(btrim(coalesce(location_region, ''))) in ('switzerland', 'ch') then 'CH'
    when lower(btrim(coalesce(location_region, ''))) in ('australia', 'au') then 'AU'
    when lower(btrim(coalesce(location_region, ''))) in ('new zealand', 'nz') then 'NZ'
    when lower(btrim(coalesce(location_region, ''))) in ('mexico', 'mx') then 'MX'
    when lower(btrim(coalesce(location_region, ''))) in ('brazil', 'br') then 'BR'
    else null
  end,
  updated_at = timezone('utc', now())
where country_code is null
  and nullif(btrim(coalesce(location_region, '')), '') is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_member_profiles_visibility_check'
      and conrelid = 'public.public_member_profiles'::regclass
  ) then
    alter table public.public_member_profiles
      add constraint public_member_profiles_visibility_check
      check (profile_visibility in ('public', 'private'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'public_member_profiles_country_code_check'
      and conrelid = 'public.public_member_profiles'::regclass
  ) then
    alter table public.public_member_profiles
      add constraint public_member_profiles_country_code_check
      check (country_code is null or country_code ~ '^[A-Z]{2}$');
  end if;
end
$$;

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
  add column if not exists entry_path text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.grow_sessions'::regclass
      and conname = 'grow_sessions_entry_path_check'
  ) then
    alter table public.grow_sessions
      add constraint grow_sessions_entry_path_check
      check (entry_path is null or entry_path in ('seed', 'grow'));
  end if;
end;
$$;

comment on column public.grow_sessions.entry_path is
  'Canonical Session entry path: seed begins with Germination; grow begins with Growing. Null preserves unclassified legacy Sessions.';

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
  add column if not exists user_deleted boolean not null default false;

alter table public.grow_sessions
  add column if not exists user_deleted_at timestamptz;

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

create or replace view public.safe_public_member_profiles as
select
  id,
  user_id,
  display_name,
  avatar_url,
  bio,
  public_handle,
  location_region,
  country_code,
  profile_visibility,
  joined_at,
  show_profile_in_community_grow,
  show_grow_stats_publicly,
  created_at,
  updated_at
from public.public_member_profiles
where coalesce(show_profile_in_community_grow, true) = true
  and coalesce(profile_visibility, 'public') = 'public'
  and nullif(btrim(coalesce(display_name, '')), '') is not null
  and exists (
    select 1
    from public.profiles
    where profiles.id = public_member_profiles.user_id
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  );

comment on view public.safe_public_member_profiles is
  'Public-safe profile lookup surface. Exposes approved profile identity fields only for visible active public profiles.';

revoke all on table public.safe_public_member_profiles from public;
grant select on table public.safe_public_member_profiles to anon, authenticated;
revoke select on table public.public_member_profiles from anon;
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
      and coalesce(public_member_profiles.profile_visibility, 'public') = 'public'
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
      and coalesce(public_member_profiles.profile_visibility, 'public') = 'public'
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
  country_code text,
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
      public_member_profiles.country_code,
      public_member_profiles.joined_at
    from public.public_member_profiles
    inner join public.profiles
      on profiles.id = public_member_profiles.id
    where coalesce(public_member_profiles.show_profile_in_community_grow, true) = true
      and coalesce(public_member_profiles.profile_visibility, 'public') = 'public'
      and nullif(btrim(coalesce(public_member_profiles.display_name, '')), '') is not null
      and coalesce(profiles.account_status, 'active') = 'active'
      and coalesce(profiles.deletion_status, '') <> 'deleted'
  ),
  normalized_relationship as (
    select case
      when lower(coalesce($2, '')) = 'following' then 'following'
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
    visible_public_member_profiles.country_code,
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
    when lower(coalesce(grow_sessions.session_status, '')) in ('deleted', 'archived', 'archived_test') then 'deleted_session'
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

create or replace function public.is_grow_session_admin()
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

revoke all on function public.is_grow_session_admin() from public;
grant execute on function public.is_grow_session_admin() to authenticated;

create or replace function public.enforce_grow_session_regular_delete_policy()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  actor_is_admin boolean := public.is_grow_session_admin();
begin
  if actor_id is null or actor_is_admin then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    raise exception 'Regular users cannot permanently delete grow sessions. Use user_deleted soft delete.' using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    new.is_mock := false;
    new.is_test := false;
    new.excluded_from_analytics := false;
    new.analytics_excluded_reason := '';
    new.analytics_excluded_at := null;
    new.is_deleted := false;
    new.deleted_at := null;
    if coalesce(new.user_deleted, false) = true then
      new.user_deleted_at := coalesce(new.user_deleted_at, timezone('utc', now()));
      new.visibility_status := 'hidden';
    elsif lower(coalesce(new.visibility_status, '')) in ('deleted', 'archived', 'archived_test', 'hidden') then
      new.visibility_status := 'active';
    end if;
    return new;
  end if;

  if coalesce(old.user_deleted, false) = true
    or coalesce(old.is_deleted, false) = true
    or lower(coalesce(old.visibility_status, '')) in ('hidden', 'deleted', 'archived', 'archived_test') then
    raise exception 'Hidden grow sessions cannot be reopened or edited.' using errcode = '42501';
  end if;

  if new.is_mock is distinct from old.is_mock
    or new.is_test is distinct from old.is_test
    or new.excluded_from_analytics is distinct from old.excluded_from_analytics
    or new.analytics_excluded_reason is distinct from old.analytics_excluded_reason
    or new.analytics_excluded_at is distinct from old.analytics_excluded_at
    or new.is_deleted is distinct from old.is_deleted
    or new.deleted_at is distinct from old.deleted_at then
    raise exception 'Founder/admin cleanup is required to permanently exclude grow sessions from analytics.' using errcode = '42501';
  end if;

  if lower(coalesce(new.session_status, '')) in ('deleted', 'archived', 'archived_test')
    and new.session_status is distinct from old.session_status then
    raise exception 'Founder/admin cleanup is required to archive grow sessions for analytics exclusion.' using errcode = '42501';
  end if;

  if coalesce(new.user_deleted, false) = true and coalesce(old.user_deleted, false) = false then
    new.user_deleted_at := coalesce(new.user_deleted_at, timezone('utc', now()));
    new.visibility_status := 'hidden';
    return new;
  end if;

  if new.user_deleted is distinct from old.user_deleted
    or new.user_deleted_at is distinct from old.user_deleted_at
    or new.visibility_status is distinct from old.visibility_status then
    raise exception 'Regular users can only hide sessions through user_deleted soft delete.' using errcode = '42501';
  end if;

  return new;
end;
$$;

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
after insert or update of session_status, completed_at, session_started_at, soak_started_at, germination_started_at, is_mock, is_test, excluded_from_analytics, is_deleted, visibility_status, deleted_at, user_deleted, user_deleted_at
on public.grow_sessions
for each row
execute function public.enforce_grow_session_analytics_eligibility();

drop trigger if exists grow_sessions_regular_delete_policy on public.grow_sessions;
create trigger grow_sessions_regular_delete_policy
before insert or update or delete
on public.grow_sessions
for each row
execute function public.enforce_grow_session_regular_delete_policy();

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

  new.bio = coalesce(new.bio, '');
  new.location_region = coalesce(new.location_region, '');
  new.country_code = nullif(upper(btrim(coalesce(new.country_code, ''))), '');
  new.public_handle = nullif(lower(regexp_replace(regexp_replace(coalesce(new.public_handle, ''), '^@+', ''), '[^a-zA-Z0-9_-]+', '-', 'g')), '');
  new.profile_visibility = case
    when coalesce(new.show_profile_in_community_grow, true) = false then 'private'
    when lower(coalesce(new.profile_visibility, 'public')) = 'private' then 'private'
    else 'public'
  end;

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
drop policy if exists "Admins can permanently delete grow sessions" on public.grow_sessions;
create policy "Admins can permanently delete grow sessions"
on public.grow_sessions
for delete
using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = any (array['don@cannakan.com', 'mo@cannakan.com'])
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
drop policy if exists "Owners and admins can read member profile rows" on public.public_member_profiles;
create policy "Owners and admins can read member profile rows"
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

comment on column public.grow_sessions.user_deleted is
  'True when the owner hides a session from normal history. Completed real sessions may still contribute anonymized analytics unless explicitly excluded.';

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

create index if not exists grow_sessions_user_deleted_idx
  on public.grow_sessions (user_id, user_deleted, created_at desc);

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
  candidate_session_ids uuid[] default null,
  confirmation_phrase text default '',
  dry_run boolean default true,
  include_explicit_unmarked boolean default false,
  legacy_created_before timestamptz default '2026-05-20 04:00:00+00'::timestamptz,
  reason text default '',
  target_user_id uuid default null
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
  required_confirmation constant text := 'DELETE TEST SESSION';
  actor_id uuid := auth.uid();
  actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  normalized_target_user_id uuid := coalesce(target_user_id, auth.uid());
  requested_ids uuid[] := coalesce(candidate_session_ids, '{}'::uuid[]);
  confirmation_matches boolean := btrim(coalesce(confirmation_phrase, '')) = required_confirmation;
  normalized_legacy_created_before timestamptz := coalesce(legacy_created_before, '2026-05-20 04:00:00+00'::timestamptz);
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
    raise exception 'Confirmation phrase mismatch. Use DELETE TEST SESSION to execute cleanup.' using errcode = '22023';
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

revoke all on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) from public;
grant execute on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) to authenticated;

comment on function public.cleanup_founder_test_grow_sessions(uuid[], text, boolean, boolean, timestamptz, text, uuid) is
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

-- IC-GC-002C: canonical Growing phase and Plant Group persistence.

alter table public.grow_sessions
  add column if not exists post_germination_decision text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.grow_sessions'::regclass
      and conname = 'grow_sessions_post_germination_decision_check'
  ) then
    alter table public.grow_sessions
      add constraint grow_sessions_post_germination_decision_check
      check (post_germination_decision is null or post_germination_decision in ('pending', 'complete', 'grow'));
  end if;
end
$$;

create table if not exists public.grow_session_growing_phases (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.grow_sessions(id) on delete cascade,
  environment_type text not null,
  environment_other text not null default '',
  grow_method text not null,
  grow_method_other text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_growing_phases_environment_check
    check (environment_type in ('Indoor', 'Outdoor', 'Greenhouse', 'Protected Outdoor', 'Mixed', 'Other')),
  constraint grow_session_growing_phases_method_check
    check (grow_method in ('Soil', 'Living Soil', 'Coco', 'Hydro', 'DWC', 'RDWC', 'Rockwool', 'NFT', 'Aeroponic', 'Raised Bed', 'Container', 'Other'))
);

create table if not exists public.grow_session_plant_groups (
  id uuid primary key default gen_random_uuid(),
  growing_phase_id uuid not null references public.grow_session_growing_phases(id) on delete cascade,
  display_order integer not null default 0 check (display_order >= 0),
  plant_label text not null default '',
  source_id uuid references public.source_directory(id) on delete set null,
  source_name text not null default '',
  variety_id uuid references public.variety_directory(id) on delete set null,
  variety_name text not null default '',
  plant_type text,
  sex text,
  plant_count integer not null check (plant_count > 0),
  harvested boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_plant_groups_type_check
    check (plant_type is null or plant_type in ('Seed', 'Seedling', 'Clone', 'Cutting', 'Established Plant', 'Other')),
  constraint grow_session_plant_groups_sex_check
    check (sex is null or sex in ('Unknown', 'Feminized', 'Female', 'Male', 'Regular', 'Other'))
);

create index if not exists grow_session_plant_groups_phase_order_idx
  on public.grow_session_plant_groups(growing_phase_id, display_order, id);

create or replace function public.set_growing_evidence_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists grow_session_growing_phases_set_updated_at on public.grow_session_growing_phases;
create trigger grow_session_growing_phases_set_updated_at
  before update on public.grow_session_growing_phases
  for each row execute function public.set_growing_evidence_updated_at();

drop trigger if exists grow_session_plant_groups_set_updated_at on public.grow_session_plant_groups;
create trigger grow_session_plant_groups_set_updated_at
  before update on public.grow_session_plant_groups
  for each row execute function public.set_growing_evidence_updated_at();

alter table public.grow_session_growing_phases enable row level security;
alter table public.grow_session_plant_groups enable row level security;

drop policy if exists "Owners can read Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can read Growing phase evidence"
  on public.grow_session_growing_phases for select to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can insert Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can insert Growing phase evidence"
  on public.grow_session_growing_phases for insert to authenticated
  with check (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can update Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can update Growing phase evidence"
  on public.grow_session_growing_phases for update to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can delete Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can delete Growing phase evidence"
  on public.grow_session_growing_phases for delete to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can read Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can read Plant Group evidence"
  on public.grow_session_plant_groups for select to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can insert Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can insert Plant Group evidence"
  on public.grow_session_plant_groups for insert to authenticated
  with check (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can update Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can update Plant Group evidence"
  on public.grow_session_plant_groups for update to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can delete Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can delete Plant Group evidence"
  on public.grow_session_plant_groups for delete to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

revoke all on public.grow_session_growing_phases from anon;
revoke all on public.grow_session_plant_groups from anon;
grant select, insert, update, delete on public.grow_session_growing_phases to authenticated;
grant select, insert, update, delete on public.grow_session_plant_groups to authenticated;

comment on table public.grow_session_growing_phases is 'One canonical Growing phase evidence record per Grow Session.';
comment on table public.grow_session_plant_groups is 'Canonical Plant Group evidence owned by a Growing phase record.';
comment on column public.grow_sessions.post_germination_decision is 'Explicit post-Germination lifecycle decision; null preserves legacy compatibility.';

-- Canonical Growing Workspace Tasks (IC-GC-003B).
create table if not exists public.grow_session_tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  growing_phase_id uuid references public.grow_session_growing_phases(id),
  plant_group_id uuid references public.grow_session_plant_groups(id) on delete set null,
  title text not null,
  details text not null default '',
  due_kind text,
  due_date date,
  due_time time without time zone,
  due_at timestamptz,
  due_local_datetime timestamp without time zone,
  due_timezone text,
  due_utc_offset_minutes smallint,
  status text not null default 'open',
  origin text not null default 'user',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_tasks_title_check check (char_length(btrim(title)) between 1 and 160),
  constraint grow_session_tasks_details_check check (char_length(details) <= 2000),
  constraint grow_session_tasks_status_check check (status in ('open', 'completed', 'upcoming')),
  constraint grow_session_tasks_origin_check check (origin in ('user', 'system', 'testing_program')),
  constraint grow_session_tasks_due_kind_check check (due_kind is null or due_kind in ('none', 'date', 'instant')),
  constraint grow_session_tasks_due_shape_check check (
    due_kind is null
    or (
      due_kind = 'none'
      and due_date is null and due_time is null and due_at is null
      and due_local_datetime is null and due_timezone is null and due_utc_offset_minutes is null
    )
    or (
      due_kind = 'date'
      and due_date is not null and due_time is null and due_at is null
      and due_local_datetime is null and due_timezone is null and due_utc_offset_minutes is null
    )
    or (
      due_kind = 'instant'
      and due_date is null and due_time is null and due_at is not null
      and due_local_datetime is not null and nullif(btrim(due_timezone), '') is not null
      and due_utc_offset_minutes between -840 and 840
      and timezone(due_timezone, due_at) = due_local_datetime
      and due_utc_offset_minutes = extract(
        epoch from (due_local_datetime - timezone('UTC', due_at))
      ) / 60
    )
  )
);

create index if not exists grow_session_tasks_session_due_idx
  on public.grow_session_tasks (session_id, status, due_date, due_time, id);
create index if not exists grow_session_tasks_owner_idx
  on public.grow_session_tasks (user_id, session_id);
create index if not exists grow_session_tasks_canonical_due_idx
  on public.grow_session_tasks (session_id, status, due_kind, due_date, due_at, id);

create or replace function public.enforce_grow_session_activity_owner()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $
declare
  parent_owner_id uuid;
begin
  select sessions.user_id
    into parent_owner_id
    from public.grow_sessions sessions
   where sessions.id = new.session_id;

  if parent_owner_id is null then
    raise exception 'Grow Companion activity requires an existing Session.';
  end if;
  if new.user_id is distinct from parent_owner_id then
    raise exception 'Grow Companion activity owner must match its Session owner.';
  end if;
  return new;
end;
$;

revoke all on function public.enforce_grow_session_activity_owner() from public, anon, authenticated, service_role;

drop trigger if exists grow_session_tasks_enforce_owner on public.grow_session_tasks;
create trigger grow_session_tasks_enforce_owner
before insert or update of session_id, user_id on public.grow_session_tasks
for each row execute function public.enforce_grow_session_activity_owner();

create or replace function public.enforce_grow_session_task_context()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $
begin
  if new.growing_phase_id is not null
     and not exists (
       select 1
         from public.grow_session_growing_phases growing_phase
        where growing_phase.id = new.growing_phase_id
          and growing_phase.session_id = new.session_id
     ) then
    raise exception 'Task Growing phase must belong to its Session.';
  end if;

  if new.plant_group_id is not null then
    if new.growing_phase_id is null then
      raise exception 'Task Plant Group context requires Growing phase context.';
    end if;
    if not exists (
      select 1
        from public.grow_session_plant_groups plant_group
        join public.grow_session_growing_phases growing_phase
          on growing_phase.id = plant_group.growing_phase_id
       where plant_group.id = new.plant_group_id
         and growing_phase.id = new.growing_phase_id
         and growing_phase.session_id = new.session_id
    ) then
      raise exception 'Task Plant Group must belong to its Session and Growing phase.';
    end if;
  end if;

  return new;
end;
$;

revoke all on function public.enforce_grow_session_task_context() from public, anon, authenticated, service_role;

drop trigger if exists grow_session_tasks_enforce_context on public.grow_session_tasks;
create trigger grow_session_tasks_enforce_context
before insert or update of session_id, growing_phase_id, plant_group_id
on public.grow_session_tasks
for each row execute function public.enforce_grow_session_task_context();

create or replace function public.set_grow_session_activity_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$;

revoke all on function public.set_grow_session_activity_updated_at() from public, anon, authenticated, service_role;

drop trigger if exists grow_session_tasks_set_updated_at on public.grow_session_tasks;
create trigger grow_session_tasks_set_updated_at
before update on public.grow_session_tasks
for each row execute function public.set_grow_session_activity_updated_at();

alter table public.grow_session_tasks enable row level security;

drop policy if exists "Owners can read their Session tasks" on public.grow_session_tasks;
create policy "Owners can read their Session tasks"
on public.grow_session_tasks for select to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = grow_session_tasks.session_id and session_row.user_id = auth.uid()
  )
);

drop policy if exists "Owners can create their Session tasks" on public.grow_session_tasks;
create policy "Owners can create their Session tasks"
on public.grow_session_tasks for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = grow_session_tasks.session_id and session_row.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update their Session tasks" on public.grow_session_tasks;
create policy "Owners can update their Session tasks"
on public.grow_session_tasks for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = grow_session_tasks.session_id and session_row.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their Session tasks" on public.grow_session_tasks;
create policy "Owners can delete their Session tasks"
on public.grow_session_tasks for delete to authenticated
using (auth.uid() = user_id);

revoke all on public.grow_session_tasks from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.grow_session_tasks to authenticated;

comment on table public.grow_session_tasks is
  'Owner-private canonical Growing Workspace Tasks scoped to one Grow Session.';
comment on column public.grow_session_tasks.due_kind is
  'Canonical due form: none, date, or instant. Null identifies read-compatible legacy due data.';

-- Canonical Growing Workspace Events (IC-GC-003C).
create table if not exists public.grow_session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  growing_phase_id uuid references public.grow_session_growing_phases(id),
  plant_group_id uuid references public.grow_session_plant_groups(id) on delete set null,
  title text,
  details text not null default '',
  occurred_kind text,
  occurred_date date,
  occurred_time time without time zone,
  occurred_at timestamptz,
  occurred_local_datetime timestamp without time zone,
  occurred_timezone text,
  occurred_utc_offset_minutes smallint,
  category text,
  origin text not null default 'user',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_events_title_check check (title is null or char_length(btrim(title)) between 1 and 160),
  constraint grow_session_events_details_check check (char_length(details) <= 2000),
  constraint grow_session_events_category_check check (category is null or category in (
    'observation', 'maintenance', 'environment', 'treatment', 'transplant',
    'harvest', 'issue', 'other', 'plant-health', 'nutrition'
  )),
  constraint grow_session_events_origin_check check (origin in ('user', 'system', 'testing_program')),
  constraint grow_session_events_occurred_kind_check check (occurred_kind is null or occurred_kind in ('date', 'instant')),
  constraint grow_session_events_occurred_shape_check check (
    occurred_kind is null
    or (
      occurred_kind = 'date' and occurred_date is not null and occurred_time is null
      and occurred_at is null and occurred_local_datetime is null
      and occurred_timezone is null and occurred_utc_offset_minutes is null
    )
    or (
      occurred_kind = 'instant' and occurred_date is null and occurred_time is null
      and occurred_at is not null and occurred_local_datetime is not null
      and nullif(btrim(occurred_timezone), '') is not null
      and occurred_utc_offset_minutes between -840 and 840
      and timezone(occurred_timezone, occurred_at) = occurred_local_datetime
      and occurred_utc_offset_minutes = extract(
        epoch from (occurred_local_datetime - timezone('UTC', occurred_at))
      ) / 60
    )
  )
);

create index if not exists grow_session_events_session_date_idx
  on public.grow_session_events (session_id, occurred_date, occurred_time, id);
create index if not exists grow_session_events_owner_idx
  on public.grow_session_events (user_id, session_id);
create index if not exists grow_session_events_canonical_occurrence_idx
  on public.grow_session_events (session_id, occurred_kind, occurred_date, occurred_at, id);

drop trigger if exists grow_session_events_enforce_owner on public.grow_session_events;
create trigger grow_session_events_enforce_owner
before insert or update of session_id, user_id on public.grow_session_events
for each row execute function public.enforce_grow_session_activity_owner();

create or replace function public.enforce_grow_session_event_context()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.growing_phase_id is not null and not exists (
    select 1 from public.grow_session_growing_phases phase
    where phase.id = new.growing_phase_id and phase.session_id = new.session_id
  ) then raise exception 'Event Growing phase must belong to its Session.'; end if;
  if new.plant_group_id is not null and (
    new.growing_phase_id is null or not exists (
      select 1 from public.grow_session_plant_groups plant_group
      join public.grow_session_growing_phases phase on phase.id = plant_group.growing_phase_id
      where plant_group.id = new.plant_group_id and phase.id = new.growing_phase_id
        and phase.session_id = new.session_id
    )
  ) then raise exception 'Event Plant Group must belong to its Session and Growing phase.'; end if;
  return new;
end;
$$;
revoke all on function public.enforce_grow_session_event_context() from public, anon, authenticated, service_role;
drop trigger if exists grow_session_events_enforce_context on public.grow_session_events;
create trigger grow_session_events_enforce_context
before insert or update of session_id, growing_phase_id, plant_group_id on public.grow_session_events
for each row execute function public.enforce_grow_session_event_context();

create or replace function public.enforce_grow_session_event_canonical_write()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op = 'INSERT' then
    if new.origin <> 'user' then raise exception 'New Events must be user-created.'; end if;
    if new.category not in ('observation','maintenance','environment','treatment','transplant','harvest','issue','other') then raise exception 'New Events require a canonical Event type.'; end if;
    if new.occurred_kind not in ('date','instant') then raise exception 'New Events require a canonical occurrence.'; end if;
  else
    if new.created_at is distinct from old.created_at then raise exception 'Event created_at is immutable.'; end if;
    if new.origin is distinct from old.origin then raise exception 'Event origin provenance cannot be relabelled.'; end if;
    if new.category is distinct from old.category and new.category not in ('observation','maintenance','environment','treatment','transplant','harvest','issue','other') then raise exception 'Corrected Events require a canonical Event type.'; end if;
    if old.occurred_kind is null and new.occurred_kind is null
       and (new.occurred_date, new.occurred_time, new.occurred_at, new.occurred_local_datetime, new.occurred_timezone, new.occurred_utc_offset_minutes)
           is distinct from
           (old.occurred_date, old.occurred_time, old.occurred_at, old.occurred_local_datetime, old.occurred_timezone, old.occurred_utc_offset_minutes)
    then raise exception 'Corrected Event occurrence requires a canonical occurrence type.'; end if;
  end if;
  if new.category = 'other' and nullif(btrim(coalesce(new.title, '')), '') is null
     and nullif(btrim(coalesce(new.details, '')), '') is null
  then raise exception 'Other Events require a title or details.'; end if;
  return new;
end;
$$;
revoke all on function public.enforce_grow_session_event_canonical_write() from public, anon, authenticated, service_role;
drop trigger if exists grow_session_events_enforce_canonical_write on public.grow_session_events;
create trigger grow_session_events_enforce_canonical_write
before insert or update on public.grow_session_events
for each row execute function public.enforce_grow_session_event_canonical_write();

drop trigger if exists grow_session_events_set_updated_at on public.grow_session_events;
create trigger grow_session_events_set_updated_at
before update on public.grow_session_events
for each row execute function public.set_grow_session_activity_updated_at();

alter table public.grow_session_events enable row level security;
drop policy if exists "Owners can read their Session events" on public.grow_session_events;
create policy "Owners can read their Session events" on public.grow_session_events for select to authenticated
using (auth.uid() = user_id and exists (select 1 from public.grow_sessions session_row where session_row.id = grow_session_events.session_id and session_row.user_id = auth.uid()));
drop policy if exists "Owners can create their Session events" on public.grow_session_events;
create policy "Owners can create their Session events" on public.grow_session_events for insert to authenticated
with check (auth.uid() = user_id and exists (select 1 from public.grow_sessions session_row where session_row.id = grow_session_events.session_id and session_row.user_id = auth.uid()));
drop policy if exists "Owners can update their Session events" on public.grow_session_events;
create policy "Owners can update their Session events" on public.grow_session_events for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and exists (select 1 from public.grow_sessions session_row where session_row.id = grow_session_events.session_id and session_row.user_id = auth.uid()));
drop policy if exists "Owners can delete their Session events" on public.grow_session_events;
create policy "Owners can delete their Session events" on public.grow_session_events for delete to authenticated
using (auth.uid() = user_id);

revoke all on public.grow_session_events from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.grow_session_events to authenticated;

comment on table public.grow_session_events is 'Owner-private canonical Growing Workspace Events scoped to one Grow Session.';
comment on column public.grow_session_events.occurred_kind is 'Canonical occurrence form: date or instant. Null identifies read-compatible legacy occurrence data.';
-- IC-GC-004: canonical owner-private Growing Workspace Notes.
create table if not exists public.grow_session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  narrative text not null,
  context_type text not null default 'session',
  plant_group_id uuid,
  task_id uuid,
  event_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_notes_narrative_check check (char_length(btrim(narrative)) between 1 and 10000),
  constraint grow_session_notes_context_type_check check (context_type in ('session', 'plant_group', 'task', 'event')),
  constraint grow_session_notes_context_shape_check check (
    (context_type = 'session' and plant_group_id is null and task_id is null and event_id is null)
    or (context_type = 'plant_group' and plant_group_id is not null and task_id is null and event_id is null)
    or (context_type = 'task' and plant_group_id is null and task_id is not null and event_id is null)
    or (context_type = 'event' and plant_group_id is null and task_id is null and event_id is not null)
  )
);

create or replace function public.enforce_grow_session_note_integrity()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare session_owner uuid;
begin
  select user_id into session_owner from public.grow_sessions where id = new.session_id;
  if session_owner is null then raise exception 'Note requires an existing Session.'; end if;
  if tg_op = 'INSERT' and new.author_user_id is distinct from auth.uid() then raise exception 'Note authorship must match the authenticated creator.'; end if;
  if tg_op = 'UPDATE' then
    if new.session_id is distinct from old.session_id then raise exception 'Note containment is immutable.'; end if;
    if new.author_user_id is distinct from old.author_user_id then raise exception 'Note authorship is immutable.'; end if;
    if new.created_at is distinct from old.created_at then raise exception 'Note created_at is immutable.'; end if;
  end if;
  if new.plant_group_id is not null and (
    tg_op = 'INSERT'
    or new.context_type is distinct from old.context_type
    or new.plant_group_id is distinct from old.plant_group_id
  ) and not exists (
    select 1 from public.grow_session_plant_groups g
    join public.grow_session_growing_phases p on p.id = g.growing_phase_id
    where g.id = new.plant_group_id and p.session_id = new.session_id
  ) then raise exception 'Note Plant Group must belong to its Session.'; end if;
  if new.task_id is not null and (
    tg_op = 'INSERT'
    or new.context_type is distinct from old.context_type
    or new.task_id is distinct from old.task_id
  ) and not exists (
    select 1 from public.grow_session_tasks t where t.id = new.task_id and t.session_id = new.session_id
  ) then raise exception 'Note Task must belong to its Session.'; end if;
  if new.event_id is not null and (
    tg_op = 'INSERT'
    or new.context_type is distinct from old.context_type
    or new.event_id is distinct from old.event_id
  ) and not exists (
    select 1 from public.grow_session_events e where e.id = new.event_id and e.session_id = new.session_id
  ) then raise exception 'Note Event must belong to its Session.'; end if;
  return new;
end;
$$;
revoke all on function public.enforce_grow_session_note_integrity() from public, anon, authenticated, service_role;
drop trigger if exists grow_session_notes_enforce_integrity on public.grow_session_notes;
create trigger grow_session_notes_enforce_integrity before insert or update on public.grow_session_notes
for each row execute function public.enforce_grow_session_note_integrity();

drop trigger if exists grow_session_notes_set_updated_at on public.grow_session_notes;
create trigger grow_session_notes_set_updated_at before update on public.grow_session_notes
for each row execute function public.set_grow_session_activity_updated_at();

create index if not exists grow_session_notes_session_updated_idx on public.grow_session_notes (session_id, updated_at desc, id);
alter table public.grow_session_notes enable row level security;
drop policy if exists "Owners can read their Session notes" on public.grow_session_notes;
create policy "Owners can read their Session notes" on public.grow_session_notes for select to authenticated
using (exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()));
drop policy if exists "Owners can create their Session notes" on public.grow_session_notes;
create policy "Owners can create their Session notes" on public.grow_session_notes for insert to authenticated
with check (author_user_id = auth.uid() and exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()));
drop policy if exists "Owners can update their Session notes" on public.grow_session_notes;
create policy "Owners can update their Session notes" on public.grow_session_notes for update to authenticated
using (exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()))
with check (exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()));
drop policy if exists "Owners can delete their Session notes" on public.grow_session_notes;
create policy "Owners can delete their Session notes" on public.grow_session_notes for delete to authenticated
using (exists (select 1 from public.grow_sessions s where s.id = grow_session_notes.session_id and s.user_id = auth.uid()));
revoke all on public.grow_session_notes from public, anon, authenticated, service_role;
grant select, insert, update, delete on public.grow_session_notes to authenticated;
comment on table public.grow_session_notes is 'Canonical owner-private Growing Workspace authored narrative Notes.';

-- ICE-SC-001: canonical Growing commencement and unresolved legacy chronology.
--
-- This migration establishes future lifecycle recording and retrieval only.
-- Existing Sessions are intentionally not backfilled or reclassified.

create table if not exists public.grow_session_phase_commencements (
  session_id uuid primary key references public.grow_sessions(id) on delete cascade,
  phase text not null default 'growing',
  commenced_at timestamptz not null,
  entry_path text not null,
  operation_id uuid not null unique,
  operation_fingerprint text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_phase_commencements_phase_check
    check (phase = 'growing'),
  constraint grow_session_phase_commencements_entry_path_check
    check (entry_path in ('seed', 'grow'))
);

create or replace function public.enforce_canonical_growing_entry()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  canonical_entry_authorized boolean :=
    coalesce(current_setting('app.canonical_growing_entry', true), '') = 'true';
begin
  if tg_op = 'INSERT' then
    if new.entry_path = 'grow'
      and not canonical_entry_authorized
      and current_user <> 'postgres' then
      raise exception 'Direct Growing entry must use the canonical lifecycle boundary.'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if new.entry_path is distinct from old.entry_path then
    raise exception 'Session Entry is immutable after creation.'
      using errcode = '23514';
  end if;

  if old.post_germination_decision = 'grow'
    and new.post_germination_decision is distinct from old.post_germination_decision then
    raise exception 'Canonical Growing entry cannot be reversed or rewritten.'
      using errcode = '23514';
  end if;

  if new.post_germination_decision = 'grow'
    and old.post_germination_decision is distinct from new.post_germination_decision
    and not canonical_entry_authorized
    and current_user <> 'postgres' then
    raise exception 'Begin Growing must use the canonical lifecycle boundary.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_canonical_growing_entry() from public;
revoke all on function public.enforce_canonical_growing_entry() from anon;
revoke all on function public.enforce_canonical_growing_entry() from authenticated;
revoke all on function public.enforce_canonical_growing_entry() from service_role;

drop trigger if exists grow_sessions_enforce_canonical_growing_entry
  on public.grow_sessions;
create trigger grow_sessions_enforce_canonical_growing_entry
  before insert or update of entry_path, post_germination_decision
  on public.grow_sessions
  for each row execute function public.enforce_canonical_growing_entry();

create or replace function public.enter_canonical_growing(
  p_session_id uuid,
  p_operation_id uuid,
  p_entry_path text,
  p_expected_updated_at timestamptz default null,
  p_session_record jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  normalized_entry_path text := lower(btrim(coalesce(p_entry_path, '')));
  normalized_session_record jsonb := coalesce(p_session_record, '{}'::jsonb)
    - 'user_id'
    - 'created_at'
    - 'updated_at';
  input_fingerprint text;
  action_at timestamptz := statement_timestamp();
  existing_session public.grow_sessions%rowtype;
  saved_session public.grow_sessions%rowtype;
  existing_commencement public.grow_session_phase_commencements%rowtype;
  saved_commencement public.grow_session_phase_commencements%rowtype;
begin
  if actor_id is null then
    raise exception 'You must be signed in to enter Growing.'
      using errcode = '42501';
  end if;

  if p_session_id is null or p_operation_id is null then
    raise exception 'Session and operation identities are required.'
      using errcode = '22023';
  end if;

  if normalized_entry_path not in ('seed', 'grow') then
    raise exception 'The Growing entry path is invalid.'
      using errcode = '22023';
  end if;

  input_fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'entry_path', normalized_entry_path,
        'expected_updated_at', p_expected_updated_at,
        'session_record',
          case when normalized_entry_path = 'grow'
            then normalized_session_record
            else '{}'::jsonb
          end
      )::text,
      'sha256'
    ),
    'hex'
  );

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));

  select *
  into existing_commencement
  from public.grow_session_phase_commencements
  where operation_id = p_operation_id;

  if found then
    if existing_commencement.session_id is distinct from p_session_id
      or existing_commencement.entry_path is distinct from normalized_entry_path
      or existing_commencement.operation_fingerprint is distinct from input_fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;

    select *
    into saved_session
    from public.grow_sessions
    where id = existing_commencement.session_id
      and user_id = actor_id;

    if not found then
      raise exception 'The canonical Growing entry is not accessible.'
        using errcode = '42501';
    end if;

    return jsonb_build_object(
      'session', to_jsonb(saved_session),
      'commencement', jsonb_build_object(
        'status', 'authoritative',
        'session_id', existing_commencement.session_id,
        'phase', existing_commencement.phase,
        'commenced_at', existing_commencement.commenced_at,
        'entry_path', existing_commencement.entry_path,
        'operation_id', existing_commencement.operation_id
      )
    );
  end if;

  if exists (
    select 1
    from public.grow_session_phase_commencements
    where session_id = p_session_id
  ) then
    raise exception 'Canonical Growing commencement already exists for this Session.'
      using errcode = '23505';
  end if;

  perform set_config('app.canonical_growing_entry', 'true', true);

  if normalized_entry_path = 'grow' then
    if jsonb_typeof(p_session_record) is distinct from 'object'
      or nullif(btrim(normalized_session_record ->> 'session_name'), '') is null then
      raise exception 'A valid direct-Growing Session record is required.'
        using errcode = '22023';
    end if;

    if coalesce(normalized_session_record ->> 'entry_path', 'grow') <> 'grow'
      or coalesce(nullif(normalized_session_record ->> 'session_status', ''), 'active') <> 'active'
      or normalized_session_record ->> 'post_germination_decision' is not null
      or normalized_session_record ->> 'germination_started_at' is not null
      or normalized_session_record ->> 'first_planted_at' is not null
      or normalized_session_record ->> 'completed_at' is not null then
      raise exception 'Direct-Growing input conflicts with its authorized lifecycle state.'
        using errcode = '23514';
    end if;

    if exists (select 1 from public.grow_sessions where id = p_session_id) then
      raise exception 'The requested direct-Growing Session identity already exists.'
        using errcode = '23505';
    end if;

    insert into public.grow_sessions (
      id,
      user_id,
      date,
      time,
      system_type,
      unit_id,
      session_name,
      custom_session_name,
      session_notes,
      session_images,
      snapshot_state,
      session_status,
      germination_started_at,
      first_planted_at,
      completed_at,
      timer_start_at,
      seed_age_tracking_enabled,
      seed_age_mode,
      session_seed_age_years,
      is_deleted,
      deleted_at,
      visibility_status,
      partitions,
      created_at,
      updated_at,
      is_mock,
      session_started_at,
      soak_started_at,
      is_test,
      excluded_from_analytics,
      user_deleted,
      user_deleted_at,
      entry_path,
      post_germination_decision
    ) values (
      p_session_id,
      actor_id,
      coalesce((normalized_session_record ->> 'date')::date, (action_at at time zone 'UTC')::date),
      coalesce(nullif(normalized_session_record ->> 'time', ''), to_char(action_at at time zone 'UTC', 'HH24:MI')),
      '',
      coalesce(normalized_session_record ->> 'unit_id', ''),
      btrim(normalized_session_record ->> 'session_name'),
      coalesce(normalized_session_record ->> 'custom_session_name', ''),
      coalesce(normalized_session_record ->> 'session_notes', ''),
      coalesce(normalized_session_record -> 'session_images', '[]'::jsonb),
      coalesce(normalized_session_record -> 'snapshot_state', '{}'::jsonb),
      'active',
      null,
      null,
      null,
      case when nullif(normalized_session_record ->> 'timer_start_at', '') is null then null else (normalized_session_record ->> 'timer_start_at')::timestamptz end,
      coalesce((normalized_session_record ->> 'seed_age_tracking_enabled')::boolean, false),
      nullif(normalized_session_record ->> 'seed_age_mode', ''),
      (normalized_session_record ->> 'session_seed_age_years')::numeric,
      coalesce((normalized_session_record ->> 'is_deleted')::boolean, false),
      case when nullif(normalized_session_record ->> 'deleted_at', '') is null then null else (normalized_session_record ->> 'deleted_at')::timestamptz end,
      coalesce(nullif(normalized_session_record ->> 'visibility_status', ''), 'active'),
      coalesce(normalized_session_record -> 'partitions', '[]'::jsonb),
      action_at,
      action_at,
      false,
      case
        when nullif(normalized_session_record ->> 'session_started_at', '') is null then action_at
        else (normalized_session_record ->> 'session_started_at')::timestamptz
      end,
      case when nullif(normalized_session_record ->> 'soak_started_at', '') is null then null else (normalized_session_record ->> 'soak_started_at')::timestamptz end,
      coalesce((normalized_session_record ->> 'is_test')::boolean, false),
      coalesce((normalized_session_record ->> 'excluded_from_analytics')::boolean, false),
      coalesce((normalized_session_record ->> 'user_deleted')::boolean, false),
      case when nullif(normalized_session_record ->> 'user_deleted_at', '') is null then null else (normalized_session_record ->> 'user_deleted_at')::timestamptz end,
      'grow',
      null
    )
    returning * into saved_session;
  else
    if p_session_record is not null and p_session_record <> '{}'::jsonb then
      raise exception 'Seed-to-Growing does not accept a replacement Session record.'
        using errcode = '22023';
    end if;

    select *
    into existing_session
    from public.grow_sessions
    where id = p_session_id
    for update;

    if not found then
      raise exception 'The Session was not found.'
        using errcode = 'P0002';
    end if;

    if existing_session.user_id is distinct from actor_id then
      raise exception 'Only the Session owner may begin Growing.'
        using errcode = '42501';
    end if;

    if existing_session.entry_path is distinct from 'seed'
      or lower(coalesce(existing_session.session_status, '')) <> 'completed'
      or existing_session.completed_at is null
      or existing_session.post_germination_decision is distinct from 'pending' then
      raise exception 'The Session is not eligible for the authorized Begin Growing transition.'
        using errcode = '23514';
    end if;

    if p_expected_updated_at is null
      or existing_session.updated_at is distinct from p_expected_updated_at then
      raise exception 'The Session changed before Begin Growing could become canonical.'
        using errcode = '40001';
    end if;

    update public.grow_sessions
    set post_germination_decision = 'grow',
        updated_at = action_at
    where id = p_session_id
    returning * into saved_session;
  end if;

  perform set_config('app.canonical_growing_entry', 'false', true);

  insert into public.grow_session_phase_commencements (
    session_id,
    phase,
    commenced_at,
    entry_path,
    operation_id,
    operation_fingerprint,
    created_at
  ) values (
    p_session_id,
    'growing',
    action_at,
    normalized_entry_path,
    p_operation_id,
    input_fingerprint,
    action_at
  )
  returning * into saved_commencement;

  return jsonb_build_object(
    'session', to_jsonb(saved_session),
    'commencement', jsonb_build_object(
      'status', 'authoritative',
      'session_id', saved_commencement.session_id,
      'phase', saved_commencement.phase,
      'commenced_at', saved_commencement.commenced_at,
      'entry_path', saved_commencement.entry_path,
      'operation_id', saved_commencement.operation_id
    )
  );
end;
$$;

create or replace function public.get_canonical_growing_commencement(
  p_session_id uuid
)
returns table (
  session_id uuid,
  status text,
  commenced_at timestamptz,
  entry_path text,
  operation_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    session_row.id,
    case when commencement.session_id is null
      then 'unresolved'::text
      else 'authoritative'::text
    end,
    commencement.commenced_at,
    commencement.entry_path,
    commencement.operation_id
  from public.grow_sessions session_row
  left join public.grow_session_phase_commencements commencement
    on commencement.session_id = session_row.id
  where session_row.id = p_session_id
    and auth.uid() is not null
    and session_row.user_id = auth.uid();
$$;

alter table public.grow_session_phase_commencements enable row level security;

drop policy if exists "Owners can read canonical phase commencement"
  on public.grow_session_phase_commencements;
create policy "Owners can read canonical phase commencement"
  on public.grow_session_phase_commencements
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.grow_sessions session_row
      where session_row.id = session_id
        and session_row.user_id = auth.uid()
    )
  );

revoke all on public.grow_session_phase_commencements from public;
revoke all on public.grow_session_phase_commencements from anon;
revoke all on public.grow_session_phase_commencements from authenticated;
revoke all on public.grow_session_phase_commencements from service_role;
grant select on public.grow_session_phase_commencements to authenticated;

revoke all on function public.enter_canonical_growing(uuid, uuid, text, timestamptz, jsonb) from public;
revoke all on function public.enter_canonical_growing(uuid, uuid, text, timestamptz, jsonb) from anon;
grant execute on function public.enter_canonical_growing(uuid, uuid, text, timestamptz, jsonb) to authenticated;

revoke all on function public.get_canonical_growing_commencement(uuid) from public;
revoke all on function public.get_canonical_growing_commencement(uuid) from anon;
grant execute on function public.get_canonical_growing_commencement(uuid) to authenticated;

comment on table public.grow_session_phase_commencements is
  'Canonical Session Lifecycle chronology for phase commencement. Existing rows are not inferred or backfilled.';
comment on function public.enter_canonical_growing(uuid, uuid, text, timestamptz, jsonb) is
  'Owner-authorized atomic lifecycle boundary for Seed-to-Growing and direct-Growing entry.';
comment on function public.get_canonical_growing_commencement(uuid) is
  'Read-only access-safe retrieval of authoritative or unresolved Growing commencement.';

notify pgrst, 'reload schema';

-- ICE-SC-002: first canonical Session Conditions production slice.
--
-- Exactly Grow Method and Environment Type are authorized. Both dimensions
-- use correction-aware half-open periods beginning at canonical Growing
-- commencement. Existing Growing Phase values remain authoritative until an
-- eligible Session passes the atomic per-Session migration and cutover gate.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

alter table public.grow_session_growing_phases
  alter column environment_type drop not null,
  alter column environment_other drop not null,
  alter column grow_method drop not null,
  alter column grow_method_other drop not null;

alter table public.grow_session_growing_phases
  alter column environment_other set default '',
  alter column grow_method_other set default '';

create table if not exists public.grow_session_conditions_authority (
  session_id uuid primary key references public.grow_sessions(id) on delete cascade,
  authority_source text not null,
  source_growing_phase_id uuid,
  canonical_revision bigint not null default 0,
  cutover_operation_id uuid not null unique,
  cutover_fingerprint text not null,
  cutover_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_conditions_authority_source_check
    check (authority_source in ('future_growing_entry', 'legacy_migration')),
  constraint grow_session_conditions_authority_revision_check
    check (canonical_revision >= 0)
);

create table if not exists public.grow_session_condition_periods (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  dimension text not null,
  canonical_value text not null,
  other_text text not null default '',
  effective_start timestamptz not null,
  effective_end timestamptz,
  original_actor_id uuid not null,
  source_kind text not null,
  source_operation_id uuid not null,
  source_growing_phase_id uuid,
  source_created_at timestamptz,
  source_updated_at timestamptz,
  revision bigint not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_condition_periods_dimension_check
    check (dimension in ('grow_method', 'environment_type')),
  constraint grow_session_condition_periods_value_check
    check (
      (
        dimension = 'grow_method'
        and canonical_value in (
          'Soil', 'Living Soil', 'Coco', 'Hydro', 'DWC', 'RDWC',
          'Rockwool', 'NFT', 'Aeroponic', 'Raised Bed', 'Container', 'Other'
        )
      )
      or
      (
        dimension = 'environment_type'
        and canonical_value in (
          'Indoor', 'Outdoor', 'Greenhouse', 'Protected Outdoor',
          'Mixed', 'Other'
        )
      )
    ),
  constraint grow_session_condition_periods_other_check
    check (
      char_length(other_text) <= 160
      and (
        canonical_value = 'Other'
        or other_text = ''
      )
    ),
  constraint grow_session_condition_periods_chronology_check
    check (effective_end is null or effective_end > effective_start),
  constraint grow_session_condition_periods_source_check
    check (source_kind in ('owner_declaration', 'operational_change', 'legacy_migration')),
  constraint grow_session_condition_periods_revision_check
    check (revision > 0),
  constraint grow_session_condition_periods_unique_start
    unique (session_id, dimension, effective_start),
  constraint grow_session_condition_periods_no_overlap
    exclude using gist (
      session_id with =,
      dimension with =,
      tstzrange(effective_start, effective_end, '[)') with &&
    )
);

create unique index if not exists grow_session_condition_periods_one_open_idx
  on public.grow_session_condition_periods(session_id, dimension)
  where effective_end is null;

create index if not exists grow_session_condition_periods_history_idx
  on public.grow_session_condition_periods(
    session_id,
    effective_start,
    dimension,
    id
  );

create table if not exists public.grow_session_condition_corrections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  condition_period_id uuid not null references public.grow_session_condition_periods(id) on delete cascade,
  revision bigint not null,
  before_facts jsonb not null,
  after_facts jsonb not null,
  correcting_actor_id uuid not null,
  operation_id uuid not null unique,
  operation_fingerprint text not null,
  corrected_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_condition_corrections_revision_check
    check (revision > 1),
  constraint grow_session_condition_corrections_changed_check
    check (before_facts <> after_facts)
);

create index if not exists grow_session_condition_corrections_history_idx
  on public.grow_session_condition_corrections(
    session_id,
    condition_period_id,
    revision,
    corrected_at,
    id
  );

create table if not exists public.grow_session_condition_operations (
  operation_id uuid primary key,
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  operation_kind text not null,
  dimension text,
  input_fingerprint text not null,
  result jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_condition_operations_kind_check
    check (
      operation_kind in (
        'authority_initialize',
        'legacy_migration',
        'declaration',
        'operational_change',
        'correction'
      )
    ),
  constraint grow_session_condition_operations_dimension_check
    check (
      dimension is null
      or dimension in ('grow_method', 'environment_type')
    )
);

create or replace function public.normalize_session_condition_input(
  p_dimension text,
  p_value text,
  p_other_text text default ''
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  normalized_dimension text := lower(btrim(coalesce(p_dimension, '')));
  candidate_value text := btrim(coalesce(p_value, ''));
  normalized_value text;
  normalized_other text := btrim(
    regexp_replace(coalesce(p_other_text, ''), '\s+', ' ', 'g')
  );
begin
  if normalized_dimension = 'grow_method' then
    select approved_value
    into normalized_value
    from unnest(array[
      'Soil', 'Living Soil', 'Coco', 'Hydro', 'DWC', 'RDWC',
      'Rockwool', 'NFT', 'Aeroponic', 'Raised Bed', 'Container', 'Other'
    ]) approved_value
    where lower(approved_value) = lower(candidate_value);
  elsif normalized_dimension = 'environment_type' then
    select approved_value
    into normalized_value
    from unnest(array[
      'Indoor', 'Outdoor', 'Greenhouse', 'Protected Outdoor', 'Mixed', 'Other'
    ]) approved_value
    where lower(approved_value) = lower(candidate_value);
  else
    raise exception 'The Session Condition dimension is not authorized.'
      using errcode = '22023';
  end if;

  if normalized_value is null then
    raise exception 'The Session Condition value is not approved.'
      using errcode = '22023';
  end if;

  if char_length(normalized_other) > 160 then
    normalized_other := left(normalized_other, 160);
  end if;

  if normalized_value <> 'Other' then
    normalized_other := '';
  end if;

  return jsonb_build_object(
    'dimension', normalized_dimension,
    'value', normalized_value,
    'other_text', normalized_other
  );
end;
$$;

create or replace function public.enforce_canonical_session_condition_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  canonical_write boolean :=
    coalesce(current_setting('app.canonical_session_condition_write', true), '') = 'true';
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;

  if not canonical_write then
    raise exception 'Canonical Session Conditions must use the authorized operation boundary.'
      using errcode = '42501';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.enforce_canonical_session_condition_period_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  canonical_write boolean :=
    coalesce(current_setting('app.canonical_session_condition_write', true), '') = 'true';
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;

  if not canonical_write then
    raise exception 'Canonical Session Conditions must use the authorized operation boundary.'
      using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.session_id is distinct from old.session_id
    or new.dimension is distinct from old.dimension
    or new.original_actor_id is distinct from old.original_actor_id
    or new.source_kind is distinct from old.source_kind
    or new.source_operation_id is distinct from old.source_operation_id
    or new.source_growing_phase_id is distinct from old.source_growing_phase_id
    or new.source_created_at is distinct from old.source_created_at
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Canonical Session Condition identity and original provenance are immutable.'
      using errcode = '23514';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.enforce_legacy_condition_authority()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_session_id uuid := coalesce(new.session_id, old.session_id);
  condition_write boolean :=
    tg_op = 'INSERT'
    and (
      new.environment_type is not null
      or coalesce(new.environment_other, '') <> ''
      or new.grow_method is not null
      or coalesce(new.grow_method_other, '') <> ''
    );
begin
  if tg_op = 'UPDATE' then
    condition_write :=
      new.environment_type is distinct from old.environment_type
      or new.environment_other is distinct from old.environment_other
      or new.grow_method is distinct from old.grow_method
      or new.grow_method_other is distinct from old.grow_method_other;
  end if;

  if condition_write and exists (
    select 1
    from public.grow_session_conditions_authority authority_row
    where authority_row.session_id = target_session_id
  ) then
    raise exception 'Legacy Growing fields are non-authoritative after Session Conditions cutover.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists grow_session_conditions_authority_guard
  on public.grow_session_conditions_authority;
create trigger grow_session_conditions_authority_guard
  before insert or update or delete
  on public.grow_session_conditions_authority
  for each row execute function public.enforce_canonical_session_condition_write();

drop trigger if exists grow_session_condition_periods_guard
  on public.grow_session_condition_periods;
create trigger grow_session_condition_periods_guard
  before insert or update or delete
  on public.grow_session_condition_periods
  for each row execute function public.enforce_canonical_session_condition_period_write();

drop trigger if exists grow_session_condition_corrections_guard
  on public.grow_session_condition_corrections;
create trigger grow_session_condition_corrections_guard
  before insert or update or delete
  on public.grow_session_condition_corrections
  for each row execute function public.enforce_canonical_session_condition_write();

drop trigger if exists grow_session_condition_operations_guard
  on public.grow_session_condition_operations;
create trigger grow_session_condition_operations_guard
  before insert or update or delete
  on public.grow_session_condition_operations
  for each row execute function public.enforce_canonical_session_condition_write();

drop trigger if exists grow_session_growing_phases_condition_authority_guard
  on public.grow_session_growing_phases;
create trigger grow_session_growing_phases_condition_authority_guard
  before insert or update of
    environment_type,
    environment_other,
    grow_method,
    grow_method_other
  on public.grow_session_growing_phases
  for each row execute function public.enforce_legacy_condition_authority();

create or replace function public.initialize_session_conditions_authority()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fingerprint text;
  saved_result jsonb;
begin
  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', new.session_id,
        'commenced_at', new.commenced_at,
        'entry_path', new.entry_path,
        'operation_id', new.operation_id
      )::text,
      'sha256'
    ),
    'hex'
  );

  saved_result := jsonb_build_object(
    'session_id', new.session_id,
    'authority', 'conditions',
    'authority_source', 'future_growing_entry',
    'canonical_revision', 0,
    'cutover_at', new.commenced_at
  );

  perform set_config('app.canonical_session_condition_write', 'true', true);

  insert into public.grow_session_conditions_authority (
    session_id,
    authority_source,
    canonical_revision,
    cutover_operation_id,
    cutover_fingerprint,
    cutover_at,
    created_at
  ) values (
    new.session_id,
    'future_growing_entry',
    0,
    new.operation_id,
    fingerprint,
    new.commenced_at,
    new.commenced_at
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    input_fingerprint,
    result,
    created_at
  ) values (
    new.operation_id,
    new.session_id,
    'authority_initialize',
    fingerprint,
    saved_result,
    new.commenced_at
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return new;
end;
$$;

drop trigger if exists grow_session_commencement_initialize_conditions
  on public.grow_session_phase_commencements;
create trigger grow_session_commencement_initialize_conditions
  after insert
  on public.grow_session_phase_commencements
  for each row execute function public.initialize_session_conditions_authority();

create or replace function public.project_canonical_session_conditions(
  p_session_id uuid,
  p_at timestamptz default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  commencement_row public.grow_session_phase_commencements%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  phase_row public.grow_session_growing_phases%rowtype;
  defined_at timestamptz := coalesce(p_at, statement_timestamp());
  dimension_name text;
  period_row public.grow_session_condition_periods%rowtype;
  applicable_count integer;
  legacy_value text;
  legacy_other text;
  condition_result jsonb;
  condition_results jsonb := '[]'::jsonb;
begin
  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id;

  select *
  into phase_row
  from public.grow_session_growing_phases
  where session_id = p_session_id;

  foreach dimension_name in array array['grow_method', 'environment_type']
  loop
    period_row := null;
    applicable_count := 0;
    legacy_value := null;
    legacy_other := '';

    if commencement_row.session_id is null then
      condition_result := jsonb_build_object(
        'dimension', dimension_name,
        'status', 'unresolved',
        'value', null,
        'other_text', '',
        'period_id', null,
        'effective_start', null,
        'effective_end', null
      );
    elsif defined_at < commencement_row.commenced_at then
      condition_result := jsonb_build_object(
        'dimension', dimension_name,
        'status', 'not_applicable',
        'value', null,
        'other_text', '',
        'period_id', null,
        'effective_start', null,
        'effective_end', null
      );
    elsif authority_row.session_id is not null then
      select count(*)
      into applicable_count
      from public.grow_session_condition_periods condition_period
      where condition_period.session_id = p_session_id
        and condition_period.dimension = dimension_name
        and condition_period.effective_start <= defined_at
        and (
          condition_period.effective_end is null
          or condition_period.effective_end > defined_at
        );

      if applicable_count = 1 then
        select *
        into period_row
        from public.grow_session_condition_periods condition_period
        where condition_period.session_id = p_session_id
          and condition_period.dimension = dimension_name
          and condition_period.effective_start <= defined_at
          and (
            condition_period.effective_end is null
            or condition_period.effective_end > defined_at
          );

        condition_result := jsonb_build_object(
          'dimension', dimension_name,
          'status', 'known',
          'value', period_row.canonical_value,
          'other_text', period_row.other_text,
          'period_id', period_row.id,
          'effective_start', period_row.effective_start,
          'effective_end', period_row.effective_end,
          'period_revision', period_row.revision,
          'source_kind', period_row.source_kind
        );
      elsif applicable_count = 0 then
        condition_result := jsonb_build_object(
          'dimension', dimension_name,
          'status', 'absent',
          'value', null,
          'other_text', '',
          'period_id', null,
          'effective_start', null,
          'effective_end', null
        );
      else
        condition_result := jsonb_build_object(
          'dimension', dimension_name,
          'status', 'unresolved',
          'value', null,
          'other_text', '',
          'period_id', null,
          'effective_start', null,
          'effective_end', null
        );
      end if;
    else
      if dimension_name = 'grow_method' then
        legacy_value := phase_row.grow_method;
        legacy_other := coalesce(phase_row.grow_method_other, '');
      else
        legacy_value := phase_row.environment_type;
        legacy_other := coalesce(phase_row.environment_other, '');
      end if;

      condition_result := jsonb_build_object(
        'dimension', dimension_name,
        'status', case when legacy_value is null then 'absent' else 'known' end,
        'value', legacy_value,
        'other_text', legacy_other,
        'period_id', null,
        'effective_start', commencement_row.commenced_at,
        'effective_end', null,
        'period_revision', null,
        'source_kind', case when legacy_value is null then null else 'legacy_growing_phase' end
      );
    end if;

    condition_results := condition_results || jsonb_build_array(condition_result);
  end loop;

  return jsonb_build_object(
    'session_id', p_session_id,
    'authority', case
      when authority_row.session_id is null then 'legacy'
      else 'conditions'
    end,
    'authority_source', authority_row.authority_source,
    'canonical_revision', coalesce(authority_row.canonical_revision, 0),
    'growing_commencement_status', case
      when commencement_row.session_id is null then 'unresolved'
      else 'authoritative'
    end,
    'growing_commenced_at', commencement_row.commenced_at,
    'defined_at', defined_at,
    'conditions', condition_results
  );
end;
$$;

create or replace function public.get_canonical_session_conditions(
  p_session_id uuid,
  p_at timestamptz default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'You must be signed in to retrieve Session Conditions.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.grow_sessions
    where id = p_session_id
      and user_id = actor_id
  ) then
    return null;
  end if;

  return public.project_canonical_session_conditions(p_session_id, p_at);
end;
$$;

create or replace function public.project_session_condition_dimension_v2(
  p_session_id uuid,
  p_dimension text,
  p_defined_at timestamptz
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  commencement_at timestamptz;
  authority_source text;
  cutover_at timestamptz;
  period_count integer;
  canonical_value text;
  other_text text;
  period_id uuid;
  effective_start timestamptz;
  effective_end timestamptz;
  period_revision bigint;
  source_kind text;
  legacy_value text;
  legacy_other text;
begin
  select c.commenced_at into commencement_at
  from public.grow_session_phase_commencements c where c.session_id = p_session_id;
  select a.authority_source, a.cutover_at into authority_source, cutover_at
  from public.grow_session_conditions_authority a where a.session_id = p_session_id;
  if authority_source = 'forward_legacy_declaration' and p_defined_at < cutover_at then
    return jsonb_build_object('dimension',p_dimension,'status','unavailable','value',null,'other_text','',
      'period_id',null,'effective_start',null,'effective_end',null,'period_revision',null,
      'source_kind','forward_legacy_declaration');
  end if;
  if commencement_at is null and authority_source is null then
    return jsonb_build_object('dimension',p_dimension,'status','unresolved','value',null,'other_text','',
      'period_id',null,'effective_start',null,'effective_end',null);
  end if;
  if authority_source is null and commencement_at is not null and p_defined_at < commencement_at then
    return jsonb_build_object('dimension',p_dimension,'status','not_applicable','value',null,'other_text','',
      'period_id',null,'effective_start',null,'effective_end',null);
  end if;
  if authority_source is not null then
    select count(*) into period_count
    from public.grow_session_condition_periods p
    where p.session_id=p_session_id and p.dimension=p_dimension
      and p.effective_start <= p_defined_at
      and (p.effective_end is null or p.effective_end > p_defined_at);
    if period_count = 1 then
      select p.canonical_value,p.other_text,p.id,p.effective_start,p.effective_end,p.revision,p.source_kind
      into canonical_value,other_text,period_id,effective_start,effective_end,period_revision,source_kind
      from public.grow_session_condition_periods p
      where p.session_id=p_session_id and p.dimension=p_dimension
        and p.effective_start <= p_defined_at
        and (p.effective_end is null or p.effective_end > p_defined_at);
      return jsonb_build_object('dimension',p_dimension,'status','known','value',canonical_value,
        'other_text',other_text,'period_id',period_id,'effective_start',effective_start,
        'effective_end',effective_end,'period_revision',period_revision,'source_kind',source_kind);
    end if;
    return jsonb_build_object('dimension',p_dimension,'status',case when authority_source='forward_legacy_declaration' then 'unavailable' else 'absent' end,
      'value',null,'other_text','', 'period_id',null,'effective_start',null,'effective_end',null,'source_kind',authority_source);
  end if;
  if p_dimension='grow_method' then
    select p.grow_method,p.grow_method_other into legacy_value,legacy_other
    from public.grow_session_growing_phases p where p.session_id=p_session_id;
  else
    select p.environment_type,p.environment_other into legacy_value,legacy_other
    from public.grow_session_growing_phases p where p.session_id=p_session_id;
  end if;
  return jsonb_build_object('dimension',p_dimension,'status',case when legacy_value is null then 'absent' else 'known' end,
    'value',legacy_value,'other_text',coalesce(legacy_other,''),'period_id',null,
    'effective_start',commencement_at,'effective_end',null,'period_revision',null,
    'source_kind',case when legacy_value is null then null else 'legacy_growing_phase' end);
end;
$$;

create or replace function public.project_canonical_session_conditions_v3(
  p_session_id uuid,
  p_at timestamptz default null
)
returns jsonb
language sql
volatile
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'session_id', p_session_id,
    'authority', case when (select a.session_id from public.grow_session_conditions_authority a where a.session_id=p_session_id) is null then 'legacy' else 'conditions' end,
    'authority_source', (select a.authority_source from public.grow_session_conditions_authority a where a.session_id=p_session_id),
    'canonical_revision', coalesce((select a.canonical_revision from public.grow_session_conditions_authority a where a.session_id=p_session_id),0),
    'growing_commencement_status', case when (select c.session_id from public.grow_session_phase_commencements c where c.session_id=p_session_id) is null then 'unresolved' else 'authoritative' end,
    'growing_commenced_at', (select c.commenced_at from public.grow_session_phase_commencements c where c.session_id=p_session_id),
    'defined_at', coalesce(p_at,statement_timestamp()),
    'earlier_conditions_status', case when (select a.authority_source from public.grow_session_conditions_authority a where a.session_id=p_session_id)='forward_legacy_declaration' then 'unavailable' else null end,
    'conditions', jsonb_build_array(
      public.project_session_condition_dimension_v2(p_session_id,'grow_method',coalesce(p_at,statement_timestamp())),
      public.project_session_condition_dimension_v2(p_session_id,'environment_type',coalesce(p_at,statement_timestamp()))
    )
  );
$$;

create or replace function public.get_session_condition_history(p_session_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  authority_row public.grow_session_conditions_authority%rowtype;
  periods jsonb := '[]'::jsonb;
  corrections jsonb := '[]'::jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to retrieve Session Condition history.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = p_session_id and session_row.user_id = actor_id
  ) then
    return null;
  end if;
  select * into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id;
  select coalesce(jsonb_agg(to_jsonb(ordered_period) order by ordered_period.effective_start,
    case ordered_period.dimension when 'grow_method' then 1 else 2 end, ordered_period.id), '[]'::jsonb)
  into periods
  from public.grow_session_condition_periods ordered_period
  where ordered_period.session_id = p_session_id;
  select coalesce(jsonb_agg(to_jsonb(ordered_correction) order by ordered_correction.corrected_at,
    ordered_correction.condition_period_id, ordered_correction.revision, ordered_correction.id), '[]'::jsonb)
  into corrections
  from public.grow_session_condition_corrections ordered_correction
  where ordered_correction.session_id = p_session_id;
  return jsonb_build_object(
    'session_id', p_session_id,
    'authority', case when authority_row.session_id is null then 'legacy' else 'conditions' end,
    'authority_source', authority_row.authority_source,
    'earlier_conditions_status', case when authority_row.authority_source = 'forward_legacy_declaration' then 'unavailable' else null end,
    'canonical_revision', coalesce(authority_row.canonical_revision, 0),
    'periods', periods,
    'corrections', corrections
  );
end;
$$;

create or replace function public.change_current_session_conditions(
  p_session_id uuid,
  p_operation_id uuid,
  p_changes jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  authority_row public.grow_session_conditions_authority%rowtype;
  existing_operation public.grow_session_condition_operations%rowtype;
  method_period public.grow_session_condition_periods%rowtype;
  environment_period public.grow_session_condition_periods%rowtype;
  method_input jsonb;
  environment_input jsonb;
  normalized_changes jsonb := '{}'::jsonb;
  fingerprint text;
  operation_at timestamptz;
  changed_method boolean := false;
  changed_environment boolean := false;
  changed_dimensions jsonb := '[]'::jsonb;
  saved_method public.grow_session_condition_periods%rowtype;
  saved_environment public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then raise exception 'You must be signed in to change Session Conditions.' using errcode = '42501'; end if;
  if p_session_id is null or p_operation_id is null or p_expected_revision is null
    or jsonb_typeof(p_changes) is distinct from 'object' then
    raise exception 'Session, operation, changes, and expected revision are required.' using errcode = '22023';
  end if;
  if p_changes = '{}'::jsonb then
    raise exception 'At least one Session Condition dimension is required.' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_object_keys(p_changes) field where field not in ('grow_method','environment_type')) then
    raise exception 'The change contains an unauthorized Session Condition dimension.' using errcode = '22023';
  end if;
  if p_changes ? 'grow_method' then
    if jsonb_typeof(p_changes -> 'grow_method') is distinct from 'object' then raise exception 'Grow Method input must be an object.' using errcode = '22023'; end if;
    method_input := public.normalize_session_condition_input('grow_method', p_changes #>> '{grow_method,value}', coalesce(p_changes #>> '{grow_method,other_text}', ''));
    normalized_changes := normalized_changes || jsonb_build_object('grow_method', method_input);
  end if;
  if p_changes ? 'environment_type' then
    if jsonb_typeof(p_changes -> 'environment_type') is distinct from 'object' then raise exception 'Environment Type input must be an object.' using errcode = '22023'; end if;
    environment_input := public.normalize_session_condition_input('environment_type', p_changes #>> '{environment_type,value}', coalesce(p_changes #>> '{environment_type,other_text}', ''));
    normalized_changes := normalized_changes || jsonb_build_object('environment_type', environment_input);
  end if;
  fingerprint := encode(extensions.digest(jsonb_build_object(
    'session_id', p_session_id, 'operation_kind', 'current_change',
    'changes', normalized_changes, 'expected_revision', p_expected_revision
  )::text, 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));
  select * into existing_operation from public.grow_session_condition_operations where operation_id = p_operation_id;
  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'current_change'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.' using errcode = '23505';
    end if;
    if not exists (select 1 from public.grow_sessions where id = p_session_id and user_id = actor_id) then
      raise exception 'The canonical Session Condition is not accessible.' using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;
  if not exists (select 1 from public.grow_sessions where id = p_session_id and user_id = actor_id) then
    raise exception 'Only the Session owner may change Session Conditions.' using errcode = '42501';
  end if;
  select * into authority_row from public.grow_session_conditions_authority where session_id = p_session_id for update;
  if not found then raise exception 'Legacy Growing fields remain authoritative for this Session.' using errcode = '23514'; end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then raise exception 'The canonical Session Conditions revision is stale.' using errcode = '40001'; end if;
  if method_input is not null then
    select * into method_period from public.grow_session_condition_periods where session_id = p_session_id and dimension = 'grow_method' and effective_end is null for update;
    if not found then raise exception 'No current canonical Grow Method period exists.' using errcode = '23514'; end if;
    changed_method := method_period.canonical_value is distinct from method_input ->> 'value'
      or method_period.other_text is distinct from method_input ->> 'other_text';
  end if;
  if environment_input is not null then
    select * into environment_period from public.grow_session_condition_periods where session_id = p_session_id and dimension = 'environment_type' and effective_end is null for update;
    if not found then raise exception 'No current canonical Environment Type period exists.' using errcode = '23514'; end if;
    changed_environment := environment_period.canonical_value is distinct from environment_input ->> 'value'
      or environment_period.other_text is distinct from environment_input ->> 'other_text';
  end if;
  if not changed_method and not changed_environment then
    saved_result := jsonb_build_object('operation_kind','current_change','session_id',p_session_id,'canonical_revision',authority_row.canonical_revision,'status','no_change','changed_dimensions',changed_dimensions);
    perform set_config('app.canonical_session_condition_write','true',true);
    insert into public.grow_session_condition_operations(operation_id,session_id,operation_kind,input_fingerprint,result)
    values(p_operation_id,p_session_id,'current_change',fingerprint,saved_result);
    perform set_config('app.canonical_session_condition_write','false',true);
    return saved_result;
  end if;
  operation_at := clock_timestamp();
  perform set_config('app.canonical_session_condition_write','true',true);
  if changed_method then
    update public.grow_session_condition_periods set effective_end=operation_at, revision=revision+1, updated_at=operation_at where id=method_period.id;
    insert into public.grow_session_condition_periods(session_id,dimension,canonical_value,other_text,effective_start,original_actor_id,source_kind,source_operation_id,revision)
    values(p_session_id,'grow_method',method_input->>'value',method_input->>'other_text',operation_at,actor_id,'operational_change',p_operation_id,1) returning * into saved_method;
    changed_dimensions := changed_dimensions || jsonb_build_array('grow_method');
  end if;
  if changed_environment then
    update public.grow_session_condition_periods set effective_end=operation_at, revision=revision+1, updated_at=operation_at where id=environment_period.id;
    insert into public.grow_session_condition_periods(session_id,dimension,canonical_value,other_text,effective_start,original_actor_id,source_kind,source_operation_id,revision)
    values(p_session_id,'environment_type',environment_input->>'value',environment_input->>'other_text',operation_at,actor_id,'operational_change',p_operation_id,1) returning * into saved_environment;
    changed_dimensions := changed_dimensions || jsonb_build_array('environment_type');
  end if;
  update public.grow_session_conditions_authority set canonical_revision=canonical_revision+1 where session_id=p_session_id returning * into authority_row;
  saved_result := jsonb_build_object('operation_kind','current_change','session_id',p_session_id,'status','success','canonical_revision',authority_row.canonical_revision,'effective_at',operation_at,'changed_dimensions',changed_dimensions,'grow_method_period',to_jsonb(saved_method),'environment_type_period',to_jsonb(saved_environment));
  insert into public.grow_session_condition_operations(operation_id,session_id,operation_kind,input_fingerprint,result)
  values(p_operation_id,p_session_id,'current_change',fingerprint,saved_result);
  perform set_config('app.canonical_session_condition_write','false',true);
  return saved_result;
end;
$$;

create or replace function public.correct_current_session_condition(
  p_session_id uuid,
  p_condition_period_id uuid,
  p_operation_id uuid,
  p_correction jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_period public.grow_session_condition_periods%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  existing_operation public.grow_session_condition_operations%rowtype;
  normalized jsonb;
  note text;
  before_facts jsonb;
  after_facts jsonb;
  fingerprint text;
  correction_at timestamptz;
  saved_period public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then raise exception 'You must be signed in to correct Session Conditions.' using errcode = '42501'; end if;
  if p_session_id is null or p_condition_period_id is null or p_operation_id is null or p_expected_revision is null or jsonb_typeof(p_correction) is distinct from 'object' then
    raise exception 'Session, period, operation, correction, and expected revision are required.' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_object_keys(p_correction) field where field not in ('value','other_text','correction_note')) then
    raise exception 'The correction contains an unauthorized field.' using errcode = '22023';
  end if;
  select * into existing_period from public.grow_session_condition_periods where id=p_condition_period_id and session_id=p_session_id for update;
  if not found then raise exception 'The canonical Session Condition period was not found.' using errcode = 'P0002'; end if;
  normalized := public.normalize_session_condition_input(existing_period.dimension,
    case when p_correction ? 'value' then p_correction->>'value' else existing_period.canonical_value end,
    case when p_correction ? 'other_text' then p_correction->>'other_text' else existing_period.other_text end);
  note := public.normalize_session_condition_correction_note(case when p_correction ? 'correction_note' then p_correction->>'correction_note' else null end);
  before_facts := jsonb_build_object('value',existing_period.canonical_value,'other_text',existing_period.other_text,'effective_start',existing_period.effective_start,'effective_end',existing_period.effective_end,'revision',existing_period.revision);
  after_facts := jsonb_build_object('value',normalized->>'value','other_text',normalized->>'other_text','effective_start',existing_period.effective_start,'effective_end',existing_period.effective_end,'revision',existing_period.revision+1,'correction_note',note);
  if existing_period.canonical_value is not distinct from normalized->>'value' and existing_period.other_text is not distinct from normalized->>'other_text' then
    raise exception 'The correction does not change canonical facts.' using errcode = '22023';
  end if;
  fingerprint := encode(extensions.digest(jsonb_build_object('session_id',p_session_id,'operation_kind','correction','period_id',p_condition_period_id,'correction',jsonb_build_object('value',normalized->>'value','other_text',normalized->>'other_text','correction_note',note),'expected_revision',p_expected_revision)::text,'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text,0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text,0));
  select * into existing_operation from public.grow_session_condition_operations where operation_id=p_operation_id;
  if found then
    if existing_operation.session_id is distinct from p_session_id or existing_operation.operation_kind is distinct from 'correction' or existing_operation.dimension is distinct from existing_period.dimension or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.' using errcode = '23505';
    end if;
    if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then raise exception 'The canonical Session Condition is not accessible.' using errcode='42501'; end if;
    return existing_operation.result;
  end if;
  if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then raise exception 'Only the Session owner may correct Session Conditions.' using errcode='42501'; end if;
  select * into authority_row from public.grow_session_conditions_authority where session_id=p_session_id for update;
  if not found then raise exception 'Legacy Growing fields remain authoritative for this Session.' using errcode='23514'; end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then raise exception 'The canonical Session Conditions revision is stale.' using errcode='40001'; end if;
  correction_at := clock_timestamp();
  perform set_config('app.canonical_session_condition_write','true',true);
  update public.grow_session_condition_periods set canonical_value=normalized->>'value', other_text=normalized->>'other_text', revision=revision+1, updated_at=correction_at where id=existing_period.id returning * into saved_period;
  insert into public.grow_session_condition_corrections(session_id,condition_period_id,revision,before_facts,after_facts,correcting_actor_id,operation_id,operation_fingerprint,corrected_at,correction_note)
  values(p_session_id,existing_period.id,saved_period.revision,before_facts,after_facts,actor_id,p_operation_id,fingerprint,correction_at,note);
  update public.grow_session_conditions_authority set canonical_revision=canonical_revision+1 where session_id=p_session_id returning * into authority_row;
  saved_result := jsonb_build_object('operation_kind','correction','status','success','session_id',p_session_id,'canonical_revision',authority_row.canonical_revision,'corrected_at',correction_at,'period',to_jsonb(saved_period),'before_facts',before_facts,'after_facts',after_facts,'correction_note',note);
  insert into public.grow_session_condition_operations(operation_id,session_id,operation_kind,dimension,input_fingerprint,result)
  values(p_operation_id,p_session_id,'correction',existing_period.dimension,fingerprint,saved_result);
  perform set_config('app.canonical_session_condition_write','false',true);
  return saved_result;
end;
$$;

create or replace function public.set_current_conditions_for_unresolved_legacy(
  p_session_id uuid,
  p_operation_id uuid,
  p_changes jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_operation public.grow_session_condition_operations%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  method_input jsonb;
  environment_input jsonb;
  normalized_changes jsonb;
  fingerprint text;
  declaration_at timestamptz;
  method_period public.grow_session_condition_periods%rowtype;
  environment_period public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then raise exception 'You must be signed in to set Current Conditions.' using errcode='42501'; end if;
  if p_session_id is null or p_operation_id is null or p_expected_revision is null or jsonb_typeof(p_changes) is distinct from 'object' then raise exception 'Session, operation, changes, and expected revision are required.' using errcode='22023'; end if;
  if not (p_changes ? 'grow_method' and p_changes ? 'environment_type') then raise exception 'Both Grow Method and Environment Type are required.' using errcode='22023'; end if;
  if exists (select 1 from jsonb_object_keys(p_changes) field where field not in ('grow_method','environment_type')) then raise exception 'The declaration contains an unauthorized Session Condition dimension.' using errcode='22023'; end if;
  method_input := public.normalize_session_condition_input('grow_method',p_changes #>> '{grow_method,value}',coalesce(p_changes #>> '{grow_method,other_text}',''));
  environment_input := public.normalize_session_condition_input('environment_type',p_changes #>> '{environment_type,value}',coalesce(p_changes #>> '{environment_type,other_text}',''));
  normalized_changes := jsonb_build_object('grow_method',method_input,'environment_type',environment_input);
  fingerprint := encode(extensions.digest(jsonb_build_object('session_id',p_session_id,'operation_kind','forward_legacy_declaration','changes',normalized_changes,'expected_revision',p_expected_revision)::text,'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text,0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text,0));
  select * into existing_operation from public.grow_session_condition_operations where operation_id=p_operation_id;
  if found then
    if existing_operation.session_id is distinct from p_session_id or existing_operation.operation_kind is distinct from 'forward_legacy_declaration' or existing_operation.input_fingerprint is distinct from fingerprint then raise exception 'The operation identity was already used with different input.' using errcode='23505'; end if;
    if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then raise exception 'The canonical Session Condition is not accessible.' using errcode='42501'; end if;
    return existing_operation.result;
  end if;
  if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then raise exception 'Only the Session owner may set Current Conditions.' using errcode='42501'; end if;
  if exists (select 1 from public.grow_session_phase_commencements where session_id=p_session_id) then raise exception 'This operation is only for unresolved legacy Sessions.' using errcode='23514'; end if;
  if exists (select 1 from public.grow_session_conditions_authority where session_id=p_session_id) or exists (select 1 from public.grow_session_condition_periods where session_id=p_session_id) then raise exception 'Legacy Session Conditions are already established or ambiguous.' using errcode='23514'; end if;
  if p_expected_revision <> 0 then raise exception 'The unresolved legacy Session revision is stale.' using errcode='40001'; end if;
  declaration_at := clock_timestamp();
  perform set_config('app.canonical_session_condition_write','true',true);
  insert into public.grow_session_conditions_authority(session_id,authority_source,canonical_revision,cutover_operation_id,cutover_fingerprint,cutover_at)
  values(p_session_id,'forward_legacy_declaration',1,p_operation_id,fingerprint,declaration_at) returning * into authority_row;
  insert into public.grow_session_condition_periods(session_id,dimension,canonical_value,other_text,effective_start,original_actor_id,source_kind,source_operation_id,revision)
  values(p_session_id,'grow_method',method_input->>'value',method_input->>'other_text',declaration_at,actor_id,'forward_legacy_declaration',p_operation_id,1) returning * into method_period;
  insert into public.grow_session_condition_periods(session_id,dimension,canonical_value,other_text,effective_start,original_actor_id,source_kind,source_operation_id,revision)
  values(p_session_id,'environment_type',environment_input->>'value',environment_input->>'other_text',declaration_at,actor_id,'forward_legacy_declaration',p_operation_id,1) returning * into environment_period;
  saved_result := jsonb_build_object('operation_kind','forward_legacy_declaration','status','success','session_id',p_session_id,'canonical_revision',1,'declared_at',declaration_at,'earlier_conditions_status','unavailable','grow_method_period',to_jsonb(method_period),'environment_type_period',to_jsonb(environment_period));
  insert into public.grow_session_condition_operations(operation_id,session_id,operation_kind,input_fingerprint,result)
  values(p_operation_id,p_session_id,'forward_legacy_declaration',fingerprint,saved_result);
  perform set_config('app.canonical_session_condition_write','false',true);
  return saved_result;
end;
$$;

create or replace function public.get_current_session_conditions_v1(
  p_session_id uuid,
  p_at timestamptz default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then raise exception 'You must be signed in to retrieve Session Conditions.' using errcode='42501'; end if;
  if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then return null; end if;
  return public.project_canonical_session_conditions_v3(p_session_id,p_at);
end;
$$;

create or replace function public.declare_session_condition(
  p_session_id uuid,
  p_operation_id uuid,
  p_dimension text,
  p_value text,
  p_other_text text,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  normalized jsonb;
  fingerprint text;
  existing_operation public.grow_session_condition_operations%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  commencement_row public.grow_session_phase_commencements%rowtype;
  saved_period public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to declare Session Conditions.'
      using errcode = '42501';
  end if;
  if p_session_id is null or p_operation_id is null or p_expected_revision is null then
    raise exception 'Session, operation, and expected revision are required.'
      using errcode = '22023';
  end if;

  normalized := public.normalize_session_condition_input(
    p_dimension,
    p_value,
    p_other_text
  );
  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'declaration',
        'dimension', normalized ->> 'dimension',
        'value', normalized ->> 'value',
        'other_text', normalized ->> 'other_text',
        'expected_revision', p_expected_revision
      )::text,
      'sha256'
    ),
    'hex'
  );

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(
    p_session_id::text || ':' || (normalized ->> 'dimension'),
    0
  ));

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;

  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'declaration'
      or existing_operation.dimension is distinct from normalized ->> 'dimension'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    if not exists (
      select 1 from public.grow_sessions
      where id = p_session_id and user_id = actor_id
    ) then
      raise exception 'The canonical Session Condition is not accessible.'
        using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;

  if not exists (
    select 1 from public.grow_sessions
    where id = p_session_id and user_id = actor_id
  ) then
    raise exception 'Only the Session owner may declare Session Conditions.'
      using errcode = '42501';
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id
  for update;

  if not found then
    raise exception 'Legacy Growing fields remain authoritative for this Session.'
      using errcode = '23514';
  end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then
    raise exception 'The canonical Session Conditions revision is stale.'
      using errcode = '40001';
  end if;

  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;

  if not found then
    raise exception 'Canonical Growing commencement is unresolved.'
      using errcode = '23514';
  end if;
  if exists (
    select 1
    from public.grow_session_condition_periods
    where session_id = p_session_id
      and dimension = normalized ->> 'dimension'
  ) then
    raise exception 'The first canonical period already exists.'
      using errcode = '23505';
  end if;

  perform set_config('app.canonical_session_condition_write', 'true', true);

  insert into public.grow_session_condition_periods (
    session_id,
    dimension,
    canonical_value,
    other_text,
    effective_start,
    original_actor_id,
    source_kind,
    source_operation_id,
    revision
  ) values (
    p_session_id,
    normalized ->> 'dimension',
    normalized ->> 'value',
    normalized ->> 'other_text',
    commencement_row.commenced_at,
    actor_id,
    'owner_declaration',
    p_operation_id,
    1
  )
  returning * into saved_period;

  update public.grow_session_conditions_authority
  set canonical_revision = canonical_revision + 1
  where session_id = p_session_id
  returning * into authority_row;

  saved_result := jsonb_build_object(
    'operation_kind', 'declaration',
    'session_id', p_session_id,
    'canonical_revision', authority_row.canonical_revision,
    'period', to_jsonb(saved_period)
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    dimension,
    input_fingerprint,
    result
  ) values (
    p_operation_id,
    p_session_id,
    'declaration',
    normalized ->> 'dimension',
    fingerprint,
    saved_result
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return saved_result;
end;
$$;

create or replace function public.change_session_condition(
  p_session_id uuid,
  p_operation_id uuid,
  p_dimension text,
  p_value text,
  p_other_text text,
  p_effective_at timestamptz,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  normalized jsonb;
  fingerprint text;
  existing_operation public.grow_session_condition_operations%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  commencement_row public.grow_session_phase_commencements%rowtype;
  current_period public.grow_session_condition_periods%rowtype;
  saved_period public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to change Session Conditions.'
      using errcode = '42501';
  end if;
  if p_session_id is null or p_operation_id is null
    or p_effective_at is null or p_expected_revision is null then
    raise exception 'Session, operation, effective boundary, and expected revision are required.'
      using errcode = '22023';
  end if;

  normalized := public.normalize_session_condition_input(
    p_dimension,
    p_value,
    p_other_text
  );
  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'operational_change',
        'dimension', normalized ->> 'dimension',
        'value', normalized ->> 'value',
        'other_text', normalized ->> 'other_text',
        'effective_at', p_effective_at,
        'expected_revision', p_expected_revision
      )::text,
      'sha256'
    ),
    'hex'
  );

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(
    p_session_id::text || ':' || (normalized ->> 'dimension'),
    0
  ));

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;

  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'operational_change'
      or existing_operation.dimension is distinct from normalized ->> 'dimension'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    if not exists (
      select 1 from public.grow_sessions
      where id = p_session_id and user_id = actor_id
    ) then
      raise exception 'The canonical Session Condition is not accessible.'
        using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;

  if not exists (
    select 1 from public.grow_sessions
    where id = p_session_id and user_id = actor_id
  ) then
    raise exception 'Only the Session owner may change Session Conditions.'
      using errcode = '42501';
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id
  for update;
  if not found then
    raise exception 'Legacy Growing fields remain authoritative for this Session.'
      using errcode = '23514';
  end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then
    raise exception 'The canonical Session Conditions revision is stale.'
      using errcode = '40001';
  end if;

  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;
  if not found then
    raise exception 'Canonical Growing commencement is unresolved.'
      using errcode = '23514';
  end if;

  select *
  into current_period
  from public.grow_session_condition_periods
  where session_id = p_session_id
    and dimension = normalized ->> 'dimension'
    and effective_end is null
  for update;

  if not found then
    raise exception 'No current canonical period exists for this dimension.'
      using errcode = '23514';
  end if;
  if p_effective_at <= current_period.effective_start
    or p_effective_at < commencement_row.commenced_at then
    raise exception 'The operational-change boundary conflicts with canonical chronology.'
      using errcode = '23514';
  end if;

  perform set_config('app.canonical_session_condition_write', 'true', true);

  update public.grow_session_condition_periods
  set effective_end = p_effective_at,
      revision = revision + 1,
      updated_at = statement_timestamp()
  where id = current_period.id;

  insert into public.grow_session_condition_periods (
    session_id,
    dimension,
    canonical_value,
    other_text,
    effective_start,
    original_actor_id,
    source_kind,
    source_operation_id,
    revision
  ) values (
    p_session_id,
    normalized ->> 'dimension',
    normalized ->> 'value',
    normalized ->> 'other_text',
    p_effective_at,
    actor_id,
    'operational_change',
    p_operation_id,
    1
  )
  returning * into saved_period;

  update public.grow_session_conditions_authority
  set canonical_revision = canonical_revision + 1
  where session_id = p_session_id
  returning * into authority_row;

  saved_result := jsonb_build_object(
    'operation_kind', 'operational_change',
    'session_id', p_session_id,
    'canonical_revision', authority_row.canonical_revision,
    'closed_period_id', current_period.id,
    'period', to_jsonb(saved_period)
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    dimension,
    input_fingerprint,
    result
  ) values (
    p_operation_id,
    p_session_id,
    'operational_change',
    normalized ->> 'dimension',
    fingerprint,
    saved_result
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return saved_result;
end;
$$;

create or replace function public.correct_session_condition(
  p_session_id uuid,
  p_condition_period_id uuid,
  p_operation_id uuid,
  p_correction jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_period public.grow_session_condition_periods%rowtype;
  saved_period public.grow_session_condition_periods%rowtype;
  commencement_row public.grow_session_phase_commencements%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  existing_operation public.grow_session_condition_operations%rowtype;
  normalized jsonb;
  submitted_normalized jsonb;
  submitted_other text;
  submitted_correction jsonb;
  corrected_value text;
  corrected_other text;
  corrected_start timestamptz;
  corrected_end timestamptz;
  before_facts jsonb;
  after_facts jsonb;
  normalized_correction jsonb;
  fingerprint text;
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to correct Session Conditions.'
      using errcode = '42501';
  end if;
  if p_session_id is null or p_condition_period_id is null
    or p_operation_id is null or p_expected_revision is null
    or jsonb_typeof(p_correction) is distinct from 'object' then
    raise exception 'Session, period, operation, correction, and expected revision are required.'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));

  select *
  into existing_period
  from public.grow_session_condition_periods
  where id = p_condition_period_id
    and session_id = p_session_id
  for update;

  if not found then
    raise exception 'The canonical Session Condition period was not found.'
      using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_correction) correction_field
    where correction_field not in (
      'value',
      'other_text',
      'effective_start',
      'effective_end'
    )
  ) then
    raise exception 'The correction contains an unauthorized field.'
      using errcode = '22023';
  end if;

  submitted_other := case when p_correction ? 'other_text'
    then btrim(regexp_replace(coalesce(p_correction ->> 'other_text', ''), '\s+', ' ', 'g'))
    else null
  end;
  if submitted_other is not null and char_length(submitted_other) > 160 then
    submitted_other := left(submitted_other, 160);
  end if;

  if p_correction ? 'value' then
    submitted_normalized := public.normalize_session_condition_input(
      existing_period.dimension,
      p_correction ->> 'value',
      case when p_correction ? 'other_text' then submitted_other else '' end
    );
  end if;

  submitted_correction := jsonb_build_object(
    'value_present', p_correction ? 'value',
    'value', case when p_correction ? 'value'
      then submitted_normalized ->> 'value'
      else null
    end,
    'other_text_present', p_correction ? 'other_text',
    'other_text', case when p_correction ? 'other_text'
      then case when p_correction ? 'value'
        then submitted_normalized ->> 'other_text'
        else submitted_other
      end
      else null
    end,
    'effective_start_present', p_correction ? 'effective_start',
    'effective_start', case when p_correction ? 'effective_start'
      then (p_correction ->> 'effective_start')::timestamptz
      else null
    end,
    'effective_end_present', p_correction ? 'effective_end',
    'effective_end', case when p_correction ? 'effective_end'
      then case
        when p_correction -> 'effective_end' = 'null'::jsonb then null
        else (p_correction ->> 'effective_end')::timestamptz
      end
      else null
    end
  );

  normalized := public.normalize_session_condition_input(
    existing_period.dimension,
    case when p_correction ? 'value'
      then p_correction ->> 'value'
      else existing_period.canonical_value
    end,
    case when p_correction ? 'other_text'
      then p_correction ->> 'other_text'
      else existing_period.other_text
    end
  );
  corrected_value := normalized ->> 'value';
  corrected_other := normalized ->> 'other_text';
  corrected_start := case when p_correction ? 'effective_start'
    then (p_correction ->> 'effective_start')::timestamptz
    else existing_period.effective_start
  end;
  corrected_end := case when p_correction ? 'effective_end'
    then case
      when p_correction -> 'effective_end' = 'null'::jsonb then null
      else (p_correction ->> 'effective_end')::timestamptz
    end
    else existing_period.effective_end
  end;

  normalized_correction := jsonb_build_object(
    'value', corrected_value,
    'other_text', corrected_other,
    'effective_start', corrected_start,
    'effective_end', corrected_end
  );
  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'correction',
        'period_id', p_condition_period_id,
        'correction', submitted_correction,
        'expected_revision', p_expected_revision
      )::text,
      'sha256'
    ),
    'hex'
  );

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;

  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'correction'
      or existing_operation.dimension is distinct from existing_period.dimension
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    if not exists (
      select 1 from public.grow_sessions
      where id = p_session_id and user_id = actor_id
    ) then
      raise exception 'The canonical Session Condition is not accessible.'
        using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;

  if not exists (
    select 1 from public.grow_sessions
    where id = p_session_id and user_id = actor_id
  ) then
    raise exception 'Only the Session owner may correct Session Conditions.'
      using errcode = '42501';
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id
  for update;
  if not found then
    raise exception 'Legacy Growing fields remain authoritative for this Session.'
      using errcode = '23514';
  end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then
    raise exception 'The canonical Session Conditions revision is stale.'
      using errcode = '40001';
  end if;

  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;
  if not found or corrected_start < commencement_row.commenced_at then
    raise exception 'The corrected period conflicts with canonical Growing commencement.'
      using errcode = '23514';
  end if;
  if corrected_end is not null and corrected_end <= corrected_start then
    raise exception 'The corrected period is inverted.'
      using errcode = '23514';
  end if;
  if existing_period.effective_start = (
    select min(period.effective_start)
    from public.grow_session_condition_periods period
    where period.session_id = p_session_id
      and period.dimension = existing_period.dimension
  ) and corrected_start is distinct from commencement_row.commenced_at then
    raise exception 'The first canonical period must remain anchored at Growing commencement.'
      using errcode = '23514';
  end if;
  if exists (
    select 1
    from public.grow_session_condition_periods other_period
    where other_period.session_id = p_session_id
      and other_period.dimension = existing_period.dimension
      and other_period.id <> existing_period.id
      and tstzrange(
        other_period.effective_start,
        other_period.effective_end,
        '[)'
      ) && tstzrange(corrected_start, corrected_end, '[)')
  ) then
    raise exception 'The corrected period overlaps canonical history.'
      using errcode = '23P01';
  end if;

  before_facts := jsonb_build_object(
    'value', existing_period.canonical_value,
    'other_text', existing_period.other_text,
    'effective_start', existing_period.effective_start,
    'effective_end', existing_period.effective_end,
    'revision', existing_period.revision
  );
  after_facts := normalized_correction || jsonb_build_object(
    'revision', existing_period.revision + 1
  );

  if before_facts - 'revision' = after_facts - 'revision' then
    raise exception 'The correction does not change canonical facts.'
      using errcode = '22023';
  end if;

  perform set_config('app.canonical_session_condition_write', 'true', true);

  update public.grow_session_condition_periods
  set canonical_value = corrected_value,
      other_text = corrected_other,
      effective_start = corrected_start,
      effective_end = corrected_end,
      revision = revision + 1,
      updated_at = statement_timestamp()
  where id = existing_period.id
  returning * into saved_period;

  insert into public.grow_session_condition_corrections (
    session_id,
    condition_period_id,
    revision,
    before_facts,
    after_facts,
    correcting_actor_id,
    operation_id,
    operation_fingerprint
  ) values (
    p_session_id,
    existing_period.id,
    saved_period.revision,
    before_facts,
    after_facts,
    actor_id,
    p_operation_id,
    fingerprint
  );

  update public.grow_session_conditions_authority
  set canonical_revision = canonical_revision + 1
  where session_id = p_session_id
  returning * into authority_row;

  saved_result := jsonb_build_object(
    'operation_kind', 'correction',
    'session_id', p_session_id,
    'canonical_revision', authority_row.canonical_revision,
    'period', to_jsonb(saved_period),
    'before_facts', before_facts,
    'after_facts', after_facts
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    dimension,
    input_fingerprint,
    result
  ) values (
    p_operation_id,
    p_session_id,
    'correction',
    existing_period.dimension,
    fingerprint,
    saved_result
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return saved_result;
end;
$$;

create or replace function public.migrate_session_conditions(
  p_session_id uuid,
  p_operation_id uuid,
  p_expected_source_updated_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  session_row public.grow_sessions%rowtype;
  phase_row public.grow_session_growing_phases%rowtype;
  commencement_row public.grow_session_phase_commencements%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  existing_operation public.grow_session_condition_operations%rowtype;
  normalized_method jsonb;
  normalized_environment jsonb;
  fingerprint text;
  saved_result jsonb;
  projection_result jsonb;
  saved_count integer;
begin
  if p_session_id is null or p_operation_id is null
    or p_expected_source_updated_at is null then
    raise exception 'Session, operation, and expected source revision are required.'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));

  select *
  into session_row
  from public.grow_sessions
  where id = p_session_id
  for update;
  if not found then
    raise exception 'The Session was not found.'
      using errcode = 'P0002';
  end if;
  if actor_id is not null and session_row.user_id is distinct from actor_id then
    raise exception 'Only the Session owner may migrate Session Conditions.'
      using errcode = '42501';
  end if;
  actor_id := coalesce(actor_id, session_row.user_id);

  select *
  into phase_row
  from public.grow_session_growing_phases
  where session_id = p_session_id
  for update;
  if not found
    or phase_row.environment_type is null
    or phase_row.grow_method is null then
    raise exception 'Authoritative legacy Session Condition truth is incomplete.'
      using errcode = '23514';
  end if;
  if phase_row.updated_at is distinct from p_expected_source_updated_at then
    raise exception 'Legacy Growing truth changed before migration.'
      using errcode = '40001';
  end if;

  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;
  if not found then
    raise exception 'Canonical Growing commencement is unresolved.'
      using errcode = '23514';
  end if;

  normalized_method := public.normalize_session_condition_input(
    'grow_method',
    phase_row.grow_method,
    phase_row.grow_method_other
  );
  normalized_environment := public.normalize_session_condition_input(
    'environment_type',
    phase_row.environment_type,
    phase_row.environment_other
  );

  if normalized_method ->> 'value' is distinct from phase_row.grow_method
    or normalized_method ->> 'other_text' is distinct from coalesce(phase_row.grow_method_other, '')
    or normalized_environment ->> 'value' is distinct from phase_row.environment_type
    or normalized_environment ->> 'other_text' is distinct from coalesce(phase_row.environment_other, '') then
    raise exception 'Legacy Session Condition truth is not normalization-compatible.'
      using errcode = '23514';
  end if;

  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'legacy_migration',
        'source_phase_id', phase_row.id,
        'source_updated_at', phase_row.updated_at,
        'commenced_at', commencement_row.commenced_at,
        'grow_method', normalized_method,
        'environment_type', normalized_environment
      )::text,
      'sha256'
    ),
    'hex'
  );

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;
  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'legacy_migration'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    return existing_operation.result;
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id
  for update;
  if found then
    raise exception 'Canonical Session Conditions authority already exists.'
      using errcode = '23505';
  end if;

  perform set_config('app.canonical_session_condition_write', 'true', true);

  insert into public.grow_session_condition_periods (
    session_id,
    dimension,
    canonical_value,
    other_text,
    effective_start,
    original_actor_id,
    source_kind,
    source_operation_id,
    source_growing_phase_id,
    source_created_at,
    source_updated_at,
    revision
  ) values
    (
      p_session_id,
      'grow_method',
      normalized_method ->> 'value',
      normalized_method ->> 'other_text',
      commencement_row.commenced_at,
      actor_id,
      'legacy_migration',
      p_operation_id,
      phase_row.id,
      phase_row.created_at,
      phase_row.updated_at,
      1
    ),
    (
      p_session_id,
      'environment_type',
      normalized_environment ->> 'value',
      normalized_environment ->> 'other_text',
      commencement_row.commenced_at,
      actor_id,
      'legacy_migration',
      p_operation_id,
      phase_row.id,
      phase_row.created_at,
      phase_row.updated_at,
      1
    );

  select count(*)
  into saved_count
  from public.grow_session_condition_periods condition_period
  where condition_period.session_id = p_session_id
    and condition_period.source_operation_id = p_operation_id
    and condition_period.effective_start = commencement_row.commenced_at
    and condition_period.effective_end is null;

  if saved_count <> 2
    or not exists (
      select 1
      from public.grow_session_condition_periods
      where session_id = p_session_id
        and dimension = 'grow_method'
        and canonical_value = phase_row.grow_method
        and other_text = coalesce(phase_row.grow_method_other, '')
    )
    or not exists (
      select 1
      from public.grow_session_condition_periods
      where session_id = p_session_id
        and dimension = 'environment_type'
        and canonical_value = phase_row.environment_type
        and other_text = coalesce(phase_row.environment_other, '')
    ) then
    raise exception 'Session Conditions migration parity validation failed.'
      using errcode = '23514';
  end if;

  insert into public.grow_session_conditions_authority (
    session_id,
    authority_source,
    source_growing_phase_id,
    canonical_revision,
    cutover_operation_id,
    cutover_fingerprint,
    cutover_at
  ) values (
    p_session_id,
    'legacy_migration',
    phase_row.id,
    1,
    p_operation_id,
    fingerprint,
    statement_timestamp()
  )
  returning * into authority_row;

  projection_result := public.project_canonical_session_conditions(
    p_session_id,
    commencement_row.commenced_at
  );

  if projection_result is null
    or projection_result ->> 'authority' <> 'conditions'
    or projection_result #>> '{conditions,0,dimension}' <> 'grow_method'
    or projection_result #>> '{conditions,0,status}' <> 'known'
    or projection_result #>> '{conditions,0,value}' is distinct from phase_row.grow_method
    or projection_result #>> '{conditions,0,other_text}' is distinct from coalesce(phase_row.grow_method_other, '')
    or projection_result #>> '{conditions,1,dimension}' <> 'environment_type'
    or projection_result #>> '{conditions,1,status}' <> 'known'
    or projection_result #>> '{conditions,1,value}' is distinct from phase_row.environment_type
    or projection_result #>> '{conditions,1,other_text}' is distinct from coalesce(phase_row.environment_other, '') then
    raise exception 'Session Conditions canonical projection parity validation failed.'
      using errcode = '23514';
  end if;

  saved_result := jsonb_build_object(
    'operation_kind', 'legacy_migration',
    'session_id', p_session_id,
    'authority', 'conditions',
    'canonical_revision', authority_row.canonical_revision,
    'cutover_at', authority_row.cutover_at,
    'migrated_dimensions', jsonb_build_array('grow_method', 'environment_type')
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    input_fingerprint,
    result
  ) values (
    p_operation_id,
    p_session_id,
    'legacy_migration',
    fingerprint,
    saved_result
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return saved_result;
end;
$$;

alter table public.grow_session_conditions_authority enable row level security;
alter table public.grow_session_condition_periods enable row level security;
alter table public.grow_session_condition_corrections enable row level security;
alter table public.grow_session_condition_operations enable row level security;

drop policy if exists "Owners can read Session Conditions authority"
  on public.grow_session_conditions_authority;
create policy "Owners can read Session Conditions authority"
  on public.grow_session_conditions_authority
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.grow_sessions session_row
      where session_row.id = session_id
        and session_row.user_id = auth.uid()
    )
  );

drop policy if exists "Owners can read canonical Session Condition periods"
  on public.grow_session_condition_periods;
create policy "Owners can read canonical Session Condition periods"
  on public.grow_session_condition_periods
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.grow_sessions session_row
      where session_row.id = session_id
        and session_row.user_id = auth.uid()
    )
  );

drop policy if exists "Owners can read Session Condition correction history"
  on public.grow_session_condition_corrections;
create policy "Owners can read Session Condition correction history"
  on public.grow_session_condition_corrections
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.grow_sessions session_row
      where session_row.id = session_id
        and session_row.user_id = auth.uid()
    )
  );

revoke all on public.grow_session_conditions_authority from public;
revoke all on public.grow_session_conditions_authority from anon;
revoke all on public.grow_session_conditions_authority from authenticated;
revoke all on public.grow_session_conditions_authority from service_role;
grant select on public.grow_session_conditions_authority to authenticated;

revoke all on public.grow_session_condition_periods from public;
revoke all on public.grow_session_condition_periods from anon;
revoke all on public.grow_session_condition_periods from authenticated;
revoke all on public.grow_session_condition_periods from service_role;
grant select on public.grow_session_condition_periods to authenticated;

revoke all on public.grow_session_condition_corrections from public;
revoke all on public.grow_session_condition_corrections from anon;
revoke all on public.grow_session_condition_corrections from authenticated;
revoke all on public.grow_session_condition_corrections from service_role;
grant select on public.grow_session_condition_corrections to authenticated;

revoke all on public.grow_session_condition_operations from public;
revoke all on public.grow_session_condition_operations from anon;
revoke all on public.grow_session_condition_operations from authenticated;
revoke all on public.grow_session_condition_operations from service_role;

revoke all on function public.normalize_session_condition_input(text, text, text) from public;
revoke all on function public.normalize_session_condition_input(text, text, text) from anon;
revoke all on function public.normalize_session_condition_input(text, text, text) from authenticated;
revoke all on function public.normalize_session_condition_input(text, text, text) from service_role;

revoke all on function public.enforce_canonical_session_condition_write() from public;
revoke all on function public.enforce_canonical_session_condition_write() from anon;
revoke all on function public.enforce_canonical_session_condition_write() from authenticated;
revoke all on function public.enforce_canonical_session_condition_write() from service_role;

revoke all on function public.enforce_canonical_session_condition_period_write() from public;
revoke all on function public.enforce_canonical_session_condition_period_write() from anon;
revoke all on function public.enforce_canonical_session_condition_period_write() from authenticated;
revoke all on function public.enforce_canonical_session_condition_period_write() from service_role;

revoke all on function public.enforce_legacy_condition_authority() from public;
revoke all on function public.enforce_legacy_condition_authority() from anon;
revoke all on function public.enforce_legacy_condition_authority() from authenticated;
revoke all on function public.enforce_legacy_condition_authority() from service_role;

revoke all on function public.initialize_session_conditions_authority() from public;
revoke all on function public.initialize_session_conditions_authority() from anon;
revoke all on function public.initialize_session_conditions_authority() from authenticated;
revoke all on function public.initialize_session_conditions_authority() from service_role;

revoke all on function public.project_canonical_session_conditions(uuid, timestamptz) from public;
revoke all on function public.project_canonical_session_conditions(uuid, timestamptz) from anon;
revoke all on function public.project_canonical_session_conditions(uuid, timestamptz) from authenticated;
revoke all on function public.project_canonical_session_conditions(uuid, timestamptz) from service_role;

revoke all on function public.get_canonical_session_conditions(uuid, timestamptz) from public;
revoke all on function public.get_canonical_session_conditions(uuid, timestamptz) from anon;
revoke all on function public.get_canonical_session_conditions(uuid, timestamptz) from service_role;
grant execute on function public.get_canonical_session_conditions(uuid, timestamptz) to authenticated;

revoke all on function public.get_session_condition_history(uuid) from public;
revoke all on function public.get_session_condition_history(uuid) from anon;
revoke all on function public.get_session_condition_history(uuid) from service_role;
grant execute on function public.get_session_condition_history(uuid) to authenticated;

revoke all on function public.declare_session_condition(uuid, uuid, text, text, text, bigint) from public;
revoke all on function public.declare_session_condition(uuid, uuid, text, text, text, bigint) from anon;
revoke all on function public.declare_session_condition(uuid, uuid, text, text, text, bigint) from service_role;
grant execute on function public.declare_session_condition(uuid, uuid, text, text, text, bigint) to authenticated;

revoke all on function public.change_session_condition(uuid, uuid, text, text, text, timestamptz, bigint) from public;
revoke all on function public.change_session_condition(uuid, uuid, text, text, text, timestamptz, bigint) from anon;
revoke all on function public.change_session_condition(uuid, uuid, text, text, text, timestamptz, bigint) from service_role;
grant execute on function public.change_session_condition(uuid, uuid, text, text, text, timestamptz, bigint) to authenticated;

revoke all on function public.correct_session_condition(uuid, uuid, uuid, jsonb, bigint) from public;
revoke all on function public.correct_session_condition(uuid, uuid, uuid, jsonb, bigint) from anon;
revoke all on function public.correct_session_condition(uuid, uuid, uuid, jsonb, bigint) from service_role;
grant execute on function public.correct_session_condition(uuid, uuid, uuid, jsonb, bigint) to authenticated;

revoke all on function public.migrate_session_conditions(uuid, uuid, timestamptz) from public;
revoke all on function public.migrate_session_conditions(uuid, uuid, timestamptz) from anon;
revoke all on function public.migrate_session_conditions(uuid, uuid, timestamptz) from service_role;
grant execute on function public.migrate_session_conditions(uuid, uuid, timestamptz) to authenticated;

do $$
declare
  eligible record;
  migration_operation_id uuid;
begin
  for eligible in
    select
      session_row.id as session_id,
      phase_row.id as phase_id,
      phase_row.updated_at
    from public.grow_sessions session_row
    join public.grow_session_phase_commencements commencement_row
      on commencement_row.session_id = session_row.id
    join public.grow_session_growing_phases phase_row
      on phase_row.session_id = session_row.id
    left join public.grow_session_conditions_authority authority_row
      on authority_row.session_id = session_row.id
    where authority_row.session_id is null
      and phase_row.grow_method is not null
      and phase_row.environment_type is not null
      and phase_row.grow_method = btrim(phase_row.grow_method)
      and phase_row.environment_type = btrim(phase_row.environment_type)
      and coalesce(phase_row.grow_method_other, '') =
        btrim(regexp_replace(coalesce(phase_row.grow_method_other, ''), '\s+', ' ', 'g'))
      and coalesce(phase_row.environment_other, '') =
        btrim(regexp_replace(coalesce(phase_row.environment_other, ''), '\s+', ' ', 'g'))
      and char_length(coalesce(phase_row.grow_method_other, '')) <= 160
      and char_length(coalesce(phase_row.environment_other, '')) <= 160
      and (
        phase_row.grow_method = 'Other'
        or coalesce(phase_row.grow_method_other, '') = ''
      )
      and (
        phase_row.environment_type = 'Other'
        or coalesce(phase_row.environment_other, '') = ''
      )
    order by session_row.id
  loop
    migration_operation_id := (
      substr(md5('ICE-SC-002:' || eligible.session_id::text), 1, 8)
      || '-'
      || substr(md5('ICE-SC-002:' || eligible.session_id::text), 9, 4)
      || '-4'
      || substr(md5('ICE-SC-002:' || eligible.session_id::text), 14, 3)
      || '-8'
      || substr(md5('ICE-SC-002:' || eligible.session_id::text), 18, 3)
      || '-'
      || substr(md5('ICE-SC-002:' || eligible.session_id::text), 21, 12)
    )::uuid;

    perform public.migrate_session_conditions(
      eligible.session_id,
      migration_operation_id,
      eligible.updated_at
    );
  end loop;
end;
$$;

comment on table public.grow_session_conditions_authority is
  'Per-Session atomic authority cutover for canonical Grow Method and Environment Type conditions.';
comment on table public.grow_session_condition_periods is
  'Correction-aware canonical Session Condition periods for Grow Method and Environment Type.';
comment on table public.grow_session_condition_corrections is
  'Immutable attributable before-and-after correction history for canonical Session Conditions.';
comment on table public.grow_session_condition_operations is
  'Stable idempotent operation identities and results for canonical Session Condition mutations and cutover.';
comment on function public.project_canonical_session_conditions(uuid, timestamptz) is
  'Internal canonical Platform Session Conditions projection shared by access-safe retrieval and atomic cutover validation.';
comment on function public.get_canonical_session_conditions(uuid, timestamptz) is
  'Canonical Platform Current Conditions and historical-point projection with explicit missing-state meaning.';
comment on function public.get_session_condition_history(uuid) is
  'Deterministic owner-scoped operational period and correction-history retrieval.';

notify pgrst, 'reload schema';

-- End of Cannakan Grow Supabase schema.
