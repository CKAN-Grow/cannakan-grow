-- ICE-SC-003 prerequisite recovery: restore only the committed ICE-SC-002
-- schema effects that are absent from production. The migration transaction
-- is intentionally fail-closed: any partial or incompatible target state stops
-- before the first schema mutation. No historical data backfill is included.
do $$
declare
  required_columns integer;
begin
  if to_regclass('public.grow_sessions') is null
     or to_regclass('public.grow_session_phase_commencements') is null
     or to_regclass('public.grow_session_growing_phases') is null then
    raise exception 'ICE-SC-003 prerequisite recovery requires the committed Growing Session base tables.' using errcode = '42P01';
  end if;

  select count(*) into required_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'grow_session_growing_phases'
    and column_name in ('session_id','grow_method','environment_type','grow_method_other','environment_other','updated_at');
  if required_columns <> 6 then
    raise exception 'ICE-SC-003 prerequisite recovery found an incompatible grow_session_growing_phases shape.' using errcode = '42804';
  end if;

  if to_regclass('public.grow_session_conditions_authority') is not null
     or to_regclass('public.grow_session_condition_periods') is not null
     or to_regclass('public.grow_session_condition_corrections') is not null
     or to_regclass('public.grow_session_condition_operations') is not null then
    raise exception 'ICE-SC-003 prerequisite recovery requires all canonical Session Conditions tables to be absent; partial state detected.' using errcode = '42710';
  end if;

  if to_regprocedure('public.normalize_session_condition_input(text,text,text)') is not null
     or to_regprocedure('public.enforce_canonical_session_condition_write()') is not null
     or to_regprocedure('public.enforce_canonical_session_condition_period_write()') is not null
     or to_regprocedure('public.enforce_legacy_condition_authority()') is not null
     or to_regprocedure('public.initialize_session_conditions_authority()') is not null
     or to_regprocedure('public.project_canonical_session_conditions(uuid,timestamptz)') is not null
     or to_regprocedure('public.get_canonical_session_conditions(uuid,timestamptz)') is not null
     or to_regprocedure('public.get_session_condition_history(uuid)') is not null
     or to_regprocedure('public.declare_session_condition(uuid,uuid,text,text,text,bigint)') is not null
     or to_regprocedure('public.change_session_condition(uuid,uuid,text,text,text,timestamptz,bigint)') is not null
     or to_regprocedure('public.correct_session_condition(uuid,uuid,uuid,jsonb,bigint)') is not null
     or to_regprocedure('public.migrate_session_conditions(uuid,uuid,timestamptz)') is not null then
    raise exception 'ICE-SC-003 prerequisite recovery found an existing canonical Session Conditions function; partial state detected.' using errcode = '42723';
  end if;

  if exists (
    select 1
    from pg_trigger trigger_row
    join pg_class relation_row on relation_row.oid = trigger_row.tgrelid
    join pg_namespace namespace_row on namespace_row.oid = relation_row.relnamespace
    where not trigger_row.tgisinternal
      and namespace_row.nspname = 'public'
      and trigger_row.tgname in (
        'grow_session_conditions_authority_guard',
        'grow_session_condition_periods_guard',
        'grow_session_condition_corrections_guard',
        'grow_session_condition_operations_guard',
        'grow_session_growing_phases_condition_authority_guard',
        'grow_session_commencement_initialize_conditions'
      )
  ) then
    raise exception 'ICE-SC-003 prerequisite recovery found an existing canonical Session Conditions trigger; partial state detected.' using errcode = '42710';
  end if;
end;
$$;
-- ICE-SC-002: first canonical Session Conditions production slice.
--
-- Exactly Grow Method and Environment Type are authorized. Both dimensions
-- use correction-aware half-open periods beginning at canonical Growing
-- commencement. Existing Growing Phase values remain authoritative until an
-- eligible Session passes the atomic per-Session migration and cutover gate.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

alter table public.grow_session_growing_phases
  alter column environment_type drop not null,
  alter column environment_other drop not null,
  alter column grow_method drop not null,
  alter column grow_method_other drop not null;

alter table public.grow_session_growing_phases
  alter column environment_other set default '',
  alter column grow_method_other set default '';

create table public.grow_session_conditions_authority (
  session_id uuid primary key references public.grow_sessions(id) on delete cascade,
  authority_source text not null,
  source_growing_phase_id uuid,
  canonical_revision bigint not null default 0,
  cutover_operation_id uuid not null unique,
  cutover_fingerprint text not null,
  cutover_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_conditions_authority_source_check
    check (authority_source in ('future_growing_entry', 'legacy_migration')),
  constraint grow_session_conditions_authority_revision_check
    check (canonical_revision >= 0)
);

create table public.grow_session_condition_periods (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  dimension text not null,
  canonical_value text not null,
  other_text text not null default '',
  effective_start timestamptz not null,
  effective_end timestamptz,
  original_actor_id uuid not null,
  source_kind text not null,
  source_operation_id uuid not null,
  source_growing_phase_id uuid,
  source_created_at timestamptz,
  source_updated_at timestamptz,
  revision bigint not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_condition_periods_dimension_check
    check (dimension in ('grow_method', 'environment_type')),
  constraint grow_session_condition_periods_value_check
    check (
      (
        dimension = 'grow_method'
        and canonical_value in (
          'Soil', 'Living Soil', 'Coco', 'Hydro', 'DWC', 'RDWC',
          'Rockwool', 'NFT', 'Aeroponic', 'Raised Bed', 'Container', 'Other'
        )
      )
      or
      (
        dimension = 'environment_type'
        and canonical_value in (
          'Indoor', 'Outdoor', 'Greenhouse', 'Protected Outdoor',
          'Mixed', 'Other'
        )
      )
    ),
  constraint grow_session_condition_periods_other_check
    check (
      char_length(other_text) <= 160
      and (
        canonical_value = 'Other'
        or other_text = ''
      )
    ),
  constraint grow_session_condition_periods_chronology_check
    check (effective_end is null or effective_end > effective_start),
  constraint grow_session_condition_periods_source_check
    check (source_kind in ('owner_declaration', 'operational_change', 'legacy_migration')),
  constraint grow_session_condition_periods_revision_check
    check (revision > 0),
  constraint grow_session_condition_periods_unique_start
    unique (session_id, dimension, effective_start),
  constraint grow_session_condition_periods_no_overlap
    exclude using gist (
      session_id with =,
      dimension with =,
      tstzrange(effective_start, effective_end, '[)') with &&
    )
);

