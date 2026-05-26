-- Safe additive push-delivery persistence for Cannakan Grow.
-- This migration does not touch auth records, roles, user preferences, or existing session data.

create table if not exists public.user_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_key text not null,
  endpoint text,
  subscription jsonb not null default '{}'::jsonb,
  p256dh_key text,
  auth_key text,
  permission_state text not null default 'default',
  push_enabled boolean not null default false,
  user_agent text,
  device_label text,
  last_seen_at timestamptz,
  last_tested_at timestamptz,
  last_delivery_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, device_key)
);

create table if not exists public.push_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  device_key text not null,
  session_id text,
  category text,
  endpoint text,
  status text not null default 'pending',
  notification_payload jsonb not null default '{}'::jsonb,
  failure_code text,
  failure_reason text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, event_key, device_key)
);

alter table public.user_push_subscriptions
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists device_key text,
  add column if not exists endpoint text,
  add column if not exists subscription jsonb default '{}'::jsonb,
  add column if not exists p256dh_key text,
  add column if not exists auth_key text,
  add column if not exists permission_state text default 'default',
  add column if not exists push_enabled boolean default false,
  add column if not exists user_agent text,
  add column if not exists device_label text,
  add column if not exists last_seen_at timestamptz,
  add column if not exists last_tested_at timestamptz,
  add column if not exists last_delivery_at timestamptz,
  add column if not exists disabled_at timestamptz,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

alter table public.push_notification_deliveries
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists event_key text,
  add column if not exists device_key text,
  add column if not exists session_id text,
  add column if not exists category text,
  add column if not exists endpoint text,
  add column if not exists status text default 'pending',
  add column if not exists notification_payload jsonb default '{}'::jsonb,
  add column if not exists failure_code text,
  add column if not exists failure_reason text,
  add column if not exists sent_at timestamptz,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

create unique index if not exists user_push_subscriptions_user_device_uidx
  on public.user_push_subscriptions (user_id, device_key)
  where user_id is not null and device_key is not null;

create unique index if not exists push_notification_deliveries_user_event_device_uidx
  on public.push_notification_deliveries (user_id, event_key, device_key)
  where user_id is not null and event_key is not null and device_key is not null;

create index if not exists user_push_subscriptions_user_active_idx
  on public.user_push_subscriptions (user_id, push_enabled, permission_state, disabled_at);

create index if not exists user_push_subscriptions_user_updated_idx
  on public.user_push_subscriptions (user_id, updated_at desc);

create index if not exists push_notification_deliveries_user_event_idx
  on public.push_notification_deliveries (user_id, event_key);

create index if not exists push_notification_deliveries_status_idx
  on public.push_notification_deliveries (status, updated_at desc);

create or replace function public.set_user_push_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists user_push_subscriptions_set_updated_at
  on public.user_push_subscriptions;

create trigger user_push_subscriptions_set_updated_at
  before update on public.user_push_subscriptions
  for each row
  execute function public.set_user_push_subscriptions_updated_at();

create or replace function public.set_push_notification_deliveries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists push_notification_deliveries_set_updated_at
  on public.push_notification_deliveries;

create trigger push_notification_deliveries_set_updated_at
  before update on public.push_notification_deliveries
  for each row
  execute function public.set_push_notification_deliveries_updated_at();

alter table public.user_push_subscriptions enable row level security;
alter table public.push_notification_deliveries enable row level security;

drop policy if exists "Users can read own push subscriptions"
  on public.user_push_subscriptions;
create policy "Users can read own push subscriptions"
  on public.user_push_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own push subscriptions"
  on public.user_push_subscriptions;
create policy "Users can insert own push subscriptions"
  on public.user_push_subscriptions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own push subscriptions"
  on public.user_push_subscriptions;
create policy "Users can update own push subscriptions"
  on public.user_push_subscriptions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own push subscriptions"
  on public.user_push_subscriptions;
create policy "Users can delete own push subscriptions"
  on public.user_push_subscriptions
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can read own push delivery records"
  on public.push_notification_deliveries;
create policy "Users can read own push delivery records"
  on public.push_notification_deliveries
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own push delivery records"
  on public.push_notification_deliveries;
create policy "Users can insert own push delivery records"
  on public.push_notification_deliveries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own push delivery records"
  on public.push_notification_deliveries;
create policy "Users can update own push delivery records"
  on public.push_notification_deliveries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own push delivery records"
  on public.push_notification_deliveries;
create policy "Users can delete own push delivery records"
  on public.push_notification_deliveries
  for delete
  to authenticated
  using (auth.uid() = user_id);
