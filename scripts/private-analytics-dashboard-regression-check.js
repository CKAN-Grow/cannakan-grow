const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing private Analytics Dashboard behavior: ${label}`);
  }
}

for (const needle of [
  "session-analytics-full-dashboard-link",
  "View Full Analytics",
  "href=\"#analytics\"",
  "account-analytics-link",
  "Analytics Dashboard",
  "navigateToHashRoute(\"#analytics\")",
  "analytics: \"analytics\"",
  "route === \"analytics\"",
  "renderPrivateAnalyticsDashboardPage()",
  "pageKey: \"private-analytics-dashboard\"",
  "function buildPrivateAnalyticsDashboardState()",
  "function buildPrivateAnalyticsCommunityInsightsHooks(state = {})",
  "function buildPrivateAnalyticsMonthlyTrendData(sessions = [])",
  "function buildPrivateAnalyticsInsightCards(state = {})",
  "function renderPrivateAnalyticsHeroKpis(cards = [])",
  "function renderPrivateAnalyticsMiniBarChart(title = \"\", rows = [], options = {})",
  "function renderPrivateAnalyticsTrendChart(title = \"\", points = [], options = {})",
  "function renderPrivateAnalyticsInsightCards(cards = [])",
  "privacyBoundary: \"owner-only\"",
  "futurePublicCommunityInsights",
  "calculateProfileAnalyticsFromOwnerSessions(visibleSessions)",
  "buildSeedVaultAnalytics(appState.seedVaultEntries || [], visibleSessions)",
  "buildPrivateAnalyticsAgeBucketRows(vaultAnalytics, \"performance\")",
  "buildPrivateAnalyticsPerformanceRollups(completedSessions, \"source\")",
  "buildPrivateAnalyticsPerformanceRollups(completedSessions, \"variety\")",
  "getApprovedPublicSnapshotsForMember(memberId, getApprovedPublicGallerySnapshots())",
  "calculateProfileAnalyticsFromPublicSnapshots(snapshots)",
  "isCompletedValidSessionForAnalytics",
  "Owner-only dashboard",
  "Overview",
  "Germination Performance",
  "Germination Trends",
  "Average Germination Rate",
  "Total Seeds Tested",
  "Total Completed Sessions",
  "Best Performing Source",
  "Best Performing Age Range",
  "Total Vault Inventory",
  "Insight Cards",
  "Most Reliable Source",
  "Most Tested Genetics",
  "Inventory Needs Attention",
  "Oldest Successful Germination",
  "Germination rate over time",
  "Seeds tested over time",
  "Session completion trends",
  "Top sources",
  "Most tested sources",
  "Source age-performance relationships",
  "Top performing varieties",
  "Most tested varieties",
  "Repeat-tested varieties",
  "Oldest successful varieties",
  "Age bucket distribution",
  "Germination by age bucket",
  "Inventory by source",
  "Inventory by age",
  "Low inventory indicators",
  "Seed Age",
  "Source Performance",
  "Variety / Genetics",
  "Seed Vault Intelligence",
  "Community Participation",
  "Personal Trends",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".private-analytics-page",
  ".private-analytics-hero",
  ".private-analytics-hero-kpi-grid",
  ".private-analytics-hero-kpi-card",
  ".private-analytics-dashboard-grid",
  ".private-analytics-kpi-grid",
  ".private-analytics-insight-grid",
  ".private-analytics-insight-card",
  ".private-analytics-visual-grid",
  ".private-analytics-chart-card",
  ".private-analytics-bar-chart",
  ".private-analytics-trend-chart",
  ".private-analytics-highlight-card",
  ".private-analytics-activity-card",
  ".session-analytics-full-dashboard-link.button",
]) {
  requireNeedle(stylesSource, needle);
}

const dashboardBuilder = appSource.match(/function buildPrivateAnalyticsDashboardState\(\) \{[\s\S]*?function renderPrivateAnalyticsMetricGrid/)?.[0] || "";
for (const forbiddenNeedle of [
  "public_member_profiles",
  "publicMemberProfiles",
  "admin_users",
  "cstp_private",
  "email",
]) {
  if (dashboardBuilder.includes(forbiddenNeedle)) {
    throw new Error(`Private Analytics Dashboard state must not read broad/private fields: ${forbiddenNeedle}`);
  }
}

console.log("Private Analytics Dashboard regression check passed.");
