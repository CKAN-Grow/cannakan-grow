-- Restore only the committed Growing Session prerequisite effects that are
-- absent from production. The migration is fail-closed before mutation when
-- any required base dependency is missing or any recovered object is partial.
do $$
begin
  if to_regclass('public.grow_sessions') is null
     or to_regclass('public.source_directory') is null
     or to_regclass('public.variety_directory') is null then
    raise exception 'Growing Session prerequisite recovery requires committed base and directory dependencies.' using errcode = '42P01';
  end if;

  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='grow_sessions' and column_name in ('entry_path','post_germination_decision')) then
    raise exception 'Growing Session prerequisite recovery found a partial grow_sessions column state.' using errcode = '42701';
  end if;
  if exists (select 1 from pg_constraint where conname in ('grow_sessions_entry_path_check','grow_sessions_post_germination_decision_check')) then
    raise exception 'Growing Session prerequisite recovery found an existing recovered constraint.' using errcode = '42710';
  end if;

  if to_regclass('public.grow_session_growing_phases') is not null
     or to_regclass('public.grow_session_plant_groups') is not null
     or to_regclass('public.grow_session_phase_commencements') is not null then
    raise exception 'Growing Session prerequisite recovery requires all recovered tables to be absent; partial state detected.' using errcode = '42710';
  end if;

  if to_regprocedure('public.set_growing_evidence_updated_at()') is not null
     or to_regprocedure('public.enforce_canonical_growing_entry()') is not null
     or to_regprocedure('public.enter_canonical_growing(uuid,uuid,text,timestamptz,jsonb)') is not null
     or to_regprocedure('public.get_canonical_growing_commencement(uuid)') is not null then
    raise exception 'Growing Session prerequisite recovery found an existing recovered function; partial state detected.' using errcode = '42723';
  end if;

  if exists (
    select 1
    from pg_trigger trigger_row
    join pg_class relation_row on relation_row.oid=trigger_row.tgrelid
    join pg_namespace namespace_row on namespace_row.oid=relation_row.relnamespace
    where not trigger_row.tgisinternal
      and namespace_row.nspname='public'
      and trigger_row.tgname in (
        'grow_session_growing_phases_set_updated_at',
        'grow_session_plant_groups_set_updated_at',
        'grow_sessions_enforce_canonical_growing_entry'
      )
  ) then
    raise exception 'Growing Session prerequisite recovery found an existing recovered trigger; partial state detected.' using errcode = '42710';
  end if;
end;
$$;
-- ICE-GC-002C-1: canonical Session Entry discriminator.
--
-- Both entry paths remain public.grow_sessions rows. Existing rows stay null
-- and retain legacy Germination-first behavior without inferred reclassification.

alter table public.grow_sessions
  add column if not exists entry_path text;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.grow_sessions'::regclass
       and conname = 'grow_sessions_entry_path_check'
  ) then
    alter table public.grow_sessions
      add constraint grow_sessions_entry_path_check
      check (entry_path is null or entry_path in ('seed', 'grow'));
  end if;
end;
$$;

comment on column public.grow_sessions.entry_path is
  'Canonical Session entry path: seed begins with Germination; grow begins with Growing. Null preserves unclassified legacy Sessions.';
-- IC-GC-002C: canonical Growing phase and Plant Group persistence.

create extension if not exists pgcrypto;

alter table public.grow_sessions
  add column if not exists post_germination_decision text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.grow_sessions'::regclass
      and conname = 'grow_sessions_post_germination_decision_check'
  ) then
    alter table public.grow_sessions
      add constraint grow_sessions_post_germination_decision_check
      check (post_germination_decision is null or post_germination_decision in ('pending', 'complete', 'grow'));
  end if;
end
$$;

create table if not exists public.grow_session_growing_phases (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.grow_sessions(id) on delete cascade,
  environment_type text not null,
  environment_other text not null default '',
  grow_method text not null,
  grow_method_other text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_growing_phases_environment_check
    check (environment_type in ('Indoor', 'Outdoor', 'Greenhouse', 'Protected Outdoor', 'Mixed', 'Other')),
  constraint grow_session_growing_phases_method_check
    check (grow_method in ('Soil', 'Living Soil', 'Coco', 'Hydro', 'DWC', 'RDWC', 'Rockwool', 'NFT', 'Aeroponic', 'Raised Bed', 'Container', 'Other'))
);

