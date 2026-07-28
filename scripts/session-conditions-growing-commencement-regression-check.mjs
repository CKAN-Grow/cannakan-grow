import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { LOCAL_DB_CONTAINER, REPOSITORY_ROOT } from "./local-demo/config.mjs";
import { runLocalSql } from "./local-demo/db.mjs";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const migration = fs.readFileSync(
  new URL("../supabase/migrations/20260727120000_canonical_growing_commencement.sql", import.meta.url),
  "utf8",
);

assert.match(app, /appState\.supabase\.rpc\("enter_canonical_growing"/);
assert.match(app, /appState\.supabase\.rpc\("get_canonical_growing_commencement"/);
assert.match(app, /function getSessionConditionsGrowingCommencement/);
assert.match(app, /periodStart:[\s\S]*GROWING_COMMENCEMENT_STATUS\.AUTHORITATIVE/);
assert.match(app, /if \(error\) \{\s+throw error;\s+\}/);
assert.doesNotMatch(app, /Failed to load canonical Growing commencement[\s\S]{0,200}attachCanonicalGrowingCommencement\(session, null\)/);
assert.match(app, /DIRECT_GROWING_OPERATION_STORAGE_KEY/);
assert.match(app, /function getOrCreateDirectGrowingOperation/);
assert.match(app, /localStorage\.setItem\(storageKey, JSON\.stringify\(normalized\)\)/);
assert.match(app, /getOrCreateDirectGrowingOperation\(session\.id\)/);
assert.match(app, /retireDirectGrowingOperation\(savedSession\)/);
assert.doesNotMatch(app, /form\.dataset\.canonicalGrowingOperationId/);
assert.doesNotMatch(app, /getCanonicalGrowingOperationAt\(directOperationId\)/);
assert.match(migration, /create table if not exists public\.grow_session_phase_commencements/);
assert.match(migration, /pg_advisory_xact_lock/);
assert.match(migration, /operation_fingerprint/);
assert.match(migration, /security definer/);
assert.doesNotMatch(migration, /\bupdate\s+public\.grow_session_phase_commencements\b/i);
assert.doesNotMatch(
  migration,
  /\binsert\s+into\s+public\.grow_session_phase_commencements\s*\([^;]+?\)\s*select\b/i,
);

runLocalSql(String.raw`
begin;

insert into auth.users (id, email, created_at, updated_at)
values
  ('71000000-0000-4000-8000-000000000001', 'commencement-owner-one@example.test', now(), now()),
  ('71000000-0000-4000-8000-000000000002', 'commencement-owner-two@example.test', now(), now());

insert into public.grow_sessions (
  id, user_id, date, time, system_type, unit_id, session_name,
  session_status, completed_at, entry_path, post_germination_decision,
  created_at, updated_at
) values
  (
    '71000000-0000-4000-8000-000000000101',
    '71000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'seed-owner-one', 'Seed transition',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '71000000-0000-4000-8000-000000000102',
    '71000000-0000-4000-8000-000000000002',
    current_date, '10:00', 'KAN', 'seed-owner-two', 'Cross owner seed',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '71000000-0000-4000-8000-000000000103',
    '71000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'legacy-unresolved', 'Legacy unresolved',
    'completed', now() - interval '30 days', 'seed', 'grow',
    now() - interval '60 days', now() - interval '30 days'
  ),
  (
    '71000000-0000-4000-8000-000000000104',
    '71000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'stale-seed', 'Stale seed',
    'completed', now() - interval '1 hour', 'seed', 'pending',
    now() - interval '2 days', now() - interval '5 minutes'
  ),
  (
    '71000000-0000-4000-8000-000000000105',
    '71000000-0000-4000-8000-000000000001',
    current_date, '10:00', 'KAN', 'generic-seed', 'Generic seed',
    'active', null, 'seed', null,
    now() - interval '2 days', now() - interval '5 minutes'
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

do $$
declare
  seed_updated_at timestamptz;
  stale_updated_at timestamptz;
  first_result jsonb;
  duplicate_result jsonb;
  direct_result jsonb;
  direct_duplicate_result jsonb;
  first_commenced_at timestamptz;
  retrieval_one record;
  retrieval_two record;
begin
  select updated_at
  into seed_updated_at
  from public.grow_sessions
  where id = '71000000-0000-4000-8000-000000000101';

  if (
    select count(*)
    from public.get_canonical_growing_commencement(
      '71000000-0000-4000-8000-000000000103'
    )
    where status = 'unresolved'
      and commenced_at is null
  ) <> 1 then
    raise exception 'Legacy chronology did not remain unresolved.';
  end if;

  if (
    select count(*)
    from public.get_canonical_growing_commencement(
      '71000000-0000-4000-8000-000000000105'
    )
    where status = 'unresolved'
      and commenced_at is null
  ) <> 1 then
    raise exception 'Generic Session creation manufactured Growing commencement.';
  end if;

  first_result := public.enter_canonical_growing(
    '71000000-0000-4000-8000-000000000101',
    '71000000-0000-4000-8000-000000000201',
    'seed',
    seed_updated_at,
    null
  );
  first_commenced_at := (first_result #>> '{commencement,commenced_at}')::timestamptz;

  if first_result #>> '{commencement,status}' <> 'authoritative'
    or first_result #>> '{session,post_germination_decision}' <> 'grow'
    or first_result #>> '{session,entry_path}' <> 'seed'
    or first_commenced_at is distinct from (
      select commenced_at
      from public.grow_session_phase_commencements
      where session_id = '71000000-0000-4000-8000-000000000101'
    ) then
    raise exception 'Seed-to-Growing did not expose one matching canonical outcome.';
  end if;

  duplicate_result := public.enter_canonical_growing(
    '71000000-0000-4000-8000-000000000101',
    '71000000-0000-4000-8000-000000000201',
    'seed',
    seed_updated_at,
    null
  );
  if duplicate_result #>> '{commencement,commenced_at}'
    is distinct from first_result #>> '{commencement,commenced_at}'
    or (
      select count(*)
      from public.grow_session_phase_commencements
      where session_id = '71000000-0000-4000-8000-000000000101'
    ) <> 1 then
    raise exception 'Duplicate submission changed or duplicated canonical chronology.';
  end if;

  begin
    perform public.enter_canonical_growing(
      '71000000-0000-4000-8000-000000000102',
      '71000000-0000-4000-8000-000000000201',
      'seed',
      seed_updated_at,
      null
    );
    raise exception 'Operation identity reuse with different input was accepted.';
  exception when unique_violation then
    null;
  end;

  select updated_at
  into stale_updated_at
  from public.grow_sessions
  where id = '71000000-0000-4000-8000-000000000104';
  update public.grow_sessions
  set updated_at = updated_at + interval '1 second'
  where id = '71000000-0000-4000-8000-000000000104';
  begin
    perform public.enter_canonical_growing(
      '71000000-0000-4000-8000-000000000104',
      '71000000-0000-4000-8000-000000000204',
      'seed',
      stale_updated_at,
      null
    );
    raise exception 'Stale lifecycle mutation was accepted.';
  exception when serialization_failure then
    null;
  end;
  if exists (
    select 1
    from public.grow_session_phase_commencements
    where session_id = '71000000-0000-4000-8000-000000000104'
  ) or (
    select post_germination_decision
    from public.grow_sessions
    where id = '71000000-0000-4000-8000-000000000104'
  ) is distinct from 'pending' then
    raise exception 'Failed stale mutation exposed a partial canonical outcome.';
  end if;

  begin
    perform public.enter_canonical_growing(
      '71000000-0000-4000-8000-000000000102',
      '71000000-0000-4000-8000-000000000205',
      'seed',
      (select updated_at from public.grow_sessions where id = '71000000-0000-4000-8000-000000000102'),
      null
    );
    raise exception 'Cross-owner Begin Growing was accepted.';
  exception when insufficient_privilege then
    null;
  end;

  direct_result := public.enter_canonical_growing(
    '71000000-0000-4000-8000-000000000110',
    '71000000-0000-4000-8000-000000000210',
    'grow',
    null,
    jsonb_build_object(
      'entry_path', 'grow',
      'date', current_date,
      'time', '12:00',
      'unit_id', '',
      'session_name', 'Direct Growing',
      'custom_session_name', 'Direct Growing',
      'session_notes', 'Preserved direct-Growing note',
      'session_images', jsonb_build_array(jsonb_build_object('url', 'direct.png')),
      'snapshot_state', jsonb_build_object('source', 'direct'),
      'session_status', 'active',
      'partitions', jsonb_build_array(jsonb_build_object('id', 'direct-partition')),
      'user_id', '71000000-0000-4000-8000-000000000002'
    )
  );

  if direct_result #>> '{session,user_id}' <> '71000000-0000-4000-8000-000000000001'
    or direct_result #>> '{session,entry_path}' <> 'grow'
    or direct_result #>> '{session,session_status}' <> 'active'
    or direct_result #>> '{commencement,status}' <> 'authoritative'
    or direct_result #>> '{commencement,entry_path}' <> 'grow'
    or direct_result #>> '{session,session_notes}' <> 'Preserved direct-Growing note'
    or direct_result #> '{session,session_images}' is distinct from '[{"url":"direct.png"}]'::jsonb
    or direct_result #> '{session,snapshot_state}' is distinct from '{"source":"direct"}'::jsonb
    or direct_result #> '{session,partitions}' is distinct from '[{"id":"direct-partition"}]'::jsonb then
    raise exception 'Direct-Growing did not produce its bounded canonical outcome.';
  end if;

  direct_duplicate_result := public.enter_canonical_growing(
    '71000000-0000-4000-8000-000000000110',
    '71000000-0000-4000-8000-000000000210',
    'grow',
    null,
    jsonb_build_object(
      'entry_path', 'grow',
      'date', current_date,
      'time', '12:00',
      'unit_id', '',
      'session_name', 'Direct Growing',
      'custom_session_name', 'Direct Growing',
      'session_notes', 'Preserved direct-Growing note',
      'session_images', jsonb_build_array(jsonb_build_object('url', 'direct.png')),
      'snapshot_state', jsonb_build_object('source', 'direct'),
      'session_status', 'active',
      'partitions', jsonb_build_array(jsonb_build_object('id', 'direct-partition')),
      'user_id', '71000000-0000-4000-8000-000000000002'
    )
  );
  if direct_duplicate_result is distinct from direct_result then
    raise exception 'Direct-Growing retry did not return its established canonical outcome.';
  end if;

  begin
    perform public.enter_canonical_growing(
      '71000000-0000-4000-8000-000000000111',
      '71000000-0000-4000-8000-000000000211',
      'grow',
      null,
      jsonb_build_object(
        'entry_path', 'grow',
        'date', current_date,
        'time', '12:00',
        'session_name', '',
        'session_status', 'active'
      )
    );
    raise exception 'Invalid direct-Growing input was accepted.';
  exception when invalid_parameter_value then
    null;
  end;
  if exists (
    select 1 from public.grow_sessions
    where id = '71000000-0000-4000-8000-000000000111'
  ) or exists (
    select 1 from public.grow_session_phase_commencements
    where session_id = '71000000-0000-4000-8000-000000000111'
  ) then
    raise exception 'Failed direct-Growing entry exposed partial state or chronology.';
  end if;

  select * into retrieval_one
  from public.get_canonical_growing_commencement(
    '71000000-0000-4000-8000-000000000101'
  );
  select * into retrieval_two
  from public.get_canonical_growing_commencement(
    '71000000-0000-4000-8000-000000000101'
  );
  if retrieval_one.status <> 'authoritative'
    or retrieval_one.commenced_at is distinct from retrieval_two.commenced_at then
    raise exception 'Authoritative retrieval was not stable and repeatable.';
  end if;

  update public.grow_sessions
  set session_name = 'Later lifecycle-safe activity'
  where id = '71000000-0000-4000-8000-000000000101';
  if first_commenced_at is distinct from (
    select commenced_at
    from public.grow_session_phase_commencements
    where session_id = '71000000-0000-4000-8000-000000000101'
  ) then
    raise exception 'Later Session activity changed canonical commencement.';
  end if;

  begin
    insert into public.grow_sessions (
      id, user_id, date, time, system_type, unit_id, session_name,
      session_status, entry_path
    ) values (
      '71000000-0000-4000-8000-000000000112',
      '71000000-0000-4000-8000-000000000001',
      current_date, '12:00', '', '', 'Generic direct entry',
      'active', 'grow'
    );
    raise exception 'Generic direct-Growing Session creation was accepted.';
  exception when insufficient_privilege then
    null;
  end;

  begin
    update public.grow_sessions
    set post_germination_decision = 'grow'
    where id = '71000000-0000-4000-8000-000000000105';
    raise exception 'Generic Begin Growing mutation was accepted.';
  exception when insufficient_privilege then
    null;
  end;

  begin
    update public.grow_session_phase_commencements
    set commenced_at = commenced_at + interval '1 second'
    where session_id = '71000000-0000-4000-8000-000000000101';
    raise exception 'Session Conditions or another consumer mutated commencement.';
  exception when insufficient_privilege then
    null;
  end;
end
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"71000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

do $$
begin
  if (
    select count(*)
    from public.get_canonical_growing_commencement(
      '71000000-0000-4000-8000-000000000101'
    )
  ) <> 0 then
    raise exception 'Cross-owner retrieval exposed canonical chronology.';
  end if;
end
$$;

reset role;

do $$
begin
  if has_function_privilege(
    'anon',
    'public.enter_canonical_growing(uuid,uuid,text,timestamptz,jsonb)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.get_canonical_growing_commencement(uuid)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'public.enter_canonical_growing(uuid,uuid,text,timestamptz,jsonb)',
    'execute'
  ) or not has_function_privilege(
    'authenticated',
    'public.get_canonical_growing_commencement(uuid)',
    'execute'
  ) or has_function_privilege(
    'anon',
    'public.enforce_canonical_growing_entry()',
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.enforce_canonical_growing_entry()',
    'execute'
  ) or has_function_privilege(
    'service_role',
    'public.enforce_canonical_growing_entry()',
    'execute'
  ) or has_table_privilege(
    'authenticated',
    'public.grow_session_phase_commencements',
    'insert,update,delete'
  ) or has_table_privilege(
    'service_role',
    'public.grow_session_phase_commencements',
    'insert,update,delete'
  ) then
    raise exception 'Canonical commencement privilege boundaries are incorrect.';
  end if;
end
$$;

set local role service_role;
do $$
begin
  begin
    update public.grow_session_phase_commencements
    set commenced_at = commenced_at + interval '1 second'
    where session_id = '71000000-0000-4000-8000-000000000101';
    raise exception 'Service-role direct chronology mutation was accepted.';
  exception when insufficient_privilege then
    null;
  end;
end
$$;
reset role;

rollback;
`, { quiet: true });

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

const concurrencyOwner = "71000000-0000-4000-8000-000000000003";
const concurrencySession = "71000000-0000-4000-8000-000000000120";
const concurrencyOperationOne = "71000000-0000-4000-8000-000000000220";
const concurrencyOperationTwo = "71000000-0000-4000-8000-000000000221";

try {
  runLocalSql(String.raw`
insert into auth.users (id, email, created_at, updated_at)
values (
  '${concurrencyOwner}',
  'commencement-concurrency@example.test',
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
  'concurrent-seed',
  'Concurrent seed',
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
  const invocation = (operationId) => String.raw`
set role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"${concurrencyOwner}","role":"authenticated"}',
  false
);
select public.enter_canonical_growing(
  '${concurrencySession}',
  '${operationId}',
  'seed',
  '${expectedUpdatedAt}'::timestamptz,
  null
);
`;
  const concurrentResults = await Promise.allSettled([
    runLocalSqlAsync(invocation(concurrencyOperationOne)),
    runLocalSqlAsync(invocation(concurrencyOperationTwo)),
  ]);
  assert.equal(
    concurrentResults.filter((result) => result.status === "fulfilled").length,
    1,
    "Exactly one conflicting concurrent lifecycle operation must succeed.",
  );
  assert.equal(
    concurrentResults.filter((result) => result.status === "rejected").length,
    1,
    "Exactly one conflicting concurrent lifecycle operation must fail.",
  );
  const concurrencyState = JSON.parse(runLocalSql(String.raw`
select jsonb_build_object(
  'decision',
  (select post_germination_decision from public.grow_sessions where id = '${concurrencySession}'),
  'count',
  (select count(*) from public.grow_session_phase_commencements where session_id = '${concurrencySession}'),
  'commenced_at',
  (select commenced_at from public.grow_session_phase_commencements where session_id = '${concurrencySession}')
)::text;
`, { tuplesOnly: true, quiet: true }));
  assert.equal(concurrencyState.decision, "grow");
  assert.equal(concurrencyState.count, 1);
  assert.ok(concurrencyState.commenced_at);
} finally {
  runLocalSql(String.raw`
delete from public.grow_sessions where id = '${concurrencySession}';
delete from auth.users where id = '${concurrencyOwner}';
`, { quiet: true });
}

console.log(
  "Session Conditions Growing commencement regression passed: both entry paths, atomicity, retrieval, unresolved legacy truth, read-only consumption, authorization, rollback, concurrency, and idempotency verified.",
);
