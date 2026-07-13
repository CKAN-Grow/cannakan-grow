const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713210000_gie_phase2_group_a_owner_analytics.sql"), "utf8");
const docs = fs.readFileSync(path.join(root, "docs", "architecture", "grow-intelligence-engine.md"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  assert(startIndex >= 0, `Missing ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert(endIndex > startIndex, `Missing ${end}`);
  return source.slice(startIndex, endIndex);
}

const ownerLoader = between(app, "async function loadGieOwnerAnalytics", "async function loadGieContractDiagnostics");
assert(ownerLoader.includes('appState.supabase.rpc("get_gie_my_analytics")'), "The browser must call the canonical no-argument Owner RPC.");
assert(!ownerLoader.includes("user.id") && !ownerLoader.includes("owner_id") && !ownerLoader.includes("ownerId"), "The Owner RPC loader must not send a browser UUID.");
assert(!app.includes('.rpc("get_gie_owner_analytics"'), "Group A browser code must not use the legacy UUID Owner RPC.");

const sessionsMetrics = between(app, "function renderMySessionsCommandCenterMetricsMarkup", "function renderMySessionsCommandCenterSectionMarkup");
const sessionsAnalytics = between(app, "function renderMySessionsAnalyticsPanelMarkup", "function buildAdminSeedAgeAnalyticsState");
const profile = between(app, "function renderProfilePage()", "function renderProfileSetupScreen()");
const dashboardState = between(app, "function buildPrivateAnalyticsDashboardState()", "function renderPrivateAnalyticsMetricGrid");
const vaultSummaries = between(app, "function renderSeedVaultSummaryPanelMarkup", "function renderSeedVaultIndicatorMarkup");

for (const [name, source] of [
  ["Sessions summaries", sessionsMetrics],
  ["Session Analytics", sessionsAnalytics],
  ["Profile", profile],
  ["private analytics dashboard", dashboardState],
]) {
  assert(source.includes("getCanonicalOwnerAnalytics") || source.includes("ownerAnalytics"), `${name} must consume Owner Analytics.`);
  for (const forbidden of ["getSessionSeedTotals(", ".reduce(", "calculateProfileAnalyticsFromOwnerSessions(", "buildSeedVaultAnalytics("]) {
    assert(!source.includes(forbidden), `${name} must not calculate analytics locally (${forbidden}).`);
  }
}
assert(app.includes('data-gie-owner-consumer="home"'), "Home must expose its Owner Analytics summary.");
assert(vaultSummaries.includes("getCanonicalOwnerAnalytics().seedVault"), "Seed Vault summary cards must consume canonical Owner Vault metrics.");
assert(!vaultSummaries.includes("getSeedVaultCollectionSummary(entries, analytics)"), "Seed Vault summaries must not aggregate entries locally.");

const ownerWrapper = between(migration, "create or replace function public.get_gie_my_analytics()", "create or replace function public.get_gie_admin_owner_analytics");
assert(ownerWrapper.includes("auth.uid()") && ownerWrapper.includes("if requester_id is null"), "Owner Analytics must be authenticated and derive identity from auth.uid().");
assert(!ownerWrapper.includes("target_user_id") && !ownerWrapper.includes("p_owner_id"), "Normal Owner Analytics must accept no owner UUID.");
for (const field of [
  "total_sessions", "recorded_sessions", "completion_rate", "active_session_rate",
  "average_session_germination_rate", "best_germination_rate", "average_session_duration_ms",
  "favorite_method", "favorite_source", "favorite_variety", "leading_session", "session_history",
  "monthly_trends", "seed_vault", "community_participation", "recommendations", "group_a_adoption",
]) {
  assert(migration.includes(`'${field}'`), `Owner Analytics is missing ${field}.`);
}
assert(migration.includes("public.get_gie_scoped_result_rows_v1('owner', target_owner_id)"), "Phase 2 must reuse the frozen scoped GIE pipeline.");
assert(migration.includes("public.is_community_intelligence_session_eligible(grow_sessions.id)"), "Phase 2 must reuse canonical lifecycle eligibility.");
assert(!migration.includes("create or replace function public.get_gie_global_analytics") && !migration.includes("create or replace function public.get_gie_community_analytics"), "Phase 2 must not change other contracts.");
assert(migration.includes("'schema_version', '2026-07-13.5'") && migration.includes("'adoption_percentage', 45"), "Phase 2 schema/adoption diagnostics are stale.");
assert(docs.includes("Group A — migrated in Phase 2") && docs.includes("20 of 20") && docs.includes("100%"), "Phase 2 adoption documentation is incomplete.");

console.log("GIE Phase 2 Group A regression checks passed.");