create table if not exists public.grow_session_plant_groups (
  id uuid primary key default gen_random_uuid(),
  growing_phase_id uuid not null references public.grow_session_growing_phases(id) on delete cascade,
  display_order integer not null default 0 check (display_order >= 0),
  plant_label text not null default '',
  source_id uuid references public.source_directory(id) on delete set null,
  source_name text not null default '',
  variety_id uuid references public.variety_directory(id) on delete set null,
  variety_name text not null default '',
  plant_type text,
  sex text,
  plant_count integer not null check (plant_count > 0),
  harvested boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_plant_groups_type_check
    check (plant_type is null or plant_type in ('Seed', 'Seedling', 'Clone', 'Cutting', 'Established Plant', 'Other')),
  constraint grow_session_plant_groups_sex_check
    check (sex is null or sex in ('Unknown', 'Feminized', 'Female', 'Male', 'Regular', 'Other'))
);

create index if not exists grow_session_plant_groups_phase_order_idx
  on public.grow_session_plant_groups(growing_phase_id, display_order, id);

create or replace function public.set_growing_evidence_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists grow_session_growing_phases_set_updated_at on public.grow_session_growing_phases;
create trigger grow_session_growing_phases_set_updated_at
  before update on public.grow_session_growing_phases
  for each row execute function public.set_growing_evidence_updated_at();

drop trigger if exists grow_session_plant_groups_set_updated_at on public.grow_session_plant_groups;
create trigger grow_session_plant_groups_set_updated_at
  before update on public.grow_session_plant_groups
  for each row execute function public.set_growing_evidence_updated_at();

alter table public.grow_session_growing_phases enable row level security;
alter table public.grow_session_plant_groups enable row level security;

