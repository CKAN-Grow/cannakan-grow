-- IC-GC-003B: canonical Growing Workspace Task semantics.
--
-- Existing identities, ownership, statuses, and due values are preserved.
-- New columns remain null on legacy rows so reads can classify legacy data
-- without fabricating zones, instants, context, or completion history.

alter table public.grow_session_tasks
  add column if not exists growing_phase_id uuid references public.grow_session_growing_phases(id),
  add column if not exists plant_group_id uuid references public.grow_session_plant_groups(id) on delete set null,
  add column if not exists due_kind text,
  add column if not exists due_at timestamptz,
  add column if not exists due_local_datetime timestamp without time zone,
  add column if not exists due_timezone text,
  add column if not exists due_utc_offset_minutes smallint;

alter table public.grow_session_tasks
  alter column due_date drop not null,
  alter column status set default 'open';

alter table public.grow_session_tasks
  drop constraint if exists grow_session_tasks_status_check,
  drop constraint if exists grow_session_tasks_completion_check,
  drop constraint if exists grow_session_tasks_due_kind_check,
  drop constraint if exists grow_session_tasks_due_shape_check,
  add constraint grow_session_tasks_status_check
    check (status in ('open', 'completed', 'upcoming')),
  add constraint grow_session_tasks_due_kind_check
    check (due_kind is null or due_kind in ('none', 'date', 'instant')),
  add constraint grow_session_tasks_due_shape_check
    check (
      due_kind is null
      or (
        due_kind = 'none'
        and due_date is null
        and due_time is null
        and due_at is null
        and due_local_datetime is null
        and due_timezone is null
        and due_utc_offset_minutes is null
      )
      or (
        due_kind = 'date'
        and due_date is not null
        and due_time is null
        and due_at is null
        and due_local_datetime is null
        and due_timezone is null
        and due_utc_offset_minutes is null
      )
      or (
        due_kind = 'instant'
        and due_date is null
        and due_time is null
        and due_at is not null
        and due_local_datetime is not null
        and nullif(btrim(due_timezone), '') is not null
        and due_utc_offset_minutes between -840 and 840
        and timezone(due_timezone, due_at) = due_local_datetime
        and due_utc_offset_minutes = extract(
          epoch from (due_local_datetime - timezone('UTC', due_at))
        ) / 60
      )
    );

create or replace function public.enforce_grow_session_task_context()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.growing_phase_id is not null and not exists (
    select 1
    from public.grow_session_growing_phases phase
    where phase.id = new.growing_phase_id
      and phase.session_id = new.session_id
  ) then
    raise exception 'Task Growing phase must belong to its Session.';
  end if;

  if new.plant_group_id is not null and (
    new.growing_phase_id is null
    or not exists (
      select 1
      from public.grow_session_plant_groups plant_group
      join public.grow_session_growing_phases phase
        on phase.id = plant_group.growing_phase_id
      where plant_group.id = new.plant_group_id
        and phase.id = new.growing_phase_id
        and phase.session_id = new.session_id
    )
  ) then
    raise exception 'Task Plant Group must belong to its Session and Growing phase.';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_grow_session_task_context() from public, anon, authenticated, service_role;

drop trigger if exists grow_session_tasks_enforce_context on public.grow_session_tasks;
create trigger grow_session_tasks_enforce_context
before insert or update of session_id, growing_phase_id, plant_group_id
on public.grow_session_tasks
for each row execute function public.enforce_grow_session_task_context();

create index if not exists grow_session_tasks_canonical_due_idx
  on public.grow_session_tasks (session_id, status, due_kind, due_date, due_at, id);

comment on column public.grow_session_tasks.due_kind is
  'Canonical due form: none, date, or instant. Null identifies read-compatible legacy due data.';
comment on column public.grow_session_tasks.due_at is
  'Canonical UTC instant for instant-based Task due values.';
comment on column public.grow_session_tasks.due_local_datetime is
  'Entered local civil date and time preserved for an instant-based Task due value.';
comment on column public.grow_session_tasks.due_timezone is
  'IANA time-zone identifier used to resolve an instant-based Task due value.';
