-- Bounded backend correction: canonical Growing entry and both initial Session
-- Conditions now have one lifecycle-owned transaction boundary.

alter table public.grow_session_condition_operations
  drop constraint if exists grow_session_condition_operations_kind_check;
alter table public.grow_session_condition_operations
  add constraint grow_session_condition_operations_kind_check
  check (operation_kind in (
    'authority_initialize',
    'legacy_migration',
    'declaration',
    'operational_change',
    'correction',
    'current_change',
    'forward_legacy_declaration',
    'begin_growing'
  ));

-- Preserve the settled ICE-SC-003 application-operation boundary.
revoke all on function public.change_session_condition(
  uuid, uuid, text, text, text, timestamptz, bigint
) from authenticated;
revoke all on function public.correct_session_condition(
  uuid, uuid, uuid, jsonb, bigint
) from authenticated;

create or replace function public.project_session_condition_dimension_v2(
  p_session_id uuid,
  p_dimension text,
  p_defined_at timestamptz
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  commencement_at timestamptz;
  authority_source text;
  cutover_at timestamptz;
  period_count integer;
  canonical_value text;
  other_text text;
  period_id uuid;
  effective_start timestamptz;
  effective_end timestamptz;
  period_revision bigint;
  source_kind text;
  legacy_value text;
  legacy_other text;
begin
  select c.commenced_at into commencement_at
  from public.grow_session_phase_commencements c where c.session_id = p_session_id;
  select a.authority_source, a.cutover_at into authority_source, cutover_at
  from public.grow_session_conditions_authority a where a.session_id = p_session_id;
  if authority_source = 'forward_legacy_declaration' and p_defined_at < cutover_at then
    return jsonb_build_object('dimension',p_dimension,'status','unavailable','value',null,'other_text','',
      'period_id',null,'effective_start',null,'effective_end',null,'period_revision',null,
      'source_kind','forward_legacy_declaration');
  end if;
  if commencement_at is null and authority_source is null then
    return jsonb_build_object('dimension',p_dimension,'status','unresolved','value',null,'other_text','',
      'period_id',null,'effective_start',null,'effective_end',null);
  end if;
  if commencement_at is not null and p_defined_at < commencement_at then
    return jsonb_build_object('dimension',p_dimension,'status','not_applicable','value',null,'other_text','',
      'period_id',null,'effective_start',null,'effective_end',null);
  end if;
  if authority_source is not null then
    select count(*) into period_count
    from public.grow_session_condition_periods p
    where p.session_id=p_session_id and p.dimension=p_dimension
      and p.effective_start <= p_defined_at
      and (p.effective_end is null or p.effective_end > p_defined_at);
    if period_count = 1 then
      select p.canonical_value,p.other_text,p.id,p.effective_start,p.effective_end,p.revision,p.source_kind
      into canonical_value,other_text,period_id,effective_start,effective_end,period_revision,source_kind
      from public.grow_session_condition_periods p
      where p.session_id=p_session_id and p.dimension=p_dimension
        and p.effective_start <= p_defined_at
        and (p.effective_end is null or p.effective_end > p_defined_at);
      return jsonb_build_object('dimension',p_dimension,'status','known','value',canonical_value,
        'other_text',other_text,'period_id',period_id,'effective_start',effective_start,
        'effective_end',effective_end,'period_revision',period_revision,'source_kind',source_kind);
    end if;
    return jsonb_build_object('dimension',p_dimension,'status',case when authority_source='forward_legacy_declaration' then 'unavailable' else 'absent' end,
      'value',null,'other_text','', 'period_id',null,'effective_start',null,'effective_end',null,'source_kind',authority_source);
  end if;
  if p_dimension='grow_method' then
    select p.grow_method,p.grow_method_other into legacy_value,legacy_other
    from public.grow_session_growing_phases p where p.session_id=p_session_id;
  else
    select p.environment_type,p.environment_other into legacy_value,legacy_other
    from public.grow_session_growing_phases p where p.session_id=p_session_id;
  end if;
  return jsonb_build_object('dimension',p_dimension,'status',case when legacy_value is null then 'absent' else 'known' end,
    'value',legacy_value,'other_text',coalesce(legacy_other,''),'period_id',null,
    'effective_start',commencement_at,'effective_end',null,'period_revision',null,
    'source_kind',case when legacy_value is null then null else 'legacy_growing_phase' end);
end;
$$;

-- Resolve correction retries from durable operation identity before validating
-- the current period against a new correction request.
create or replace function public.correct_current_session_condition(
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
  authority_row public.grow_session_conditions_authority%rowtype;
  existing_operation public.grow_session_condition_operations%rowtype;
  normalized jsonb;
  note text;
  before_facts jsonb;
  after_facts jsonb;
  fingerprint text;
  correction_at timestamptz;
  saved_period public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then raise exception 'You must be signed in to correct Session Conditions.' using errcode = '42501'; end if;
  if p_session_id is null or p_condition_period_id is null or p_operation_id is null or p_expected_revision is null or jsonb_typeof(p_correction) is distinct from 'object' then
    raise exception 'Session, period, operation, correction, and expected revision are required.' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_object_keys(p_correction) field where field not in ('value','other_text','correction_note')) then
    raise exception 'The correction contains an unauthorized field.' using errcode = '22023';
  end if;
  select * into existing_period from public.grow_session_condition_periods where id=p_condition_period_id and session_id=p_session_id for update;
  if not found then raise exception 'The canonical Session Condition period was not found.' using errcode = 'P0002'; end if;
  normalized := public.normalize_session_condition_input(existing_period.dimension,
    case when p_correction ? 'value' then p_correction->>'value' else existing_period.canonical_value end,
    case when p_correction ? 'other_text' then p_correction->>'other_text' else existing_period.other_text end);
  note := public.normalize_session_condition_correction_note(case when p_correction ? 'correction_note' then p_correction->>'correction_note' else null end);
  before_facts := jsonb_build_object('value',existing_period.canonical_value,'other_text',existing_period.other_text,'effective_start',existing_period.effective_start,'effective_end',existing_period.effective_end,'revision',existing_period.revision);
  after_facts := jsonb_build_object('value',normalized->>'value','other_text',normalized->>'other_text','effective_start',existing_period.effective_start,'effective_end',existing_period.effective_end,'revision',existing_period.revision+1,'correction_note',note);
  fingerprint := encode(extensions.digest(jsonb_build_object('session_id',p_session_id,'operation_kind','correction','period_id',p_condition_period_id,'correction',jsonb_build_object('value',normalized->>'value','other_text',normalized->>'other_text','correction_note',note),'expected_revision',p_expected_revision)::text,'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text,0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text,0));
  select * into existing_operation from public.grow_session_condition_operations where operation_id=p_operation_id;
  if found then
    if existing_operation.session_id is distinct from p_session_id or existing_operation.operation_kind is distinct from 'correction' or existing_operation.dimension is distinct from existing_period.dimension or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.' using errcode = '23505';
    end if;
    if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then raise exception 'The canonical Session Condition is not accessible.' using errcode='42501'; end if;
    return existing_operation.result;
  end if;
  if existing_period.canonical_value is not distinct from normalized->>'value' and existing_period.other_text is not distinct from normalized->>'other_text' then
    raise exception 'The correction does not change canonical facts.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then raise exception 'Only the Session owner may correct Session Conditions.' using errcode='42501'; end if;
  select * into authority_row from public.grow_session_conditions_authority where session_id=p_session_id for update;
  if not found then raise exception 'Legacy Growing fields remain authoritative for this Session.' using errcode='23514'; end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then raise exception 'The canonical Session Conditions revision is stale.' using errcode='40001'; end if;
  correction_at := clock_timestamp();
  perform set_config('app.canonical_session_condition_write','true',true);
  update public.grow_session_condition_periods set canonical_value=normalized->>'value', other_text=normalized->>'other_text', revision=revision+1, updated_at=correction_at where id=existing_period.id returning * into saved_period;
  insert into public.grow_session_condition_corrections(session_id,condition_period_id,revision,before_facts,after_facts,correcting_actor_id,operation_id,operation_fingerprint,corrected_at,correction_note)
  values(p_session_id,existing_period.id,saved_period.revision,before_facts,after_facts,actor_id,p_operation_id,fingerprint,correction_at,note);
  update public.grow_session_conditions_authority set canonical_revision=canonical_revision+1 where session_id=p_session_id returning * into authority_row;
  saved_result := jsonb_build_object('operation_kind','correction','status','success','session_id',p_session_id,'canonical_revision',authority_row.canonical_revision,'corrected_at',correction_at,'period',to_jsonb(saved_period),'before_facts',before_facts,'after_facts',after_facts,'correction_note',note);
  insert into public.grow_session_condition_operations(operation_id,session_id,operation_kind,dimension,input_fingerprint,result)
  values(p_operation_id,p_session_id,'correction',existing_period.dimension,fingerprint,saved_result);
  perform set_config('app.canonical_session_condition_write','false',true);
  return saved_result;
end;
$$;

create or replace function public.enter_canonical_growing_with_initial_conditions(
  p_session_id uuid,
  p_operation_id uuid,
  p_entry_path text,
  p_initial_conditions jsonb,
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
  method_input jsonb;
  environment_input jsonb;
  normalized_conditions jsonb;
  fingerprint text;
  method_operation_hash text;
  environment_operation_hash text;
  method_operation_id uuid;
  environment_operation_id uuid;
  existing_operation public.grow_session_condition_operations%rowtype;
  lifecycle_result jsonb;
  method_result jsonb;
  environment_result jsonb;
  saved_result jsonb;
begin
  if actor_id is null then
    raise exception 'You must be signed in to begin Growing.'
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

  if jsonb_typeof(p_initial_conditions) is distinct from 'object'
    or not (p_initial_conditions ? 'grow_method')
    or not (p_initial_conditions ? 'environment_type') then
    raise exception 'Both initial Grow Method and Environment Type are required.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_initial_conditions) field
    where field not in ('grow_method', 'environment_type')
  ) then
    raise exception 'The initial conditions contain an unauthorized dimension.'
      using errcode = '22023';
  end if;

  if jsonb_typeof(p_initial_conditions -> 'grow_method') is distinct from 'object'
    or jsonb_typeof(p_initial_conditions -> 'environment_type') is distinct from 'object' then
    raise exception 'Initial Grow Method and Environment Type inputs must be objects.'
      using errcode = '22023';
  end if;

  method_input := public.normalize_session_condition_input(
    'grow_method',
    p_initial_conditions #>> '{grow_method,value}',
    coalesce(p_initial_conditions #>> '{grow_method,other_text}', '')
  );
  environment_input := public.normalize_session_condition_input(
    'environment_type',
    p_initial_conditions #>> '{environment_type,value}',
    coalesce(p_initial_conditions #>> '{environment_type,other_text}', '')
  );
  normalized_conditions := jsonb_build_object(
    'grow_method', method_input,
    'environment_type', environment_input
  );

  fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'session_id', p_session_id,
        'operation_kind', 'begin_growing',
        'entry_path', normalized_entry_path,
        'expected_updated_at', p_expected_updated_at,
        'session_record', case
          when normalized_entry_path = 'grow' then normalized_session_record
          else '{}'::jsonb
        end,
        'initial_conditions', normalized_conditions
      )::text,
      'sha256'
    ),
    'hex'
  );

  method_operation_hash := md5(
    'begin_growing:' || p_operation_id::text || ':grow_method'
  );
  environment_operation_hash := md5(
    'begin_growing:' || p_operation_id::text || ':environment_type'
  );
  method_operation_id := (
    substr(method_operation_hash, 1, 8)
    || '-'
    || substr(method_operation_hash, 9, 4)
    || '-4'
    || substr(method_operation_hash, 14, 3)
    || '-8'
    || substr(method_operation_hash, 18, 3)
    || '-'
    || substr(method_operation_hash, 21, 12)
  )::uuid;
  environment_operation_id := (
    substr(environment_operation_hash, 1, 8)
    || '-'
    || substr(environment_operation_hash, 9, 4)
    || '-4'
    || substr(environment_operation_hash, 14, 3)
    || '-8'
    || substr(environment_operation_hash, 18, 3)
    || '-'
    || substr(environment_operation_hash, 21, 12)
  )::uuid;

  if method_operation_id = p_operation_id
    or environment_operation_id = p_operation_id
    or method_operation_id = environment_operation_id then
    raise exception 'A derived condition operation identity conflicts with the Begin Growing operation.'
      using errcode = '23505';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));

  select *
  into existing_operation
  from public.grow_session_condition_operations
  where operation_id = p_operation_id;

  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'begin_growing'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.'
        using errcode = '23505';
    end if;
    if not exists (
      select 1
      from public.grow_sessions
      where id = p_session_id
        and user_id = actor_id
    ) then
      raise exception 'The canonical Begin Growing operation is not accessible.'
        using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;

  lifecycle_result := public.enter_canonical_growing(
    p_session_id,
    p_operation_id,
    normalized_entry_path,
    p_expected_updated_at,
    p_session_record
  );

  method_result := public.declare_session_condition(
    p_session_id,
    method_operation_id,
    'grow_method',
    method_input ->> 'value',
    method_input ->> 'other_text',
    0
  );
  environment_result := public.declare_session_condition(
    p_session_id,
    environment_operation_id,
    'environment_type',
    environment_input ->> 'value',
    environment_input ->> 'other_text',
    1
  );

  if (method_result ->> 'canonical_revision')::bigint <> 1
    or (environment_result ->> 'canonical_revision')::bigint <> 2
    or (method_result #>> '{period,effective_start}')::timestamptz
      is distinct from (lifecycle_result #>> '{commencement,commenced_at}')::timestamptz
    or (environment_result #>> '{period,effective_start}')::timestamptz
      is distinct from (lifecycle_result #>> '{commencement,commenced_at}')::timestamptz then
    raise exception 'Initial Session Conditions did not share the canonical Growing commencement boundary.'
      using errcode = '23514';
  end if;

  saved_result := jsonb_build_object(
    'operation_kind', 'begin_growing',
    'status', 'success',
    'session_id', p_session_id,
    'operation_id', p_operation_id,
    'canonical_revision', 2,
    'session', lifecycle_result -> 'session',
    'commencement', lifecycle_result -> 'commencement',
    'grow_method_period', method_result -> 'period',
    'environment_type_period', environment_result -> 'period',
    'condition_operation_ids', jsonb_build_object(
      'grow_method', method_operation_id,
      'environment_type', environment_operation_id
    )
  );

  perform set_config('app.canonical_session_condition_write', 'true', true);
  update public.grow_session_condition_operations
  set operation_kind = 'begin_growing',
      dimension = null,
      input_fingerprint = fingerprint,
      result = saved_result
  where operation_id = p_operation_id
    and session_id = p_session_id
    and operation_kind = 'authority_initialize'
  returning * into existing_operation;

  if not found then
    raise exception 'Canonical Session Conditions authority initialization was not established.'
      using errcode = '23514';
  end if;
  perform set_config('app.canonical_session_condition_write', 'false', true);

  return saved_result;
end;
$$;

revoke all on function public.enter_canonical_growing_with_initial_conditions(
  uuid, uuid, text, jsonb, timestamptz, jsonb
) from public, anon, service_role;
grant execute on function public.enter_canonical_growing_with_initial_conditions(
  uuid, uuid, text, jsonb, timestamptz, jsonb
) to authenticated;

comment on function public.enter_canonical_growing_with_initial_conditions(
  uuid, uuid, text, jsonb, timestamptz, jsonb
) is
  'Lifecycle-owned atomic Begin Growing boundary that establishes commencement and both initial Session Conditions or persists none.';

notify pgrst, 'reload schema';
