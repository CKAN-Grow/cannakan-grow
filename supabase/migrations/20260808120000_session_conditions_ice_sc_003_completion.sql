-- ICE-SC-003 bounded completion: canonical no-change creates no durable
-- condition or operation evidence and advances no canonical revision.
-- The settled 20260807100000 restoration remains unchanged.

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
    return jsonb_build_object(
      'operation_kind','current_change',
      'session_id',p_session_id,
      'canonical_revision',authority_row.canonical_revision,
      'status','no_change',
      'changed_dimensions',changed_dimensions
    );
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

revoke all on function public.change_current_session_conditions(uuid, uuid, jsonb, bigint) from public, anon, service_role;
grant execute on function public.change_current_session_conditions(uuid, uuid, jsonb, bigint) to authenticated;

comment on function public.change_current_session_conditions(uuid, uuid, jsonb, bigint) is
  'Atomic owner-scoped Current Conditions change; canonical no-change creates no durable evidence or revision.';

notify pgrst, 'reload schema';