create unique index if not exists grow_session_condition_periods_one_open_idx
  on public.grow_session_condition_periods(session_id, dimension)
  where effective_end is null;

create index if not exists grow_session_condition_periods_history_idx
  on public.grow_session_condition_periods(
    session_id,
    effective_start,
    dimension,
    id
  );

create table public.grow_session_condition_corrections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  condition_period_id uuid not null references public.grow_session_condition_periods(id) on delete cascade,
  revision bigint not null,
  before_facts jsonb not null,
  after_facts jsonb not null,
  correcting_actor_id uuid not null,
  operation_id uuid not null unique,
  operation_fingerprint text not null,
  corrected_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_condition_corrections_revision_check
    check (revision > 1),
  constraint grow_session_condition_corrections_changed_check
    check (before_facts <> after_facts)
);

create index if not exists grow_session_condition_corrections_history_idx
  on public.grow_session_condition_corrections(
    session_id,
    condition_period_id,
    revision,
    corrected_at,
    id
  );

create table public.grow_session_condition_operations (
  operation_id uuid primary key,
  session_id uuid not null references public.grow_sessions(id) on delete cascade,
  operation_kind text not null,
  dimension text,
  input_fingerprint text not null,
  result jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint grow_session_condition_operations_kind_check
    check (
      operation_kind in (
        'authority_initialize',
        'legacy_migration',
        'declaration',
        'operational_change',
        'correction'
      )
    ),
  constraint grow_session_condition_operations_dimension_check
    check (
      dimension is null
      or dimension in ('grow_method', 'environment_type')
    )
);

