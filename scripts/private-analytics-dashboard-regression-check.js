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
  ".private-analytics-dashboard-grid",
  ".private-analytics-kpi-grid",
  ".private-analytics-chart-card",
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
