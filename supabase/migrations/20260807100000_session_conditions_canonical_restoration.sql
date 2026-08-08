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
  if authority_source is null and commencement_at is not null and p_defined_at < commencement_at then
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

create or replace function public.project_canonical_session_conditions_v3(
  p_session_id uuid,
  p_at timestamptz default null
)
returns jsonb
language sql
volatile
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'session_id', p_session_id,
    'authority', case when (select a.session_id from public.grow_session_conditions_authority a where a.session_id=p_session_id) is null then 'legacy' else 'conditions' end,
    'authority_source', (select a.authority_source from public.grow_session_conditions_authority a where a.session_id=p_session_id),
    'canonical_revision', coalesce((select a.canonical_revision from public.grow_session_conditions_authority a where a.session_id=p_session_id),0),
    'growing_commencement_status', case when (select c.session_id from public.grow_session_phase_commencements c where c.session_id=p_session_id) is null then 'unresolved' else 'authoritative' end,
    'growing_commenced_at', (select c.commenced_at from public.grow_session_phase_commencements c where c.session_id=p_session_id),
    'defined_at', coalesce(p_at,statement_timestamp()),
    'earlier_conditions_status', case when (select a.authority_source from public.grow_session_conditions_authority a where a.session_id=p_session_id)='forward_legacy_declaration' then 'unavailable' else null end,
    'conditions', jsonb_build_array(
      public.project_session_condition_dimension_v2(p_session_id,'grow_method',coalesce(p_at,statement_timestamp())),
      public.project_session_condition_dimension_v2(p_session_id,'environment_type',coalesce(p_at,statement_timestamp()))
    )
  );
$$;

create or replace function public.get_session_condition_history(p_session_id uuid)
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
    raise exception 'You must be signed in to retrieve Session Condition history.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.grow_sessions session_row
    where session_row.id = p_session_id and session_row.user_id = actor_id
  ) then
    return null;
  end if;
  select * into authority_row
  from public.grow_session_conditions_authority
  where session_id = p_session_id;
  select coalesce(jsonb_agg(to_jsonb(ordered_period) order by ordered_period.effective_start,
    case ordered_period.dimension when 'grow_method' then 1 else 2 end, ordered_period.id), '[]'::jsonb)
  into periods
  from public.grow_session_condition_periods ordered_period
  where ordered_period.session_id = p_session_id;
  select coalesce(jsonb_agg(to_jsonb(ordered_correction) order by ordered_correction.corrected_at,
    ordered_correction.condition_period_id, ordered_correction.revision, ordered_correction.id), '[]'::jsonb)
  into corrections
  from public.grow_session_condition_corrections ordered_correction
  where ordered_correction.session_id = p_session_id;
  return jsonb_build_object(
    'session_id', p_session_id,
    'authority', case when authority_row.session_id is null then 'legacy' else 'conditions' end,
    'authority_source', authority_row.authority_source,
    'earlier_conditions_status', case when authority_row.authority_source = 'forward_legacy_declaration' then 'unavailable' else null end,
    'canonical_revision', coalesce(authority_row.canonical_revision, 0),
    'periods', periods,
    'corrections', corrections
  );
end;
$$;