create or replace function public.normalize_session_condition_input(
  p_dimension text,
  p_value text,
  p_other_text text default ''
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  normalized_dimension text := lower(btrim(coalesce(p_dimension, '')));
  candidate_value text := btrim(coalesce(p_value, ''));
  normalized_value text;
  normalized_other text := btrim(
    regexp_replace(coalesce(p_other_text, ''), '\s+', ' ', 'g')
  );
begin
  if normalized_dimension = 'grow_method' then
    select approved_value
    into normalized_value
    from unnest(array[
      'Soil', 'Living Soil', 'Coco', 'Hydro', 'DWC', 'RDWC',
      'Rockwool', 'NFT', 'Aeroponic', 'Raised Bed', 'Container', 'Other'
    ]) approved_value
    where lower(approved_value) = lower(candidate_value);
  elsif normalized_dimension = 'environment_type' then
    select approved_value
    into normalized_value
    from unnest(array[
      'Indoor', 'Outdoor', 'Greenhouse', 'Protected Outdoor', 'Mixed', 'Other'
    ]) approved_value
    where lower(approved_value) = lower(candidate_value);
  else
    raise exception 'The Session Condition dimension is not authorized.'
      using errcode = '22023';
  end if;

  if normalized_value is null then
    raise exception 'The Session Condition value is not approved.'
      using errcode = '22023';
  end if;

  if char_length(normalized_other) > 160 then
    normalized_other := left(normalized_other, 160);
  end if;

  if normalized_value <> 'Other' then
    normalized_other := '';
  end if;

  return jsonb_build_object(
    'dimension', normalized_dimension,
    'value', normalized_value,
    'other_text', normalized_other
  );
end;
$$;

create or replace function public.enforce_canonical_session_condition_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  canonical_write boolean :=
    coalesce(current_setting('app.canonical_session_condition_write', true), '') = 'true';
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;

  if not canonical_write then
    raise exception 'Canonical Session Conditions must use the authorized operation boundary.'
      using errcode = '42501';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.enforce_canonical_session_condition_period_write()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  canonical_write boolean :=
    coalesce(current_setting('app.canonical_session_condition_write', true), '') = 'true';
begin
  if tg_op = 'DELETE' and pg_trigger_depth() > 1 then
    return old;
  end if;

  if not canonical_write then
    raise exception 'Canonical Session Conditions must use the authorized operation boundary.'
      using errcode = '42501';
  end if;

  if tg_op = 'UPDATE' and (
    new.id is distinct from old.id
    or new.session_id is distinct from old.session_id
    or new.dimension is distinct from old.dimension
    or new.original_actor_id is distinct from old.original_actor_id
    or new.source_kind is distinct from old.source_kind
    or new.source_operation_id is distinct from old.source_operation_id
    or new.source_growing_phase_id is distinct from old.source_growing_phase_id
    or new.source_created_at is distinct from old.source_created_at
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Canonical Session Condition identity and original provenance are immutable.'
      using errcode = '23514';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create or replace function public.enforce_legacy_condition_authority()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_session_id uuid := coalesce(new.session_id, old.session_id);
  condition_write boolean :=
    tg_op = 'INSERT'
    and (
      new.environment_type is not null
      or coalesce(new.environment_other, '') <> ''
      or new.grow_method is not null
      or coalesce(new.grow_method_other, '') <> ''
    );
begin
  if tg_op = 'UPDATE' then
    condition_write :=
      new.environment_type is distinct from old.environment_type
      or new.environment_other is distinct from old.environment_other
      or new.grow_method is distinct from old.grow_method
      or new.grow_method_other is distinct from old.grow_method_other;
  end if;

  if condition_write and exists (
    select 1
    from public.grow_session_conditions_authority authority_row
    where authority_row.session_id = target_session_id
  ) then
    raise exception 'Legacy Growing fields are non-authoritative after Session Conditions cutover.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists grow_session_conditions_authority_guard
  on public.grow_session_conditions_authority;
create trigger grow_session_conditions_authority_guard
  before insert or update or delete
  on public.grow_session_conditions_authority
  for each row execute function public.enforce_canonical_session_condition_write();

drop trigger if exists grow_session_condition_periods_guard
  on public.grow_session_condition_periods;
create trigger grow_session_condition_periods_guard
  before insert or update or delete
  on public.grow_session_condition_periods
  for each row execute function public.enforce_canonical_session_condition_period_write();

drop trigger if exists grow_session_condition_corrections_guard
  on public.grow_session_condition_corrections;
create trigger grow_session_condition_corrections_guard
  before insert or update or delete
  on public.grow_session_condition_corrections
  for each row execute function public.enforce_canonical_session_condition_write();

drop trigger if exists grow_session_condition_operations_guard
  on public.grow_session_condition_operations;
create trigger grow_session_condition_operations_guard
  before insert or update or delete
  on public.grow_session_condition_operations
  for each row execute function public.enforce_canonical_session_condition_write();

drop trigger if exists grow_session_growing_phases_condition_authority_guard
  on public.grow_session_growing_phases;
create trigger grow_session_growing_phases_condition_authority_guard
  before insert or update of
    environment_type,
    environment_other,
    grow_method,
    grow_method_other
  on public.grow_session_growing_phases
  for each row execute function public.enforce_legacy_condition_authority();

create or replace function public.initialize_session_conditions_authority()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fingerprint text;
  saved_result jsonb;
begin
  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', new.session_id,
        'commenced_at', new.commenced_at,
        'entry_path', new.entry_path,
        'operation_id', new.operation_id
      )::text,
      'sha256'
    ),
    'hex'
  );

  saved_result := jsonb_build_object(
    'session_id', new.session_id,
    'authority', 'conditions',
    'authority_source', 'future_growing_entry',
    'canonical_revision', 0,
    'cutover_at', new.commenced_at
  );

  perform set_config('app.canonical_session_condition_write', 'true', true);

  insert into public.grow_session_conditions_authority (
    session_id,
    authority_source,
    canonical_revision,
    cutover_operation_id,
    cutover_fingerprint,
    cutover_at,
    created_at
  ) values (
    new.session_id,
    'future_growing_entry',
    0,
    new.operation_id,
    fingerprint,
    new.commenced_at,
    new.commenced_at
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    input_fingerprint,
    result,
    created_at
  ) values (
    new.operation_id,
    new.session_id,
    'authority_initialize',
    fingerprint,
    saved_result,
    new.commenced_at
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return new;
end;
$$;

drop trigger if exists grow_session_commencement_initialize_conditions
  on public.grow_session_phase_commencements;
create trigger grow_session_commencement_initialize_conditions
  after insert
  on public.grow_session_phase_commencements
  for each row execute function public.initialize_session_conditions_authority();

create or replace function public.project_canonical_session_conditions(
  p_session_id uuid,
  p_at timestamptz default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  commencement_row public.grow_session_phase_commencements%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  phase_row public.grow_session_growing_phases%rowtype;
  defined_at timestamptz := coalesce(p_at, statement_timestamp());
  dimension_name text;
  period_row public.grow_session_condition_periods%rowtype;
  applicable_count integer;
  legacy_value text;
  legacy_other text;
  condition_result jsonb;
  condition_results jsonb := '[]'::jsonb;
begin
  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id;

  select *
  into phase_row
  from public.grow_session_growing_phases
  where session_id = p_session_id;

  foreach dimension_name in array array['grow_method', 'environment_type']
  loop
    period_row := null;
    applicable_count := 0;
    legacy_value := null;
    legacy_other := '';

    if commencement_row.session_id is null then
      condition_result := jsonb_build_object(
        'dimension', dimension_name,
        'status', 'unresolved',
        'value', null,
        'other_text', '',
        'period_id', null,
        'effective_start', null,
        'effective_end', null
      );
    elsif defined_at < commencement_row.commenced_at then
      condition_result := jsonb_build_object(
        'dimension', dimension_name,
        'status', 'not_applicable',
        'value', null,
        'other_text', '',
        'period_id', null,
        'effective_start', null,
        'effective_end', null
      );
    elsif authority_row.session_id is not null then
      select count(*)
      into applicable_count
      from public.grow_session_condition_periods condition_period
      where condition_period.session_id = p_session_id
        and condition_period.dimension = dimension_name
        and condition_period.effective_start <= defined_at
        and (
          condition_period.effective_end is null
          or condition_period.effective_end > defined_at
        );

      if applicable_count = 1 then
        select *
        into period_row
        from public.grow_session_condition_periods condition_period
        where condition_period.session_id = p_session_id
          and condition_period.dimension = dimension_name
          and condition_period.effective_start <= defined_at
          and (
            condition_period.effective_end is null
            or condition_period.effective_end > defined_at
          );

        condition_result := jsonb_build_object(
          'dimension', dimension_name,
          'status', 'known',
          'value', period_row.canonical_value,
          'other_text', period_row.other_text,
          'period_id', period_row.id,
          'effective_start', period_row.effective_start,
          'effective_end', period_row.effective_end,
          'period_revision', period_row.revision,
          'source_kind', period_row.source_kind
        );
      elsif applicable_count = 0 then
        condition_result := jsonb_build_object(
          'dimension', dimension_name,
          'status', 'absent',
          'value', null,
          'other_text', '',
          'period_id', null,
          'effective_start', null,
          'effective_end', null
        );
      else
        condition_result := jsonb_build_object(
          'dimension', dimension_name,
          'status', 'unresolved',
          'value', null,
          'other_text', '',
          'period_id', null,
          'effective_start', null,
          'effective_end', null
        );
      end if;
    else
      if dimension_name = 'grow_method' then
        legacy_value := phase_row.grow_method;
        legacy_other := coalesce(phase_row.grow_method_other, '');
      else
        legacy_value := phase_row.environment_type;
        legacy_other := coalesce(phase_row.environment_other, '');
      end if;

      condition_result := jsonb_build_object(
        'dimension', dimension_name,
        'status', case when legacy_value is null then 'absent' else 'known' end,
        'value', legacy_value,
        'other_text', legacy_other,
        'period_id', null,
        'effective_start', commencement_row.commenced_at,
        'effective_end', null,
        'period_revision', null,
        'source_kind', case when legacy_value is null then null else 'legacy_growing_phase' end
      );
    end if;

    condition_results := condition_results || jsonb_build_array(condition_result);
  end loop;

  return jsonb_build_object(
    'session_id', p_session_id,
    'authority', case
      when authority_row.session_id is null then 'legacy'
      else 'conditions'
    end,
    'authority_source', authority_row.authority_source,
    'canonical_revision', coalesce(authority_row.canonical_revision, 0),
    'growing_commencement_status', case
      when commencement_row.session_id is null then 'unresolved'
      else 'authoritative'
    end,
    'growing_commenced_at', commencement_row.commenced_at,
    'defined_at', defined_at,
    'conditions', condition_results
  );
end;
$$;

create or replace function public.get_canonical_session_conditions(
  p_session_id uuid,
  p_at timestamptz default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception 'You must be signed in to retrieve Session Conditions.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.grow_sessions
    where id = p_session_id
      and user_id = actor_id
  ) then
    return null;
  end if;

  return public.project_canonical_session_conditions(p_session_id, p_at);
end;
$$;

create or replace function public.get_session_condition_history(
  p_session_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  authority_row public.grow_session_conditions_authority%rowtype;
  periods jsonb := '[]'::jsonb;
  corrections jsonb := '[]'::jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to retrieve Session Condition history.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.grow_sessions session_row
    where session_row.id = p_session_id
      and session_row.user_id = actor_id
  ) then
    return null;
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id;

  if authority_row.session_id is not null then
    select coalesce(jsonb_agg(to_jsonb(ordered_period) order by
      ordered_period.effective_start,
      case ordered_period.dimension when 'grow_method' then 1 else 2 end,
      ordered_period.id
    ), '[]'::jsonb)
    into periods
    from public.grow_session_condition_periods ordered_period
    where ordered_period.session_id = p_session_id;

    select coalesce(jsonb_agg(to_jsonb(ordered_correction) order by
      ordered_correction.corrected_at,
      ordered_correction.condition_period_id,
      ordered_correction.revision,
      ordered_correction.id
    ), '[]'::jsonb)
    into corrections
    from public.grow_session_condition_corrections ordered_correction
    where ordered_correction.session_id = p_session_id;
  end if;

  return jsonb_build_object(
    'session_id', p_session_id,
    'authority', case
      when authority_row.session_id is null then 'legacy'
      else 'conditions'
    end,
    'canonical_revision', coalesce(authority_row.canonical_revision, 0),
    'periods', periods,
    'corrections', corrections
  );
end;
$$;

create or replace function public.declare_session_condition(
  p_session_id uuid,
  p_operation_id uuid,
  p_dimension text,
  p_value text,
  p_other_text text,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  normalized jsonb;
  fingerprint text;
  existing_operation public.grow_session_condition_operations%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  commencement_row public.grow_session_phase_commencements%rowtype;
  saved_period public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to declare Session Conditions.'
      using errcode = '42501';
  end if;
  if p_session_id is null or p_operation_id is null or p_expected_revision is null then
    raise exception 'Session, operation, and expected revision are required.'
      using errcode = '22023';
  end if;

  normalized := public.normalize_session_condition_input(
    p_dimension,
    p_value,
    p_other_text
  );
  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'declaration',
        'dimension', normalized ->> 'dimension',
        'value', normalized ->> 'value',
        'other_text', normalized ->> 'other_text',
        'expected_revision', p_expected_revision
      )::text,
      'sha256'
    ),
    'hex'
  );

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(
    p_session_id::text || ':' || (normalized ->> 'dimension'),
    0
  ));

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;

  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'declaration'
      or existing_operation.dimension is distinct from normalized ->> 'dimension'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    if not exists (
      select 1 from public.grow_sessions
      where id = p_session_id and user_id = actor_id
    ) then
      raise exception 'The canonical Session Condition is not accessible.'
        using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;

  if not exists (
    select 1 from public.grow_sessions
    where id = p_session_id and user_id = actor_id
  ) then
    raise exception 'Only the Session owner may declare Session Conditions.'
      using errcode = '42501';
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id
  for update;

  if not found then
    raise exception 'Legacy Growing fields remain authoritative for this Session.'
      using errcode = '23514';
  end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then
    raise exception 'The canonical Session Conditions revision is stale.'
      using errcode = '40001';
  end if;

  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;

  if not found then
    raise exception 'Canonical Growing commencement is unresolved.'
      using errcode = '23514';
  end if;
  if exists (
    select 1
    from public.grow_session_condition_periods
    where session_id = p_session_id
      and dimension = normalized ->> 'dimension'
  ) then
    raise exception 'The first canonical period already exists.'
      using errcode = '23505';
  end if;

  perform set_config('app.canonical_session_condition_write', 'true', true);

  insert into public.grow_session_condition_periods (
    session_id,
    dimension,
    canonical_value,
    other_text,
    effective_start,
    original_actor_id,
    source_kind,
    source_operation_id,
    revision
  ) values (
    p_session_id,
    normalized ->> 'dimension',
    normalized ->> 'value',
    normalized ->> 'other_text',
    commencement_row.commenced_at,
    actor_id,
    'owner_declaration',
    p_operation_id,
    1
  )
  returning * into saved_period;

  update public.grow_session_conditions_authority
  set canonical_revision = canonical_revision + 1
  where session_id = p_session_id
  returning * into authority_row;

  saved_result := jsonb_build_object(
    'operation_kind', 'declaration',
    'session_id', p_session_id,
    'canonical_revision', authority_row.canonical_revision,
    'period', to_jsonb(saved_period)
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    dimension,
    input_fingerprint,
    result
  ) values (
    p_operation_id,
    p_session_id,
    'declaration',
    normalized ->> 'dimension',
    fingerprint,
    saved_result
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return saved_result;
end;
$$;

create or replace function public.change_session_condition(
  p_session_id uuid,
  p_operation_id uuid,
  p_dimension text,
  p_value text,
  p_other_text text,
  p_effective_at timestamptz,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  normalized jsonb;
  fingerprint text;
  existing_operation public.grow_session_condition_operations%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  commencement_row public.grow_session_phase_commencements%rowtype;
  current_period public.grow_session_condition_periods%rowtype;
  saved_period public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to change Session Conditions.'
      using errcode = '42501';
  end if;
  if p_session_id is null or p_operation_id is null
    or p_effective_at is null or p_expected_revision is null then
    raise exception 'Session, operation, effective boundary, and expected revision are required.'
      using errcode = '22023';
  end if;

  normalized := public.normalize_session_condition_input(
    p_dimension,
    p_value,
    p_other_text
  );
  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'operational_change',
        'dimension', normalized ->> 'dimension',
        'value', normalized ->> 'value',
        'other_text', normalized ->> 'other_text',
        'effective_at', p_effective_at,
        'expected_revision', p_expected_revision
      )::text,
      'sha256'
    ),
    'hex'
  );

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(
    p_session_id::text || ':' || (normalized ->> 'dimension'),
    0
  ));

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;

  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'operational_change'
      or existing_operation.dimension is distinct from normalized ->> 'dimension'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    if not exists (
      select 1 from public.grow_sessions
      where id = p_session_id and user_id = actor_id
    ) then
      raise exception 'The canonical Session Condition is not accessible.'
        using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;

  if not exists (
    select 1 from public.grow_sessions
    where id = p_session_id and user_id = actor_id
  ) then
    raise exception 'Only the Session owner may change Session Conditions.'
      using errcode = '42501';
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id
  for update;
  if not found then
    raise exception 'Legacy Growing fields remain authoritative for this Session.'
      using errcode = '23514';
  end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then
    raise exception 'The canonical Session Conditions revision is stale.'
      using errcode = '40001';
  end if;

  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;
  if not found then
    raise exception 'Canonical Growing commencement is unresolved.'
      using errcode = '23514';
  end if;

  select *
  into current_period
  from public.grow_session_condition_periods
  where session_id = p_session_id
    and dimension = normalized ->> 'dimension'
    and effective_end is null
  for update;

  if not found then
    raise exception 'No current canonical period exists for this dimension.'
      using errcode = '23514';
  end if;
  if p_effective_at <= current_period.effective_start
    or p_effective_at < commencement_row.commenced_at then
    raise exception 'The operational-change boundary conflicts with canonical chronology.'
      using errcode = '23514';
  end if;

  perform set_config('app.canonical_session_condition_write', 'true', true);

  update public.grow_session_condition_periods
  set effective_end = p_effective_at,
      revision = revision + 1,
      updated_at = statement_timestamp()
  where id = current_period.id;

  insert into public.grow_session_condition_periods (
    session_id,
    dimension,
    canonical_value,
    other_text,
    effective_start,
    original_actor_id,
    source_kind,
    source_operation_id,
    revision
  ) values (
    p_session_id,
    normalized ->> 'dimension',
    normalized ->> 'value',
    normalized ->> 'other_text',
    p_effective_at,
    actor_id,
    'operational_change',
    p_operation_id,
    1
  )
  returning * into saved_period;

  update public.grow_session_conditions_authority
  set canonical_revision = canonical_revision + 1
  where session_id = p_session_id
  returning * into authority_row;

  saved_result := jsonb_build_object(
    'operation_kind', 'operational_change',
    'session_id', p_session_id,
    'canonical_revision', authority_row.canonical_revision,
    'closed_period_id', current_period.id,
    'period', to_jsonb(saved_period)
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    dimension,
    input_fingerprint,
    result
  ) values (
    p_operation_id,
    p_session_id,
    'operational_change',
    normalized ->> 'dimension',
    fingerprint,
    saved_result
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return saved_result;
end;
$$;

create or replace function public.correct_session_condition(
  p_session_id uuid,
  p_condition_period_id uuid,
  p_operation_id uuid,
  p_correction jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_period public.grow_session_condition_periods%rowtype;
  saved_period public.grow_session_condition_periods%rowtype;
  commencement_row public.grow_session_phase_commencements%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  existing_operation public.grow_session_condition_operations%rowtype;
  normalized jsonb;
  submitted_normalized jsonb;
  submitted_other text;
  submitted_correction jsonb;
  corrected_value text;
  corrected_other text;
  corrected_start timestamptz;
  corrected_end timestamptz;
  before_facts jsonb;
  after_facts jsonb;
  normalized_correction jsonb;
  fingerprint text;
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to correct Session Conditions.'
      using errcode = '42501';
  end if;
  if p_session_id is null or p_condition_period_id is null
    or p_operation_id is null or p_expected_revision is null
    or jsonb_typeof(p_correction) is distinct from 'object' then
    raise exception 'Session, period, operation, correction, and expected revision are required.'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));

  select *
  into existing_period
  from public.grow_session_condition_periods
  where id = p_condition_period_id
    and session_id = p_session_id
  for update;

  if not found then
    raise exception 'The canonical Session Condition period was not found.'
      using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_correction) correction_field
    where correction_field not in (
      'value',
      'other_text',
      'effective_start',
      'effective_end'
    )
  ) then
    raise exception 'The correction contains an unauthorized field.'
      using errcode = '22023';
  end if;

  submitted_other := case when p_correction ? 'other_text'
    then btrim(regexp_replace(coalesce(p_correction ->> 'other_text', ''), '\s+', ' ', 'g'))
    else null
  end;
  if submitted_other is not null and char_length(submitted_other) > 160 then
    submitted_other := left(submitted_other, 160);
  end if;

  if p_correction ? 'value' then
    submitted_normalized := public.normalize_session_condition_input(
      existing_period.dimension,
      p_correction ->> 'value',
      case when p_correction ? 'other_text' then submitted_other else '' end
    );
  end if;

  submitted_correction := jsonb_build_object(
    'value_present', p_correction ? 'value',
    'value', case when p_correction ? 'value'
      then submitted_normalized ->> 'value'
      else null
    end,
    'other_text_present', p_correction ? 'other_text',
    'other_text', case when p_correction ? 'other_text'
      then case when p_correction ? 'value'
        then submitted_normalized ->> 'other_text'
        else submitted_other
      end
      else null
    end,
    'effective_start_present', p_correction ? 'effective_start',
    'effective_start', case when p_correction ? 'effective_start'
      then (p_correction ->> 'effective_start')::timestamptz
      else null
    end,
    'effective_end_present', p_correction ? 'effective_end',
    'effective_end', case when p_correction ? 'effective_end'
      then case
        when p_correction -> 'effective_end' = 'null'::jsonb then null
        else (p_correction ->> 'effective_end')::timestamptz
      end
      else null
    end
  );

  normalized := public.normalize_session_condition_input(
    existing_period.dimension,
    case when p_correction ? 'value'
      then p_correction ->> 'value'
      else existing_period.canonical_value
    end,
    case when p_correction ? 'other_text'
      then p_correction ->> 'other_text'
      else existing_period.other_text
    end
  );
  corrected_value := normalized ->> 'value';
  corrected_other := normalized ->> 'other_text';
  corrected_start := case when p_correction ? 'effective_start'
    then (p_correction ->> 'effective_start')::timestamptz
    else existing_period.effective_start
  end;
  corrected_end := case when p_correction ? 'effective_end'
    then case
      when p_correction -> 'effective_end' = 'null'::jsonb then null
      else (p_correction ->> 'effective_end')::timestamptz
    end
    else existing_period.effective_end
  end;

  normalized_correction := jsonb_build_object(
    'value', corrected_value,
    'other_text', corrected_other,
    'effective_start', corrected_start,
    'effective_end', corrected_end
  );
  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'correction',
        'period_id', p_condition_period_id,
        'correction', submitted_correction,
        'expected_revision', p_expected_revision
      )::text,
      'sha256'
    ),
    'hex'
  );

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;

  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'correction'
      or existing_operation.dimension is distinct from existing_period.dimension
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    if not exists (
      select 1 from public.grow_sessions
      where id = p_session_id and user_id = actor_id
    ) then
      raise exception 'The canonical Session Condition is not accessible.'
        using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;

  if not exists (
    select 1 from public.grow_sessions
    where id = p_session_id and user_id = actor_id
  ) then
    raise exception 'Only the Session owner may correct Session Conditions.'
      using errcode = '42501';
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id
  for update;
  if not found then
    raise exception 'Legacy Growing fields remain authoritative for this Session.'
      using errcode = '23514';
  end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then
    raise exception 'The canonical Session Conditions revision is stale.'
      using errcode = '40001';
  end if;

  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;
  if not found or corrected_start < commencement_row.commenced_at then
    raise exception 'The corrected period conflicts with canonical Growing commencement.'
      using errcode = '23514';
  end if;
  if corrected_end is not null and corrected_end <= corrected_start then
    raise exception 'The corrected period is inverted.'
      using errcode = '23514';
  end if;
  if existing_period.effective_start = (
    select min(period.effective_start)
    from public.grow_session_condition_periods period
    where period.session_id = p_session_id
      and period.dimension = existing_period.dimension
  ) and corrected_start is distinct from commencement_row.commenced_at then
    raise exception 'The first canonical period must remain anchored at Growing commencement.'
      using errcode = '23514';
  end if;
  if exists (
    select 1
    from public.grow_session_condition_periods other_period
    where other_period.session_id = p_session_id
      and other_period.dimension = existing_period.dimension
      and other_period.id <> existing_period.id
      and tstzrange(
        other_period.effective_start,
        other_period.effective_end,
        '[)'
      ) && tstzrange(corrected_start, corrected_end, '[)')
  ) then
    raise exception 'The corrected period overlaps canonical history.'
      using errcode = '23P01';
  end if;

  before_facts := jsonb_build_object(
    'value', existing_period.canonical_value,
    'other_text', existing_period.other_text,
    'effective_start', existing_period.effective_start,
    'effective_end', existing_period.effective_end,
    'revision', existing_period.revision
  );
  after_facts := normalized_correction || jsonb_build_object(
    'revision', existing_period.revision + 1
  );

  if before_facts - 'revision' = after_facts - 'revision' then
    raise exception 'The correction does not change canonical facts.'
      using errcode = '22023';
  end if;

  perform set_config('app.canonical_session_condition_write', 'true', true);

  update public.grow_session_condition_periods
  set canonical_value = corrected_value,
      other_text = corrected_other,
      effective_start = corrected_start,
      effective_end = corrected_end,
      revision = revision + 1,
      updated_at = statement_timestamp()
  where id = existing_period.id
  returning * into saved_period;

  insert into public.grow_session_condition_corrections (
    session_id,
    condition_period_id,
    revision,
    before_facts,
    after_facts,
    correcting_actor_id,
    operation_id,
    operation_fingerprint
  ) values (
    p_session_id,
    existing_period.id,
    saved_period.revision,
    before_facts,
    after_facts,
    actor_id,
    p_operation_id,
    fingerprint
  );

  update public.grow_session_conditions_authority
  set canonical_revision = canonical_revision + 1
  where session_id = p_session_id
  returning * into authority_row;

  saved_result := jsonb_build_object(
    'operation_kind', 'correction',
    'session_id', p_session_id,
    'canonical_revision', authority_row.canonical_revision,
    'period', to_jsonb(saved_period),
    'before_facts', before_facts,
    'after_facts', after_facts
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    dimension,
    input_fingerprint,
    result
  ) values (
    p_operation_id,
    p_session_id,
    'correction',
    existing_period.dimension,
    fingerprint,
    saved_result
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return saved_result;
end;
$$;

create or replace function public.migrate_session_conditions(
  p_session_id uuid,
  p_operation_id uuid,
  p_expected_source_updated_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  session_row public.grow_sessions%rowtype;
  phase_row public.grow_session_growing_phases%rowtype;
  commencement_row public.grow_session_phase_commencements%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  existing_operation public.grow_session_condition_operations%rowtype;
  normalized_method jsonb;
  normalized_environment jsonb;
  fingerprint text;
  saved_result jsonb;
  projection_result jsonb;
  saved_count integer;
begin
  if p_session_id is null or p_operation_id is null
    or p_expected_source_updated_at is null then
    raise exception 'Session, operation, and expected source revision are required.'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));

  select *
  into session_row
  from public.grow_sessions
  where id = p_session_id
  for update;
  if not found then
    raise exception 'The Session was not found.'
      using errcode = 'P0002';
  end if;
  if actor_id is not null and session_row.user_id is distinct from actor_id then
    raise exception 'Only the Session owner may migrate Session Conditions.'
      using errcode = '42501';
  end if;
  actor_id := coalesce(actor_id, session_row.user_id);

  select *
  into phase_row
  from public.grow_session_growing_phases
  where session_id = p_session_id
  for update;
  if not found
    or phase_row.environment_type is null
    or phase_row.grow_method is null then
    raise exception 'Authoritative legacy Session Condition truth is incomplete.'
      using errcode = '23514';
  end if;
  if phase_row.updated_at is distinct from p_expected_source_updated_at then
    raise exception 'Legacy Growing truth changed before migration.'
      using errcode = '40001';
  end if;

  select *
  into commencement_row
  from public.grow_session_phase_commencements
  where session_id = p_session_id;
  if not found then
    raise exception 'Canonical Growing commencement is unresolved.'
      using errcode = '23514';
  end if;

  normalized_method := public.normalize_session_condition_input(
    'grow_method',
    phase_row.grow_method,
    phase_row.grow_method_other
  );
  normalized_environment := public.normalize_session_condition_input(
    'environment_type',
    phase_row.environment_type,
    phase_row.environment_other
  );

  if normalized_method ->> 'value' is distinct from phase_row.grow_method
    or normalized_method ->> 'other_text' is distinct from coalesce(phase_row.grow_method_other, '')
    or normalized_environment ->> 'value' is distinct from phase_row.environment_type
    or normalized_environment ->> 'other_text' is distinct from coalesce(phase_row.environment_other, '') then
    raise exception 'Legacy Session Condition truth is not normalization-compatible.'
      using errcode = '23514';
  end if;

  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'legacy_migration',
        'source_phase_id', phase_row.id,
        'source_updated_at', phase_row.updated_at,
        'commenced_at', commencement_row.commenced_at,
        'grow_method', normalized_method,
        'environment_type', normalized_environment
      )::text,
      'sha256'
    ),
    'hex'
  );

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;
  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'legacy_migration'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    return existing_operation.result;
  end if;

  select *
  into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id
  for update;
  if found then
    raise exception 'Canonical Session Conditions authority already exists.'
      using errcode = '23505';
  end if;

  perform set_config('app.canonical_session_condition_write', 'true', true);

  insert into public.grow_session_condition_periods (
    session_id,
    dimension,
    canonical_value,
    other_text,
    effective_start,
    original_actor_id,
    source_kind,
    source_operation_id,
    source_growing_phase_id,
    source_created_at,
    source_updated_at,
    revision
  ) values
    (
      p_session_id,
      'grow_method',
      normalized_method ->> 'value',
      normalized_method ->> 'other_text',
      commencement_row.commenced_at,
      actor_id,
      'legacy_migration',
      p_operation_id,
      phase_row.id,
      phase_row.created_at,
      phase_row.updated_at,
      1
    ),
    (
      p_session_id,
      'environment_type',
      normalized_environment ->> 'value',
      normalized_environment ->> 'other_text',
      commencement_row.commenced_at,
      actor_id,
      'legacy_migration',
      p_operation_id,
      phase_row.id,
      phase_row.created_at,
      phase_row.updated_at,
      1
    );

  select count(*)
  into saved_count
  from public.grow_session_condition_periods condition_period
  where condition_period.session_id = p_session_id
    and condition_period.source_operation_id = p_operation_id
    and condition_period.effective_start = commencement_row.commenced_at
    and condition_period.effective_end is null;

  if saved_count <> 2
    or not exists (
      select 1
      from public.grow_session_condition_periods
      where session_id = p_session_id
        and dimension = 'grow_method'
        and canonical_value = phase_row.grow_method
        and other_text = coalesce(phase_row.grow_method_other, '')
    )
    or not exists (
      select 1
      from public.grow_session_condition_periods
      where session_id = p_session_id
        and dimension = 'environment_type'
        and canonical_value = phase_row.environment_type
        and other_text = coalesce(phase_row.environment_other, '')
    ) then
    raise exception 'Session Conditions migration parity validation failed.'
      using errcode = '23514';
  end if;

  insert into public.grow_session_conditions_authority (
    session_id,
    authority_source,
    source_growing_phase_id,
    canonical_revision,
    cutover_operation_id,
    cutover_fingerprint,
    cutover_at
  ) values (
    p_session_id,
    'legacy_migration',
    phase_row.id,
    1,
    p_operation_id,
    fingerprint,
    statement_timestamp()
  )
  returning * into authority_row;

  projection_result := public.project_canonical_session_conditions(
    p_session_id,
    commencement_row.commenced_at
  );

  if projection_result is null
    or projection_result ->> 'authority' <> 'conditions'
    or projection_result #>> '{conditions,0,dimension}' <> 'grow_method'
    or projection_result #>> '{conditions,0,status}' <> 'known'
    or projection_result #>> '{conditions,0,value}' is distinct from phase_row.grow_method
    or projection_result #>> '{conditions,0,other_text}' is distinct from coalesce(phase_row.grow_method_other, '')
    or projection_result #>> '{conditions,1,dimension}' <> 'environment_type'
    or projection_result #>> '{conditions,1,status}' <> 'known'
    or projection_result #>> '{conditions,1,value}' is distinct from phase_row.environment_type
    or projection_result #>> '{conditions,1,other_text}' is distinct from coalesce(phase_row.environment_other, '') then
    raise exception 'Session Conditions canonical projection parity validation failed.'
      using errcode = '23514';
  end if;

  saved_result := jsonb_build_object(
    'operation_kind', 'legacy_migration',
    'session_id', p_session_id,
    'authority', 'conditions',
    'canonical_revision', authority_row.canonical_revision,
    'cutover_at', authority_row.cutover_at,
    'migrated_dimensions', jsonb_build_array('grow_method', 'environment_type')
  );

  insert into public.grow_session_condition_operations (
    operation_id,
    session_id,
    operation_kind,
    input_fingerprint,
    result
  ) values (
    p_operation_id,
    p_session_id,
    'legacy_migration',
    fingerprint,
    saved_result
  );

  perform set_config('app.canonical_session_condition_write', 'false', true);
  return saved_result;
