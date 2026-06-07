const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing dev demo reseed behavior: ${label}`);
  }
}

function getFunctionBody(source, functionName) {
  const signature = `function ${functionName}`;
  const signatureIndex = source.indexOf(signature);
  if (signatureIndex < 0) {
    throw new Error(`Missing function: ${functionName}`);
  }

  const openBraceIndex = source.indexOf("{", signatureIndex);
  if (openBraceIndex < 0) {
    throw new Error(`Could not find body for function: ${functionName}`);
  }

  let depth = 0;
  for (let index = openBraceIndex; index < source.length; index += 1) {
    const character = source[index];
    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openBraceIndex + 1, index);
      }
    }
  }

  throw new Error(`Could not parse body for function: ${functionName}`);
}

for (const needle of [
  'const DEV_DEMO_DATA_VERSION = "mary-jane-berlin-demo-v1";',
  'const SEEDSMAN_DEMO_LOGO_URL = "/assets/images/sources/real/seedsman-logo.png";',
  "const DEMO_SNAPSHOT_IMAGE_URLS = Object.freeze([",
  "const DEV_DEMO_SOURCE_LOGOS = Object.freeze({",
  "function resetAndReseedDevModeMockData(options = {})",
  "function isDevModeOnlyMockRecord(record = {})",
  "function shouldExposeDevModeMockData()",
  "function buildDevModeSeedVaultEntries(userId = appState.user?.id || DEV_QA_BYPASS_USER_ID)",
  "function buildDevModeAppNotifications()",
  "function canAccessMockDataControls()",
  "canAccessMockDataControls()",
  "setMockDataEnabledAndRefresh(enabled)",
  'data-dev-demo-reseed="true"',
  "saveSessions([...demoSessions, ...realSessions])",
  "&& !isDevModeOnlyMockRecord(session)",
  "saveSeedVaultEntries([...buildDevModeSeedVaultEntries(userId), ...realVaultEntries]",
  "persistAppNotifications([...buildDevModeAppNotifications(), ...existingNotifications]",
  "getSourceDirectoryMockRecords()",
  "isMockDataEnabled() ? testedSourcesMock : []",
  "function buildMockGalleryPartitionRecords(partitionSpecs = [])",
  "function getDemoSnapshotImageUrlForIndex(index = 0)",
  "function getMockGallerySessionIdForRecord(record = {}, index = 0)",
  "partitionResults: buildSnapshotPartitionResultMetadata(resultSummary, systemType === \"TRA\" ? 16 : 8)",
  "resultSummary: buildSnapshotResultSummaryMetadata(resultSummary)",
  "imageUrl,",
  "sessionId,",
  "if (isMockGallerySnapshot(snapshot) && !isMockDataEnabled())",
  "const feedDetails = getGallerySnapshotFeedDetails(snapshot);",
  "const minimumSnapshotCount = isMockDataEnabled() ? 2 : 3;",
  ".filter((entry) => entry.snapshotCount >= minimumSnapshotCount)",
  "renderMySeedVaultPanelMarkup(entries = [], options = {})",
  "return isMockDataEnabled()\n    ? GALLERY_TOP_MEMBERS_MOCK_ENTRIES.map((entry) => ({ ...entry }))\n    : [];",
  "normalizeSeedVaultEntry(entry = {})",
  "normalizeStoredSession(session)",
  "is_mock_data",
  "dev_mode_only",
  "mock_source",
]) {
  requireNeedle(appSource, needle);
}

for (const logoPath of [
  "public/assets/images/sources/real/seedsman-logo.png",
]) {
  const absolutePath = path.join(repoRoot, logoPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing dev demo source logo asset: ${logoPath}`);
  }
}

const resetBody = getFunctionBody(appSource, "resetAndReseedDevModeMockData");
for (const forbidden of [
  "supabase",
  ".from(",
  "profiles",
  "admin_users",
  "auth.users",
  "founder",
  "CSTP",
  "cstp",
]) {
  if (resetBody.includes(forbidden)) {
    throw new Error(`Dev demo reset should not touch production/admin/CSTP path: ${forbidden}`);
  }
}

for (const sourceName of [
  "Seedsman",
  "Poppin Fire",
  "Good Genetix",
  "Summit Seed Co.",
  "Evergreen Genetics",
  "Atlas Breeding Labs",
]) {
  requireNeedle(appSource, sourceName, `mock source ${sourceName}`);
}

for (const forbiddenSourceName of [
  "Lumen Leaf Genetics",
  "Verdant Vault Seeds",
  "Northstar Germplasm",
  "Summit Sprout Collective",
  "Aurora Calyx Seedworks",
]) {
  if (appSource.includes(forbiddenSourceName)) {
    throw new Error(`Old demo source should not remain in Berlin demo data: ${forbiddenSourceName}`);
  }
}

const mockGallerySeedBody = getFunctionBody(appSource, "buildMockGallerySnapshotSeedRecords");
const configuredSnapshotCount = (mockGallerySeedBody.match(/title:\s*"/g) || []).length;
if (configuredSnapshotCount < 24 || configuredSnapshotCount > 36) {
  throw new Error(`Expected 24-36 approved Dev Mode Community Grow snapshots, found ${configuredSnapshotCount}`);
}
if ((mockGallerySeedBody.match(/source:\s*"Seedsman"/g) || []).length < 12) {
  throw new Error("Seedsman should have prominent Dev Mode Community Grow coverage.");
}
if ((mockGallerySeedBody.match(/source:\s*"Poppin Fire"/g) || []).length < 8) {
  throw new Error("Poppin Fire should have the second-largest Dev Mode Community Grow coverage.");
}
if ((mockGallerySeedBody.match(/source:\s*"Good Genetix"/g) || []).length < 6) {
  throw new Error("Good Genetix should have the third-largest Dev Mode Community Grow coverage.");
}
if ((mockGallerySeedBody.match(/monthOffset:\s*0/g) || []).length < 8) {
  throw new Error("Community Insights needs enough current-month Dev Mode snapshots.");
}
for (const requiredNeedle of [
  "Seedsman Banana Jealousy",
  "Poppin Fire Double Blueberry Muffin",
  "Good Genetix Permanent G Auto",
  "repeat: 16",
  "germinatedCount: 6",
  "germinatedCount: 3",
  "seedAgeYears: 7",
]) {
  requireNeedle(mockGallerySeedBody, requiredNeedle, `mock gallery coverage ${requiredNeedle}`);
}

const snapshotImageManifestMatch = appSource.match(/const DEMO_SNAPSHOT_IMAGE_URLS = Object\.freeze\(\[([\s\S]*?)\]\);/);
if (!snapshotImageManifestMatch) {
  throw new Error("Missing demo snapshot image manifest.");
}
const snapshotImageUrls = [...snapshotImageManifestMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
if (snapshotImageUrls.length < 1) {
  throw new Error("Expected at least one uploaded demo snapshot image.");
}
for (const imageUrl of snapshotImageUrls) {
  const relativePath = decodeURIComponent(imageUrl).replace(/^\/+/, "");
  const absolutePath = path.join(repoRoot, "public", relativePath.replace(/^assets[\\/]/, "assets/"));
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing uploaded demo snapshot image asset: ${imageUrl}`);
  }
}
if (!appSource.includes("getDemoSnapshotImageUrlForIndex(index)")) {
  throw new Error("Approved Community Grow snapshots should actively use uploaded demo snapshot images.");
}
if (configuredSnapshotCount < snapshotImageUrls.length) {
  throw new Error("Community Grow snapshot posts should use all uploaded images before reuse is needed.");
}

console.log("Dev demo reseed regression check passed.");