create or replace function public.change_current_session_conditions(
  p_session_id uuid,
  p_operation_id uuid,
  p_changes jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  authority_row public.grow_session_conditions_authority%rowtype;
  existing_operation public.grow_session_condition_operations%rowtype;
  method_period public.grow_session_condition_periods%rowtype;
  environment_period public.grow_session_condition_periods%rowtype;
  method_input jsonb;
  environment_input jsonb;
  normalized_changes jsonb := '{}'::jsonb;
  fingerprint text;
  operation_at timestamptz;
  changed_method boolean := false;
  changed_environment boolean := false;
  changed_dimensions jsonb := '[]'::jsonb;
  saved_method public.grow_session_condition_periods%rowtype;
  saved_environment public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then raise exception 'You must be signed in to change Session Conditions.' using errcode = '42501'; end if;
  if p_session_id is null or p_operation_id is null or p_expected_revision is null
    or jsonb_typeof(p_changes) is distinct from 'object' then
    raise exception 'Session, operation, changes, and expected revision are required.' using errcode = '22023';
  end if;
  if p_changes = '{}'::jsonb then
    raise exception 'At least one Session Condition dimension is required.' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_object_keys(p_changes) field where field not in ('grow_method','environment_type')) then
    raise exception 'The change contains an unauthorized Session Condition dimension.' using errcode = '22023';
  end if;
  if p_changes ? 'grow_method' then
    if jsonb_typeof(p_changes -> 'grow_method') is distinct from 'object' then raise exception 'Grow Method input must be an object.' using errcode = '22023'; end if;
    method_input := public.normalize_session_condition_input('grow_method', p_changes #>> '{grow_method,value}', coalesce(p_changes #>> '{grow_method,other_text}', ''));
    normalized_changes := normalized_changes || jsonb_build_object('grow_method', method_input);
  end if;
  if p_changes ? 'environment_type' then
    if jsonb_typeof(p_changes -> 'environment_type') is distinct from 'object' then raise exception 'Environment Type input must be an object.' using errcode = '22023'; end if;
    environment_input := public.normalize_session_condition_input('environment_type', p_changes #>> '{environment_type,value}', coalesce(p_changes #>> '{environment_type,other_text}', ''));
    normalized_changes := normalized_changes || jsonb_build_object('environment_type', environment_input);
  end if;
  fingerprint := encode(extensions.digest(jsonb_build_object(
    'session_id', p_session_id, 'operation_kind', 'current_change',
    'changes', normalized_changes, 'expected_revision', p_expected_revision
  )::text, 'sha256'), 'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text, 0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text, 0));
  select * into existing_operation from public.grow_session_condition_operations where operation_id = p_operation_id;
  if found then
    if existing_operation.session_id is distinct from p_session_id
      or existing_operation.operation_kind is distinct from 'current_change'
      or existing_operation.input_fingerprint is distinct from fingerprint then
      raise exception 'The operation identity was already used with different input.' using errcode = '23505';
    end if;
    if not exists (select 1 from public.grow_sessions where id = p_session_id and user_id = actor_id) then
      raise exception 'The canonical Session Condition is not accessible.' using errcode = '42501';
    end if;
    return existing_operation.result;
  end if;
  if not exists (select 1 from public.grow_sessions where id = p_session_id and user_id = actor_id) then
    raise exception 'Only the Session owner may change Session Conditions.' using errcode = '42501';
  end if;
  select * into authority_row from public.grow_session_conditions_authority where session_id = p_session_id for update;
  if not found then raise exception 'Legacy Growing fields remain authoritative for this Session.' using errcode = '23514'; end if;
  if authority_row.canonical_revision is distinct from p_expected_revision then raise exception 'The canonical Session Conditions revision is stale.' using errcode = '40001'; end if;
  if method_input is not null then
    select * into method_period from public.grow_session_condition_periods where session_id = p_session_id and dimension = 'grow_method' and effective_end is null for update;
    if not found then raise exception 'No current canonical Grow Method period exists.' using errcode = '23514'; end if;
    changed_method := method_period.canonical_value is distinct from method_input ->> 'value'
      or method_period.other_text is distinct from method_input ->> 'other_text';
  end if;
  if environment_input is not null then
    select * into environment_period from public.grow_session_condition_periods where session_id = p_session_id and dimension = 'environment_type' and effective_end is null for update;
    if not found then raise exception 'No current canonical Environment Type period exists.' using errcode = '23514'; end if;
    changed_environment := environment_period.canonical_value is distinct from environment_input ->> 'value'
      or environment_period.other_text is distinct from environment_input ->> 'other_text';
  end if;
  if not changed_method and not changed_environment then
    saved_result := jsonb_build_object('operation_kind','current_change','session_id',p_session_id,'canonical_revision',authority_row.canonical_revision,'status','no_change','changed_dimensions',changed_dimensions);
    perform set_config('app.canonical_session_condition_write','true',true);
    insert into public.grow_session_condition_operations(operation_id,session_id,operation_kind,input_fingerprint,result)
    values(p_operation_id,p_session_id,'current_change',fingerprint,saved_result);
    perform set_config('app.canonical_session_condition_write','false',true);
    return saved_result;
  end if;
  operation_at := clock_timestamp();
  perform set_config('app.canonical_session_condition_write','true',true);
  if changed_method then
    update public.grow_session_condition_periods set effective_end=operation_at, revision=revision+1, updated_at=operation_at where id=method_period.id;
    insert into public.grow_session_condition_periods(session_id,dimension,canonical_value,other_text,effective_start,original_actor_id,source_kind,source_operation_id,revision)
    values(p_session_id,'grow_method',method_input->>'value',method_input->>'other_text',operation_at,actor_id,'operational_change',p_operation_id,1) returning * into saved_method;
    changed_dimensions := changed_dimensions || jsonb_build_array('grow_method');
  end if;
  if changed_environment then
    update public.grow_session_condition_periods set effective_end=operation_at, revision=revision+1, updated_at=operation_at where id=environment_period.id;
    insert into public.grow_session_condition_periods(session_id,dimension,canonical_value,other_text,effective_start,original_actor_id,source_kind,source_operation_id,revision)
    values(p_session_id,'environment_type',environment_input->>'value',environment_input->>'other_text',operation_at,actor_id,'operational_change',p_operation_id,1) returning * into saved_environment;
    changed_dimensions := changed_dimensions || jsonb_build_array('environment_type');
  end if;
  update public.grow_session_conditions_authority set canonical_revision=canonical_revision+1 where session_id=p_session_id returning * into authority_row;
  saved_result := jsonb_build_object('operation_kind','current_change','session_id',p_session_id,'status','success','canonical_revision',authority_row.canonical_revision,'effective_at',operation_at,'changed_dimensions',changed_dimensions,'grow_method_period',to_jsonb(saved_method),'environment_type_period',to_jsonb(saved_environment));
  insert into public.grow_session_condition_operations(operation_id,session_id,operation_kind,input_fingerprint,result)
  values(p_operation_id,p_session_id,'current_change',fingerprint,saved_result);
  perform set_config('app.canonical_session_condition_write','false',true);
  return saved_result;
end;
$$;

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
  if existing_period.canonical_value is not distinct from normalized->>'value' and existing_period.other_text is not distinct from normalized->>'other_text' then
    raise exception 'The correction does not change canonical facts.' using errcode = '22023';
  end if;
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

create or replace function public.set_current_conditions_for_unresolved_legacy(
  p_session_id uuid,
  p_operation_id uuid,
  p_changes jsonb,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing_operation public.grow_session_condition_operations%rowtype;
  authority_row public.grow_session_conditions_authority%rowtype;
  method_input jsonb;
  environment_input jsonb;
  normalized_changes jsonb;
  fingerprint text;
  declaration_at timestamptz;
  method_period public.grow_session_condition_periods%rowtype;
  environment_period public.grow_session_condition_periods%rowtype;
  saved_result jsonb;
begin
  if actor_id is null then raise exception 'You must be signed in to set Current Conditions.' using errcode='42501'; end if;
  if p_session_id is null or p_operation_id is null or p_expected_revision is null or jsonb_typeof(p_changes) is distinct from 'object' then raise exception 'Session, operation, changes, and expected revision are required.' using errcode='22023'; end if;
  if not (p_changes ? 'grow_method' and p_changes ? 'environment_type') then raise exception 'Both Grow Method and Environment Type are required.' using errcode='22023'; end if;
  if exists (select 1 from jsonb_object_keys(p_changes) field where field not in ('grow_method','environment_type')) then raise exception 'The declaration contains an unauthorized Session Condition dimension.' using errcode='22023'; end if;
  method_input := public.normalize_session_condition_input('grow_method',p_changes #>> '{grow_method,value}',coalesce(p_changes #>> '{grow_method,other_text}',''));
  environment_input := public.normalize_session_condition_input('environment_type',p_changes #>> '{environment_type,value}',coalesce(p_changes #>> '{environment_type,other_text}',''));
  normalized_changes := jsonb_build_object('grow_method',method_input,'environment_type',environment_input);
  fingerprint := encode(extensions.digest(jsonb_build_object('session_id',p_session_id,'operation_kind','forward_legacy_declaration','changes',normalized_changes,'expected_revision',p_expected_revision)::text,'sha256'),'hex');
  perform pg_advisory_xact_lock(hashtextextended(p_operation_id::text,0));
  perform pg_advisory_xact_lock(hashtextextended(p_session_id::text,0));
  select * into existing_operation from public.grow_session_condition_operations where operation_id=p_operation_id;
  if found then
    if existing_operation.session_id is distinct from p_session_id or existing_operation.operation_kind is distinct from 'forward_legacy_declaration' or existing_operation.input_fingerprint is distinct from fingerprint then raise exception 'The operation identity was already used with different input.' using errcode='23505'; end if;
    if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then raise exception 'The canonical Session Condition is not accessible.' using errcode='42501'; end if;
    return existing_operation.result;
  end if;
  if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then raise exception 'Only the Session owner may set Current Conditions.' using errcode='42501'; end if;
  if exists (select 1 from public.grow_session_phase_commencements where session_id=p_session_id) then raise exception 'This operation is only for unresolved legacy Sessions.' using errcode='23514'; end if;
  if exists (select 1 from public.grow_session_conditions_authority where session_id=p_session_id) or exists (select 1 from public.grow_session_condition_periods where session_id=p_session_id) then raise exception 'Legacy Session Conditions are already established or ambiguous.' using errcode='23514'; end if;
  if p_expected_revision <> 0 then raise exception 'The unresolved legacy Session revision is stale.' using errcode='40001'; end if;
  declaration_at := clock_timestamp();
  perform set_config('app.canonical_session_condition_write','true',true);
  insert into public.grow_session_conditions_authority(session_id,authority_source,canonical_revision,cutover_operation_id,cutover_fingerprint,cutover_at)
  values(p_session_id,'forward_legacy_declaration',1,p_operation_id,fingerprint,declaration_at) returning * into authority_row;
  insert into public.grow_session_condition_periods(session_id,dimension,canonical_value,other_text,effective_start,original_actor_id,source_kind,source_operation_id,revision)
  values(p_session_id,'grow_method',method_input->>'value',method_input->>'other_text',declaration_at,actor_id,'forward_legacy_declaration',p_operation_id,1) returning * into method_period;
  insert into public.grow_session_condition_periods(session_id,dimension,canonical_value,other_text,effective_start,original_actor_id,source_kind,source_operation_id,revision)
  values(p_session_id,'environment_type',environment_input->>'value',environment_input->>'other_text',declaration_at,actor_id,'forward_legacy_declaration',p_operation_id,1) returning * into environment_period;
  saved_result := jsonb_build_object('operation_kind','forward_legacy_declaration','status','success','session_id',p_session_id,'canonical_revision',1,'declared_at',declaration_at,'earlier_conditions_status','unavailable','grow_method_period',to_jsonb(method_period),'environment_type_period',to_jsonb(environment_period));
  insert into public.grow_session_condition_operations(operation_id,session_id,operation_kind,input_fingerprint,result)
  values(p_operation_id,p_session_id,'forward_legacy_declaration',fingerprint,saved_result);
  perform set_config('app.canonical_session_condition_write','false',true);
  return saved_result;
end;
$$;

create or replace function public.get_current_session_conditions_v1(
  p_session_id uuid,
  p_at timestamptz default null
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then raise exception 'You must be signed in to retrieve Session Conditions.' using errcode='42501'; end if;
  if not exists (select 1 from public.grow_sessions where id=p_session_id and user_id=actor_id) then return null; end if;
  return public.project_canonical_session_conditions_v3(p_session_id,p_at);
end;
$$;