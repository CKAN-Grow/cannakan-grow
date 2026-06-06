-- Ensure Push Notifications preference persistence exists on deployed Supabase projects.
-- Safe additive migration: preserves existing preference rows and saved handles/devices.

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
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists notify_snapshot boolean not null default true,
  add column if not exists notify_completion boolean not null default true,
  add column if not exists notify_follow boolean not null default true,
  add column if not exists notify_like boolean not null default true,
  add column if not exists push_notifications_enabled boolean not null default false,
  add column if not exists email_notifications boolean not null default true,
  add column if not exists session_reminders boolean not null default true,
  add column if not exists community_updates boolean not null default true,
  add column if not exists low_filter_alerts boolean not null default true,
  add column if not exists grow_reminders_enabled boolean not null default true,
  add column if not exists soaking_reminders boolean not null default true,
  add column if not exists germination_reminders boolean not null default true,
  add column if not exists snapshot_reminders boolean not null default true,
  add column if not exists supply_reminders boolean not null default true,
  add column if not exists community_activity_notifications boolean not null default true,
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.user_notification_preferences
set push_notifications_enabled = false
where push_notifications_enabled is null;

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
  on public.user_notification_preferences (user_id)
  where user_id is not null;

create index if not exists user_notification_preferences_push_enabled_idx
  on public.user_notification_preferences (user_id, push_notifications_enabled, updated_at desc);

create or replace function public.set_user_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists user_notification_preferences_set_updated_at
  on public.user_notification_preferences;

create trigger user_notification_preferences_set_updated_at
  before update on public.user_notification_preferences
  for each row
  execute function public.set_user_notification_preferences_updated_at();

alter table public.user_notification_preferences enable row level security;

drop policy if exists "Users can view their own notification preferences"
  on public.user_notification_preferences;
create policy "Users can view their own notification preferences"
  on public.user_notification_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own notification preferences"
  on public.user_notification_preferences;
create policy "Users can create their own notification preferences"
  on public.user_notification_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notification preferences"
  on public.user_notification_preferences;
create policy "Users can update their own notification preferences"
  on public.user_notification_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
