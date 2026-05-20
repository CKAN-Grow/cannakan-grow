-- Production repair for the founder/admin grow-session timestamp RPC.
--
-- This migration recreates public.update_owner_grow_session_times with the
-- argument names/order expected by the frontend RPC call. It is scoped to grow
-- sessions only, requires the actor to be signed in, founder/admin-approved,
-- and the owner of the target session, and writes an internal audit row.

alter table public.grow_sessions
  add column if not exists timer_start_at timestamptz,
  add column if not exists session_started_at timestamptz,
  add column if not exists soak_started_at timestamptz,
  add column if not exists germination_started_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz;

create table if not exists public.grow_session_time_edit_audit (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.grow_sessions(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  previous_values jsonb not null default '{}'::jsonb,
  next_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.grow_session_time_edit_audit
  add column if not exists session_id uuid references public.grow_sessions(id) on delete set null,
  add column if not exists actor_user_id uuid references auth.users(id) on delete set null,
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null,
  add column if not exists previous_values jsonb not null default '{}'::jsonb,
  add column if not exists next_values jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default timezone('utc', now());

alter table public.grow_session_time_edit_audit enable row level security;

create index if not exists grow_session_time_edit_audit_session_created_idx
  on public.grow_session_time_edit_audit (session_id, created_at desc);

create index if not exists grow_session_time_edit_audit_actor_created_idx
  on public.grow_session_time_edit_audit (actor_user_id, created_at desc);

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

drop policy if exists "Admins can view grow session time edit audit" on public.grow_session_time_edit_audit;
create policy "Admins can view grow session time edit audit"
on public.grow_session_time_edit_audit
for select
to authenticated
using (public.is_grow_session_timestamp_admin());

drop function if exists public.update_owner_grow_session_times(uuid, timestamptz, timestamptz, timestamptz, timestamptz, date, text);
drop function if exists public.update_owner_grow_session_times(timestamptz, timestamptz, date, uuid, timestamptz, text, timestamptz);

create or replace function public.update_owner_grow_session_times(
  p_completed_at timestamptz,
  p_germination_started_at timestamptz,
  p_session_date date,
  p_session_id uuid,
  p_session_started_at timestamptz,
  p_session_time text,
  p_soak_started_at timestamptz
)
returns public.grow_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_session public.grow_sessions%rowtype;
  updated_session public.grow_sessions%rowtype;
  normalized_session_date date;
  normalized_session_time text;
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

  normalized_session_date := coalesce(p_session_date, (p_session_started_at at time zone 'UTC')::date);
  normalized_session_time := coalesce(nullif(btrim(p_session_time), ''), to_char(p_session_started_at at time zone 'UTC', 'HH24:MI'));

  select *
  into existing_session
  from public.grow_sessions
  where grow_sessions.id = p_session_id
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
  where grow_sessions.id = p_session_id
    and grow_sessions.user_id = auth.uid()
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

revoke all on function public.update_owner_grow_session_times(timestamptz, timestamptz, date, uuid, timestamptz, text, timestamptz) from public;
grant execute on function public.update_owner_grow_session_times(timestamptz, timestamptz, date, uuid, timestamptz, text, timestamptz) to authenticated;

comment on function public.update_owner_grow_session_times(timestamptz, timestamptz, date, uuid, timestamptz, text, timestamptz) is
  'Founder/admin-only grow session timestamp editor. Requires auth.uid() = grow_sessions.user_id, validates timeline order, and writes a private audit record.';

notify pgrst, 'reload schema';
