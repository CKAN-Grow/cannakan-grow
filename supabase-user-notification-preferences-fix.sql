create extension if not exists pgcrypto;

create table if not exists public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  email_notifications boolean not null default true,
  low_filter_alerts boolean not null default true,
  session_reminders boolean not null default true,
  community_updates boolean not null default false,
  notify_snapshot boolean not null default true,
  notify_completion boolean not null default true,
  notify_follow boolean not null default true,
  notify_like boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_notification_preferences
  add column if not exists id uuid default gen_random_uuid();

update public.user_notification_preferences
set id = gen_random_uuid()
where id is null;

alter table public.user_notification_preferences
  alter column id set default gen_random_uuid();

alter table public.user_notification_preferences
  alter column id set not null;

alter table public.user_notification_preferences
  add column if not exists email_notifications boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists low_filter_alerts boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists session_reminders boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists community_updates boolean not null default false;

alter table public.user_notification_preferences
  add column if not exists notify_snapshot boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_completion boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_follow boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists notify_like boolean not null default true;

alter table public.user_notification_preferences
  add column if not exists created_at timestamptz not null default now();

alter table public.user_notification_preferences
  add column if not exists updated_at timestamptz not null default now();

update public.user_notification_preferences
set
  email_notifications = notify_snapshot,
  low_filter_alerts = notify_like,
  session_reminders = notify_completion,
  community_updates = notify_follow
where
  email_notifications is distinct from notify_snapshot
  or low_filter_alerts is distinct from notify_like
  or session_reminders is distinct from notify_completion
  or community_updates is distinct from notify_follow;

do $$
declare
  pk_name text;
  pk_columns text[];
begin
  select
    constraint_name,
    array_agg(column_name order by ordinal_position)
  into pk_name, pk_columns
  from (
    select
      tc.constraint_name,
      kcu.column_name,
      kcu.ordinal_position
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema = kcu.table_schema
     and tc.table_name = kcu.table_name
    where tc.table_schema = 'public'
      and tc.table_name = 'user_notification_preferences'
      and tc.constraint_type = 'PRIMARY KEY'
  ) pk
  group by constraint_name;

  if pk_name is not null and pk_columns <> array['id'] then
    execute format(
      'alter table public.user_notification_preferences drop constraint %I',
      pk_name
    );
  end if;

  if not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'user_notification_preferences'
      and constraint_type = 'PRIMARY KEY'
  ) then
    alter table public.user_notification_preferences
      add constraint user_notification_preferences_pkey primary key (id);
  end if;
end $$;

create unique index if not exists user_notification_preferences_user_id_key
  on public.user_notification_preferences (user_id);

create or replace function public.set_user_notification_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_notification_preferences_set_updated_at on public.user_notification_preferences;
create trigger user_notification_preferences_set_updated_at
before update on public.user_notification_preferences
for each row
execute procedure public.set_user_notification_preferences_updated_at();

alter table public.user_notification_preferences enable row level security;

drop policy if exists "Users can view their own notification preferences" on public.user_notification_preferences;
create policy "Users can view their own notification preferences"
on public.user_notification_preferences
for select
using (auth.uid() = user_id);

drop policy if exists "Users can create their own notification preferences" on public.user_notification_preferences;
create policy "Users can create their own notification preferences"
on public.user_notification_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own notification preferences" on public.user_notification_preferences;
create policy "Users can update their own notification preferences"
on public.user_notification_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
