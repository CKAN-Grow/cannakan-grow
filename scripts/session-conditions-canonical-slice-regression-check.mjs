import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import { LOCAL_DB_CONTAINER, REPOSITORY_ROOT } from "./local-demo/config.mjs";
import { runLocalSql } from "./local-demo/db.mjs";

const migration = fs.readFileSync(
  new URL("../supabase/migrations/20260728120000_session_conditions_first_canonical_slice.sql", import.meta.url),
  "utf8",
);
const schema = fs.readFileSync(new URL("../supabase-schema.sql", import.meta.url), "utf8");
const growingModule = fs.readFileSync(new URL("../src/growing-foundation.js", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");

for (const source of [migration, schema]) {
  assert.match(source, /create table if not exists public\.grow_session_conditions_authority/);
  assert.match(source, /create table if not exists public\.grow_session_condition_periods/);
  assert.match(source, /create table if not exists public\.grow_session_condition_corrections/);
  assert.match(source, /create table if not exists public\.grow_session_condition_operations/);
  assert.match(source, /dimension in \('grow_method', 'environment_type'\)/);
  assert.match(source, /tstzrange\(effective_start, effective_end, '\[\)'\) with &&/);
  assert.match(source, /grow_session_condition_periods_one_open_idx/);
  assert.match(source, /unique \(session_id, dimension, effective_start\)/);
  assert.match(source, /create or replace function public\.declare_session_condition/);
  assert.match(source, /create or replace function public\.change_session_condition/);
  assert.match(source, /create or replace function public\.correct_session_condition/);
  assert.match(source, /create or replace function public\.migrate_session_conditions/);
  assert.match(source, /create or replace function public\.project_canonical_session_conditions/);
  assert.match(source, /create or replace function public\.get_canonical_session_conditions/);
  assert.match(source, /create or replace function public\.get_session_condition_history/);
  assert.match(source, /Legacy Growing fields are non-authoritative after Session Conditions cutover/);
  assert.match(source, /revoke all on public\.grow_session_condition_operations from authenticated/);
}
assert.doesNotMatch(migration, /record_id|task_id|event_id|note_id|observation_id|measurement_id|evidence_id|outcome_id|reflection_id/);

assert.equal(
  schema.split("-- ICE-SC-002: first canonical Session Conditions production slice.").length - 1,
  1,
  "Schema snapshot must contain the ICE-SC-002 migration exactly once.",
);
assert.match(growingModule, /appState\.supabase\.rpc\("get_canonical_session_conditions"/);
assert.match(growingModule, /appState\.supabase\.rpc\(rpcName/);
assert.match(growingModule, /appState\.supabase\.rpc\("migrate_session_conditions"/);
assert.match(growingModule, /SESSION_CONDITION_OPERATION_STORAGE_KEY/);
assert.match(growingModule, /sessionConditions\.authority === "legacy"/);
assert.match(growingModule, /sessionConditions\.authority === "conditions"/);
assert.doesNotMatch(growingModule, /value: String\(condition\.value \|\| ""\)\.trim\(\)/);
assert.doesNotMatch(growingModule, /otherText: normalizeGrowingText\(condition\.other_text/);
assert.match(app, /sessionConditions: normalizeSessionConditionProjection/);

runLocalSql(String.raw`
begin;

insert into auth.users (id, email, created_at, updated_at)
values
  ('72000000-0000-4000-8000-000000000001', 'conditions-owner-one@example.test', now(), now()),
  ('72000000-0000-4000-8000-000000000002', 'conditions-owner-two@example.test', now(), now());

insert into public.grow_sessions (
  id, user_id, date, time, system_type, unit_id, session_name,
  session_status, completed_at, entry_path, post_germination_decision,
  created_at, updated_at
) values
  (
    '72000000-0000-4000-8000-000000000101',
    '72000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'conditions-future', 'Conditions future entry',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '72000000-0000-4000-8000-000000000102',
    '72000000-0000-4000-8000-000000000002',
    current_date, '10:00', 'KAN', 'conditions-cross-owner', 'Cross owner',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '72000000-0000-4000-8000-000000000103',
    '72000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'conditions-legacy', 'Legacy eligible',
    'completed', now() - interval '10 days', 'seed', 'grow',
    now() - interval '30 days', now() - interval '10 days'
  ),
  (
    '72000000-0000-4000-8000-000000000104',
    '72000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'conditions-unresolved', 'Legacy unresolved',
    'completed', now() - interval '10 days', 'seed', 'grow',
    now() - interval '30 days', now() - interval '10 days'
  ),
  (
    '72000000-0000-4000-8000-000000000105',
    '72000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'conditions-stale', 'Legacy stale',
    'completed', now() - interval '10 days', 'seed', 'grow',
    now() - interval '30 days', now() - interval '10 days'
  ),
  (
    '72000000-0000-4000-8000-000000000106',
    '72000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'conditions-projection-mismatch', 'Projection mismatch',
    'completed', now() - interval '10 days', 'seed', 'grow',
    now() - interval '30 days', now() - interval '10 days'
  );

alter table public.grow_session_phase_commencements
  disable trigger grow_session_commencement_initialize_conditions;

insert into public.grow_session_phase_commencements (
  session_id, phase, commenced_at, entry_path, operation_id,
  operation_fingerprint, created_at
) values
  (
    '72000000-0000-4000-8000-000000000103',
    'growing',
    '2026-07-01T12:00:00Z',
    'seed',
    '72000000-0000-4000-8000-000000000203',
    'legacy-eligible',
    '2026-07-01T12:00:00Z'
  ),
  (
    '72000000-0000-4000-8000-000000000105',
    'growing',
    '2026-07-01T12:00:00Z',
    'seed',
    '72000000-0000-4000-8000-000000000205',
    'legacy-stale',
    '2026-07-01T12:00:00Z'
  ),
  (
    '72000000-0000-4000-8000-000000000106',
    'growing',
    '2026-07-01T12:00:00Z',
    'seed',
    '72000000-0000-4000-8000-000000000206',
    'projection-mismatch',
    '2026-07-01T12:00:00Z'
  );

alter table public.grow_session_phase_commencements
  enable trigger grow_session_commencement_initialize_conditions;

insert into public.grow_session_growing_phases (
  id, session_id, environment_type, environment_other,
  grow_method, grow_method_other, created_at, updated_at
) values
  (
    '72000000-0000-4000-8000-000000000303',
    '72000000-0000-4000-8000-000000000103',
    'Greenhouse', '', 'Coco', '',
    '2026-07-01T12:00:00Z', '2026-07-02T12:00:00Z'
  ),
  (
    '72000000-0000-4000-8000-000000000304',
    '72000000-0000-4000-8000-000000000104',
    'Indoor', '', 'Soil', '',
    '2026-07-01T12:00:00Z', '2026-07-02T12:00:00Z'
  ),
  (
    '72000000-0000-4000-8000-000000000305',
    '72000000-0000-4000-8000-000000000105',
    'Outdoor', '', 'Living Soil', '',
    '2026-07-01T12:00:00Z', '2026-07-02T12:00:00Z'
  ),
  (
    '72000000-0000-4000-8000-000000000306',
    '72000000-0000-4000-8000-000000000106',
    'Indoor', '', 'Soil', '',
    '2026-07-01T12:00:00Z', '2026-07-02T12:00:00Z'
  );

create or replace function pg_temp.force_session_condition_projection_mismatch()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.session_id = '72000000-0000-4000-8000-000000000106' then
    update public.grow_session_condition_periods
    set canonical_value = 'Hydro'
    where session_id = new.session_id
      and dimension = 'grow_method';
  end if;
  return new;
end;
$$;

create trigger force_session_condition_projection_mismatch
  after insert on public.grow_session_conditions_authority
  for each row execute function pg_temp.force_session_condition_projection_mismatch();

create or replace function pg_temp.session_condition_operation_count(p_session_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from public.grow_session_condition_operations
  where session_id = p_session_id;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"72000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

do $$
declare
  future_updated_at timestamptz;
  commencement_at timestamptz;
  declaration_one jsonb;
  declaration_retry jsonb;
  declaration_two jsonb;
  change_result jsonb;
  change_retry jsonb;
  correction_result jsonb;
  correction_retry jsonb;
  migration_result jsonb;
  migration_retry jsonb;
  history_result jsonb;
  projection_result jsonb;
  period_one uuid;
  current_revision bigint;
  rejected boolean;
begin
  select updated_at into future_updated_at
  from public.grow_sessions
  where id = '72000000-0000-4000-8000-000000000101';

  perform public.enter_canonical_growing(
    '72000000-0000-4000-8000-000000000101',
    '72000000-0000-4000-8000-000000000201',
    'seed',
    future_updated_at,
    null
  );

  select commenced_at into commencement_at
  from public.grow_session_phase_commencements
  where session_id = '72000000-0000-4000-8000-000000000101';

  if (
    select count(*)
    from public.grow_session_conditions_authority authority_row
    where authority_row.session_id = '72000000-0000-4000-8000-000000000101'
      and authority_row.authority_source = 'future_growing_entry'
      and authority_row.canonical_revision = 0
      and authority_row.cutover_at = commencement_at
  ) <> 1 then
    raise exception 'Future Growing entry did not initialize one atomic Session Conditions authority.';
  end if;

  projection_result := public.get_canonical_session_conditions(
    '72000000-0000-4000-8000-000000000101',
    commencement_at
  );
  if projection_result ->> 'authority' <> 'conditions'
    or jsonb_path_query_array(
      projection_result,
      '$.conditions[*] ? (@.status == "absent")'
    ) <> projection_result -> 'conditions' then
    raise exception 'Future conditions authority did not preserve explicit absence.';
  end if;

  if (
    public.get_canonical_session_conditions(
      '72000000-0000-4000-8000-000000000101',
      commencement_at - interval '1 microsecond'
    ) #>> '{conditions,0,status}'
  ) <> 'not_applicable' then
    raise exception 'Pre-commencement projection was not not-applicable.';
  end if;

  declaration_one := public.declare_session_condition(
    '72000000-0000-4000-8000-000000000101',
    '72000000-0000-4000-8000-000000000401',
    'grow_method',
    'soil',
    'must clear',
    0
  );
  declaration_retry := public.declare_session_condition(
    '72000000-0000-4000-8000-000000000101',
    '72000000-0000-4000-8000-000000000401',
    'grow_method',
    'soil',
    'must clear',
    0
  );
  if declaration_retry is distinct from declaration_one
    or declaration_one #>> '{period,canonical_value}' <> 'Soil'
    or declaration_one #>> '{period,other_text}' <> ''
    or (declaration_one #>> '{period,effective_start}')::timestamptz <> commencement_at then
    raise exception 'Grow Method declaration or identical retry was not deterministic.';
  end if;

  rejected := false;
  begin
    perform public.declare_session_condition(
      '72000000-0000-4000-8000-000000000101',
      '72000000-0000-4000-8000-000000000401',
      'grow_method',
      'Coco',
      '',
      0
    );
  exception when unique_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Different-input operation identity reuse was accepted.';
  end if;

  declaration_two := public.declare_session_condition(
    '72000000-0000-4000-8000-000000000101',
    '72000000-0000-4000-8000-000000000402',
    'environment_type',
    'other',
    repeat('x', 200),
    1
  );
  if declaration_two #>> '{period,canonical_value}' <> 'Other'
    or length(declaration_two #>> '{period,other_text}') <> 160
    or (declaration_two ->> 'canonical_revision')::bigint <> 2 then
    raise exception 'Environment Type declaration did not preserve approved normalization and Other boundary.';
  end if;

  rejected := false;
  begin
    perform public.declare_session_condition(
      '72000000-0000-4000-8000-000000000101',
      gen_random_uuid(),
      'light_level',
      'High',
      '',
      2
    );
  exception when invalid_parameter_value then
    rejected := true;
  end;
  if not rejected then
    raise exception 'An unauthorized dimension was accepted.';
  end if;

  rejected := false;
  begin
    perform public.change_session_condition(
      '72000000-0000-4000-8000-000000000101',
      gen_random_uuid(),
      'grow_method',
      'Unsupported',
      '',
      commencement_at + interval '12 hours',
      2
    );
  exception when invalid_parameter_value then
    rejected := true;
  end;
  if not rejected then
    raise exception 'An unsupported value was accepted.';
  end if;

  rejected := false;
  begin
    perform public.change_session_condition(
      '72000000-0000-4000-8000-000000000101',
      gen_random_uuid(),
      'grow_method',
      'Coco',
      '',
      commencement_at + interval '12 hours',
      1
    );
  exception when serialization_failure then
    rejected := true;
  end;
  if not rejected then
    raise exception 'A stale expected revision was accepted.';
  end if;

  change_result := public.change_session_condition(
    '72000000-0000-4000-8000-000000000101',
    '72000000-0000-4000-8000-000000000403',
    'grow_method',
    'Coco',
    '',
    commencement_at + interval '1 day',
    2
  );
  if (change_result ->> 'canonical_revision')::bigint <> 3 then
    raise exception 'Operational change did not advance canonical revision.';
  end if;

  change_retry := public.change_session_condition(
    '72000000-0000-4000-8000-000000000101',
    '72000000-0000-4000-8000-000000000403',
    'grow_method',
    'Coco',
    '',
    commencement_at + interval '1 day',
    2
  );
  if change_retry is distinct from change_result then
    raise exception 'Operational-change identical retry was not deterministic.';
  end if;

  rejected := false;
  begin
    perform public.change_session_condition(
      '72000000-0000-4000-8000-000000000101',
      '72000000-0000-4000-8000-000000000403',
      'grow_method',
      'Hydro',
      '',
      commencement_at + interval '1 day',
      2
    );
  exception when unique_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Operational-change identity reuse with different input was accepted.';
  end if;

  rejected := false;
  begin
    perform public.change_session_condition(
      '72000000-0000-4000-8000-000000000101',
      gen_random_uuid(),
      'grow_method',
      'Hydro',
      '',
      commencement_at + interval '1 day',
      3
    );
  exception when check_violation or unique_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'A duplicate period start or second open period was accepted.';
  end if;

  if (
    public.get_canonical_session_conditions(
      '72000000-0000-4000-8000-000000000101',
      commencement_at + interval '1 day' - interval '1 microsecond'
    ) #>> '{conditions,0,value}'
  ) <> 'Soil' or (
    public.get_canonical_session_conditions(
      '72000000-0000-4000-8000-000000000101',
      commencement_at + interval '1 day'
    ) #>> '{conditions,0,value}'
  ) <> 'Coco' then
    raise exception 'Half-open operational boundary semantics failed.';
  end if;

  select id into period_one
  from public.grow_session_condition_periods
  where session_id = '72000000-0000-4000-8000-000000000101'
    and dimension = 'grow_method'
    and effective_start = commencement_at;

  correction_result := public.correct_session_condition(
    '72000000-0000-4000-8000-000000000101',
    period_one,
    '72000000-0000-4000-8000-000000000404',
    '{"value":"Living Soil"}'::jsonb,
    3
  );
  if correction_result #>> '{before_facts,value}' <> 'Soil'
    or correction_result #>> '{after_facts,value}' <> 'Living Soil'
    or (correction_result ->> 'canonical_revision')::bigint <> 4 then
    raise exception 'Correction did not preserve attributable before-and-after truth.';
  end if;

  correction_retry := public.correct_session_condition(
    '72000000-0000-4000-8000-000000000101',
    period_one,
    '72000000-0000-4000-8000-000000000404',
    '{"value":"Living Soil"}'::jsonb,
    3
  );
  if correction_retry is distinct from correction_result then
    raise exception 'Correction identical retry was not deterministic.';
  end if;

  rejected := false;
  begin
    perform public.correct_session_condition(
      '72000000-0000-4000-8000-000000000101',
      period_one,
      '72000000-0000-4000-8000-000000000404',
      '{"value":"Soil"}'::jsonb,
      3
    );
  exception when unique_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Correction identity reuse with different input was accepted.';
  end if;

  if (
    public.get_canonical_session_conditions(
      '72000000-0000-4000-8000-000000000101',
      commencement_at + interval '1 hour'
    ) #>> '{conditions,0,value}'
  ) <> 'Living Soil' or (
    public.get_canonical_session_conditions(
      '72000000-0000-4000-8000-000000000101',
      commencement_at + interval '2 days'
    ) #>> '{conditions,0,value}'
  ) <> 'Coco' then
    raise exception 'Correction-aware historical or Current Conditions projection failed.';
  end if;

  history_result := public.get_session_condition_history(
    '72000000-0000-4000-8000-000000000101'
  );
  if jsonb_array_length(history_result -> 'periods') <> 3
    or jsonb_array_length(history_result -> 'corrections') <> 1
    or history_result #>> '{corrections,0,before_facts,value}' <> 'Soil'
    or history_result #>> '{corrections,0,after_facts,value}' <> 'Living Soil' then
    raise exception 'Deterministic period or correction history retrieval failed.';
  end if;

  perform public.correct_session_condition(
    '72000000-0000-4000-8000-000000000101',
    period_one,
    '72000000-0000-4000-8000-000000000405',
    jsonb_build_object('effective_end', commencement_at + interval '12 hours'),
    4
  );
  correction_retry := public.correct_session_condition(
    '72000000-0000-4000-8000-000000000101',
    period_one,
    '72000000-0000-4000-8000-000000000404',
    '{"value":"Living Soil"}'::jsonb,
    3
  );
  if correction_retry is distinct from correction_result
    or (
      select count(*)
      from public.grow_session_condition_corrections
      where operation_id = '72000000-0000-4000-8000-000000000404'
    ) <> 1
    or (
      select count(*)
      from public.grow_session_condition_corrections
      where session_id = '72000000-0000-4000-8000-000000000101'
    ) <> 2 then
    raise exception 'Correction replay after later omitted-field change was not deterministic.';
  end if;

  rejected := false;
  begin
    perform public.correct_session_condition(
      '72000000-0000-4000-8000-000000000101',
      period_one,
      '72000000-0000-4000-8000-000000000404',
      '{"value":"Soil"}'::jsonb,
      3
    );
  exception when unique_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Later different-input correction identity reuse was accepted.';
  end if;

  select authority_row.canonical_revision into current_revision
  from public.grow_session_conditions_authority authority_row
  where authority_row.session_id = '72000000-0000-4000-8000-000000000101';
  rejected := false;
  begin
    perform public.correct_session_condition(
      '72000000-0000-4000-8000-000000000101',
      period_one,
      gen_random_uuid(),
      jsonb_build_object('effective_end', commencement_at + interval '2 days'),
      current_revision
    );
  exception when exclusion_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'An overlapping correction was accepted.';
  end if;

  migration_result := public.migrate_session_conditions(
    '72000000-0000-4000-8000-000000000103',
    '72000000-0000-4000-8000-000000000503',
    '2026-07-02T12:00:00Z'
  );
  migration_retry := public.migrate_session_conditions(
    '72000000-0000-4000-8000-000000000103',
    '72000000-0000-4000-8000-000000000503',
    '2026-07-02T12:00:00Z'
  );
  if migration_result is distinct from migration_retry
    or migration_result ->> 'authority' <> 'conditions'
    or jsonb_array_length(migration_result -> 'migrated_dimensions') <> 2 then
    raise exception 'Migration, cutover, or identical retry was not deterministic.';
  end if;

  rejected := false;
  begin
    perform public.migrate_session_conditions(
      '72000000-0000-4000-8000-000000000105',
      '72000000-0000-4000-8000-000000000503',
      '2026-07-02T12:00:00Z'
    );
  exception when unique_violation then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Migration operation identity reuse across Sessions was accepted.';
  end if;

  projection_result := public.get_canonical_session_conditions(
    '72000000-0000-4000-8000-000000000103',
    '2026-07-03T12:00:00Z'
  );
  if projection_result ->> 'authority' <> 'conditions'
    or projection_result #>> '{conditions,0,status}' <> 'known'
    or projection_result #>> '{conditions,0,value}' <> 'Coco'
    or projection_result #>> '{conditions,1,status}' <> 'known'
    or projection_result #>> '{conditions,1,value}' <> 'Greenhouse' then
    raise exception 'Migrated value or projection parity failed.';
  end if;

  rejected := false;
  begin
    perform public.migrate_session_conditions(
      '72000000-0000-4000-8000-000000000106',
      '72000000-0000-4000-8000-000000000506',
      '2026-07-02T12:00:00Z'
    );
  exception when check_violation then
    rejected := true;
  end;
  if not rejected
    or exists (
      select 1
      from public.grow_session_conditions_authority
      where session_id = '72000000-0000-4000-8000-000000000106'
    )
    or exists (
      select 1
      from public.grow_session_condition_periods
      where session_id = '72000000-0000-4000-8000-000000000106'
    )
    or pg_temp.session_condition_operation_count(
      '72000000-0000-4000-8000-000000000106'
    ) <> 0
    or (
      select grow_method
      from public.grow_session_growing_phases
      where session_id = '72000000-0000-4000-8000-000000000106'
    ) <> 'Soil' then
    raise exception 'Projection-parity failure did not roll back cutover and preserve legacy authority.';
  end if;

  rejected := false;
  begin
    update public.grow_session_growing_phases
    set grow_method = 'Soil'
    where session_id = '72000000-0000-4000-8000-000000000103';
  exception when insufficient_privilege then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Legacy write authority remained after cutover.';
  end if;

  rejected := false;
  begin
    perform public.migrate_session_conditions(
      '72000000-0000-4000-8000-000000000104',
      gen_random_uuid(),
      '2026-07-02T12:00:00Z'
    );
  exception when check_violation then
    rejected := true;
  end;
  if not rejected or exists (
    select 1 from public.grow_session_conditions_authority
    where session_id = '72000000-0000-4000-8000-000000000104'
  ) then
    raise exception 'Unresolved chronology migrated or cut over.';
  end if;

  rejected := false;
  begin
    perform public.migrate_session_conditions(
      '72000000-0000-4000-8000-000000000105',
      gen_random_uuid(),
      '2026-07-01T12:00:00Z'
    );
  exception when serialization_failure then
    rejected := true;
  end;
  if not rejected or exists (
    select 1 from public.grow_session_condition_periods
    where session_id = '72000000-0000-4000-8000-000000000105'
  ) then
    raise exception 'Stale migration failed to roll back completely.';
  end if;

  projection_result := public.get_canonical_session_conditions(
    '72000000-0000-4000-8000-000000000104',
    null
  );
  if projection_result #>> '{conditions,0,status}' <> 'unresolved'
    or projection_result #>> '{conditions,1,status}' <> 'unresolved' then
    raise exception 'Legacy chronology uncertainty was not preserved.';
  end if;

  rejected := false;
  begin
    delete from public.grow_session_condition_periods
    where session_id = '72000000-0000-4000-8000-000000000101';
  exception when insufficient_privilege then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Independent canonical period deletion was accepted.';
  end if;

  rejected := false;
  begin
    delete from public.grow_session_condition_corrections
    where session_id = '72000000-0000-4000-8000-000000000101';
  exception when insufficient_privilege then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Correction-history erasure was accepted.';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"72000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

do $$
declare
  rejected boolean := false;
begin
  if public.get_canonical_session_conditions(
    '72000000-0000-4000-8000-000000000101',
    null
  ) is not null then
    raise exception 'Cross-owner Current Conditions retrieval was accepted.';
  end if;

  rejected := false;
  begin
    perform public.declare_session_condition(
      '72000000-0000-4000-8000-000000000101',
      gen_random_uuid(),
      'grow_method',
      'Soil',
      '',
      4
    );
  exception when insufficient_privilege then
    rejected := true;
  end;
  if not rejected then
    raise exception 'Cross-owner mutation was accepted.';
  end if;
end;
$$;

reset role;

do $$
begin
  if has_function_privilege(
    'anon',
    'public.get_canonical_session_conditions(uuid,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Anonymous Current Conditions execute privilege was present.';
  end if;
end;
$$;

rollback;
`);

function runLocalSqlAsync(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "docker",
      [
        "exec",
        "-i",
        LOCAL_DB_CONTAINER,
        "psql",
        "-U",
        "postgres",
        "-d",
        "postgres",
        "-v",
        "ON_ERROR_STOP=1",
        "-A",
        "-t",
      ],
      { cwd: REPOSITORY_ROOT, stdio: ["pipe", "pipe", "pipe"] },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr || stdout || `Local SQL process exited with code ${code}.`));
    });
    child.stdin.end(sql);
  });
}

