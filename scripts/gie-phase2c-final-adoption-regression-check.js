const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713230000_gie_phase2c_final_consumer_adoption.sql"), "utf8");
const docs = fs.readFileSync(path.join(root, "docs", "architecture", "grow-evidence-engine.md"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert(startIndex >= 0 && endIndex > startIndex, `Missing source range ${start} -> ${end}`);
  return source.slice(startIndex, endIndex);
}

for (const contract of ["get_gie_global_analytics()", "get_gie_my_analytics()", "get_gie_community_analytics()"] ) {
  assert(migration.includes(`public.${contract}`), `Phase 2C must extend existing contract ${contract}.`);
}
assert(!migration.includes("get_gie_phase2c_analytics_contract"), "Phase 2C must not create a fourth analytics contract.");
assert(migration.includes("'schema_version', '2026-07-13.7'"), "All affected schemas must advance to Phase 2C parity.");
assert(migration.includes("lower(coalesce(status, '')) = 'approved'") && migration.includes("coalesce(is_published, false) = true") && migration.includes("coalesce(analytics_excluded, false) = false"), "Community network profiles must use approved, published, analytics-eligible evidence only.");
assert(migration.includes("coalesce(include_profile_in_gallery, false) = true"), "Public network identity must require explicit profile sharing.");

const ownerLoader = between(app, "async function loadGeeOwnerAnalytics", "function normalizeGeeCommunityAnalyticsPayload");
assert(ownerLoader.includes('.rpc("get_gie_my_analytics")') && !/owner_id|user\.id|target_user_id/.test(ownerLoader), "Normal Owner Analytics must never send an owner UUID.");
const ai = between(app, "async function getGeeAiAnalyticsContext", "async function refreshUserSessionsAfterSave");
assert(ai.includes('normalizedScope === "owner"') && ai.includes('normalizedScope === "public"') && ai.includes('normalizedScope === "admin-owner"'), "AI adapter must enforce explicit scoped paths.");
assert(ai.includes('rpc("get_gie_admin_owner_analytics"') && ai.includes("isAdminUser()"), "Admin Owner AI context must use the protected admin RPC.");
assert(!/getSessions\(|gallerySnapshots|seedVaultEntries|service.?role|secret.?key/i.test(ai), "AI context must not inspect raw records or browser secrets.");

const ownerProfile = between(app, "function calculateProfileAnalyticsFromOwnerSessions", "function calculateProfileAnalyticsFromPublicSnapshots");
const publicProfile = between(app, "function calculateProfileAnalyticsFromPublicSnapshots", "function calculateOwnerProfilePrivateStats");
assert(ownerProfile.includes("getCanonicalOwnerAnalytics()") && !ownerProfile.includes(".reduce("), "Owner Grow Network compatibility adapter must be calculation-free.");
assert(publicProfile.includes("networkProfiles.find") && !publicProfile.includes("getGallerySnapshotSuccessRate"), "Public profiles must render Community network profile fields only.");

const adminAge = between(app, "function buildAdminSeedAgeAnalyticsState", "function renderAdminSeedAgeAnalyticsSection");
assert(adminAge.includes("adminSeedAgeAnalytics") && !adminAge.includes("getSessions(") && !adminAge.includes("buildSeedAgeBucketAnalytics"), "Admin seed-age analytics must render Global contract output.");
const recommendations = between(app, "function getLearnRecommendationSignals", "function renderRecommendedTutorialsSectionMarkup");
assert(recommendations.includes("recommendationContexts") && !recommendations.includes("getSessions(") && !recommendations.includes(".sort("), "Recommendation inputs/order must originate in GEE.");
for (const field of ["evidence_count", "confidence", "scope", "engine_version", "contract_version", "generated_at", "evidence_state"]) {
  assert(migration.includes(`'${field}'`), `Canonical recommendations are missing ${field}.`);
}

assert(app.includes("geeGroupCAdoptionDiagnostics") && app.includes('data-gee-group-c-adoption="true"'), "Grow Intelligence Health must render Phase 2C diagnostics.");
assert(migration.includes("'adoption_percentage', 100") && migration.includes("'remaining_legacy_consumers', '[]'::jsonb"), "Diagnostics must report complete adoption and no legacy consumers.");
assert(docs.includes("20 of 20") && docs.includes("(100%)") && docs.includes("getGeeAiAnalyticsContext()"), "Final adoption documentation is stale.");
assert(!/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY/.test(app), "Browser code must not contain secret or service-role keys.");

console.log("GEE Phase 2C final adoption regression checks passed.");