end;
$$;

alter table public.grow_session_conditions_authority enable row level security;
alter table public.grow_session_condition_periods enable row level security;
alter table public.grow_session_condition_corrections enable row level security;
alter table public.grow_session_condition_operations enable row level security;

drop policy if exists "Owners can read Session Conditions authority"
  on public.grow_session_conditions_authority;
create policy "Owners can read Session Conditions authority"
  on public.grow_session_conditions_authority
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

drop policy if exists "Owners can read canonical Session Condition periods"
  on public.grow_session_condition_periods;
create policy "Owners can read canonical Session Condition periods"
  on public.grow_session_condition_periods
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

drop policy if exists "Owners can read Session Condition correction history"
  on public.grow_session_condition_corrections;
create policy "Owners can read Session Condition correction history"
  on public.grow_session_condition_corrections
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

revoke all on public.grow_session_conditions_authority from public;
revoke all on public.grow_session_conditions_authority from anon;
revoke all on public.grow_session_conditions_authority from authenticated;
revoke all on public.grow_session_conditions_authority from service_role;
grant select on public.grow_session_conditions_authority to authenticated;

revoke all on public.grow_session_condition_periods from public;
revoke all on public.grow_session_condition_periods from anon;
revoke all on public.grow_session_condition_periods from authenticated;
revoke all on public.grow_session_condition_periods from service_role;
grant select on public.grow_session_condition_periods to authenticated;

