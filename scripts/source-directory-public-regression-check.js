const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing public Source Explorer behavior: ${label}`);
  }
}

for (const needle of [
  "\"source-directory\": \"source-directory\"",
  "route === \"source-directory\"",
  "replaceLocationHashWithoutNavigation(legacyRedirectHash)",
  "renderSourcesLandingPage()",
  "pageKey: \"source-explorer\"",
  "pageLabel: \"Source Explorer\"",
  "function getSourceDirectoryPublicRoute(sourceKey = \"\")",
  "return normalizedKey ? `#sources/${encodeURIComponent(normalizedKey)}` : \"#sources\";",
  "function getSourceDirectoryPublicTrustHooks(sourceRecord = {})",
  "function buildSourceDirectoryPublicSourceDetail(sourceKey = \"\", communityState = buildCommunityInsightsState())",
  "function buildSourceDirectoryPublicRecords()",
  "function filterAndSortSourceDirectoryPublicRecords(records = [], options = {})",
  "function renderSourceDirectoryPublicPage()",
  "function getSourceDirectoryPublicSnapshotSummary(snapshot = null, sourceKey = \"\")",
  "function renderSourceDirectoryPublicDetailPage(sourceKey = \"\")",
  "getApprovedPublicGallerySnapshots()",
  "getCommunityInsightsSafeSnapshotPartitions(snapshot)",
  "Search by source name",
  "average-germination",
  "seeds-tested",
  "latest-activity",
  "public-entries",
  "Top public varieties/genetics",
  "Source Explorer",
  "Discover trusted seed sources through real community performance.",
  "Trusted Source Reports",
  "CSTP status pending",
  "Gold/Silver Certification",
  "Public Report Links",
  "Certification placeholder",
  "placeholder only",
  "href=\"#sources\"",
  "href=\"#community-insights\"",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".source-directory-public-page",
  ".source-directory-public-hero",
  ".source-directory-public-metric-grid",
  ".source-directory-public-controls",
  ".source-directory-public-card",
  ".source-directory-public-grid",
  ".source-directory-public-detail-grid",
  ".source-directory-public-snapshot-list",
  ".source-directory-public-cstp-placeholder",
]) {
  requireNeedle(stylesSource, needle);
}

const publicBlock = appSource.match(/function getSourceDirectoryPublicRoute[\s\S]*?function getSeedExplorerDemoSeeds/)?.[0] || "";
if (!publicBlock) {
  throw new Error("Could not locate public Source Explorer helper block.");
}

for (const forbiddenNeedle of [
  "getSessions(",
  "appState.seedVaultEntries",
  "calculateProfileAnalyticsFromOwnerSessions",
  "public_member_profiles",
  "publicMemberProfiles",
  "admin_users",
  "cstp_private",
  "getAdminCstp",
  "getGallerySnapshotPublicSessionDetails",
]) {
  if (publicBlock.includes(forbiddenNeedle)) {
    throw new Error(`Public Source Explorer must stay aggregate/public-safe only: ${forbiddenNeedle}`);
  }
}

for (const forbiddenPattern of [
  /\bemailAddress\b/,
  /\bemail_address\b/,
  /\buserEmail\b/,
  /\bownerEmail\b/,
  /[.[]email\b/,
  /["']email["']\s*:/,
]) {
  if (forbiddenPattern.test(publicBlock)) {
    throw new Error(`Public Source Explorer must not access email fields: ${forbiddenPattern}`);
  }
}

const sortBlock = appSource.match(/function filterAndSortSourceDirectoryPublicRecords[\s\S]*?function renderSourceDirectoryPublicMetricGrid/)?.[0] || "";
for (const sortNeedle of [
  "sort === \"seeds-tested\"",
  "sort === \"latest-activity\"",
  "sort === \"public-entries\"",
  "right.averageRate",
]) {
  requireNeedle(sortBlock, sortNeedle, `source sorting: ${sortNeedle}`);
}

console.log("Public Source Explorer regression check passed.");
