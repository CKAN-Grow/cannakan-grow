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
  "navigateToHashRoute(\"#analytics\")",
  "analytics: \"analytics\"",
  "route === \"analytics\"",
  "renderOwnerAnalyticsDashboardPage()",
  "pageKey: \"private-analytics-dashboard\"",
  "function buildPrivateAnalyticsDashboardState()",
  "function renderOwnerAnalyticsDashboardPage()",
  "function renderPrivateAnalyticsDashboardPage()",
  "return renderOwnerAnalyticsDashboardPage();",
  "getCanonicalOwnerAnalytics()",
  "data-gie-owner-consumer=\"session-analytics\"",
  "Owner Analytics Contract",
  "Canonical Recommendations",
  "Completed Sessions",
  "Active Sessions",
  "Seeds Tested",
  "Seeds Germinated",
  "Overall Germination %",
  "Community Confidence",
  "Favorite Method",
  "Favorite Source",
  "Favorite Variety",
  "Recent Session Performance",
  "Source Performance",
  "Variety Performance",
  "Method Performance",
  "Seed Vault Summary",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".private-analytics-page",
  ".private-analytics-hero",
  ".private-analytics-dashboard-grid",
  ".private-analytics-kpi-grid",
  ".private-analytics-insight-grid",
  ".private-analytics-chart-card",
  ".private-analytics-bar-chart",
  ".private-analytics-highlight-card",
  ".session-analytics-full-dashboard-link.button",
]) {
  requireNeedle(stylesSource, needle);
}

const dashboardBuilder = appSource.match(/function buildPrivateAnalyticsDashboardState\(\) \{[\s\S]*?function renderPrivateAnalyticsMetricGrid/)?.[0] || "";
const dashboardRenderer = appSource.match(/function renderOwnerAnalyticsDashboardPage\(\) \{[\s\S]*?function renderPrivateAnalyticsDashboardPage/)?.[0] || "";
for (const [label, source] of [["state", dashboardBuilder], ["renderer", dashboardRenderer]]) {
  for (const forbiddenNeedle of [
    "calculateProfileAnalyticsFromOwnerSessions",
    "buildSeedVaultAnalytics",
    "buildPrivateAnalyticsPerformanceRollups",
    "getApprovedPublicSnapshotsForMember",
    "getSessionSeedTotals",
    ".reduce(",
  ]) {
    if (source.includes(forbiddenNeedle)) {
      throw new Error(`Private Analytics Dashboard ${label} must render the Owner contract, not local analytics: ${forbiddenNeedle}`);
    }
  }
}

console.log("Private Analytics Dashboard Owner Contract regression check passed.");
