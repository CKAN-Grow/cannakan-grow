-- IC-GC-003C: evolve the canonical private Session Event capability in place.
-- Existing Event identities, ownership, raw compatibility values, and timestamps are preserved.

alter table public.grow_session_events
  add column if not exists growing_phase_id uuid references public.grow_session_growing_phases(id),
  add column if not exists plant_group_id uuid references public.grow_session_plant_groups(id) on delete set null,
  add column if not exists occurred_kind text,
  add column if not exists occurred_at timestamptz,
  add column if not exists occurred_local_datetime timestamp without time zone,
  add column if not exists occurred_timezone text,
  add column if not exists occurred_utc_offset_minutes smallint;

alter table public.grow_session_events
  alter column title drop not null,
  alter column occurred_date drop not null;

alter table public.grow_session_events
  drop constraint if exists grow_session_events_title_check,
  drop constraint if exists grow_session_events_category_check,
  drop constraint if exists grow_session_events_occurred_kind_check,
  drop constraint if exists grow_session_events_occurred_shape_check,
  add constraint grow_session_events_title_check
    check (title is null or char_length(btrim(title)) between 1 and 160),
  add constraint grow_session_events_category_check
    check (category is null or category in (
      'observation', 'maintenance', 'environment', 'treatment',
      'transplant', 'harvest', 'issue', 'other',
      'plant-health', 'nutrition'
    )),
  add constraint grow_session_events_occurred_kind_check
    check (occurred_kind is null or occurred_kind in ('date', 'instant')),
  add constraint grow_session_events_occurred_shape_check
    check (
      occurred_kind is null
      or (
        occurred_kind = 'date'
        and occurred_date is not null
        and occurred_time is null
        and occurred_at is null
        and occurred_local_datetime is null
        and occurred_timezone is null
        and occurred_utc_offset_minutes is null
      )
      or (
        occurred_kind = 'instant'
        and occurred_date is null
        and occurred_time is null
        and occurred_at is not null
        and occurred_local_datetime is not null
        and nullif(btrim(occurred_timezone), '') is not null
        and occurred_utc_offset_minutes between -840 and 840
        and timezone(occurred_timezone, occurred_at) = occurred_local_datetime
        and occurred_utc_offset_minutes = extract(
          epoch from (occurred_local_datetime - timezone('UTC', occurred_at))
        ) / 60
      )
    );

create or replace function public.enforce_grow_session_event_context()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.growing_phase_id is not null and not exists (
    select 1 from public.grow_session_growing_phases phase
    where phase.id = new.growing_phase_id and phase.session_id = new.session_id
  ) then
    raise exception 'Event Growing phase must belong to its Session.';
  end if;

  if new.plant_group_id is not null and (
    new.growing_phase_id is null
    or not exists (
      select 1
      from public.grow_session_plant_groups plant_group
      join public.grow_session_growing_phases phase on phase.id = plant_group.growing_phase_id
      where plant_group.id = new.plant_group_id
        and phase.id = new.growing_phase_id
        and phase.session_id = new.session_id
    )
  ) then
    raise exception 'Event Plant Group must belong to its Session and Growing phase.';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_grow_session_event_context() from public, anon, authenticated, service_role;

drop trigger if exists grow_session_events_enforce_context on public.grow_session_events;
create trigger grow_session_events_enforce_context
before insert or update of session_id, growing_phase_id, plant_group_id
on public.grow_session_events
for each row execute function public.enforce_grow_session_event_context();

create or replace function public.enforce_grow_session_event_canonical_write()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'INSERT' then
    if new.origin <> 'user' then raise exception 'New Events must be user-created.'; end if;
    if new.category not in ('observation','maintenance','environment','treatment','transplant','harvest','issue','other') then
      raise exception 'New Events require a canonical Event type.';
    end if;
    if new.occurred_kind not in ('date','instant') then raise exception 'New Events require a canonical occurrence.'; end if;
  else
    if new.created_at is distinct from old.created_at then raise exception 'Event created_at is immutable.'; end if;
    if new.origin is distinct from old.origin then raise exception 'Event origin provenance cannot be relabelled.'; end if;
    if new.category is distinct from old.category
       and new.category not in ('observation','maintenance','environment','treatment','transplant','harvest','issue','other') then
      raise exception 'Corrected Events require a canonical Event type.';
    end if;
    if old.occurred_kind is null
       and new.occurred_kind is null
       and (new.occurred_date, new.occurred_time, new.occurred_at, new.occurred_local_datetime, new.occurred_timezone, new.occurred_utc_offset_minutes)
           is distinct from
           (old.occurred_date, old.occurred_time, old.occurred_at, old.occurred_local_datetime, old.occurred_timezone, old.occurred_utc_offset_minutes) then
      raise exception 'Corrected Event occurrence requires a canonical occurrence type.';
    end if;
  end if;
  if new.category = 'other' and nullif(btrim(coalesce(new.title, '')), '') is null
     and nullif(btrim(coalesce(new.details, '')), '') is null then
    raise exception 'Other Events require a title or details.';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_grow_session_event_canonical_write() from public, anon, authenticated, service_role;

drop trigger if exists grow_session_events_enforce_canonical_write on public.grow_session_events;
create trigger grow_session_events_enforce_canonical_write
before insert or update on public.grow_session_events
for each row execute function public.enforce_grow_session_event_canonical_write();

create index if not exists grow_session_events_canonical_occurrence_idx
  on public.grow_session_events (session_id, occurred_kind, occurred_date, occurred_at, id);

comment on column public.grow_session_events.occurred_kind is
  'Canonical occurrence form: date or instant. Null identifies read-compatible legacy occurrence data.';
comment on column public.grow_session_events.occurred_at is
  'Canonical UTC instant for instant-based Event occurrence values.';
comment on column public.grow_session_events.occurred_local_datetime is
  'Entered local civil date and time preserved for an instant-based Event occurrence value.';
comment on column public.grow_session_events.occurred_timezone is
  'IANA time-zone identifier used to resolve an instant-based Event occurrence value.';
