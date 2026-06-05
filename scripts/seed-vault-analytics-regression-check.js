const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Seed Vault analytics behavior: ${label}`);
  }
}

for (const needle of [
  "function buildSeedVaultAnalytics(entries = [], sessions = getSessions())",
  "function buildSeedVaultAgeInsightCards(ageBuckets = [], context = {})",
  "function getSeedVaultEntrySessionAnalytics(entry = null, sessions = getSessions())",
  "function getSeedVaultLinkedPartitionResults(session = null, entryId = \"\", options = {})",
  "function isSeedVaultSessionUsageEligible(session = null)",
  "function getSeedVaultInventoryStatus(entry = null)",
  "function getSeedVaultEntryEffectiveAgeYears(entry = null)",
  "function createSeedVaultAgeCorrelationBucket(bucketDefinition = {})",
  "function addSeedVaultAgePerformanceSample(bucket, sample = {})",
  "function finalizeSeedVaultAgeCorrelationBucket(bucket = {})",
  "function renderSeedVaultMetricCardsMarkup(analytics = null)",
  "function renderSeedVaultAgeInsightCardsMarkup(analytics = null)",
  "function renderSeedVaultRollupMarkup(analytics = null)",
  "function renderSeedVaultUsageMarkup(entry = {}, entryAnalytics = null)",
  "isGrowSessionAnalyticsEligible(session)",
  "applyIntegrityFilters !== false",
  "[\"archived\", \"deleted\", \"stale\", \"abandoned\"].includes(lifecycleHealth.lifecycleState || lifecycleHealth.classification)",
  "getSeedAgeBucketKey(ageYears)",
  "key: \"unknown\"",
  "key: \"0-1\"",
  "key: \"1-2\"",
  "key: \"2-5\"",
  "key: \"5-10\"",
  "key: \"10-15\"",
  "key: \"15-20\"",
  "key: \"20-plus\"",
  "ageIntelligence",
  "oldestEntries",
  "oldestSuccessfulGermination",
  "sourceAgeCorrelations",
  "varietyAgeCorrelations",
  "oldestSuccessfulSources",
  "oldestSuccessfulVarieties",
  "repeatTestedVarieties",
  "averageAge",
  "totalSeedsOwned",
  "totalVarieties",
  "totalSources",
  "unknownAgeCount",
  "lowInventoryEntries",
  "outOfStockEntries",
  "sessionsStarted",
  "totalSeedsUsed",
  "averageGerminationRate",
  "bestGerminationRate",
  "completedLinkedSessions",
  "Best Performing Age Range",
  "Oldest Successfully Germinated Seeds",
  "Largest Age Group",
  "Unknown Age Inventory",
  "Most Tested Age Group",
  "Vault Intelligence",
  "Source, quantity, age, and linked-session performance for your inventory.",
]) {
  requireNeedle(appSource, needle);
}

for (const forbiddenNeedle of [
  "Private Vault Intelligence",
  "Public-safe metadata",
]) {
  if (appSource.includes(forbiddenNeedle)) {
    throw new Error(`Seed Vault analytics UI should not show visibility language: ${forbiddenNeedle}`);
  }
}

for (const needle of [
  ".seed-vault-metric-grid",
  ".seed-vault-metric-card",
  ".seed-vault-insight-grid",
  ".seed-vault-insight-card",
  ".seed-vault-health-pill",
  ".seed-vault-health-pill.is-success",
  ".seed-vault-health-pill.is-attention",
  ".seed-vault-health-pill.is-muted",
  ".seed-vault-intelligence-panel",
  ".seed-vault-rollup-grid",
  ".seed-vault-usage-grid",
]) {
  requireNeedle(stylesSource, needle);
}

if (/publicMemberProfiles|Community Grow|gallerySnapshots/.test(appSource.match(/function buildSeedVaultAnalytics[\s\S]*?function normalizeSeedVaultFavoriteFilter/)?.[0] || "")) {
  throw new Error("Seed Vault analytics must stay isolated from public profile and Community Grow data.");
}

console.log("Seed Vault analytics regression check passed.");
