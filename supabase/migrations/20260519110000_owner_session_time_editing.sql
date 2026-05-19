-- ============================================================================
-- Owner-only Grow Session Time Editing
-- ============================================================================
--
-- Scope:
-- - Grow sessions only.
-- - Owners may edit their own session timeline timestamps.
-- - Admin/founder status does not grant cross-user timestamp editing.
-- - Timestamp edits are audited in a private table.

alter table public.grow_sessions
  add column if not exists session_started_at timestamptz,
  add column if not exists soak_started_at timestamptz;

update public.grow_sessions
set
  session_started_at = coalesce(
    session_started_at,
    case
      when date is not null then (date::text || 'T' || left(coalesce(nullif(time, ''), '00:00'), 5) || ':00')::timestamp at time zone 'UTC'
      else null
    end
  ),
  soak_started_at = coalesce(soak_started_at, timer_start_at)
where session_started_at is null
   or soak_started_at is null;

update public.grow_sessions
set soak_started_at = session_started_at,
    timer_start_at = session_started_at
where session_started_at is not null
  and germination_started_at is not null
  and soak_started_at is not null
  and soak_started_at > germination_started_at
  and session_started_at <= germination_started_at;

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

create table if not exists public.grow_session_time_edit_audit (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.grow_sessions(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  owner_user_id uuid references auth.users(id) on delete set null,
  previous_values jsonb not null default '{}'::jsonb,
  next_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.grow_session_time_edit_audit is
  'Private audit log for owner-only grow session timestamp edits. Not exposed to public app surfaces.';

create index if not exists grow_session_time_edit_audit_session_created_idx
  on public.grow_session_time_edit_audit (session_id, created_at desc);

create index if not exists grow_session_time_edit_audit_actor_created_idx
  on public.grow_session_time_edit_audit (actor_user_id, created_at desc);

alter table public.grow_session_time_edit_audit enable row level security;

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
  'Owner-only grow session timestamp editor. Requires auth.uid() = grow_sessions.user_id, validates timeline order, and writes a private audit record.';