revoke all on public.grow_session_condition_corrections from public;
revoke all on public.grow_session_condition_corrections from anon;
revoke all on public.grow_session_condition_corrections from authenticated;
revoke all on public.grow_session_condition_corrections from service_role;
grant select on public.grow_session_condition_corrections to authenticated;

revoke all on public.grow_session_condition_operations from public;
revoke all on public.grow_session_condition_operations from anon;
revoke all on public.grow_session_condition_operations from authenticated;
revoke all on public.grow_session_condition_operations from service_role;

revoke all on function public.normalize_session_condition_input(text, text, text) from public;
revoke all on function public.normalize_session_condition_input(text, text, text) from anon;
revoke all on function public.normalize_session_condition_input(text, text, text) from authenticated;
revoke all on function public.normalize_session_condition_input(text, text, text) from service_role;

revoke all on function public.enforce_canonical_session_condition_write() from public;
revoke all on function public.enforce_canonical_session_condition_write() from anon;
revoke all on function public.enforce_canonical_session_condition_write() from authenticated;
revoke all on function public.enforce_canonical_session_condition_write() from service_role;

revoke all on function public.enforce_canonical_session_condition_period_write() from public;
revoke all on function public.enforce_canonical_session_condition_period_write() from anon;
revoke all on function public.enforce_canonical_session_condition_period_write() from authenticated;
revoke all on function public.enforce_canonical_session_condition_period_write() from service_role;

