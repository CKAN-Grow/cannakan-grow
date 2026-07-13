const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713190000_gie_multi_contract_phase1.sql"),
  "utf8",
);
const ownerHardeningMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713200000_gie_owner_contract_auth_hardening.sql"),
  "utf8",
);
const priorEngine = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713180000_gie_data_quality_score_and_health.sql"),
  "utf8",
);
const moderationMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713090000_admin_snapshot_moderation_controls.sql"),
  "utf8",
);
const docs = fs.readFileSync(
  path.join(root, "docs", "architecture", "grow-intelligence-engine.md"),
  "utf8",
);
const buildConfig = fs.readFileSync(path.join(root, "scripts", "build-config.mjs"), "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function between(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}`);
  return source.slice(start, end);
}

const contractDefinitions = migration.match(
  /create or replace function public\.get_gie_(?:global|owner|community)_analytics\(/g,
) || [];
assert(contractDefinitions.length === 3, "Phase 1 must define exactly three canonical GIE analytics contracts.");
assert(new Set(contractDefinitions).size === 3, "Global, Owner, and Community contract definitions must each exist once.");

for (const field of [
  "contract_name",
  "contract_version",
  "engine_version",
  "schema_version",
  "data_quality_version",
  "generated_at",
]) {
  assert(migration.includes(`'${field}'`), `Shared contract metadata is missing ${field}.`);
}
assert(migration.includes("get_gie_contract_metadata_v1('global_analytics', 'gie-global.v1')"), "Missing Global contract identity/version.");
assert(migration.includes("get_gie_contract_metadata_v1('owner_analytics', 'gie-owner.v1')"), "Missing Owner contract identity/version.");
assert(migration.includes("get_gie_contract_metadata_v1('community_analytics', 'gie-community.v1')"), "Missing Community contract identity/version.");
assert(migration.includes("'engine_version', 'gie.v1'") && migration.includes("'schema_version', '2026-07-13.4'"), "Contracts must share engine and schema versions from one helper.");

assert(migration.includes("get_gie_scoped_result_rows_v1") && migration.includes("get_gie_scoped_analytics_v1") && migration.includes("get_gie_contract_analytics_v1"), "Contracts must compose the shared canonical scoped pipeline and single dispatcher.");
assert(migration.includes("public.is_community_intelligence_session_eligible(grow_sessions.id)"), "Scoped session rows must retain canonical lifecycle eligibility.");
for (const helper of ["get_gie_contract_metadata_v1(text, text)", "get_gie_scoped_result_rows_v1(text, uuid)", "get_gie_scoped_analytics_v1(text, uuid)", "get_gie_contract_analytics_v1(text, uuid)"]) {
  assert(migration.includes(`revoke all on function public.${helper} from anon`), `${helper} must not be callable by anon.`);
  assert(migration.includes(`revoke all on function public.${helper} from authenticated`), `${helper} must not be callable directly by authenticated browsers.`);
}

const globalContract = between(
  migration,
  "create or replace function public.get_gie_global_analytics()",
  "-- Contract 2:",
);
for (const privateField of ["user_id", "profile", "grow_id", "session_title", "notes", "image", "private_report"]) {
  assert(!globalContract.includes(privateField), `Global contract must not expose or select ${privateField}.`);
}
assert(globalContract.includes("grant execute on function public.get_gie_global_analytics() to anon"), "Global contract must be anonymous-safe.");

const ownerContract = between(
  migration,
  "create or replace function public.get_gie_owner_analytics(p_owner_id uuid default null)",
  "-- Contract 3:",
);
assert(ownerContract.includes("if requester_id is null then"), "Owner contract must reject unauthenticated access.");
assert(ownerContract.includes("target_owner_id is distinct from requester_id and not requester_is_admin"), "Owner contract must reject cross-owner access.");
assert(ownerContract.includes("from public.admin_users where admin_users.user_id = requester_id"), "Owner contract must use the existing admin authorization model.");
assert(ownerContract.includes("grow_sessions.user_id = target_owner_id"), "Authorized owners must receive only their scoped sessions.");
assert(ownerContract.includes("revoke all on function public.get_gie_owner_analytics(uuid) from anon"), "Anon must not execute Owner analytics.");
assert(ownerHardeningMigration.includes("revoke all on function public.get_gie_owner_analytics(uuid) from authenticated"), "The Phase 1 UUID Owner RPC must be restricted by the additive hardening migration.");
assert(ownerHardeningMigration.includes("grant execute on function public.get_gie_my_analytics() to authenticated"), "Authenticated owners must use the no-argument Owner contract.");

const communityRows = between(
  migration,
  "community_evidence as (",
  "evidence as (",
);
assert(communityRows.includes("status, '')) = 'approved'"), "Community analytics must require approved evidence.");
assert(communityRows.includes("is_published, false) = true"), "Community analytics must require currently published evidence.");
assert(communityRows.includes("analytics_excluded, false) = false"), "Community analytics must exclude hidden/deleted diagnostic evidence.");
for (const privateField of ["public_grow_note", "snapshot_image", "submitted_profile", "profiles"]) {
  assert(!communityRows.includes(privateField), `Community analytics must not select ${privateField}.`);
}

assert(globalContract.includes("get_gie_contract_analytics_v1('global', null)"), "Global must compose the single GIE contract dispatcher.");
assert(migration.includes("return public.get_grow_intelligence_engine_analytics_legacy_v1()"), "The shared dispatcher must preserve the released anonymous implementation for Global.");
assert(priorEngine.includes("from public.grow_sessions") && !globalContract.includes("grow_gallery_snapshots"), "Global truth must remain completed-session based.");
assert(moderationMigration.includes("delete from public.grow_gallery_snapshots") && !between(moderationMigration, "create or replace function public.admin_delete_grow_gallery_snapshot", "revoke all on function public.admin_delete_grow_gallery_snapshot").includes("delete from public.grow_sessions"), "Deleting Community evidence must not delete the underlying Global session.");

const compatibilityWrapper = between(
  migration,
  "create or replace function public.get_grow_intelligence_engine_analytics()",
  "-- Admin-only, read-only contract health.",
);
assert(compatibilityWrapper.includes("select public.get_gie_global_analytics() -> 'analytics'"), "The released GIE RPC must delegate to the Global contract.");
assert(!compatibilityWrapper.includes("from public.grow_sessions") && !compatibilityWrapper.includes("jsonb_array_elements"), "Compatibility wrapper must contain no analytics implementation.");
assert(app.includes('appState.supabase.rpc("get_gie_global_analytics")'), "Seed and Source Explorer must consume the Global contract directly.");

const healthMarkup = between(app, "function renderGrowIntelligenceHealthSectionMarkup", "function renderAdminPage");
assert(app.includes('appState.supabase.rpc("get_gie_contract_diagnostics")'), "Grow Intelligence Health must load contract diagnostics.");
for (const label of ["Contract Health", "Contract Version", "Authorization", "Payload"]) {
  assert(healthMarkup.includes(label), `Grow Intelligence Health is missing ${label}.`);
}
assert(!healthMarkup.includes("get_gie_global_analytics") && !healthMarkup.includes("get_gie_owner_analytics") && !healthMarkup.includes("get_gie_community_analytics"), "The health UI must not calculate or compose contract diagnostics.");

assert(buildConfig.includes("CANNAKAN_SUPABASE_URL") && buildConfig.includes("CANNAKAN_SUPABASE_ANON_KEY"), "Local build must support URL and anon key configuration.");
for (const forbidden of ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY", "service_role_key", "admin_secret"]) {
  assert(!app.toLowerCase().includes(forbidden.toLowerCase()), `Browser code must not contain ${forbidden}.`);
}

assert(docs.includes("There is exactly one Grow Intelligence Engine"), "Documentation must freeze the single-engine rule.");
assert(docs.includes("Need analytics?") && docs.includes("Never calculate analytics locally"), "Documentation is missing the permanent contract workflow.");
assert(docs.includes("Phase 1 consumer migration inventory") && docs.includes("Phase 2 migration roadmap"), "Documentation must include inventory and Phase 2 roadmap.");

console.log("GIE multi-contract Phase 1 regression checks passed (one engine; three contracts). ");
