import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { DEMO_OWNER_EMAIL, DEMO_OWNER_PASSWORD, REPOSITORY_ROOT } from "./config.mjs";
import { ids } from "./ids.mjs";
import { expectedCounts, manifest } from "./manifest.mjs";
import { runLocalSql, sqlLiteral } from "./db.mjs";
import { assertLocalDemoSafety, collectRuntimeSafetyContext, evaluateSafety } from "./safety.mjs";

const uuidArray = (values) => `array[${values.map(sqlLiteral).join(",")}]::uuid[]`;
const countByIds = (table, values, column = "id") => `(select count(*) from ${table} where ${column} = any(${uuidArray(values)}))`;

function buildVerificationSql() {
  const allSessionIds = [...Object.values(ids.completedSessions), ...Object.values(ids.activeSessions)];
  return `\\set ON_ERROR_STOP on
do $$
declare
  contract jsonb := public.get_gie_community_analytics();
  owner_recognition jsonb;
  chad jsonb;
  seedsman jsonb;
begin
  if ${countByIds("auth.users", Object.values(ids.users))} <> ${expectedCounts.authUsers} then raise exception 'demo auth user count mismatch'; end if;
  if ${countByIds("auth.identities", Object.values(ids.identities))} <> ${expectedCounts.authIdentities} then raise exception 'demo auth identity count mismatch'; end if;
  if ${countByIds("public.profiles", Object.values(ids.users))} <> ${expectedCounts.profiles} then raise exception 'demo profile count mismatch'; end if;
  if ${countByIds("public.public_member_profiles", Object.values(ids.publicProfiles))} <> ${expectedCounts.publicProfiles} then raise exception 'demo public profile count mismatch'; end if;
  if ${countByIds("public.sources", Object.values(ids.sources))} <> ${expectedCounts.sources} then raise exception 'demo source count mismatch'; end if;
  if ${countByIds("public.variety_directory", Object.values(ids.varieties))} <> ${expectedCounts.directoryVarieties} then raise exception 'demo variety directory count mismatch'; end if;
  if ${countByIds("public.grow_sessions", allSessionIds)} <> ${expectedCounts.completedSessions + expectedCounts.activeSessions} then raise exception 'demo session count mismatch'; end if;
  if ${countByIds("public.grow_gallery_snapshots", Object.values(ids.snapshots))} <> ${expectedCounts.communitySnapshots} then raise exception 'demo snapshot count mismatch'; end if;
  if ${countByIds("public.seed_vault_entries", Object.values(ids.vaultEntries))} <> ${expectedCounts.vaultEntries} then raise exception 'demo Vault count mismatch'; end if;
  if ${countByIds("public.seed_vault_collections", Object.values(ids.collections))} <> ${expectedCounts.collections} then raise exception 'demo collection count mismatch'; end if;
  if ${countByIds("public.seed_vault_tags", Object.values(ids.tags))} <> ${expectedCounts.tags} then raise exception 'demo tag count mismatch'; end if;
  if ${countByIds("public.seed_vault_grow_notes", Object.values(ids.growNotes))} <> ${expectedCounts.growNotes} then raise exception 'demo grow-note count mismatch'; end if;
  if ${countByIds("public.community_activity", Object.values(ids.activities))} <> ${expectedCounts.profileActivities} then raise exception 'demo profile-activity count mismatch'; end if;
  if (select count(*) from public.seed_vault_entries where id = any(${uuidArray(Object.values(ids.vaultEntries))}) and planning_status = 'planned') <> ${expectedCounts.planningEntries} then raise exception 'demo planning count mismatch'; end if;
  if (select count(*) from public.seed_vault_entry_collections where seed_vault_entry_id = any(${uuidArray(Object.values(ids.vaultEntries))})) <> ${expectedCounts.collectionLinks} then raise exception 'demo collection-link count mismatch'; end if;
  if (select count(*) from public.seed_vault_entry_tags where seed_vault_entry_id = any(${uuidArray(Object.values(ids.vaultEntries))})) <> ${expectedCounts.tagLinks} then raise exception 'demo tag-link count mismatch'; end if;
  if (select count(*) from unnest(${uuidArray(Object.values(ids.completedSessions))}) session_id where public.is_community_intelligence_session_eligible(session_id)) <> ${expectedCounts.completedSessions} then raise exception 'completed demo sessions are not canonically eligible'; end if;
  if exists (select 1 from unnest(${uuidArray(Object.values(ids.activeSessions))}) session_id where public.is_community_intelligence_session_eligible(session_id)) then raise exception 'active demo session entered completed analytics'; end if;
  if (select count(*) from public.get_gie_community_evidence_v1() evidence where evidence.id = any(${uuidArray(Object.values(ids.snapshots))})) <> ${expectedCounts.communitySnapshots} then raise exception 'demo snapshots are not canonical Community evidence'; end if;
  if (select count(distinct row_data.variety_key) from public.get_gie_scoped_result_rows_v1('community', null) row_data where row_data.evidence_id = any(${uuidArray(Object.values(ids.snapshots))}::text[])) <> ${expectedCounts.analyticsVarieties} then raise exception 'analytics variety count mismatch'; end if;

  owner_recognition := public.get_identity_and_recognition_v1(${sqlLiteral(ids.users.owner)}, false, false);
  if (select count(*) from jsonb_array_elements(owner_recognition -> 'recognitions') recognition where recognition ->> 'id' = 'early-supporter' and (recognition ->> 'earned')::boolean) <> 1 then raise exception 'local founder Early Supporter recognition mismatch'; end if;
  if owner_recognition #>> '{recognitions,0,id}' <> 'early-supporter' then raise exception 'local founder recognition ordering mismatch'; end if;
  if (select count(*) from public.user_recognitions where user_id = ${sqlLiteral(ids.users.owner)} and recognition_id = 'early-supporter' and revoked_at is null) <> 1 then raise exception 'local founder Early Supporter persistence mismatch'; end if;

  select report into chad from jsonb_array_elements(contract #> '{analytics,source_reports}') report where report ->> 'key' = ${sqlLiteral(ids.sources.chadWestport)};
  if chad is null or (chad ->> 'session_count')::integer <> 1 then raise exception 'sparse Chad report missing'; end if;
  if jsonb_array_length(chad -> 'monthly_trends') <> 1 then raise exception 'sparse Chad report must have one period'; end if;
  if jsonb_array_length(chad #> '{regional_coverage,regions}') <> 1 or chad #>> '{regional_coverage,regions,0,region_code}' <> 'MA' then raise exception 'sparse Chad regional fixture mismatch'; end if;
  if chad #>> '{germination_distribution,buckets,0,share_percent}' <> '100.0' then raise exception 'sparse Chad distribution mismatch'; end if;

  select report into seedsman from jsonb_array_elements(contract #> '{analytics,source_reports}') report where report ->> 'key' = ${sqlLiteral(ids.sources.seedsman)};
  if seedsman is null or (seedsman ->> 'session_count')::integer <> 4 then raise exception 'multi-period Seedsman report missing'; end if;
  if jsonb_array_length(seedsman -> 'monthly_trends') < 3 then raise exception 'multi-period fixture needs at least three periods'; end if;
  if jsonb_array_length(seedsman #> '{regional_coverage,regions}') <> 3 then raise exception 'multi-region fixture must contain MA, CA, and Germany'; end if;
  if jsonb_array_length(seedsman -> 'recent_activity') <> 4 then raise exception 'canonical recent activity mismatch'; end if;
  if (select count(*) from jsonb_array_elements(seedsman #> '{germination_distribution,buckets}') bucket where (bucket ->> 'seeds_tested')::integer > 0) <> 4 then raise exception 'mature distribution must populate all four buckets'; end if;
  if exists (select 1 from jsonb_array_elements(contract #> '{analytics,variety_reports}') report where report ->> 'key' = ${sqlLiteral(ids.varieties.vaultReserve)}) then raise exception 'empty-evidence variety unexpectedly has a report'; end if;
end;
$$;
select jsonb_build_object(
  'counts', jsonb_build_object('contributors', ${expectedCounts.authUsers}, 'sources', ${expectedCounts.sources}, 'completed_sessions', ${expectedCounts.completedSessions}, 'active_sessions', ${expectedCounts.activeSessions}, 'analytics_varieties', ${expectedCounts.analyticsVarieties}, 'vault_entries', ${expectedCounts.vaultEntries}, 'collections', ${expectedCounts.collections}, 'tags', ${expectedCounts.tags}, 'planning_entries', ${expectedCounts.planningEntries}),
  'gie', (select jsonb_build_object('contract_version', payload ->> 'contract_version', 'schema_version', payload ->> 'schema_version', 'source_reports', payload #> '{analytics,source_reports}', 'variety_reports', payload #> '{analytics,variety_reports}') from (select public.get_gie_community_analytics() payload) canonical)
)::text;
`;
}

