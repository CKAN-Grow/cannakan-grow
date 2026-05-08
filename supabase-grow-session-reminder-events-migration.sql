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

create index if not exists grow_session_reminder_events_session_status_idx
  on public.grow_session_reminder_events (session_id, status, due_at desc);

create index if not exists grow_session_reminder_events_user_status_idx
  on public.grow_session_reminder_events (user_id, status, created_at desc);

create or replace function public.set_grow_session_reminder_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists grow_session_reminder_events_set_updated_at on public.grow_session_reminder_events;
create trigger grow_session_reminder_events_set_updated_at
before update on public.grow_session_reminder_events
for each row
execute procedure public.set_grow_session_reminder_events_updated_at();

alter table public.grow_session_reminder_events enable row level security;

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
