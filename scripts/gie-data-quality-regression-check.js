const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const baseMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713160000_grow_intelligence_engine.sql"),
  "utf8",
);
const qualityMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713170000_gie_canonical_metrics_and_data_quality.sql"),
  "utf8",
);

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

const sourceMetrics = getBetween(app, "function getSourceDirectoryMetrics", "function getSourceDirectoryCommunityConfidenceLabel");
const seedMetrics = getBetween(app, "function getSeedExplorerMetrics", "function renderSeedExplorerCommunityConfidenceMetricMarkup");
const sourceCards = getBetween(app, "function renderSourceDirectoryMetricsMarkup", "function parseSourceDirectoryGerminationRateCandidate");
const seedCards = getBetween(app, "function renderSeedExplorerMetricCardsMarkup", "function renderSeedExplorerFilterPills");
const dataHealth = getBetween(app, "function renderGrowIntelligenceEngineDataHealthSectionMarkup", "function renderAdminPage");
const normalizer = getBetween(app, "function normalizeExplorerCompletedSessionAggregatePayload", "function buildExplorerAggregateFromCachedPayload");

assert(!app.includes("Seeds Reported"), "Explorer must not use the Seeds Reported label.");
assert(!app.includes("Seeds Tracked"), "Explorer must not use the Seeds Tracked label.");
assert(seedCards.includes('label: "Seeds Tested"') && seedCards.includes("metrics.totalSeedsTested"), "Seed Explorer must render the canonical Seeds Tested headline.");
assert(sourceCards.includes('label: "Seeds Tested"') && sourceCards.includes("metrics.seedsTested"), "Source Explorer must render the canonical Seeds Tested headline.");
assert(sourceCards.includes('label: "Source Attribution %"'), "Source Explorer must render source attribution separately from Seeds Tested.");
assert(!seedCards.includes("Source Attribution"), "Seed Explorer must not display source-attribution metrics.");

assert(seedMetrics.includes("aggregate.totalSeedsTested"), "Seed Explorer must read total seeds directly from the GIE aggregate.");
assert(sourceMetrics.includes("aggregate.totalSeedsTested"), "Source Explorer must read total seeds directly from the GIE aggregate.");
assert(!seedMetrics.includes(".reduce("), "Seed Explorer must not calculate analytics from records.");
assert(!sourceMetrics.includes(".reduce("), "Source Explorer must not calculate analytics from records.");

[
  "totalSeedsTested",
  "totalSeedsWithSource",
  "totalSeedsWithoutSource",
  "sourceAttributionRate",
  "varietiesMissingSource",
  "duplicateSources",
  "unknownSources",
  "unknownVarieties",
].forEach((field) => {
  assert(normalizer.includes(field), `GIE payload normalizer is missing ${field}.`);
});

[
  "Seeds Tested",
  "Seeds With Source",
  "Seeds Missing Source",
  "Source Attribution %",
  "Varieties Missing Source",
  "Duplicate Sources",
  "Unknown Sources",
  "Unknown Varieties",
].forEach((label) => {
  assert(dataHealth.includes(label), `Explorer Data Health is missing ${label}.`);
});
assert(dataHealth.includes("aggregate.sourceAttributionStatus"), "Explorer Data Health must render the canonical GIE alert status.");

[
  "total_seeds_tested",
  "total_seeds_with_source",
  "total_seeds_without_source",
  "source_attribution_rate",
  "varieties_missing_source",
  "duplicate_sources",
  "unknown_sources",
  "unknown_varieties",
].forEach((field) => {
  assert(baseMigration.includes(`'${field}'`), `Base GIE payload is missing ${field}.`);
  assert(qualityMigration.includes(`'${field}'`), `Forward GIE migration is missing ${field}.`);
});

assert(qualityMigration.includes("grow_intelligence_engine_config"), "GIE source attribution thresholds must be configurable.");
assert(qualityMigration.includes("source_attribution_healthy_threshold") && qualityMigration.includes("source_attribution_warning_threshold") && qualityMigration.includes("source_attribution_needs_attention_threshold"), "GIE must expose the 95/90/80 attribution threshold configuration.");
assert(qualityMigration.includes("'Healthy'") && qualityMigration.includes("'Warning'") && qualityMigration.includes("'Needs Attention'"), "GIE must classify source attribution health canonically.");

console.log("GIE canonical metrics and data-quality regression checks passed.");