async function verifyLocalLogin(status) {
  const response = await fetch(`${status.API_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: status.ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: DEMO_OWNER_EMAIL, password: DEMO_OWNER_PASSWORD }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.user?.id !== ids.users.owner) {
    throw new Error(`Local demo authentication failed (${response.status}): ${JSON.stringify(body)}`);
  }
  console.log(`Local demo authentication verified for ${DEMO_OWNER_EMAIL}.`);
}

function verifySafetyRegression(runtimeContext) {
  const base = { ...runtimeContext, environment: {}, nodeEnv: "development", executionMode: "development", argv: ["--local-demo-command=verify"], lifecycleEvent: "demo:verify", command: "verify", remoteProjectTarget: "" };
  const remoteUrl = evaluateSafety({ ...base, status: { ...base.status, API_URL: "https://production.example.com", DB_URL: "postgresql://postgres@db.production.example.com/postgres" } });
  if (remoteUrl.passed) throw new Error("Safety regression: remote Supabase URLs were accepted.");
  const remoteProject = evaluateSafety({ ...base, remoteProjectTarget: "production-project-ref" });
  if (remoteProject.passed) throw new Error("Safety regression: linked remote target was accepted.");
  const productionKey = evaluateSafety({ ...base, environment: { SUPABASE_SECRET_KEY: "sb_secret_production_value" } });
  if (productionKey.passed) throw new Error("Safety regression: production secret key was accepted.");
  const override = evaluateSafety({ ...base, argv: ["--local-demo-command=verify", "--force"] });
  if (override.passed) throw new Error("Safety regression: force-style override was accepted.");
  console.log("Local-only safety regression checks passed.");
}

function verifyProductionIsolation() {
  const app = fs.readFileSync(path.join(REPOSITORY_ROOT, "app.js"), "utf8");
  const build = fs.readFileSync(path.join(REPOSITORY_ROOT, "scripts", "build-config.mjs"), "utf8");
  const packageJson = fs.readFileSync(path.join(REPOSITORY_ROOT, "package.json"), "utf8");
  const migrationText = fs.readdirSync(path.join(REPOSITORY_ROOT, "supabase", "migrations"), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => fs.readFileSync(path.join(REPOSITORY_ROOT, "supabase", "migrations", entry.name), "utf8"))
    .join("\n");
  if (/local-demo\/|local-demo\\|DEMO_OWNER_PASSWORD|founder\.demo@example\.test/.test(app + build)) throw new Error("Production isolation: browser/build code references local demo internals.");
  if (/d3a00000-0000-|local-demo-phase-1|founder\.demo@example\.test/.test(migrationText)) throw new Error("Production isolation: demo data appears in production migrations.");
  const scripts = JSON.parse(packageJson).scripts || {};
  if (String(scripts.build || "").includes("demo:")) throw new Error("Production isolation: build invokes demo workflow.");
  if (manifest.some((entry) => !entry.id || entry.ownership !== "local-demo-phase-1")) throw new Error("Ownership manifest is incomplete.");
  console.log("Production-isolation and deterministic-ownership regression checks passed.");
}

export async function verifyDemo({ safetyCommand = "verify" } = {}) {
  const safety = assertLocalDemoSafety(safetyCommand);
  const raw = runLocalSql(buildVerificationSql(), { tuplesOnly: true, quiet: true });
  const summary = JSON.parse(raw.split(/\r?\n/).filter(Boolean).at(-1));
  await verifyLocalLogin(collectRuntimeSafetyContext(safetyCommand).status);
  verifySafetyRegression(collectRuntimeSafetyContext(safetyCommand));
  verifyProductionIsolation();
  const canonical = JSON.stringify(summary.gie);
  const fingerprint = createHash("sha256").update(canonical).digest("hex").slice(0, 16);
  console.log(`Canonical GIE fingerprint: ${fingerprint}`);
  console.log(`Verified deterministic counts: ${JSON.stringify(summary.counts)}`);
  return { ...summary, fingerprint, safety };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifyDemo();
}
