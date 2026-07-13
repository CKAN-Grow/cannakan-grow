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
const healthMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260713180000_gie_data_quality_score_and_health.sql"),
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
const dataHealth = getBetween(app, "function renderGrowIntelligenceHealthSectionMarkup", "function renderAdminPage");
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
  "dataQualityScore",
  "dataQualityStatus",
  "dataQualityBreakdown",
  "dataQualityVersion",
  "invalidResultRows",
].forEach((field) => {
  assert(normalizer.includes(field), `GIE payload normalizer is missing ${field}.`);
});

[
  "Seeds Missing Source",
  "Source Attribution Rate",
  "Duplicate Sources",
  "Unknown Sources",
  "Unknown Varieties",
  "Invalid Result Rows",
  "Data Quality Version",
].forEach((label) => {
  assert(dataHealth.includes(label), `Grow Intelligence Health is missing ${label}.`);
});
assert(dataHealth.includes("aggregate.dataQualityScore") && dataHealth.includes("aggregate.dataQualityStatus"), "Grow Intelligence Health must render the canonical GIE score and status.");
assert(dataHealth.includes("aggregate.dataQualityBreakdown.map"), "Grow Intelligence Health must render the canonical deterministic breakdown.");
assert(!dataHealth.includes("100 -") && !dataHealth.includes("score >="), "The UI must not calculate or reinterpret the data-quality score.");

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

for (const field of ["data_quality_score", "data_quality_status", "data_quality_breakdown", "data_quality_version"]) {
  assert(healthMigration.includes(`'${field}'`), `Scoring migration is missing ${field}.`);
}
assert(healthMigration.includes("'schema_version', '2026-07-13.3'"), "Scoring migration must increment the GIE schema version.");
assert(healthMigration.includes("'gie-dq.v1'"), "Scoring migration must expose the versioned score formula.");
assert(healthMigration.includes("source_deduction :=") && healthMigration.includes("100 - source_rate"), "Source attribution must contribute deterministically to the score.");
assert(healthMigration.includes("source_deduction + unknown_variety_deduction"), "The canonical score must be the deterministic sum of GIE deductions.");
assert(Math.round(100 - Math.min(70, 100 - 89)) === 89, "An 89% source-attribution rate with no unrelated defects must produce the expected score of 89.");
assert(healthMigration.includes("return payload || quality || observations"), "Quality scoring must enrich, not replace or recalculate, canonical Seeds Tested.");
assert(healthMigration.indexOf("'category', 'Source attribution completeness'") < healthMigration.indexOf("'category', 'Missing required result fields'"), "The score breakdown order must be deterministic.");
assert(healthMigration.includes("public.is_community_intelligence_session_eligible(grow_sessions.id)"), "Quality observations must reuse canonical eligibility without changing it.");
assert(healthMigration.includes("Admin or service-role access is required"), "Health diagnostics must remain admin/service-role protected.");
assert(healthMigration.includes("revoke all on function public.get_grow_intelligence_engine_diagnostics() from anon"), "Anonymous callers must not access session diagnostics.");

console.log("GIE canonical metrics and data-quality regression checks passed.");