revoke all on function public.enforce_legacy_condition_authority() from public;
revoke all on function public.enforce_legacy_condition_authority() from anon;
revoke all on function public.enforce_legacy_condition_authority() from authenticated;
revoke all on function public.enforce_legacy_condition_authority() from service_role;

revoke all on function public.initialize_session_conditions_authority() from public;
revoke all on function public.initialize_session_conditions_authority() from anon;
revoke all on function public.initialize_session_conditions_authority() from authenticated;
revoke all on function public.initialize_session_conditions_authority() from service_role;

revoke all on function public.project_canonical_session_conditions(uuid, timestamptz) from public;
revoke all on function public.project_canonical_session_conditions(uuid, timestamptz) from anon;
revoke all on function public.project_canonical_session_conditions(uuid, timestamptz) from authenticated;
revoke all on function public.project_canonical_session_conditions(uuid, timestamptz) from service_role;

revoke all on function public.get_canonical_session_conditions(uuid, timestamptz) from public;
revoke all on function public.get_canonical_session_conditions(uuid, timestamptz) from anon;
revoke all on function public.get_canonical_session_conditions(uuid, timestamptz) from service_role;
grant execute on function public.get_canonical_session_conditions(uuid, timestamptz) to authenticated;

revoke all on function public.get_session_condition_history(uuid) from public;
revoke all on function public.get_session_condition_history(uuid) from anon;
revoke all on function public.get_session_condition_history(uuid) from service_role;
grant execute on function public.get_session_condition_history(uuid) to authenticated;

