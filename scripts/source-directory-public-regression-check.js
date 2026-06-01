const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing public Source Directory behavior: ${label}`);
  }
}

for (const needle of [
  "\"source-directory\": \"source-directory\"",
  "route === \"source-directory\"",
  "renderSourceDirectoryPublicPage()",
  "renderSourceDirectoryPublicDetailPage(id)",
  "pageKey: \"source-directory\"",
  "pageKey: \"source-directory-detail\"",
  "function getSourceDirectoryPublicRoute(sourceKey = \"\")",
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
  "Public Transparency Directory",
  "Results are observational and may not represent all seeds from a source.",
  "Future CSTP certifications will display separately when available.",
  "CSTP status pending",
  "Gold/Silver Certification",
  "Public Report Links",
  "Not certified",
  "placeholder only",
  "href=\"#source-directory\"",
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

const publicBlock = appSource.match(/function getSourceDirectoryPublicRoute[\s\S]*?function renderSourcesLandingPage/)?.[0] || "";
if (!publicBlock) {
  throw new Error("Could not locate public Source Directory helper block.");
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
    throw new Error(`Public Source Directory must stay aggregate/public-safe only: ${forbiddenNeedle}`);
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
    throw new Error(`Public Source Directory must not access email fields: ${forbiddenPattern}`);
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

console.log("Public Source Directory regression check passed.");