drop policy if exists "Owners can read Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can read Growing phase evidence"
  on public.grow_session_growing_phases for select to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can insert Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can insert Growing phase evidence"
  on public.grow_session_growing_phases for insert to authenticated
  with check (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can update Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can update Growing phase evidence"
  on public.grow_session_growing_phases for update to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can delete Growing phase evidence" on public.grow_session_growing_phases;
create policy "Owners can delete Growing phase evidence"
  on public.grow_session_growing_phases for delete to authenticated
  using (exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = session_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can read Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can read Plant Group evidence"
  on public.grow_session_plant_groups for select to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can insert Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can insert Plant Group evidence"
  on public.grow_session_plant_groups for insert to authenticated
  with check (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can update Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can update Plant Group evidence"
  on public.grow_session_plant_groups for update to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

drop policy if exists "Owners can delete Plant Group evidence" on public.grow_session_plant_groups;
create policy "Owners can delete Plant Group evidence"
  on public.grow_session_plant_groups for delete to authenticated
  using (exists (
    select 1 from public.grow_session_growing_phases phase
    join public.grow_sessions session_row on session_row.id = phase.session_id
    where phase.id = growing_phase_id and session_row.user_id = auth.uid()
  ));

revoke all on public.grow_session_growing_phases from anon;
revoke all on public.grow_session_plant_groups from anon;
grant select, insert, update, delete on public.grow_session_growing_phases to authenticated;
grant select, insert, update, delete on public.grow_session_plant_groups to authenticated;

comment on table public.grow_session_growing_phases is 'One canonical Growing phase evidence record per Grow Session.';
comment on table public.grow_session_plant_groups is 'Canonical Plant Group evidence owned by a Growing phase record.';
comment on column public.grow_sessions.post_germination_decision is 'Explicit post-Germination lifecycle decision; null preserves legacy compatibility.';

notify pgrst, 'reload schema';
-- ICE-SC-001: canonical Growing commencement and unresolved legacy chronology.
--
-- This migration establishes future lifecycle recording and retrieval only.
-- Existing Sessions are intentionally not backfilled or reclassified.

create extension if not exists pgcrypto;

create table if not exists public.grow_session_phase_commencements (
  session_id uuid primary key references public.grow_sessions(id) on delete cascade,
  phase text not null default 'growing',
  commenced_at timestamptz not null,
  entry_path text not null,
  operation_id uuid not null unique,
  operation_fingerprint text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_phase_commencements_phase_check
    check (phase = 'growing'),
  constraint grow_session_phase_commencements_entry_path_check
    check (entry_path in ('seed', 'grow'))
);

create or replace function public.enforce_canonical_growing_entry()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  canonical_entry_authorized boolean :=
    coalesce(current_setting('app.canonical_growing_entry', true), '') = 'true';
begin
  if tg_op = 'INSERT' then
    if new.entry_path = 'grow'
      and not canonical_entry_authorized
      and current_user <> 'postgres' then
      raise exception 'Direct Growing entry must use the canonical lifecycle boundary.'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if new.entry_path is distinct from old.entry_path then
    raise exception 'Session Entry is immutable after creation.'
      using errcode = '23514';
  end if;

  if old.post_germination_decision = 'grow'
    and new.post_germination_decision is distinct from old.post_germination_decision then
    raise exception 'Canonical Growing entry cannot be reversed or rewritten.'
      using errcode = '23514';
  end if;

  if new.post_germination_decision = 'grow'
    and old.post_germination_decision is distinct from new.post_germination_decision
    and not canonical_entry_authorized
    and current_user <> 'postgres' then
    raise exception 'Begin Growing must use the canonical lifecycle boundary.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_canonical_growing_entry() from public;
revoke all on function public.enforce_canonical_growing_entry() from anon;
revoke all on function public.enforce_canonical_growing_entry() from authenticated;
revoke all on function public.enforce_canonical_growing_entry() from service_role;

drop trigger if exists grow_sessions_enforce_canonical_growing_entry
  on public.grow_sessions;
create trigger grow_sessions_enforce_canonical_growing_entry
  before insert or update of entry_path, post_germination_decision
  on public.grow_sessions
  for each row execute function public.enforce_canonical_growing_entry();

create or replace function public.enter_canonical_growing(
  p_session_id uuid,
  p_operation_id uuid,
  p_entry_path text,
  p_expected_updated_at timestamptz default null,
  p_session_record jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  normalized_entry_path text := lower(btrim(coalesce(p_entry_path, '')));
  normalized_session_record jsonb := coalesce(p_session_record, '{}'::jsonb)
    - 'user_id'
    - 'created_at'
    - 'updated_at';
  input_fingerprint text;
  action_at timestamptz := statement_timestamp();
  existing_session public.grow_sessions%rowtype;
  saved_session public.grow_sessions%rowtype;
  existing_commencement public.grow_session_phase_commencements%rowtype;
  saved_commencement public.grow_session_phase_commencements%rowtype;
begin
  if actor_id is null then
    raise exception 'You must be signed in to enter Growing.'
      using errcode = '42501';
  end if;

  if p_session_id is null or p_operation_id is null then
    raise exception 'Session and operation identities are required.'
      using errcode = '22023';
  end if;

  if normalized_entry_path not in ('seed', 'grow') then
    raise exception 'The Growing entry path is invalid.'
      using errcode = '22023';
  end if;

  input_fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'entry_path', normalized_entry_path,
        'expected_updated_at', p_expected_updated_at,
        'session_record',
          case when normalized_entry_path = 'grow'
            then normalized_session_record
            else '{}'::jsonb
          end
      )::text,
      'sha256'
    ),
    'hex'
  );

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));

  select *
  into existing_commencement
  from public.grow_session_phase_commencements
  where operation_id = p_operation_id;

  if found then
    if existing_commencement.session_id is distinct from p_session_id
      or existing_commencement.entry_path is distinct from normalized_entry_path
      or existing_commencement.operation_fingerprint is distinct from input_fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;

    select *
    into saved_session
    from public.grow_sessions
    where id = existing_commencement.session_id
      and user_id = actor_id;

    if not found then
      raise exception 'The canonical Growing entry is not accessible.'
        using errcode = '42501';
    end if;

    return jsonb_build_object(
      'session', to_jsonb(saved_session),
      'commencement', jsonb_build_object(
        'status', 'authoritative',
        'session_id', existing_commencement.session_id,
        'phase', existing_commencement.phase,
        'commenced_at', existing_commencement.commenced_at,
        'entry_path', existing_commencement.entry_path,
        'operation_id', existing_commencement.operation_id
      )
    );
  end if;

  if exists (
    select 1
    from public.grow_session_phase_commencements
    where session_id = p_session_id
  ) then
    raise exception 'Canonical Growing commencement already exists for this Session.'
      using errcode = '23505';
  end if;

  perform set_config('app.canonical_growing_entry', 'true', true);

  if normalized_entry_path = 'grow' then
    if jsonb_typeof(p_session_record) is distinct from 'object'
      or nullif(btrim(normalized_session_record ->> 'session_name'), '') is null then
      raise exception 'A valid direct-Growing Session record is required.'
        using errcode = '22023';
    end if;

    if coalesce(normalized_session_record ->> 'entry_path', 'grow') <> 'grow'
      or coalesce(nullif(normalized_session_record ->> 'session_status', ''), 'active') <> 'active'
      or normalized_session_record ->> 'post_germination_decision' is not null
      or normalized_session_record ->> 'germination_started_at' is not null
      or normalized_session_record ->> 'first_planted_at' is not null
      or normalized_session_record ->> 'completed_at' is not null then
      raise exception 'Direct-Growing input conflicts with its authorized lifecycle state.'
        using errcode = '23514';
    end if;

    if exists (select 1 from public.grow_sessions where id = p_session_id) then
      raise exception 'The requested direct-Growing Session identity already exists.'
        using errcode = '23505';
    end if;

    insert into public.grow_sessions (
      id,
      user_id,
      date,
      time,
      system_type,
      unit_id,
      session_name,
      custom_session_name,
      session_notes,
      session_images,
      snapshot_state,
      session_status,
      germination_started_at,
      first_planted_at,
      completed_at,
      timer_start_at,
      seed_age_tracking_enabled,
      seed_age_mode,
      session_seed_age_years,
      is_deleted,
      deleted_at,
      visibility_status,
      partitions,
      created_at,
      updated_at,
      is_mock,
      session_started_at,
      soak_started_at,
      is_test,
      excluded_from_analytics,
      user_deleted,
      user_deleted_at,
      entry_path,
      post_germination_decision
    ) values (
      p_session_id,
      actor_id,
      coalesce((normalized_session_record ->> 'date')::date, (action_at at time zone 'UTC')::date),
      coalesce(nullif(normalized_session_record ->> 'time', ''), to_char(action_at at time zone 'UTC', 'HH24:MI')),
      '',
      coalesce(normalized_session_record ->> 'unit_id', ''),
      btrim(normalized_session_record ->> 'session_name'),
      coalesce(normalized_session_record ->> 'custom_session_name', ''),
      coalesce(normalized_session_record ->> 'session_notes', ''),
      coalesce(normalized_session_record -> 'session_images', '[]'::jsonb),
      coalesce(normalized_session_record -> 'snapshot_state', '{}'::jsonb),
      'active',
      null,
      null,
      null,
      case when nullif(normalized_session_record ->> 'timer_start_at', '') is null then null else (normalized_session_record ->> 'timer_start_at')::timestamptz end,
      coalesce((normalized_session_record ->> 'seed_age_tracking_enabled')::boolean, false),
      nullif(normalized_session_record ->> 'seed_age_mode', ''),
      (normalized_session_record ->> 'session_seed_age_years')::numeric,
      coalesce((normalized_session_record ->> 'is_deleted')::boolean, false),
      case when nullif(normalized_session_record ->> 'deleted_at', '') is null then null else (normalized_session_record ->> 'deleted_at')::timestamptz end,
      coalesce(nullif(normalized_session_record ->> 'visibility_status', ''), 'active'),
      coalesce(normalized_session_record -> 'partitions', '[]'::jsonb),
      action_at,
      action_at,
      false,
      case
        when nullif(normalized_session_record ->> 'session_started_at', '') is null then action_at
        else (normalized_session_record ->> 'session_started_at')::timestamptz
      end,
      case when nullif(normalized_session_record ->> 'soak_started_at', '') is null then null else (normalized_session_record ->> 'soak_started_at')::timestamptz end,
      coalesce((normalized_session_record ->> 'is_test')::boolean, false),
      coalesce((normalized_session_record ->> 'excluded_from_analytics')::boolean, false),
      coalesce((normalized_session_record ->> 'user_deleted')::boolean, false),
      case when nullif(normalized_session_record ->> 'user_deleted_at', '') is null then null else (normalized_session_record ->> 'user_deleted_at')::timestamptz end,
      'grow',
      null
    )
    returning * into saved_session;
  else
    if p_session_record is not null and p_session_record <> '{}'::jsonb then
      raise exception 'Seed-to-Growing does not accept a replacement Session record.'
        using errcode = '22023';
    end if;

    select *
    into existing_session
    from public.grow_sessions
    where id = p_session_id
    for update;

    if not found then
      raise exception 'The Session was not found.'
        using errcode = 'P0002';
    end if;

    if existing_session.user_id is distinct from actor_id then
      raise exception 'Only the Session owner may begin Growing.'
        using errcode = '42501';
    end if;

    if existing_session.entry_path is distinct from 'seed'
      or lower(coalesce(existing_session.session_status, '')) <> 'completed'
      or existing_session.completed_at is null
      or existing_session.post_germination_decision is distinct from 'pending' then
      raise exception 'The Session is not eligible for the authorized Begin Growing transition.'
        using errcode = '23514';
    end if;

    if p_expected_updated_at is null
      or existing_session.updated_at is distinct from p_expected_updated_at then
      raise exception 'The Session changed before Begin Growing could become canonical.'
        using errcode = '40001';
    end if;

    update public.grow_sessions
    set post_germination_decision = 'grow',
        updated_at = action_at
    where id = p_session_id
    returning * into saved_session;
  end if;

  perform set_config('app.canonical_growing_entry', 'false', true);

  insert into public.grow_session_phase_commencements (
    session_id,
    phase,
    commenced_at,
    entry_path,
    operation_id,
    operation_fingerprint,
    created_at
  ) values (
    p_session_id,
    'growing',
    action_at,
    normalized_entry_path,
    p_operation_id,
    input_fingerprint,
    action_at
  )
  returning * into saved_commencement;

  return jsonb_build_object(
    'session', to_jsonb(saved_session),
    'commencement', jsonb_build_object(
      'status', 'authoritative',
      'session_id', saved_commencement.session_id,
      'phase', saved_commencement.phase,
      'commenced_at', saved_commencement.commenced_at,
      'entry_path', saved_commencement.entry_path,
      'operation_id', saved_commencement.operation_id
    )
  );
