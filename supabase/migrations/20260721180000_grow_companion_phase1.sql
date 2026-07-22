-- Grow Companion Capability 1: owner-private Session tasks and events.
--
-- This migration depends on the canonical public.grow_sessions table created by
-- 20260501000000_legacy_public_schema_baseline.sql. Activity remains internal to
-- its parent Session: it is not projected into Community, Seed Vault, GIE, or
-- public-profile contracts.

create table if not exists public.grow_session_tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  details text not null default '',
  due_date date not null,
  due_time time without time zone,
  status text not null default 'upcoming',
  origin text not null default 'user',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_tasks_title_check check (char_length(btrim(title)) between 1 and 160),
  constraint grow_session_tasks_details_check check (char_length(details) <= 2000),
  constraint grow_session_tasks_status_check check (status in ('upcoming', 'completed')),
  constraint grow_session_tasks_origin_check check (origin in ('user', 'system', 'testing_program')),
  constraint grow_session_tasks_completion_check check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  )
);

create table if not exists public.grow_session_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  details text not null default '',
  occurred_date date not null,
  occurred_time time without time zone,
  category text,
  origin text not null default 'user',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_events_title_check check (char_length(btrim(title)) between 1 and 160),
  constraint grow_session_events_details_check check (char_length(details) <= 2000),
  constraint grow_session_events_category_check check (
    category is null or category in ('observation', 'transplant', 'plant-health', 'environment', 'nutrition', 'harvest')
  ),
  constraint grow_session_events_origin_check check (origin in ('user', 'system', 'testing_program'))
);

create index if not exists grow_session_tasks_session_due_idx
  on public.grow_session_tasks (session_id, status, due_date, due_time, id);
create index if not exists grow_session_tasks_owner_idx
  on public.grow_session_tasks (user_id, session_id);
create index if not exists grow_session_events_session_occurred_idx
  on public.grow_session_events (session_id, occurred_date desc, occurred_time desc, id);
create index if not exists grow_session_events_owner_idx
  on public.grow_session_events (user_id, session_id);

create or replace function public.enforce_grow_session_activity_owner()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
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
$$;

revoke all on function public.enforce_grow_session_activity_owner() from public, anon, authenticated, service_role;

drop trigger if exists grow_session_tasks_enforce_owner on public.grow_session_tasks;
create trigger grow_session_tasks_enforce_owner
before insert or update of session_id, user_id on public.grow_session_tasks
for each row execute function public.enforce_grow_session_activity_owner();

drop trigger if exists grow_session_events_enforce_owner on public.grow_session_events;
create trigger grow_session_events_enforce_owner
before insert or update of session_id, user_id on public.grow_session_events
for each row execute function public.enforce_grow_session_activity_owner();

create or replace function public.set_grow_session_activity_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function public.set_grow_session_activity_updated_at() from public, anon, authenticated, service_role;

drop trigger if exists grow_session_tasks_set_updated_at on public.grow_session_tasks;
create trigger grow_session_tasks_set_updated_at
before update on public.grow_session_tasks
for each row execute function public.set_grow_session_activity_updated_at();

drop trigger if exists grow_session_events_set_updated_at on public.grow_session_events;
create trigger grow_session_events_set_updated_at
before update on public.grow_session_events
for each row execute function public.set_grow_session_activity_updated_at();

alter table public.grow_session_tasks enable row level security;
alter table public.grow_session_events enable row level security;

drop policy if exists "Owners can read their Session tasks" on public.grow_session_tasks;
create policy "Owners can read their Session tasks"
on public.grow_session_tasks for select to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions sessions
    where sessions.id = grow_session_tasks.session_id and sessions.user_id = auth.uid()
  )
);

drop policy if exists "Owners can create their Session tasks" on public.grow_session_tasks;
create policy "Owners can create their Session tasks"
on public.grow_session_tasks for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions sessions
    where sessions.id = grow_session_tasks.session_id and sessions.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update their Session tasks" on public.grow_session_tasks;
create policy "Owners can update their Session tasks"
on public.grow_session_tasks for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions sessions
    where sessions.id = grow_session_tasks.session_id and sessions.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their Session tasks" on public.grow_session_tasks;
create policy "Owners can delete their Session tasks"
on public.grow_session_tasks for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists "Owners can read their Session events" on public.grow_session_events;
create policy "Owners can read their Session events"
on public.grow_session_events for select to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions sessions
    where sessions.id = grow_session_events.session_id and sessions.user_id = auth.uid()
  )
);

drop policy if exists "Owners can create their Session events" on public.grow_session_events;
create policy "Owners can create their Session events"
on public.grow_session_events for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions sessions
    where sessions.id = grow_session_events.session_id and sessions.user_id = auth.uid()
  )
);

drop policy if exists "Owners can update their Session events" on public.grow_session_events;
create policy "Owners can update their Session events"
on public.grow_session_events for update to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.grow_sessions sessions
    where sessions.id = grow_session_events.session_id and sessions.user_id = auth.uid()
  )
);

drop policy if exists "Owners can delete their Session events" on public.grow_session_events;
create policy "Owners can delete their Session events"
on public.grow_session_events for delete to authenticated
using (auth.uid() = user_id);

revoke all privileges on table public.grow_session_tasks, public.grow_session_events from public, anon, authenticated, service_role;
grant select, insert, update, delete on table public.grow_session_tasks, public.grow_session_events to authenticated;

comment on table public.grow_session_tasks is
  'Owner-private Grow Companion tasks scoped to one canonical Grow Session. Not GIE or public evidence.';
comment on table public.grow_session_events is
  'Owner-private Grow Companion events scoped to one canonical Grow Session. Not GIE or public evidence.';
