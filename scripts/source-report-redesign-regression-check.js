const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713220000_gie_phase2b_group_b_community_analytics.sql"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function between(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}`);
  return source.slice(start, end);
}

const adapter = between(app, "function normalizeGieCommunityAnalyticsPayload", "function getCanonicalCommunityAnalytics");
const sourceReport = between(app, "function renderSourceProfilePage", "function getSourceCstpReportDetail");
const sourceReportHelpers = between(app, "function renderSourceReportDashboardCardHeader", "function renderSourceProfilePage");

assert(app.includes('appState.supabase.rpc("get_gie_community_analytics")'), "Source Report must retain the canonical Community RPC.");
assert(adapter.includes("sourceReports: mapReports(analytics?.source_reports"), "Source Report must retain the versioned canonical adapter.");
assert(sourceReport.includes("getCanonicalCommunitySourceReport") && sourceReport.includes('data-gie-community-consumer="source-report"'), "Source Report must consume the canonical adapter.");

for (const label of [
  "Source Report",
  "Community Sessions",
  "Seeds Tested",
  "Average Germination",
  "Varieties Tested",
  "Contributors",
  "Top Performing Varieties",
  "Germination Distribution",
  "Community Performance",
  "Recent Community Activity",
  "Community Confidence Breakdown",
  "Community Growth by Region",
  "Source Rankings",
  "Powered by <strong>GIE</strong>",
]) {
  assert(sourceReport.includes(label), `Source Report redesign is missing ${label}.`);
}

for (const unavailable of [
  "Not enough canonical distribution data.",
  "Canonical recent community activity is not available for this source.",
  "Canonical regional data is not available for this source.",
  "Not enough approved evidence to display performance trends.",
]) {
  assert(sourceReport.includes(unavailable), `Source Report is missing canonical unavailable state: ${unavailable}`);
}

for (const forbidden of [
  "getSessions(",
  "getApprovedPublicGallerySnapshots(",
  "buildGalleryLeaderboardEntries(",
  ".reduce(",
  ".sort(",
  "Community Score",
  "Letter Grade",
  "source-report-cstp",
]) {
  assert(!sourceReport.includes(forbidden) && !sourceReportHelpers.includes(forbidden), `Source Report contains forbidden local or retired UI behavior: ${forbidden}`);
}

assert(!app.includes("Community Analytics Contract"), "User-facing Analytics Contract copy must be retired.");
assert(styles.includes(".source-report-dashboard") && styles.includes("max-width: 1200px;"), "Source Report must retain the compact 1200px dashboard layout.");
assert(styles.includes("@media (max-width: 560px)") && styles.includes(".source-report-snapshot-grid { grid-template-columns: 1fr; }"), "Source Report must retain its single-column mobile layout.");

for (const eligibilityRule of [
  "lower(coalesce(status, '')) = 'approved'",
  "coalesce(is_published, false) = true",
  "coalesce(analytics_excluded, false) = false",
  "public.get_gie_scoped_result_rows_v1('community', null)",
]) {
  assert(migration.includes(eligibilityRule), `Canonical GIE eligibility rule is missing: ${eligibilityRule}`);
}

console.log("Source Report redesign regression checks passed.");
