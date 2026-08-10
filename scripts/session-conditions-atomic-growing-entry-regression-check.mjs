import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { LOCAL_DB_CONTAINER, REPOSITORY_ROOT } from "./local-demo/config.mjs";
import { runLocalSql } from "./local-demo/db.mjs";

const migration = fs.readFileSync(
  new URL(
    "../supabase/migrations/20260808130000_atomic_growing_entry_initial_conditions.sql",
    import.meta.url,
  ),
  "utf8",
);
const schema = fs.readFileSync(new URL("../supabase-schema.sql", import.meta.url), "utf8");

for (const source of [migration, schema]) {
  assert.match(
    source,
    /revoke all on function public\.change_session_condition\([\s\S]*?\) from authenticated;/,
  );
  assert.match(
    source,
    /revoke all on function public\.correct_session_condition\([\s\S]*?\) from authenticated;/,
  );
  assert.match(source, /create or replace function public\.project_session_condition_dimension_v2/);
  assert.ok(
    source.lastIndexOf("if commencement_at is not null and p_defined_at < commencement_at then")
      > source.lastIndexOf("if authority_source is null and commencement_at is not null and p_defined_at < commencement_at then"),
    "The final effective projection must check authoritative commencement before condition authority.",
  );
  const correctionRetryDefinition = source.slice(
    source.lastIndexOf("create or replace function public.correct_current_session_condition("),
  );
  assert.ok(
    correctionRetryDefinition.indexOf("select * into existing_operation")
      < correctionRetryDefinition.indexOf("The correction does not change canonical facts."),
    "Correction retry identity must be resolved before current-state no-change validation.",
  );
  assert.match(source, /create or replace function public\.enter_canonical_growing_with_initial_conditions/);
  assert.match(source, /lifecycle_result := public\.enter_canonical_growing/);
  assert.equal(
    source.match(/:= public\.declare_session_condition\(/g)?.length,
    2,
    "The atomic operation must compose exactly the two authorized initial declarations.",
  );
  assert.match(source, /operation_kind = 'begin_growing'/);
  assert.match(source, /grant execute on function public\.enter_canonical_growing_with_initial_conditions/);
  assert.match(source, /from public, anon, service_role/);
}

const atomicFunctionSignature =
  "public.enter_canonical_growing_with_initial_conditions(uuid,uuid,text,jsonb,timestamp with time zone,jsonb)";

runLocalSql(String.raw`
begin;

insert into auth.users (id, email, created_at, updated_at)
values
  ('94000000-0000-4000-8000-000000000001', 'atomic-growing-owner@example.test', now(), now()),
  ('94000000-0000-4000-8000-000000000002', 'atomic-growing-other@example.test', now(), now());

insert into public.grow_sessions (
  id, user_id, date, time, system_type, unit_id, session_name,
  session_status, completed_at, entry_path, post_germination_decision,
  created_at, updated_at
) values
  (
    '94000000-0000-4000-8000-000000000101',
    '94000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'atomic-success', 'Atomic success',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '94000000-0000-4000-8000-000000000102',
    '94000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'atomic-invalid-condition', 'Invalid condition',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '94000000-0000-4000-8000-000000000103',
    '94000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'atomic-invalid-lifecycle', 'Invalid lifecycle',
    'active', null, 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '94000000-0000-4000-8000-000000000104',
    '94000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'atomic-cross-owner', 'Cross owner',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '94000000-0000-4000-8000-000000000105',
    '94000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'atomic-write-failure', 'Write failure',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '94000000-0000-4000-8000-000000000106',
    '94000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'atomic-collision-holder', 'Collision holder',
    'active', null, 'seed', null,
    now() - interval '2 days', now() - interval '5 minutes'
  );

select set_config('app.canonical_session_condition_write', 'true', true);
insert into public.grow_session_condition_operations(
  operation_id, session_id, operation_kind, input_fingerprint, result
) values (
  (
    substr(md5('begin_growing:94000000-0000-4000-8000-000000000205:environment_type'), 1, 8)
    || '-'
    || substr(md5('begin_growing:94000000-0000-4000-8000-000000000205:environment_type'), 9, 4)
    || '-4'
    || substr(md5('begin_growing:94000000-0000-4000-8000-000000000205:environment_type'), 14, 3)
    || '-8'
    || substr(md5('begin_growing:94000000-0000-4000-8000-000000000205:environment_type'), 18, 3)
    || '-'
    || substr(md5('begin_growing:94000000-0000-4000-8000-000000000205:environment_type'), 21, 12)
  )::uuid,
  '94000000-0000-4000-8000-000000000106',
  'current_change',
  'synthetic-collision',
  '{}'::jsonb
);
select set_config('app.canonical_session_condition_write', 'false', true);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"94000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

do $$
declare
  expected_updated_at timestamptz;
  first_result jsonb;
  duplicate_result jsonb;
  projection jsonb;
  history jsonb;
  commencement_at timestamptz;
  rejected boolean;
begin
  select updated_at into expected_updated_at
  from public.grow_sessions
  where id = '94000000-0000-4000-8000-000000000101';

  first_result := public.enter_canonical_growing_with_initial_conditions(
    '94000000-0000-4000-8000-000000000101',
    '94000000-0000-4000-8000-000000000201',
    'seed',
    '{"grow_method":{"value":"Soil","other_text":""},"environment_type":{"value":"Indoor","other_text":""}}'::jsonb,
    expected_updated_at,
    null
  );
  commencement_at := (first_result #>> '{commencement,commenced_at}')::timestamptz;

  if first_result ->> 'status' <> 'success'
    or first_result ->> 'operation_kind' <> 'begin_growing'
    or (first_result ->> 'canonical_revision')::bigint <> 2
    or first_result #>> '{session,post_germination_decision}' <> 'grow'
    or (select count(*) from public.grow_session_phase_commencements where session_id = '94000000-0000-4000-8000-000000000101') <> 1
    or (select count(*) from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000101') <> 2
    or (select count(*) from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000101' and effective_start = commencement_at) <> 2
    or (select count(*) from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000101' and source_kind = 'owner_declaration') <> 2
    or (select canonical_revision from public.grow_session_conditions_authority where session_id = '94000000-0000-4000-8000-000000000101') <> 2 then
    raise exception 'Successful atomic Begin Growing did not establish one commencement and both initial dimensions.';
  end if;

  projection := public.get_current_session_conditions_v1(
    '94000000-0000-4000-8000-000000000101',
    commencement_at
  );
  history := public.get_session_condition_history(
    '94000000-0000-4000-8000-000000000101'
  );
  if projection #>> '{conditions,0,status}' <> 'known'
    or projection #>> '{conditions,0,value}' <> 'Soil'
    or projection #>> '{conditions,1,status}' <> 'known'
    or projection #>> '{conditions,1,value}' <> 'Indoor'
    or jsonb_array_length(history -> 'periods') <> 2
    or jsonb_array_length(history -> 'corrections') <> 0 then
    raise exception 'Current projection or Condition History did not resolve the atomic initial evidence.';
  end if;

  duplicate_result := public.enter_canonical_growing_with_initial_conditions(
    '94000000-0000-4000-8000-000000000101',
    '94000000-0000-4000-8000-000000000201',
    'seed',
    '{"grow_method":{"value":"soil","other_text":"ignored"},"environment_type":{"value":"indoor","other_text":"ignored"}}'::jsonb,
    expected_updated_at,
    null
  );
  if duplicate_result is distinct from first_result
    or (select count(*) from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000101') <> 2 then
    raise exception 'Idempotent retry changed or duplicated the atomic outcome.';
  end if;

  rejected := false;
  begin
    perform public.enter_canonical_growing_with_initial_conditions(
      '94000000-0000-4000-8000-000000000101',
      '94000000-0000-4000-8000-000000000201',
      'seed',
      '{"grow_method":{"value":"Soil"},"environment_type":{"value":"Outdoor"}}'::jsonb,
      expected_updated_at,
      null
    );
  exception when unique_violation then rejected := true;
  end;
  if not rejected then
    raise exception 'Conflicting retry was accepted.';
  end if;

  select updated_at into expected_updated_at
  from public.grow_sessions
  where id = '94000000-0000-4000-8000-000000000102';
  rejected := false;
  begin
    perform public.enter_canonical_growing_with_initial_conditions(
      '94000000-0000-4000-8000-000000000102',
      '94000000-0000-4000-8000-000000000202',
      'seed',
      '{"grow_method":{"value":"Soil"},"environment_type":{"value":"Invalid"}}'::jsonb,
      expected_updated_at,
      null
    );
  exception when invalid_parameter_value then rejected := true;
  end;
  if not rejected
    or exists (select 1 from public.grow_session_phase_commencements where session_id = '94000000-0000-4000-8000-000000000102')
    or exists (select 1 from public.grow_session_conditions_authority where session_id = '94000000-0000-4000-8000-000000000102')
    or exists (select 1 from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000102')
    or (select post_germination_decision from public.grow_sessions where id = '94000000-0000-4000-8000-000000000102') is distinct from 'pending' then
    raise exception 'Invalid initial condition input exposed a partial lifecycle or condition outcome.';
  end if;

  rejected := false;
  begin
    perform public.enter_canonical_growing_with_initial_conditions(
      '94000000-0000-4000-8000-000000000103',
      '94000000-0000-4000-8000-000000000203',
      'seed',
      '{"grow_method":{"value":"Soil"},"environment_type":{"value":"Indoor"}}'::jsonb,
      (select updated_at from public.grow_sessions where id = '94000000-0000-4000-8000-000000000103'),
      null
    );
  exception when check_violation then rejected := true;
  end;
  if not rejected
    or exists (select 1 from public.grow_session_phase_commencements where session_id = '94000000-0000-4000-8000-000000000103')
    or exists (select 1 from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000103') then
    raise exception 'Lifecycle rejection persisted initial condition evidence.';
  end if;

  select updated_at into expected_updated_at
  from public.grow_sessions
  where id = '94000000-0000-4000-8000-000000000105';
  rejected := false;
  begin
    perform public.enter_canonical_growing_with_initial_conditions(
      '94000000-0000-4000-8000-000000000105',
      '94000000-0000-4000-8000-000000000205',
      'seed',
      '{"grow_method":{"value":"Coco"},"environment_type":{"value":"Greenhouse"}}'::jsonb,
      expected_updated_at,
      null
    );
  exception when unique_violation then rejected := true;
  end;
  if not rejected
    or exists (select 1 from public.grow_session_phase_commencements where session_id = '94000000-0000-4000-8000-000000000105')
    or exists (select 1 from public.grow_session_conditions_authority where session_id = '94000000-0000-4000-8000-000000000105')
    or exists (select 1 from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000105')
    or (select post_germination_decision from public.grow_sessions where id = '94000000-0000-4000-8000-000000000105') is distinct from 'pending' then
    raise exception 'A condition write failure did not roll back commencement and the first declaration.';
  end if;

  first_result := public.enter_canonical_growing_with_initial_conditions(
    '94000000-0000-4000-8000-000000000110',
    '94000000-0000-4000-8000-000000000210',
    'grow',
    '{"grow_method":{"value":"Hydro"},"environment_type":{"value":"Greenhouse"}}'::jsonb,
    null,
    jsonb_build_object(
      'entry_path', 'grow',
      'date', current_date,
      'time', '12:00',
      'session_name', 'Atomic direct Growing',
      'session_status', 'active'
    )
  );
  if first_result #>> '{session,entry_path}' <> 'grow'
    or first_result #>> '{commencement,entry_path}' <> 'grow'
    or (select count(*) from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000110') <> 2 then
    raise exception 'Direct-Growing entry did not establish the same atomic initial-condition outcome.';
  end if;
end
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"94000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
do $$
declare
  rejected boolean := false;
begin
  begin
    perform public.enter_canonical_growing_with_initial_conditions(
      '94000000-0000-4000-8000-000000000104',
      '94000000-0000-4000-8000-000000000204',
      'seed',
      '{"grow_method":{"value":"Soil"},"environment_type":{"value":"Indoor"}}'::jsonb,
      (select updated_at from public.grow_sessions where id = '94000000-0000-4000-8000-000000000104'),
      null
    );
  exception when insufficient_privilege then rejected := true;
  end;
  if not rejected
    or exists (select 1 from public.grow_session_phase_commencements where session_id = '94000000-0000-4000-8000-000000000104')
    or exists (select 1 from public.grow_session_condition_periods where session_id = '94000000-0000-4000-8000-000000000104') then
    raise exception 'Cross-owner Begin Growing was accepted or exposed partial effects.';
  end if;
end
$$;

reset role;
do $$
begin
  if has_function_privilege('anon', '${atomicFunctionSignature}', 'execute')
    or has_function_privilege('service_role', '${atomicFunctionSignature}', 'execute')
    or not has_function_privilege('authenticated', '${atomicFunctionSignature}', 'execute')
    or (select count(*) from public.grow_session_condition_operations where session_id = '94000000-0000-4000-8000-000000000101' and operation_kind = 'begin_growing') <> 1
    or (select count(*) from public.grow_session_condition_operations where session_id = '94000000-0000-4000-8000-000000000101' and operation_kind = 'declaration') <> 2 then
    raise exception 'Atomic Begin Growing function privileges are incorrect.';
  end if;
end
$$;

rollback;
`, { quiet: true });

function runLocalSqlAsync(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "docker",
      [
        "exec", "-i", LOCAL_DB_CONTAINER, "psql", "-U", "postgres", "-d", "postgres",
        "-v", "ON_ERROR_STOP=1", "-A", "-t",
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

const concurrencyOwner = "94000000-0000-4000-8000-000000000003";
const concurrencySession = "94000000-0000-4000-8000-000000000120";
const concurrencyOperationOne = "94000000-0000-4000-8000-000000000220";
const concurrencyOperationTwo = "94000000-0000-4000-8000-000000000221";

try {
  runLocalSql(String.raw`
delete from public.grow_sessions where id = '${concurrencySession}';
delete from auth.users where id = '${concurrencyOwner}';
insert into auth.users (id, email, created_at, updated_at)
values ('${concurrencyOwner}', 'atomic-growing-concurrency@example.test', now(), now());
insert into public.grow_sessions (
  id, user_id, date, time, system_type, unit_id, session_name,
  session_status, completed_at, entry_path, post_germination_decision,
  created_at, updated_at
) values (
  '${concurrencySession}', '${concurrencyOwner}', current_date, '10:00', 'KAN',
  'atomic-concurrency', 'Atomic concurrency', 'completed', now() - interval '1 hour',
  'seed', 'pending', now() - interval '2 days', now() - interval '5 minutes'
);
`, { quiet: true });

  const expectedUpdatedAt = runLocalSql(
    `select updated_at from public.grow_sessions where id = '${concurrencySession}';`,
    { tuplesOnly: true, quiet: true },
  );
  const invocation = (operationId, growMethod) => String.raw`
set role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"${concurrencyOwner}","role":"authenticated"}',
  false
);
select public.enter_canonical_growing_with_initial_conditions(
  '${concurrencySession}',
  '${operationId}',
  'seed',
  '{"grow_method":{"value":"${growMethod}"},"environment_type":{"value":"Indoor"}}'::jsonb,
  '${expectedUpdatedAt}'::timestamptz,
  null
);
`;

  const concurrentResults = await Promise.allSettled([
    runLocalSqlAsync(invocation(concurrencyOperationOne, "Soil")),
    runLocalSqlAsync(invocation(concurrencyOperationTwo, "Coco")),
  ]);
  assert.equal(
    concurrentResults.filter((result) => result.status === "fulfilled").length,
    1,
    "Exactly one competing atomic Begin Growing operation must succeed.",
  );
  assert.equal(
    concurrentResults.filter((result) => result.status === "rejected").length,
    1,
    "Exactly one competing atomic Begin Growing operation must fail.",
  );

  const state = JSON.parse(runLocalSql(String.raw`
select jsonb_build_object(
  'decision', (select post_germination_decision from public.grow_sessions where id = '${concurrencySession}'),
  'commencement_count', (select count(*) from public.grow_session_phase_commencements where session_id = '${concurrencySession}'),
  'authority_revision', (select canonical_revision from public.grow_session_conditions_authority where session_id = '${concurrencySession}'),
  'period_count', (select count(*) from public.grow_session_condition_periods where session_id = '${concurrencySession}'),
  'boundary_count', (
    select count(*)
    from public.grow_session_condition_periods period_row
    join public.grow_session_phase_commencements commencement_row
      on commencement_row.session_id = period_row.session_id
     and commencement_row.commenced_at = period_row.effective_start
    where period_row.session_id = '${concurrencySession}'
  ),
  'begin_operation_count', (select count(*) from public.grow_session_condition_operations where session_id = '${concurrencySession}' and operation_kind = 'begin_growing'),
  'declaration_count', (select count(*) from public.grow_session_condition_operations where session_id = '${concurrencySession}' and operation_kind = 'declaration')
)::text;
`, { tuplesOnly: true, quiet: true }));
  assert.deepEqual(state, {
    decision: "grow",
    commencement_count: 1,
    authority_revision: 2,
    period_count: 2,
    boundary_count: 2,
    begin_operation_count: 1,
    declaration_count: 2,
  });
} finally {
  runLocalSql(String.raw`
delete from public.grow_sessions where id = '${concurrencySession}';
delete from auth.users where id = '${concurrencyOwner}';
`, { quiet: true });
  const fixtureCount = Number(runLocalSql(String.raw`
select
  (select count(*) from public.grow_sessions where id = '${concurrencySession}')
  +
  (select count(*) from auth.users where id = '${concurrencyOwner}');
`, { tuplesOnly: true, quiet: true }));
  assert.equal(fixtureCount, 0, "Atomic Begin Growing concurrency fixtures were not removed.");
}

console.log("Atomic Begin Growing and initial Session Conditions regression checks passed.");
