import assert from "node:assert/strict";
import fs from "node:fs";
import { runLocalSql } from "./local-demo/db.mjs";

const migrationPath = "supabase/migrations/20260806120000_session_conditions_current_operations.sql";
const migration = fs.readFileSync(migrationPath, "utf8");

for (const required of [
  "change_current_session_conditions",
  "correct_current_session_condition",
  "set_current_conditions_for_unresolved_legacy",
  "project_session_condition_dimension_v2",
  "get_current_session_conditions_v1",
  "forward_legacy_declaration",
  "correction_note",
  "clock_timestamp()",
  "canonical_revision",
]) assert.match(migration, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.doesNotMatch(migration, /p_effective_at/);
assert.doesNotMatch(migration, /record_id|task_id|event_id|note_id|observation_id|measurement_id|evidence_id|outcome_id|reflection_id/);

runLocalSql(String.raw`
begin;
insert into auth.users (id, email, created_at, updated_at) values
  ('93000000-0000-4000-8000-000000000001', 'ice003-regression-owner@example.test', now(), now()),
  ('93000000-0000-4000-8000-000000000002', 'ice003-regression-other@example.test', now(), now());
insert into public.grow_sessions (
  id, user_id, date, time, system_type, unit_id, session_name, session_status,
  created_at, updated_at, entry_path, post_germination_decision
) values (
  '93000000-0000-4000-8000-000000000101',
  '93000000-0000-4000-8000-000000000001',
  current_date, '10:00', 'KAN', 'ice003-regression', 'ICE-SC-003 regression',
  'active', now(), now(), 'seed', 'pending'
);
create or replace function pg_temp.ice003_operation_count(p_session_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*) from public.grow_session_condition_operations where session_id = p_session_id;
$$;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"93000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

do $$
declare
  declaration jsonb;
  declaration_at timestamptz;
  before_projection jsonb;
  after_projection jsonb;
  changed jsonb;
  retry jsonb;
  no_change jsonb;
  corrected jsonb;
  target_period_id uuid;
  original_start timestamptz;
  original_end timestamptz;
  operation_count bigint;
  rejected boolean := false;
begin
  declaration := public.set_current_conditions_for_unresolved_legacy(
    '93000000-0000-4000-8000-000000000101',
    '93000000-0000-4000-8000-000000000201',
    '{"grow_method":{"value":"Coco","other_text":""},"environment_type":{"value":"Indoor","other_text":""}}'::jsonb,
    0
  );
  if declaration->>'status' <> 'success' or (declaration->>'canonical_revision')::bigint <> 1 then
    raise exception 'Forward declaration did not produce one revision success.';
  end if;
  declaration_at := (declaration->>'declared_at')::timestamptz;
  before_projection := public.get_current_session_conditions_v1(
    '93000000-0000-4000-8000-000000000101', declaration_at - interval '1 second'
  );
  if before_projection#>>'{conditions,0,status}' <> 'unavailable'
    or before_projection#>>'{conditions,1,status}' <> 'unavailable' then
    raise exception 'Earlier forward-declaration conditions were not unavailable.';
  end if;
  after_projection := public.get_current_session_conditions_v1(
    '93000000-0000-4000-8000-000000000101', declaration_at + interval '1 second'
  );
  if after_projection#>>'{conditions,0,status}' <> 'known'
    or after_projection#>>'{conditions,1,status}' <> 'known' then
    raise exception 'Forward-declared Current Conditions were not projected.';
  end if;

  changed := public.change_current_session_conditions(
    '93000000-0000-4000-8000-000000000101',
    '93000000-0000-4000-8000-000000000202',
    '{"grow_method":{"value":"Hydro","other_text":""},"environment_type":{"value":"Greenhouse","other_text":""}}'::jsonb,
    1
  );
  if changed->>'status' <> 'success' or (changed->>'canonical_revision')::bigint <> 2
    or jsonb_array_length(changed->'changed_dimensions') <> 2 then
    raise exception 'Composite change did not atomically change both dimensions.';
  end if;
  retry := public.change_current_session_conditions(
    '93000000-0000-4000-8000-000000000101',
    '93000000-0000-4000-8000-000000000202',
    '{"grow_method":{"value":"Hydro","other_text":""},"environment_type":{"value":"Greenhouse","other_text":""}}'::jsonb,
    1
  );
  if retry <> changed then raise exception 'Identical retry did not return byte-identical JSON result.'; end if;
  no_change := public.change_current_session_conditions(
    '93000000-0000-4000-8000-000000000101',
    '93000000-0000-4000-8000-000000000203',
    '{"grow_method":{"value":"Hydro","other_text":""},"environment_type":{"value":"Greenhouse","other_text":""}}'::jsonb,
    2
  );
  if no_change->>'status' <> 'no_change' or (no_change->>'canonical_revision')::bigint <> 2 then
    raise exception 'Equal-value composite change did not produce canonical no-change.';
  end if;
  select id, effective_start, effective_end into target_period_id, original_start, original_end
  from public.grow_session_condition_periods
  where session_id='93000000-0000-4000-8000-000000000101'
    and dimension='grow_method' and effective_end is null;
  corrected := public.correct_current_session_condition(
    '93000000-0000-4000-8000-000000000101', target_period_id,
    '93000000-0000-4000-8000-000000000204',
    '{"value":"DWC","correction_note":"  first line\r\nsecond line  "}'::jsonb,
    2
  );
  if corrected->>'status' <> 'success'
    or corrected#>>'{correction_note}' <> E'first line\nsecond line' then
    raise exception 'Value-only correction note was not normalized and retained.';
  end if;
  if exists (
    select 1 from public.grow_session_condition_periods
    where id=target_period_id and (effective_start is distinct from original_start or effective_end is distinct from original_end)
  ) then raise exception 'Correction changed an applicability boundary.'; end if;
  rejected := false;
  begin
    perform public.correct_current_session_condition(
      '93000000-0000-4000-8000-000000000101', target_period_id,
      '93000000-0000-4000-8000-000000000206',
      jsonb_build_object('value', 'RDWC', 'correction_note', chr(1)), 3
    );
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Correction control-character rejection failed.'; end if;
  rejected := false;
  begin
    perform public.change_current_session_conditions(
      '93000000-0000-4000-8000-000000000101',
      '93000000-0000-4000-8000-000000000205',
      '{"grow_method":{"value":"Soil","other_text":""}}'::jsonb,
      1
    );
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Stale composite change was accepted.'; end if;
  select pg_temp.ice003_operation_count('93000000-0000-4000-8000-000000000101') into operation_count;
  if operation_count <> 4 then raise exception 'Unexpected operation evidence count: %', operation_count; end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"93000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
do $$
begin
  if public.get_current_session_conditions_v1('93000000-0000-4000-8000-000000000101', now()) is not null then
    raise exception 'Cross-owner projection was disclosed.';
  end if;
end;
$$;
rollback;
`, { quiet: true });

console.log("ICE-SC-003 local regression vectors passed.");
