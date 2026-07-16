const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260715200000_gie_community_rank_display_v1.sql"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function between(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}`);
  return source.slice(start, end);
}

const adapter = between(app, "function normalizeGieCommunityAnalyticsPayload", "function getCanonicalCommunityAnalytics");
const rankHelpers = between(app, "function getCanonicalRankDisplayMeta", "function renderSourceDirectoryTopVarietiesMarkup");
const sourceReport = between(app, "function renderSourceProfilePage", "function getSourceCstpReportDetail");
const varietyReport = between(app, "function renderSeedProfilePage", "function renderExploreSegmentedNavItemMarkup");
const seedExplorerCard = between(app, "function renderSeedExplorerCardMarkup", "function renderSeedExplorerListRowsMarkup");
const sourceTable = between(app, "function renderSourceReportRankingsTable", "function renderSourceProfilePage");

assert(adapter.includes("rankDisplay: mapRankDisplay(row)"), "The Community adapter must preserve canonical rank_display metadata.");
assert(rankHelpers.includes("supplied?.kind === \"percentile\""), "Rank 4+ must require a canonical percentile supplied by GIE.");
assert(!rankHelpers.includes("Math.ceil") && !rankHelpers.includes("/ total") && !rankHelpers.includes("eligiblePopulation) *"), "The browser must not calculate rank percentiles.");
assert(sourceReport.includes('entityLabel: "Source Rank"'), "Source Report hero must use the shared rank display.");
assert(varietyReport.includes('entityLabel: "Variety Rank"'), "Variety Report hero must use the shared rank display.");
assert(seedExplorerCard.includes("getCanonicalCommunityVarietyReport") && seedExplorerCard.includes("renderCanonicalRankDisplayMarkup"), "Seed Explorer cards must reuse canonical variety rank metadata when available.");
assert(sourceTable.includes("row.performanceRank") && sourceTable.includes("<th>Rank</th>"), "Source ranking tables must retain exact canonical numeric ranks.");

const helpers = new Function(
  "escapeHtml",
  "renderMySessionsInlineIconMarkup",
  "getCanonicalCommunitySourceReport",
  `${rankHelpers}; return { getCanonicalRankDisplayMeta, renderCanonicalRankDisplayMarkup, getSourceDirectoryPerformanceContextLabel };`,
)(String, (name) => `<svg data-icon="${name}"></svg>`, () => null);

for (const rank of [1, 2, 3]) {
  const meta = helpers.getCanonicalRankDisplayMeta({ performanceRank: rank }, { entityLabel: "Source Rank" });
  assert(meta?.kind === "podium" && meta.label === `#${rank}`, `Rank ${rank} must use a podium display.`);
  const markup = helpers.renderCanonicalRankDisplayMarkup({ performanceRank: rank }, { entityLabel: "Source Rank" });
  assert(markup.includes(`is-rank-${rank}`) && markup.includes('data-icon="award"'), `Rank ${rank} must render the premium award badge.`);
}

const fourth = {
  performanceRank: 4,
  rankDisplay: { kind: "percentile", rank: 4, label: "Top 8%", eligiblePopulation: 50 },
};
assert(helpers.getCanonicalRankDisplayMeta(fourth)?.label === "Top 8%", "Rank 4+ must render the exact GIE-supplied percentile label.");
const fourthMarkup = helpers.renderCanonicalRankDisplayMarkup(fourth, { entityLabel: "Source Rank", populationLabel: "of eligible Community sources" });
assert(fourthMarkup.includes("Top 8%") && fourthMarkup.includes("of eligible Community sources"), "The percentile badge must render the canonical placement and eligible-population context.");
assert(helpers.getCanonicalRankDisplayMeta({ performanceRank: 4 }) === null, "Rank 4+ must not be estimated when canonical percentile metadata is absent.");
assert(helpers.getSourceDirectoryPerformanceContextLabel({ community: { rank: 4 } }, 5) === "", "Explorer must not derive placement from a visible five-row slice.");
assert(helpers.getSourceDirectoryPerformanceContextLabel(fourth) === "Top 8%", "Explorer must reuse the canonical rank display metadata when available.");

for (const contractNeedle of [
  "get_gie_rank_display_v1",
  "p_rank::numeric * 100 / p_eligible_population",
  "jsonb_array_length(coalesce(analytics -> 'source_reports'",
  "jsonb_array_length(coalesce(analytics -> 'variety_reports'",
  "'contract_version', 'gie-community.v1.1'",
  "'rank_populations'",
  "order by ranked.ordinality",
]) {
  assert(migration.includes(contractNeedle), `The additive GIE rank contract is missing ${contractNeedle}.`);
}

assert(migration.includes("get_gie_rank_display_v1(1, 50") && migration.includes("get_gie_rank_display_v1(2, 50") && migration.includes("get_gie_rank_display_v1(3, 50") && migration.includes("get_gie_rank_display_v1(4, 50"), "Migration-time checks must cover ranks 1, 2, 3, and 4+.");
assert(!migration.includes("order by average_rate") && !migration.includes("dense_rank()") && !migration.includes("row_number()"), "The additive contract must not recalculate ranking or tie logic.");
assert(styles.includes(".canonical-rank-display.is-rank-1") && styles.includes(".canonical-rank-display.is-rank-2") && styles.includes(".canonical-rank-display.is-rank-3"), "Gold, silver, and bronze podium styles must remain distinct.");

console.log("Canonical rank display regression checks passed.");
