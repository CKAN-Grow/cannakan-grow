import assert from "node:assert/strict";
import fs from "node:fs";
import { spawn } from "node:child_process";
import { LOCAL_DB_CONTAINER, REPOSITORY_ROOT } from "./local-demo/config.mjs";
import { runLocalSql } from "./local-demo/db.mjs";

const migration = fs.readFileSync(
  new URL("../supabase/migrations/20260810120000_germination_setup_evidence_inventory.sql", import.meta.url),
  "utf8",
);
const metadataMigration = fs.readFileSync(
  new URL("../supabase/migrations/20260811080000_extend_germination_seed_metadata_values.sql", import.meta.url),
  "utf8",
);
const schema = fs.readFileSync(new URL("../supabase-schema.sql", import.meta.url), "utf8");
const application = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const kanLayout = fs.readFileSync(new URL("../public/assets/system-layout-kan.svg", import.meta.url), "utf8");

assert.match(schema, /create or replace function public\.save_germination_setup_v1\(\s*p_session_id uuid,\s*p_operation_id uuid,\s*p_expected_revision bigint,\s*p_setup jsonb\s*\)\s*returns jsonb\s*language plpgsql\s*security definer\s*set search_path = public\s*as \$\$/);
assert.match(schema, /revoke all on function public\.save_germination_setup_v1\(uuid, uuid, bigint, jsonb\)\s*from public, anon, service_role;/);
assert.match(schema, /grant execute on function public\.save_germination_setup_v1\(uuid, uuid, bigint, jsonb\)\s*to authenticated;/);
assert.match(schema, /'unknown', 'not_applicable', 'photoperiod', 'autoflower', 'fast_flower'/);
assert.match(schema, /'unknown', 'not_applicable', 'feminized', 'regular'/);
assert.match(metadataMigration, /new_type_allowlist constant text := 'if seed_type not in \(''unknown'', ''not_applicable'', ''photoperiod'', ''autoflower'', ''fast_flower''\)'/);
assert.match(metadataMigration, /new_sex_allowlist constant text := 'or seed_sex not in \(''unknown'', ''not_applicable'', ''feminized'', ''regular''\)'/);
assert.match(metadataMigration, /pg_get_functiondef\('public\.save_germination_setup_v1\(uuid, uuid, bigint, jsonb\)'::regprocedure\)/);
assert.match(metadataMigration, /execute updated_definition/);
assert.doesNotMatch(metadataMigration, /create table|alter table|create policy|grant execute|update public\.seed_vault_entries/);
for (const source of [migration, schema]) {
  assert.match(source, /create table if not exists public\.grow_session_germination_setups/);
  assert.match(source, /create table if not exists public\.grow_session_germination_operations/);
  assert.match(source, /create table if not exists public\.seed_vault_germination_inventory_operations/);
  assert.match(source, /create or replace function public\.get_germination_setup_vault_entries_v1/);
  assert.match(source, /create or replace function public\.get_germination_setup_v1/);
  assert.match(source, /create or replace function public\.save_germination_setup_v1/);
  assert.match(source, /perform pg_advisory_xact_lock\(hashtextextended\(p_operation_id::text, 0\)\)/);
  assert.match(source, /perform pg_advisory_xact_lock\(hashtextextended\(p_session_id::text, 0\)\)/);
  assert.match(source, /for update;/);
  assert.match(source, /'vault_snapshot', vault_snapshot/);
  assert.match(source, /'evaluation_point', 'canonical_germination_commencement'/);
  assert.match(source, /'proposed_start', proposed_start/);
  assert.match(source, /'PAPER_TOWEL_SOAK'/);
  assert.match(source, /KAN supports no more than 8 populated Seed Entries/);
  assert.match(source, /Individually positioned Germination methods require quantity one/);
  assert.match(source, /Shared Germination methods must not persist entry-level physical positions/);
  assert.match(source, /'position', position_label/);
  assert.doesNotMatch(source, /or jsonb_array_length\(raw_entries\) > 8/);
  assert.doesNotMatch(source, /update public\.grow_sessions\s+set date = proposed_start/);
  assert.match(source, /where id = vault_entry_id and user_id = actor_id/);
  assert.match(source, /grant execute on function public\.save_germination_setup_v1/);
}
assert.doesNotMatch(migration, /grow_session_condition_(?:periods|corrections|operations)|grow_session_conditions_authority/);
assert.match(application, /rpc\("get_germination_setup_vault_entries_v1"\)/);
assert.match(application, /rpc\("get_germination_setup_v1"/);
assert.match(application, /rpc\("save_germination_setup_v1"/);
assert.match(application, /renderConnectedGerminationSetup\(savedSessionId, state\.methodType\)/);
assert.match(application, /clearNewSessionSeedVaultStarterIntent\(\)/);
assert.match(application, /const GERMINATION_SETUP_METHOD_SELECTION_ORDER/);
assert.match(application, /All 8 KAN® partitions are assigned\./);
assert.match(application, /if \(rule\.kind === "shared"\) return ""/);
assert.match(application, /position: methodRule\.kind === "shared" \? null : String\(entry\?\.partitionLabel \|\| ""\)\.trim\(\)/);
assert.match(application, /Estimated age \(years\)/);
for (const [partition, cx, cy] of [
  ["1", "528", "332.13"], ["2", "735.48", "432.68"], ["3", "802.84", "637.21"],
  ["4", "734.43", "844.76"], ["5", "522.24", "931.6"], ["6", "323.83", "840.83"],
  ["7", "262.41", "637.21"], ["8", "325.16", "432.68"],
]) {
  assert.match(kanLayout, new RegExp(`id="partition-${partition}"[^>]+data-partition="${partition}"[^>]+cx="${cx}"[^>]+cy="${cy}"`));
}

if (process.argv.includes("--static")) {
  console.log("Germination Setup backend static regression checks passed.");
  process.exit(0);
}

const ownerId = "95000000-0000-4000-8000-000000000001";
const otherId = "95000000-0000-4000-8000-000000000002";
const ownerVaultId = "95000000-0000-4000-8000-000000000101";
const otherVaultId = "95000000-0000-4000-8000-000000000102";
const sessionId = "95000000-0000-4000-8000-000000000201";
const rejectedSessionId = "95000000-0000-4000-8000-000000000202";
const createOperationId = "95000000-0000-4000-8000-000000000301";
const correctionOperationId = "95000000-0000-4000-8000-000000000302";
const noChangeOperationId = "95000000-0000-4000-8000-000000000303";
const removalOperationId = "95000000-0000-4000-8000-000000000304";
const rejectedOperationId = "95000000-0000-4000-8000-000000000305";

const initialSetup = JSON.stringify({
  session_name: "Germination regression",
  proposed_start: "2026-08-11",
  method_type: "KAN",
  tracking_mode: "mixed",
  entries: [
    {
      id: "vault-entry-one",
      position: "P1",
      quantity: 4,
      reference_type: "vault",
      vault_entry_id: ownerVaultId,
      variety: "Client value must not override Vault",
      source: "Client value must not override Vault",
      breeder: "Client value must not override Vault",
      seed_type: "photoperiod",
      sex: "feminized",
      age_reference_kind: "acquisition_year",
      age_source_value: "2024",
    },
    {
      id: "manual-entry-one",
      position: "P2",
      quantity: 2,
      reference_type: "manual",
      vault_entry_id: null,
      variety: "Manual Variety",
      source: "Grower source",
      breeder: "",
      seed_type: "unknown",
      sex: "unknown",
      age_reference_kind: "unknown",
      age_source_value: "",
    },
  ],
});
const correctedSetup = JSON.stringify({
  ...JSON.parse(initialSetup),
  entries: [
    { ...JSON.parse(initialSetup).entries[0], quantity: 2 },
    JSON.parse(initialSetup).entries[1],
  ],
});
const removedVaultSetup = JSON.stringify({
  ...JSON.parse(initialSetup),
  entries: [JSON.parse(initialSetup).entries[1]],
});

const manualEntry = (id, position, quantity = 1, ageReferenceKind = "unknown", ageSourceValue = "") => ({
  id,
  position,
  quantity,
  reference_type: "manual",
  vault_entry_id: null,
  variety: `Variety ${id}`,
  source: "Focused regression",
  breeder: "",
  seed_type: "unknown",
  sex: "unknown",
  age_reference_kind: ageReferenceKind,
  age_source_value: ageSourceValue,
});
const methodSetup = (methodType, entries, trackingMode = "mixed") => JSON.stringify({
  session_name: `Method ${methodType}`,
  proposed_start: "2026-08-11",
  method_type: methodType,
  tracking_mode: trackingMode,
  entries,
});
const sqlJson = (value) => value.replaceAll("'", "''");
const eightKanSetup = methodSetup("KAN", Array.from({ length: 8 }, (_, index) => manualEntry(`kan-${index + 1}`, `P${index + 1}`, index + 1)));
const ninthKanSetup = methodSetup("KAN", Array.from({ length: 9 }, (_, index) => manualEntry(`kan-nine-${index + 1}`, `P${Math.min(index + 1, 8)}`)));
const duplicateKanSetup = methodSetup("KAN", [manualEntry("kan-duplicate-1", "P1"), manualEntry("kan-duplicate-2", "P1")]);
const noncanonicalKanSetup = methodSetup("KAN", [manualEntry("kan-noncanonical", "Partition 1")]);
const nineRockwoolSetup = methodSetup("ROCKWOOL", Array.from({ length: 9 }, (_, index) => manualEntry(`rockwool-${index + 1}`, `Cube ${index + 1}`)));
const paperTowelSetup = methodSetup("PAPER_TOWEL", Array.from({ length: 9 }, (_, index) => manualEntry(`paper-${index + 1}`, null, 2)));
const paperSoakSetup = methodSetup("PAPER_TOWEL_SOAK", [
  manualEntry("paper-soak-1", null, 3, "user_statement", "1.5"),
  manualEntry("paper-soak-2", null, 2, "user_statement", "1.5"),
]);
const waterGlassSetup = methodSetup("WATER_SOAK", [manualEntry("glass-1", null, 4), manualEntry("glass-2", null, 2)]);
const otherSetup = methodSetup("OTHER", [manualEntry("other-1", "Grower tray A", 2)]);
const traSetup = methodSetup("TRA", [manualEntry("tra-1", "P1")]);
const staleUnknownAgeSetup = methodSetup("PAPER_TOWEL", [manualEntry("stale-age", null, 2, "unknown", "2024")]);
const offStepAgeSetup = methodSetup("PAPER_TOWEL", [manualEntry("off-step-age", null, 2, "user_statement", "1.25")]);
const inconsistentSameAgeSetup = methodSetup("PAPER_TOWEL", [
  manualEntry("same-age-1", null, 2, "user_statement", "1.5"),
  manualEntry("same-age-2", null, 2, "acquisition_year", "2024"),
], "same");
const invalidSingleSetups = [
  methodSetup("ROCKWOOL", [manualEntry("rockwool-invalid", "Cube 1", 2)]),
  methodSetup("RAPID_ROOTER", [manualEntry("plug-invalid", "Plug 1", 2)]),
  methodSetup("DIRECT_SOW", [manualEntry("direct-invalid", "Planting position 1", 2)]),
];
const invalidGroupedQuantitySetup = methodSetup("WATER_SOAK", [manualEntry("glass-invalid", null, 0)]);
const invalidSharedPositionSetup = methodSetup("PAPER_TOWEL", [manualEntry("fabricated-position", "Towel group 1", 2)]);
const metadataSetup = methodSetup("KAN", [
  { ...manualEntry("metadata-fast-flower", "P1"), seed_type: "fast_flower", sex: "not_applicable" },
  { ...manualEntry("metadata-not-applicable", "P2"), seed_type: "not_applicable", sex: "unknown" },
]);
const unsupportedTypeSetup = methodSetup("KAN", [
  { ...manualEntry("metadata-unsupported-type", "P1"), seed_type: "hybrid", sex: "unknown" },
]);
const unsupportedSexSetup = methodSetup("KAN", [
  { ...manualEntry("metadata-unsupported-sex", "P1"), seed_type: "unknown", sex: "unspecified" },
]);

runLocalSql(String.raw`
begin;

insert into auth.users (id, email, created_at, updated_at)
values
  ('${ownerId}', 'germination-owner@example.test', now(), now()),
  ('${otherId}', 'germination-other@example.test', now(), now());

insert into public.seed_vault_entries (
  id, user_id, seed_name, seed_variety, seed_type, sex, source, breeder,
  quantity, seed_count, remaining_count, year_acquired, visibility,
  is_archived, is_deleted, created_at, updated_at
) values
  (
    '${ownerVaultId}', '${ownerId}', 'Frozen Original', 'Frozen Original',
    'photoperiod', 'feminized', 'Original Vault Source', 'Original Breeder',
    6, 6, 6, 2024, 'private', false, false, now(), now()
  ),
  (
    '${otherVaultId}', '${otherId}', 'Other Owner Seed', 'Other Owner Seed',
    'photoperiod', 'regular', 'Other Source', 'Other Breeder',
    5, 5, 5, 2023, 'private', false, false, now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"${ownerId}","role":"authenticated"}', true);

do $$
declare
  first_result jsonb;
  retry_result jsonb;
  loaded_result jsonb;
  correction_result jsonb;
  no_change_result jsonb;
  removal_result jsonb;
  rejected boolean;
begin
  first_result := public.save_germination_setup_v1(
    '${sessionId}', '${createOperationId}', 0, '${initialSetup.replaceAll("'", "''")}'::jsonb
  );
  if first_result ->> 'status' <> 'success'
    or (first_result ->> 'revision')::bigint <> 1
    or first_result #>> '{setup,entries,0,variety}' <> 'Frozen Original'
    or first_result #>> '{setup,entries,0,vault_snapshot,source}' <> 'Original Vault Source'
    or first_result #>> '{setup,entries,0,vault_entry_id}' <> '${ownerVaultId}'
    or first_result #>> '{setup,entries,1,variety}' <> 'Manual Variety'
    or (select quantity from public.seed_vault_entries where id = '${ownerVaultId}') <> 2
    or (select count(*) from public.seed_vault_germination_inventory_operations where operation_id = '${createOperationId}') <> 1 then
    raise exception 'Initial Germination Setup save did not preserve evidence and deduct inventory exactly once.';
  end if;

  retry_result := public.save_germination_setup_v1(
    '${sessionId}', '${createOperationId}', 0, '${initialSetup.replaceAll("'", "''")}'::jsonb
  );
  if retry_result is distinct from first_result
    or (select quantity from public.seed_vault_entries where id = '${ownerVaultId}') <> 2
    or (select count(*) from public.seed_vault_germination_inventory_operations where operation_id = '${createOperationId}') <> 1 then
    raise exception 'Idempotent retry changed the result or deducted inventory twice.';
  end if;

  reset role;
  update public.seed_vault_entries
  set seed_name = 'Edited Later', seed_variety = 'Edited Later', source = 'Edited Vault Source'
  where id = '${ownerVaultId}';
  set local role authenticated;
  perform set_config('request.jwt.claims', '{"sub":"${ownerId}","role":"authenticated"}', true);

  loaded_result := public.get_germination_setup_v1('${sessionId}');
  if loaded_result #>> '{setup,entries,0,variety}' <> 'Frozen Original'
    or loaded_result #>> '{setup,entries,0,vault_snapshot,source}' <> 'Original Vault Source'
    or loaded_result #>> '{setup,entries,0,vault_entry_id}' <> '${ownerVaultId}'
    or (loaded_result #>> '{vault_inventory,0,available_quantity}')::integer <> 2 then
    raise exception 'Reload did not preserve frozen Session evidence separately from the live Vault reference.';
  end if;

  correction_result := public.save_germination_setup_v1(
    '${sessionId}', '${correctionOperationId}', 1, '${correctedSetup.replaceAll("'", "''")}'::jsonb
  );
  if correction_result ->> 'status' <> 'success'
    or (correction_result ->> 'revision')::bigint <> 2
    or correction_result #>> '{setup,entries,0,variety}' <> 'Frozen Original'
    or (select quantity from public.seed_vault_entries where id = '${ownerVaultId}') <> 4
    or (select quantity_delta from public.seed_vault_germination_inventory_operations where operation_id = '${correctionOperationId}') <> 2 then
    raise exception 'Reachable correction did not reconcile inventory or preserve frozen evidence.';
  end if;

  no_change_result := public.save_germination_setup_v1(
    '${sessionId}', '${noChangeOperationId}', 2, '${correctedSetup.replaceAll("'", "''")}'::jsonb
  );
  if no_change_result ->> 'status' <> 'no_change'
    or (no_change_result ->> 'revision')::bigint <> 2
    or (select quantity from public.seed_vault_entries where id = '${ownerVaultId}') <> 4
    or exists (select 1 from public.seed_vault_germination_inventory_operations where operation_id = '${noChangeOperationId}') then
    raise exception 'No-change save changed revision or inventory.';
  end if;

  removal_result := public.save_germination_setup_v1(
    '${sessionId}', '${removalOperationId}', 2, '${removedVaultSetup.replaceAll("'", "''")}'::jsonb
  );
  if removal_result ->> 'status' <> 'success'
    or (removal_result ->> 'revision')::bigint <> 3
    or jsonb_array_length(removal_result #> '{setup,entries}') <> 1
    or (select quantity from public.seed_vault_entries where id = '${ownerVaultId}') <> 6
    or (select quantity_delta from public.seed_vault_germination_inventory_operations where operation_id = '${removalOperationId}') <> 2 then
    raise exception 'Reachable Vault-entry removal did not restore the prior commitment.';
  end if;

  rejected := false;
  begin
    perform public.save_germination_setup_v1(
      '${rejectedSessionId}', '${rejectedOperationId}', 0,
      jsonb_set('${initialSetup.replaceAll("'", "''")}'::jsonb, '{entries,0,vault_entry_id}', to_jsonb('${otherVaultId}'::text))
    );
  exception when insufficient_privilege then rejected := true;
  end;
  if not rejected
    or exists (select 1 from public.grow_sessions where id = '${rejectedSessionId}')
    or (select quantity from public.seed_vault_entries where id = '${otherVaultId}') <> 5 then
    raise exception 'Cross-owner Vault reference was accepted or left a partial effect.';
  end if;

  if exists (select 1 from public.grow_session_condition_periods where session_id = '${sessionId}')
    or exists (select 1 from public.grow_session_conditions_authority where session_id = '${sessionId}') then
    raise exception 'Germination Setup changed Session Conditions.';
  end if;

  if jsonb_array_length(public.get_germination_setup_vault_entries_v1()) <> 1
    or public.get_germination_setup_vault_entries_v1() #>> '{0,id}' <> '${ownerVaultId}' then
    raise exception 'Owner-scoped Vault loading exposed an ineligible or cross-owner record.';
  end if;
end
$$;

do $$
declare
  saved jsonb;
  method_change_session uuid := gen_random_uuid();
  rejected boolean;
begin
  saved := public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(eightKanSetup)}'::jsonb);
  if jsonb_array_length(saved #> '{setup,entries}') <> 8 then
    raise exception 'Valid P1-P8 KAN setup was not accepted.';
  end if;

  saved := public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(metadataSetup)}'::jsonb);
  if saved #>> '{setup,entries,0,seed_type}' <> 'fast_flower'
    or saved #>> '{setup,entries,0,sex}' <> 'not_applicable'
    or saved #>> '{setup,entries,1,seed_type}' <> 'not_applicable'
    or saved #>> '{setup,entries,1,sex}' <> 'unknown' then
    raise exception 'Extended Germination Setup Type and Sex metadata was not preserved distinctly.';
  end if;

  saved := public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(nineRockwoolSetup)}'::jsonb);
  if jsonb_array_length(saved #> '{setup,entries}') <> 9
    or exists (select 1 from jsonb_array_elements(saved #> '{setup,entries}') entry where (entry ->> 'quantity')::integer <> 1) then
    raise exception 'More than eight valid individually positioned entries were not preserved.';
  end if;

  saved := public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(paperSoakSetup)}'::jsonb);
  if saved #>> '{setup,method_type}' <> 'PAPER_TOWEL_SOAK'
    or saved #>> '{setup,entries,0,seed_age,source_value}' <> '1.5'
    or jsonb_array_length(saved #> '{setup,entries}') <> 2
    or (select sum((entry ->> 'quantity')::integer) from jsonb_array_elements(saved #> '{setup,entries}') entry) <> 5
    or saved #> '{setup,entries,0,position}' <> 'null'::jsonb then
    raise exception 'Soak + Paper Towel shared context, null position, or half-year grower estimate was not preserved.';
  end if;
  saved := public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(paperTowelSetup)}'::jsonb);
  if jsonb_array_length(saved #> '{setup,entries}') <> 9
    or exists (select 1 from jsonb_array_elements(saved #> '{setup,entries}') entry where entry -> 'position' <> 'null'::jsonb) then
    raise exception 'More than eight shared Paper Towel entries were not preserved with null positions.';
  end if;
  saved := public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(waterGlassSetup)}'::jsonb);
  if jsonb_array_length(saved #> '{setup,entries}') <> 2
    or exists (select 1 from jsonb_array_elements(saved #> '{setup,entries}') entry where entry -> 'position' <> 'null'::jsonb)
    or (select sum((entry ->> 'quantity')::integer) from jsonb_array_elements(saved #> '{setup,entries}') entry) <> 6 then
    raise exception 'Water Soak did not preserve its shared null-position contract.';
  end if;
  perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(otherSetup)}'::jsonb);

  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(ninthKanSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'A ninth KAN entry was accepted.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(duplicateKanSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'A duplicate KAN partition was accepted.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(noncanonicalKanSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'A noncanonical KAN position was accepted.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(traSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'An active TRā setup was accepted.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(staleUnknownAgeSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'Unknown seed age retained a stale value.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(offStepAgeSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'An off-step grower estimate was accepted.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(inconsistentSameAgeSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'Inconsistent Same seed-age evidence was accepted.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(invalidGroupedQuantitySetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'A nonpositive grouped quantity was accepted.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(invalidSharedPositionSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'A fabricated entry-level position was accepted for a shared method.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(unsupportedTypeSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'An unsupported Germination Setup Type was accepted.'; end if;
  end loop;
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(unsupportedSexSetup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'An unsupported Germination Setup Sex was accepted.'; end if;
  end loop;

  ${invalidSingleSetups.map((setup, index) => `
  for rejected in select false loop
    begin
      perform public.save_germination_setup_v1(gen_random_uuid(), gen_random_uuid(), 0, '${sqlJson(setup)}'::jsonb);
    exception when others then rejected := true;
    end;
    if not rejected then raise exception 'Invalid individually positioned quantity ${index + 1} was accepted.'; end if;
  end loop;`).join("\n")}

  perform public.save_germination_setup_v1(method_change_session, gen_random_uuid(), 0, '${sqlJson(methodSetup("KAN", [manualEntry("method-change", "P1", 2)]))}'::jsonb);
  rejected := false;
  begin
    perform public.save_germination_setup_v1(method_change_session, gen_random_uuid(), 1, '${sqlJson(methodSetup("ROCKWOOL", [manualEntry("method-change", "P1", 2)]))}'::jsonb);
  exception when others then rejected := true;
  end;
  if not rejected
    or (select revision from public.grow_session_germination_setups where session_id = method_change_session) <> 1 then
    raise exception 'Method change silently converted or accepted incompatible structure.';
  end if;
end
$$;

reset role;
do $$
declare
  rejected boolean := false;
begin
  begin
    update public.seed_vault_entries set quantity = 0 where id = '${ownerVaultId}';
  exception when insufficient_privilege then rejected := true;
  end;
  if not rejected then
    raise exception 'Direct zero inventory write bypassed the Germination Setup operation boundary.';
  end if;
end
$$;

do $$
begin
  if has_function_privilege('anon', 'public.save_germination_setup_v1(uuid,uuid,bigint,jsonb)', 'execute')
    or has_function_privilege('service_role', 'public.save_germination_setup_v1(uuid,uuid,bigint,jsonb)', 'execute')
    or not has_function_privilege('authenticated', 'public.save_germination_setup_v1(uuid,uuid,bigint,jsonb)', 'execute') then
    raise exception 'Germination Setup function privileges are incorrect.';
  end if;
end
$$;

rollback;
`, { quiet: true });

function runLocalSqlAsync(sql) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "docker",
      ["exec", "-i", LOCAL_DB_CONTAINER, "psql", "-U", "postgres", "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-A", "-t"],
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

const concurrencyOwner = "95000000-0000-4000-8000-000000000011";
const concurrencyVault = "95000000-0000-4000-8000-000000000111";
const concurrencySessions = [
  "95000000-0000-4000-8000-000000000211",
  "95000000-0000-4000-8000-000000000212",
];
const concurrencyOperations = [
  "95000000-0000-4000-8000-000000000311",
  "95000000-0000-4000-8000-000000000312",
];

try {
  runLocalSql(String.raw`
insert into auth.users (id, email, created_at, updated_at)
values ('${concurrencyOwner}', 'germination-concurrency@example.test', now(), now());
insert into public.seed_vault_entries (
  id, user_id, seed_name, seed_variety, seed_type, sex, source,
  quantity, seed_count, remaining_count, visibility, is_archived, is_deleted, created_at, updated_at
) values (
  '${concurrencyVault}', '${concurrencyOwner}', 'Concurrency Seed', 'Concurrency Seed',
  'photoperiod', 'regular', 'Concurrency Source', 5, 5, 5, 'private', false, false, now(), now()
);
`, { quiet: true });

  const invocation = (session, operation) => {
    const input = JSON.stringify({
      session_name: `Concurrency ${session.slice(-3)}`,
      proposed_start: "2026-08-11",
      method_type: "KAN",
      tracking_mode: "mixed",
      entries: [{
        id: `concurrency-${session.slice(-3)}`,
        position: "P1",
        quantity: 4,
        reference_type: "vault",
        vault_entry_id: concurrencyVault,
        variety: "Concurrency Seed",
        source: "Concurrency Source",
        breeder: "",
        seed_type: "photoperiod",
        sex: "regular",
        age_reference_kind: "unknown",
        age_source_value: "",
      }],
    }).replaceAll("'", "''");
    return String.raw`
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"${concurrencyOwner}","role":"authenticated"}', false);
select public.save_germination_setup_v1('${session}', '${operation}', 0, '${input}'::jsonb);
`;
  };

  const concurrentResults = await Promise.allSettled([
    runLocalSqlAsync(invocation(concurrencySessions[0], concurrencyOperations[0])),
    runLocalSqlAsync(invocation(concurrencySessions[1], concurrencyOperations[1])),
  ]);
  assert.equal(concurrentResults.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(concurrentResults.filter((result) => result.status === "rejected").length, 1);

  const state = JSON.parse(runLocalSql(String.raw`
select jsonb_build_object(
  'quantity', (select quantity from public.seed_vault_entries where id = '${concurrencyVault}'),
  'session_count', (select count(*) from public.grow_sessions where id = any(array['${concurrencySessions[0]}'::uuid, '${concurrencySessions[1]}'::uuid])),
  'setup_count', (select count(*) from public.grow_session_germination_setups where session_id = any(array['${concurrencySessions[0]}'::uuid, '${concurrencySessions[1]}'::uuid])),
  'inventory_operation_count', (select count(*) from public.seed_vault_germination_inventory_operations where operation_id = any(array['${concurrencyOperations[0]}'::uuid, '${concurrencyOperations[1]}'::uuid]))
)::text;
`, { tuplesOnly: true, quiet: true }));
  assert.deepEqual(state, {
    quantity: 1,
    session_count: 1,
    setup_count: 1,
    inventory_operation_count: 1,
  });
} finally {
  runLocalSql(String.raw`
delete from public.grow_sessions
where id = any(array['${concurrencySessions[0]}'::uuid, '${concurrencySessions[1]}'::uuid]);
delete from public.seed_vault_entries where id = '${concurrencyVault}';
delete from auth.users where id = '${concurrencyOwner}';
`, { quiet: true });
}

console.log("Germination Setup backend and inventory regression checks passed.");
