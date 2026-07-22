const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}`);
  return source.slice(start, end);
}

const homeSecondary = getBetween(
  app,
  "function renderHomeSecondaryInfoRowMarkup",
  "function renderRegisteredMemberCountCardMarkup",
);
const seedRenderer = getBetween(
  app,
  "function renderHomeSeedExplorerPreviewSectionMarkup",
  "function renderHomeCstpTestingIconMarkup",
);
const seedDataHelper = getBetween(
  app,
  "function getHomeSeedExplorerPreviewData",
  "function renderHomeSeedExplorerPreviewSectionMarkup",
);
const globalNormalizer = getBetween(
  app,
  "function normalizeExplorerCompletedSessionAggregatePayload",
  "function buildExplorerAggregateFromCachedPayload",
);
const globalCacheState = getBetween(
  app,
  "function getHomeGlobalAnalyticsCacheState",
  "function formatHomeCanonicalMetric",
);
const canonicalMetricFormatterSource = getBetween(
  app,
  "function formatHomeCanonicalMetric",
  "function renderHomeTestedSourcesPreviewSectionMarkup",
);
const fullSeedExplorer = getBetween(
  app,
  "function buildExplorerCompletedSessionAggregate",
  "function getSeedExplorerSeedById",
);
const iconResolver = getBetween(
  app,
  "function getAppSectionHeaderIconName",
  "function renderAppSectionHeaderIcon",
);

const seedIndex = homeSecondary.indexOf("renderHomeSeedExplorerPreviewSectionMarkup()");
const sourceIndex = homeSecondary.indexOf("renderHomeTestedSourcesPreviewSectionMarkup()");
const cstpIndex = homeSecondary.indexOf("renderHomeCstpOverviewSectionMarkup()");

assert(seedIndex >= 0, "Home secondary flow must render Seed Explorer.");
assert(sourceIndex > seedIndex, "Seed Explorer must render before Source Explorer.");
assert(cstpIndex > sourceIndex, "CSTP must render after Source Explorer.");
assert(seedRenderer.includes("SEED EXPLORER") || seedRenderer.includes("Seed Explorer"), "Seed Explorer header copy is missing.");
assert(seedRenderer.includes("Discover seed varieties through real community germination data."), "Seed Explorer supporting copy is missing.");
assert(seedRenderer.includes('href="#seeds"'), "Seed Explorer CTA must navigate to the existing Seed Explorer route.");
assert(seedRenderer.includes("Trending Varieties"), "Seed Explorer preview must include Trending Varieties.");
assert(seedDataHelper.includes("getHomeGlobalAnalyticsCacheState()"), "Seed Explorer Home preview must consume the normalized Global Analytics cache state.");
assert(seedDataHelper.includes("globalAnalytics.seedRecords"), "Seed Explorer Home preview must use canonical Global variety rows.");
for (const field of ["totalCompletedSessions", "totalSeedsTested", "totalSeedsGerminated", "totalVarietiesLogged", "communityConfidence"]) {
  assert(seedDataHelper.includes(field), `Seed Explorer Home preview must render canonical Global ${field}.`);
}
for (const [normalizedField, canonicalField] of Object.entries({
  totalCompletedSessions: "total_completed_sessions",
  totalSeedsTested: "total_seeds_tested",
  totalSeedsGerminated: "total_seeds_germinated",
  totalVarietiesLogged: "total_varieties_logged",
})) {
  assert(globalNormalizer.includes(`${normalizedField}: normalizeCanonicalMetric(sourcePayload.${canonicalField}`), `Global normalizer must map ${canonicalField} to ${normalizedField}.`);
}
assert(globalNormalizer.includes("canonicalMetricAvailability") && globalCacheState.includes('return { state: "malformed", analytics: null }'), "Malformed Global metrics must remain distinguishable from valid zeroes.");
assert(globalCacheState.includes('return { state: "available", analytics }'), "A valid Global contract must retain the available state.");
const formatHomeCanonicalMetric = new Function(`${canonicalMetricFormatterSource}; return formatHomeCanonicalMetric;`)();
assert(formatHomeCanonicalMetric(0, "available") === "0", "A valid canonical zero must render as 0.");
assert(formatHomeCanonicalMetric(undefined, "unavailable") === "—", "An unavailable contract must not render as a false zero.");
assert(formatHomeCanonicalMetric(undefined, "malformed") === "—", "A malformed contract must not render as a false zero.");
assert(seedDataHelper.includes('state: analyticsState') && seedDataHelper.includes('source: "global"'), "Home Seed Explorer availability and Global provenance must not share one field.");
for (const field of ["varietyName", "source", "germinationSuccess", "communitySessions", "seedsTracked", "totalGerminated", "publicEvidenceCount", "growInsight", "sourceRelationship"]) {
  assert(seedDataHelper.includes(`row.${field}`), `Trending varieties must map canonical seed_records.${field}.`);
}
assert(!seedDataHelper.includes("row.communityConfidence") && !seedDataHelper.includes("row.confidencePercent"), "Trending varieties must not expect stale per-record confidence fields.");
assert(!seedRenderer.includes('confidenceLabel || "Not available"') && !seedRenderer.includes("row.confidencePercent"), "Valid trending records must not render stale Not available confidence text.");
assert(!seedDataHelper.includes("buildCommunityInsightsState") && !seedDataHelper.includes("geeCommunityAnalytics"), "Seed Explorer Home preview must not consume Community Analytics.");
assert(!seedDataHelper.includes("getSeedExplorerRecords().sort") && !seedDataHelper.includes("fallbackRows") && !seedDataHelper.includes(".reduce("), "Seed Explorer Home preview must not calculate or independently rank analytics.");
assert(seedRenderer.includes("formatHomeCanonicalMetric(kpi.value, preview.state)"), "Loading, unavailable, malformed, and true-zero Global metrics must remain distinct.");
assert(fullSeedExplorer.includes("buildExplorerAggregateFromCachedPayload(appState.explorerCompletedSessionAggregate)"), "Home and full Seed Explorer must share the normalized Global cache.");
assert(!seedRenderer.includes("184") && !seedRenderer.includes("1,240"), "Seed Explorer preview must not hardcode sample stats.");
assert(iconResolver.includes('case "seed"') && iconResolver.includes('return "seedGermination"'), "Shared section icon resolver must support seed markers.");
assert(css.includes(".home-seed-explorer-row"), "Missing Seed Explorer row styling.");

console.log("Home Seed Explorer section regression checks passed.");
