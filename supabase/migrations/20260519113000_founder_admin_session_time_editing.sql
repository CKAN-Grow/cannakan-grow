-- Founder/Admin-only Grow Session Time Editing
-- Regular users receive automatic lifecycle timestamps. Manual backdating is restricted
-- to founder/admin-owned sessions through the audited RPC below.

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

revoke all on function public.update_owner_grow_session_times(uuid, timestamptz, timestamptz, timestamptz, timestamptz, date, text) from public;
grant execute on function public.update_owner_grow_session_times(uuid, timestamptz, timestamptz, timestamptz, timestamptz, date, text) to authenticated;

comment on function public.update_owner_grow_session_times(uuid, timestamptz, timestamptz, timestamptz, timestamptz, date, text) is
  'Founder/admin-only grow session timestamp editor. Requires auth.uid() = grow_sessions.user_id, validates timeline order, and writes a private audit record.';
