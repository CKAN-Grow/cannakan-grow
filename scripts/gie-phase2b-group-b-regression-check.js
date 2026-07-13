const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713220000_gie_phase2b_group_b_community_analytics.sql"), "utf8");
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

const loader = between(app, "async function loadGieCommunityAnalytics", "async function loadGieContractDiagnostics");
const communityState = between(app, "function buildCommunityInsightsState()", "function renderCommunityInsightsKpiGrid");
const communityPage = between(app, "function renderCommunityInsightsPage()", "function renderCommunityInsightsDrilldownPage");
const rankings = between(app, "function renderCommunityInsightsDrilldownPage", "function formatSeedAgePercentMetric");
const varietyReport = between(app, "function renderSeedProfilePage", "function renderExploreSegmentedNavItemMarkup");
const sourceReport = between(app, "function renderSourceProfilePage", "function getSourceCstpReportDetail");
const galleryAnalytics = between(app, "function renderCommunityIntelligenceDashboardMarkup()", "function renderGallery(");
const seedAgeReport = between(app, "function renderSeedAgeAnalyticsPage()", "function formatHomeGalleryRankingMetric");
const health = between(app, "function renderGrowIntelligenceHealthSectionMarkup()", "function renderAdminPage");
const communityRpc = between(migration, "create or replace function public.get_gie_community_analytics()", "revoke all on function public.get_gie_community_analytics()");

assert(loader.includes('appState.supabase.rpc("get_gie_community_analytics")'), "Group B must use the canonical Community RPC.");
assert(!/user\.id|owner_id|ownerId|target_user/.test(loader), "Community RPC calls must not send owner identity.");
assert((app.match(/\.rpc\("get_gie_community_analytics"\)/g) || []).length === 1, "Community Analytics must have one browser request implementation.");

for (const [name, source] of [
  ["Community", communityState + communityPage],
  ["Rankings", rankings],
  ["Variety Reports", varietyReport],
  ["Source Reports", sourceReport],
  ["Leaderboards", galleryAnalytics],
  ["Community Seed Age Report", seedAgeReport],
]) {
  for (const forbidden of ["getApprovedPublicGallerySnapshots(", "getSessions(", ".reduce(", "getPublicAnalyticsSignalStrength(", "buildGalleryLeaderboardEntries("]) {
    assert(!source.includes(forbidden), `${name} contains duplicate Community analytics: ${forbidden}`);
  }
}

assert(communityState.includes("getCanonicalCommunityAnalytics()"), "Community must adapt the cached canonical payload.");
assert(rankings.includes("state.topSources") && rankings.includes("state.topVarieties") && rankings.includes("state.contributorLeaderboard"), "Ranking pages must use canonical ranking arrays.");
assert(varietyReport.includes("getCanonicalCommunityVarietyReport") && varietyReport.includes('data-gie-community-consumer="variety-report"'), "Variety Reports must consume Community Analytics.");
assert(sourceReport.includes("getCanonicalCommunitySourceReport") && sourceReport.includes('data-gie-community-consumer="source-report"'), "Source Reports must consume Community Analytics.");
assert(galleryAnalytics.includes("state.leaderboards?.sources") && galleryAnalytics.includes("state.leaderboards?.contributors"), "Leaderboards must consume canonical leaderboard rows.");
assert(!app.includes("function getCommunityIntelligenceDashboardData"), "Legacy Community dashboard aggregation must remain removed.");
assert(seedAgeReport.includes("getCanonicalCommunityAnalytics()") && app.includes('data-gie-community-consumer="community-report-seed-age"'), "Community Seed Age report must consume Community Analytics.");
assert(!app.includes("function getCommunitySeedAgeOverviewSessions") && !app.includes("function buildPublicSeedAgeAnalyticsState"), "Legacy Community seed-age aggregators must remain removed.");

for (const field of [
  "overview", "source_rows", "variety_rows", "month_rows", "best_age_range", "most_tested_age_range",
  "rankings", "leaderboards", "source_reports", "variety_reports", "confidence", "source_quality", "group_b_adoption",
]) {
  assert(migration.includes(`'${field}'`), `Community Analytics is missing ${field}.`);
}
assert(migration.includes("public.get_gie_scoped_result_rows_v1('community', null)"), "Phase 2B must reuse the frozen Community scope pipeline.");
assert(migration.includes("lower(coalesce(status, '')) = 'approved'"), "Community evidence must be approved.");
assert(migration.includes("coalesce(is_published, false) = true"), "Community evidence must be published.");
assert(migration.includes("coalesce(analytics_excluded, false) = false"), "Hidden/deleted analytics evidence must be excluded.");
assert(communityRpc.includes("'schema_version', '2026-07-13.6'") && communityRpc.includes("'privacy_scope', 'approved_public_evidence'"), "Community contract schema/privacy metadata is stale.");
assert(communityRpc.includes("public.get_gie_contract_analytics_v1('community', null)"), "Community contract must retain the canonical engine dispatcher.");
assert(!migration.includes("create or replace function public.get_gie_global_analytics") && !migration.includes("create or replace function public.get_gie_my_analytics"), "Phase 2B must not alter Global or Owner contracts.");
assert(!migration.includes("create or replace function public.resolve_grow_session_lifecycle") && !migration.includes("create or replace function public.get_gie_scoped_result_rows_v1"), "Phase 2B must not alter lifecycle or normalization.");
assert(!migration.includes("md5(user_id") && !migration.includes("jsonb_agg(to_jsonb(rows) order by rows.rank) from ranked_contributors"), "Community payload must not expose stable user-derived identifiers.");
assert(migration.includes("'evidence_records', '[]'::jsonb"), "Community contract must not return private evidence records.");

assert(health.includes("gieGroupBAdoptionDiagnostics") && health.includes('data-gie-group-b-adoption="true"'), "Grow Intelligence Health must render Group B diagnostics.");
assert(docs.includes("16 of 20") && docs.includes("80%") && docs.includes("Group B — migrated in Phase 2B"), "Phase 2B adoption documentation is stale.");

console.log("GIE Phase 2B Group B regression checks passed.");