const concurrencyOwner = "72000000-0000-4000-8000-000000000006";
const concurrencySession = "72000000-0000-4000-8000-000000000106";
const concurrencyCommencementOperation = "72000000-0000-4000-8000-000000000206";
const concurrencyDeclarationOne = "72000000-0000-4000-8000-000000000406";
const concurrencyDeclarationTwo = "72000000-0000-4000-8000-000000000407";
const concurrencyChangeOne = "72000000-0000-4000-8000-000000000408";
const concurrencyChangeTwo = "72000000-0000-4000-8000-000000000409";
const concurrencyCorrection = "72000000-0000-4000-8000-000000000410";

try {
  runLocalSql(String.raw`
insert into auth.users (id, email, created_at, updated_at)
values (
  '${concurrencyOwner}',
  'conditions-concurrency@example.test',
  now(),
  now()
);
insert into public.grow_sessions (
  id, user_id, date, time, system_type, unit_id, session_name,
  session_status, completed_at, entry_path, post_germination_decision,
  created_at, updated_at
) values (
  '${concurrencySession}',
  '${concurrencyOwner}',
  current_date,
  '10:00',
  'KAN',
  'conditions-concurrency',
  'Conditions concurrency',
  'completed',
  now() - interval '1 hour',
  'seed',
  'pending',
  now() - interval '2 days',
  now() - interval '5 minutes'
);
`, { quiet: true });

  const expectedUpdatedAt = runLocalSql(
    `select updated_at from public.grow_sessions where id = '${concurrencySession}';`,
    { tuplesOnly: true, quiet: true },
  );
  runLocalSql(String.raw`
set role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"${concurrencyOwner}","role":"authenticated"}',
  false
);
select public.enter_canonical_growing(
  '${concurrencySession}',
  '${concurrencyCommencementOperation}',
  'seed',
  '${expectedUpdatedAt}'::timestamptz,
  null
);
select public.declare_session_condition(
  '${concurrencySession}',
  '${concurrencyDeclarationOne}',
  'grow_method',
  'Soil',
  '',
  0
);
select public.declare_session_condition(
  '${concurrencySession}',
  '${concurrencyDeclarationTwo}',
  'environment_type',
  'Indoor',
  '',
  1
);
`, { quiet: true });

  const commencementAt = runLocalSql(
    `select commenced_at from public.grow_session_phase_commencements where session_id = '${concurrencySession}';`,
    { tuplesOnly: true, quiet: true },
  );
  const boundary = new Date(new Date(commencementAt).getTime() + 86_400_000).toISOString();
  const invocation = (operationId, value) => String.raw`
set role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"${concurrencyOwner}","role":"authenticated"}',
  false
);
select public.change_session_condition(
  '${concurrencySession}',
  '${operationId}',
  'grow_method',
  '${value}',
  '',
  '${boundary}'::timestamptz,
  2
);
`;
  const concurrentResults = await Promise.allSettled([
    runLocalSqlAsync(invocation(concurrencyChangeOne, "Coco")),
    runLocalSqlAsync(invocation(concurrencyChangeTwo, "Hydro")),
  ]);
  assert.equal(
    concurrentResults.filter((result) => result.status === "fulfilled").length,
    1,
    "Exactly one conflicting concurrent Session Condition operation must succeed.",
  );
  assert.equal(
    concurrentResults.filter((result) => result.status === "rejected").length,
    1,
    "Exactly one conflicting concurrent Session Condition operation must fail.",
  );

  const concurrencyState = JSON.parse(runLocalSql(String.raw`
select jsonb_build_object(
  'revision',
  (select canonical_revision from public.grow_session_conditions_authority where session_id = '${concurrencySession}'),
  'grow_period_count',
  (select count(*) from public.grow_session_condition_periods where session_id = '${concurrencySession}' and dimension = 'grow_method'),
  'grow_open_count',
  (select count(*) from public.grow_session_condition_periods where session_id = '${concurrencySession}' and dimension = 'grow_method' and effective_end is null),
  'operation_count',
  (select count(*) from public.grow_session_condition_operations where session_id = '${concurrencySession}' and operation_kind = 'operational_change')
)::text;
`, { tuplesOnly: true, quiet: true }));
  assert.deepEqual(concurrencyState, {
    revision: 3,
    grow_period_count: 2,
    grow_open_count: 1,
    operation_count: 1,
  });

  const firstPeriod = runLocalSql(
    `select id from public.grow_session_condition_periods where session_id = '${concurrencySession}' and dimension = 'grow_method' order by effective_start limit 1;`,
    { tuplesOnly: true, quiet: true },
  );
  runLocalSql(String.raw`
set role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"${concurrencyOwner}","role":"authenticated"}',
  false
);
select public.correct_session_condition(
  '${concurrencySession}',
  '${firstPeriod}',
  '${concurrencyCorrection}',
  '{"value":"Living Soil"}'::jsonb,
  3
);
`, { quiet: true });
  assert.equal(
    Number(runLocalSql(
      `select count(*) from public.grow_session_condition_corrections where session_id = '${concurrencySession}';`,
      { tuplesOnly: true, quiet: true },
    )),
    1,
    "The deletion fixture must contain attributable correction history.",
  );
} finally {
  runLocalSql(
    `delete from public.grow_sessions where id = '${concurrencySession}';`,
    { quiet: true },
  );
  const orphanCounts = JSON.parse(runLocalSql(String.raw`
select jsonb_build_object(
  'authority',
  (select count(*) from public.grow_session_conditions_authority where session_id = '${concurrencySession}'),
  'periods',
  (select count(*) from public.grow_session_condition_periods where session_id = '${concurrencySession}'),
  'corrections',
  (select count(*) from public.grow_session_condition_corrections where session_id = '${concurrencySession}'),
  'operations',
  (select count(*) from public.grow_session_condition_operations where session_id = '${concurrencySession}')
)::text;
`, { tuplesOnly: true, quiet: true }));
  assert.deepEqual(orphanCounts, {
    authority: 0,
    periods: 0,
    corrections: 0,
    operations: 0,
  });
  runLocalSql(
    `delete from auth.users where id = '${concurrencyOwner}';`,
    { quiet: true },
  );
}

console.log(
  "Session Conditions canonical slice regression passed: dimensions, periods, declaration, change, correction, retrieval, migration, cutover, security, rollback, and idempotency verified.",
);