end;
$$;

create or replace function public.get_canonical_growing_commencement(
  p_session_id uuid
)
returns table (
  session_id uuid,
  status text,
  commenced_at timestamptz,
  entry_path text,
  operation_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    session_row.id,
    case when commencement.session_id is null
      then 'unresolved'::text
      else 'authoritative'::text
    end,
    commencement.commenced_at,
    commencement.entry_path,
    commencement.operation_id
  from public.grow_sessions session_row
  left join public.grow_session_phase_commencements commencement
    on commencement.session_id = session_row.id
  where session_row.id = p_session_id
    and auth.uid() is not null
    and session_row.user_id = auth.uid();
$$;

alter table public.grow_session_phase_commencements enable row level security;

drop policy if exists "Owners can read canonical phase commencement"
  on public.grow_session_phase_commencements;
create policy "Owners can read canonical phase commencement"
  on public.grow_session_phase_commencements
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.grow_sessions session_row
      where session_row.id = session_id
        and session_row.user_id = auth.uid()
    )
  );

revoke all on public.grow_session_phase_commencements from public;
revoke all on public.grow_session_phase_commencements from anon;
revoke all on public.grow_session_phase_commencements from authenticated;
revoke all on public.grow_session_phase_commencements from service_role;
grant select on public.grow_session_phase_commencements to authenticated;

revoke all on function public.enter_canonical_growing(uuid, uuid, text, timestamptz, jsonb) from public;
revoke all on function public.enter_canonical_growing(uuid, uuid, text, timestamptz, jsonb) from anon;
grant execute on function public.enter_canonical_growing(uuid, uuid, text, timestamptz, jsonb) to authenticated;

revoke all on function public.get_canonical_growing_commencement(uuid) from public;
revoke all on function public.get_canonical_growing_commencement(uuid) from anon;
grant execute on function public.get_canonical_growing_commencement(uuid) to authenticated;

comment on table public.grow_session_phase_commencements is
  'Canonical Session Lifecycle chronology for phase commencement. Existing rows are not inferred or backfilled.';
comment on function public.enter_canonical_growing(uuid, uuid, text, timestamptz, jsonb) is
  'Owner-authorized atomic lifecycle boundary for Seed-to-Growing and direct-Growing entry.';
comment on function public.get_canonical_growing_commencement(uuid) is
  'Read-only access-safe retrieval of authoritative or unresolved Growing commencement.';

notify pgrst, 'reload schema';