revoke all on function public.declare_session_condition(uuid, uuid, text, text, text, bigint) from public;
revoke all on function public.declare_session_condition(uuid, uuid, text, text, text, bigint) from anon;
revoke all on function public.declare_session_condition(uuid, uuid, text, text, text, bigint) from service_role;
grant execute on function public.declare_session_condition(uuid, uuid, text, text, text, bigint) to authenticated;

revoke all on function public.change_session_condition(uuid, uuid, text, text, text, timestamptz, bigint) from public;
revoke all on function public.change_session_condition(uuid, uuid, text, text, text, timestamptz, bigint) from anon;
revoke all on function public.change_session_condition(uuid, uuid, text, text, text, timestamptz, bigint) from service_role;
grant execute on function public.change_session_condition(uuid, uuid, text, text, text, timestamptz, bigint) to authenticated;

revoke all on function public.correct_session_condition(uuid, uuid, uuid, jsonb, bigint) from public;
revoke all on function public.correct_session_condition(uuid, uuid, uuid, jsonb, bigint) from anon;
revoke all on function public.correct_session_condition(uuid, uuid, uuid, jsonb, bigint) from service_role;
grant execute on function public.correct_session_condition(uuid, uuid, uuid, jsonb, bigint) to authenticated;

revoke all on function public.migrate_session_conditions(uuid, uuid, timestamptz) from public;
revoke all on function public.migrate_session_conditions(uuid, uuid, timestamptz) from anon;
revoke all on function public.migrate_session_conditions(uuid, uuid, timestamptz) from service_role;
grant execute on function public.migrate_session_conditions(uuid, uuid, timestamptz) to authenticated;

comment on table public.grow_session_conditions_authority is
  'Per-Session atomic authority cutover for canonical Grow Method and Environment Type conditions.';
comment on table public.grow_session_condition_periods is
  'Correction-aware canonical Session Condition periods for Grow Method and Environment Type.';
comment on table public.grow_session_condition_corrections is
  'Immutable attributable before-and-after correction history for canonical Session Conditions.';
comment on table public.grow_session_condition_operations is
  'Stable idempotent operation identities and results for canonical Session Condition mutations and cutover.';
comment on function public.project_canonical_session_conditions(uuid, timestamptz) is
  'Internal canonical Platform Session Conditions projection shared by access-safe retrieval and atomic cutover validation.';
comment on function public.get_canonical_session_conditions(uuid, timestamptz) is
  'Canonical Platform Current Conditions and historical-point projection with explicit missing-state meaning.';
comment on function public.get_session_condition_history(uuid) is
  'Deterministic owner-scoped operational period and correction-history retrieval.';

notify pgrst, 'reload schema';
