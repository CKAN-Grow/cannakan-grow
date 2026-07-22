const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");

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

const loader = between(app, "async function loadGeeCommunityAnalytics", "async function loadGeeContractDiagnostics");
const state = between(app, "function buildCommunityInsightsState()", "function renderCommunityInsightsKpiGrid");
const page = between(app, "function renderCommunityInsightsPage()", "function renderCommunityInsightsDrilldownPage");
const drilldown = between(app, "function renderCommunityInsightsDrilldownPage", "function formatSeedAgePercentMetric");
const galleryDashboard = between(app, "function renderCommunityIntelligenceDashboardMarkup()", "function renderGallery(");

assert(loader.includes('appState.supabase.rpc("get_gie_community_analytics")'), "Community must call the canonical Community RPC.");
assert(!/user\.id|owner_id|ownerId/.test(loader), "Public Community calls must not send an owner UUID.");
assert(state.includes("getCanonicalCommunityAnalytics()"), "Community state must be a canonical payload adapter.");
for (const forbidden of ["getApprovedPublicGallerySnapshots(", "getSessions(", ".reduce(", "getPublicAnalyticsSignalStrength("]) {
  assert(!state.includes(forbidden), `Community state must not aggregate locally: ${forbidden}`);
  assert(!page.includes(forbidden), `Community page must not aggregate locally: ${forbidden}`);
  assert(!drilldown.includes(forbidden), `Community ranking pages must not aggregate locally: ${forbidden}`);
  assert(!galleryDashboard.includes(forbidden), `Gallery analytics dashboard must not aggregate locally: ${forbidden}`);
}
assert(app.includes('data-gee-community-consumer="community"'), "Community consumer marker is missing.");
assert(app.includes('data-gee-community-consumer="leaderboards"'), "Leaderboard consumer marker is missing.");
assert(app.includes("state.overview?.sources") && app.includes("state.overview?.varieties"), "Community counts must render canonical overview fields.");
assert(drilldown.includes("state.topSources") && drilldown.includes("state.topVarieties"), "Ranking routes must render canonical ranking arrays.");
assert(galleryDashboard.includes("state.leaderboards?.sources") && galleryDashboard.includes("state.leaderboards?.varieties"), "Gallery leaderboards must render GEE leaderboards.");
assert(!app.includes("function getCommunityIntelligenceDashboardData"), "Legacy gallery analytics aggregator must remain removed.");

for (const selector of [".community-insights-page", ".community-insights-kpi-grid", ".community-insights-grid", ".community-insights-chart-card"]) {
  assert(styles.includes(selector), `Missing Community Insights styling: ${selector}`);
}

console.log("Community Insights regression check passed (canonical Community contract).");
