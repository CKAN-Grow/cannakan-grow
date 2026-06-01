const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Community Insights behavior: ${label}`);
  }
}

for (const needle of [
  "\"community-insights\": \"community-insights\"",
  "route === \"community-insights\"",
  "renderCommunityInsightsPage()",
  "pageKey: \"community-insights\"",
  "function getCommunityInsightsSafeSnapshotPartitions(snapshot = null)",
  "function buildCommunityInsightsState()",
  "function renderCommunityInsightsPage()",
  "function renderCommunityInsightsBarChart(title = \"\", rows = [], options = {})",
  "function renderCommunityInsightsTrendChart(title = \"\", rows = [], options = {})",
  "getApprovedPublicGallerySnapshots()",
  "privacyBoundary: \"approved-public-community-grow-only\"",
  "sourceDirectoryIntegration",
  "cstpPublicStatistics",
  "certificationAnalytics",
  "publicLeaderboards",
  "communityBenchmarking",
  "Community Average Germination Rate",
  "Total Public Sessions Represented",
  "Total Public Seeds Tested",
  "Total Public Seeds Germinated",
  "Total Approved Community Grow Entries",
  "Active Community Contributors",
  "Source Intelligence",
  "Top Performing Sources",
  "Most Tested Sources",
  "Highest Participation Sources",
  "Source performance distribution",
  "Genetics / Variety Intelligence",
  "Most Tested Varieties",
  "Best Performing Varieties",
  "Repeat-Tested Varieties",
  "Variety participation distribution",
  "Seed Age Insights",
  "Germination by Age Bucket",
  "Most Tested Age Range",
  "Best Performing Age Range",
  "Community Age Distribution",
  "Community Trends",
  "Germination performance over time",
  "Session participation trends",
  "Snapshot submission trends",
  "Community activity trends",
  "Best Performing Age Range",
  "Most Reliable Source",
  "Most Tested Genetics",
  "Fastest Growing Category",
  "Community Trend Highlights",
  "No private sessions, profiles, Seed Vault inventory, emails, admin fields, or CSTP-private data are used.",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".community-insights-page",
  ".community-insights-hero",
  ".community-insights-kpi-grid",
  ".community-insights-insight-grid",
  ".community-insights-grid",
  ".community-insights-chart-card",
  ".community-insights-bar-chart",
  ".community-insights-trend-chart",
]) {
  requireNeedle(stylesSource, needle);
}

const stateBuilder = appSource.match(/function buildCommunityInsightsState\(\) \{[\s\S]*?function renderCommunityInsightsKpiGrid/)?.[0] || "";
for (const forbiddenNeedle of [
  "getSessions(",
  "appState.seedVaultEntries",
  "calculateProfileAnalyticsFromOwnerSessions",
  "public_member_profiles",
  "publicMemberProfiles",
  "admin_users",
  "cstp_private",
  "email",
]) {
  if (stateBuilder.includes(forbiddenNeedle)) {
    throw new Error(`Community Insights state must stay public-safe and aggregate-only: ${forbiddenNeedle}`);
  }
}

console.log("Community Insights regression check passed.");
