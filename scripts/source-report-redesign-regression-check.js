const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260713220000_gie_phase2b_group_b_community_analytics.sql"), "utf8");

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
const sourceReport = between(app, "function renderSourceProfilePage", "function getSourceCstpReportDetail");
const sourceReportHelpers = between(app, "function renderSourceReportDashboardCardHeader", "function renderSourceProfilePage");

assert(app.includes('appState.supabase.rpc("get_gie_community_analytics")'), "Source Report must retain the canonical Community RPC.");
assert(adapter.includes("sourceReports: mapReports(analytics?.source_reports"), "Source Report must retain the versioned canonical adapter.");
assert(sourceReport.includes("getCanonicalCommunitySourceReport") && sourceReport.includes('data-gie-community-consumer="source-report"'), "Source Report must consume the canonical adapter.");

for (const label of [
  "Source Report",
  "Community Sessions",
  "Seeds Tested",
  "Average Germination",
  "Varieties Tested",
  "Contributors",
  "Top Performing Varieties",
  "Germination Distribution",
  "Community Performance",
  "Recent Community Activity",
  "Community Confidence Breakdown",
  "Community Coverage",
  "Source Rankings",
  "Powered by <strong>GIE</strong>",
]) {
  assert(sourceReport.includes(label), `Source Report redesign is missing ${label}.`);
}

for (const unavailable of [
  "Canonical germination distribution data is not available for this source.",
  "Canonical recent Community activity is not available for this source.",
  "Canonical performance periods are not available for this source.",
]) {
  assert(sourceReport.includes(unavailable) || sourceReportHelpers.includes(unavailable), `Source Report is missing canonical unavailable state: ${unavailable}`);
}

for (const canonicalEvidence of [
  "renderSourceReportGerminationDistribution(report)",
  "renderSourceReportPerformance(report)",
  "renderSourceReportRecentActivity(report)",
  "renderSourceReportPerformanceLineChart(periods)",
  "Growing Evidence",
  "Based on ${formatPrivateAnalyticsNumber(safeCount)} approved Community",
  "Additional approved reporting periods are required to establish a trend.",
  "Latest approved session",
  "Germinated",
]) {
  assert(sourceReport.includes(canonicalEvidence) || sourceReportHelpers.includes(canonicalEvidence), `Source Report is missing limited-evidence presentation: ${canonicalEvidence}`);
}

assert(adapter.includes("canonicalPresence") && adapter.includes("hasCanonicalValue"), "The Community adapter must preserve canonical field presence for truthful unavailable states.");
assert(!sourceReport.includes("Not enough canonical distribution data.") && !sourceReportHelpers.includes("Not enough canonical distribution data.") && !sourceReport.includes("Not enough approved evidence to display performance trends.") && !sourceReportHelpers.includes("Not enough approved evidence to display performance trends."), "Evidence volume must not trigger Source Report unavailable states.");
assert(!sourceReport.includes("<progress") && !sourceReportHelpers.includes("source-report-result-rate"), "Source Report must not use stretched progress bars as primary visualizations.");
assert(sourceReport.includes("Community Coverage") && sourceReport.includes("renderSourceReportRegionMap(report)"), "The regional world map must consume canonical Source Report coverage.");
assert(sourceReportHelpers.includes("No regional Community evidence has been published yet.") && sourceReportHelpers.includes("/assets/app/source-report/world-map.svg"), "The empty regional state must use the neutral world map and exact limitation copy.");
assert(sourceReportHelpers.includes("source-report-distribution-donut") && sourceReportHelpers.includes("report?.germinationDistribution"), "Distribution must render only chart-ready canonical GIE buckets.");
assert(sourceReport.includes('/assets/images/seed-report-hero-bg.png'), "Source Report hero must use the target seed-report background asset.");
assert(sourceReport.includes("source-report-hero-verification") && sourceReport.includes("Latest evidence"), "Source verification and freshness metadata must sit beneath the hero description.");
assert(sourceReport.includes("Evidence Strength") && !sourceReport.includes("GIE Confidence</span>") && !sourceReport.includes("report.confidence?.percent"), "Public Source Report confidence must use canonical plain-language labels without exposing the internal numeric score.");

const normalizeCommunityPayload = new Function(`${adapter}; return normalizeGieCommunityAnalyticsPayload;`)();
const chadWestportContract = normalizeCommunityPayload({
  analytics: {
    source_reports: [{
      key: "chad-westport",
      label: "Chad Westport",
      sessions: 1,
      evidence_count: 1,
      contributors: 1,
      seeds_tested: 10,
      seeds_germinated: 10,
      germination_rate: 100,
      variety_count: 1,
      latest_at: "2026-07-14T12:00:00.000Z",
      rank: 1,
      confidence: { label: "Growing", percent: 38 },
      source_quality: { status: "Building Evidence", recognized_evidence_only: true },
      top_varieties: [{ key: "canonical-variety", label: "Canonical Variety", sessions: 1, seeds_tested: 10, seeds_germinated: 10, germination_rate: 100, rank: 1 }],
      monthly_trends: [{ key: "2026-07", label: "Jul 2026", session_count: 1, total_seeds: 10, total_germinated: 10, average_rate: 100 }],
      recent_activity: [{ evidence_id: "chad-session", published_at: "2026-07-14T12:00:00.000Z", seeds_tested: 10, seeds_germinated: 10, germination_rate: 100, variety_label: "Canonical Variety" }],
      germination_distribution: { total_seeds: 10, buckets: [
        { key: "96_100", label: "96–100%", session_count: 1, seeds_tested: 10, share_percent: 100, start_percent: 0, end_percent: 100 },
        { key: "91_95", label: "91–95%", session_count: 0, seeds_tested: 0, share_percent: 0, start_percent: 100, end_percent: 100 },
        { key: "86_90", label: "86–90%", session_count: 0, seeds_tested: 0, share_percent: 0, start_percent: 100, end_percent: 100 },
        { key: "below_85", label: "Below 85%", session_count: 0, seeds_tested: 0, share_percent: 0, start_percent: 100, end_percent: 100 },
      ] },
      regional_coverage: { state: "sparse", session_count: 1, seeds_tested: 10, country_count: 1, regions: [{ country_code: "US", country_label: "United States", region_code: "MA", region_label: "Massachusetts", session_count: 1, seeds_tested: 10, contributor_count: 1, map_x: 29, map_y: 33 }] },
    }],
  },
});
const chadWestportReport = chadWestportContract.analytics.sourceReports[0];
assert(chadWestportReport.sessionCount === 1, "A single canonical Chad Westport session must survive adapter normalization.");
assert(chadWestportReport.totalSeeds === 10 && chadWestportReport.totalGerminated === 10 && chadWestportReport.averageRate === 100, "Canonical Chad Westport result totals must survive adapter normalization.");
assert(chadWestportReport.varietyCount === 1 && chadWestportReport.relationships.length === 1 && chadWestportReport.monthlyTrends.length === 1, "Canonical Chad Westport variety and period evidence must survive adapter normalization.");
assert(chadWestportReport.confidence.label === "Growing" && chadWestportReport.performanceRank === 1 && chadWestportReport.latestAt, "Canonical Chad Westport confidence, rank, and latest evidence must survive adapter normalization.");
assert(chadWestportReport.germinationDistribution.totalSeeds === 10 && chadWestportReport.germinationDistribution.buckets.length === 4, "Canonical Chad Westport distribution must survive adapter normalization.");
assert(Object.values(chadWestportReport.canonicalPresence).every(Boolean), "The Chad Westport fixture must retain canonical presence metadata for every supplied field.");

const sourceReportRenderers = new Function(
  "escapeHtml",
  "renderMySessionsInlineIconMarkup",
  "formatPrivateAnalyticsNumber",
  "formatPrivateAnalyticsPercent",
  "renderCommunityInsightsTrendChart",
  "parseCompletedAtValue",
  `${sourceReportHelpers}; return { renderSourceReportGerminationDistribution, renderSourceReportPerformance, renderSourceReportPerformanceLineChart, renderSourceReportRecentActivity, renderSourceReportRegionMap, renderSourceReportTopVarietiesTable, renderSourceReportRankingsTable };`,
)(
  (value) => String(value),
  () => "<svg></svg>",
  (value) => String(Number(value)),
  (value) => `${Number(value)}%`,
  (_title, rows) => `<div data-period-count="${rows.length}"></div>`,
  (value) => new Date(value),
);
const chadDistributionMarkup = sourceReportRenderers.renderSourceReportGerminationDistribution(chadWestportReport);
const chadPerformanceMarkup = sourceReportRenderers.renderSourceReportPerformance(chadWestportReport);
const chadActivityMarkup = sourceReportRenderers.renderSourceReportRecentActivity(chadWestportReport);
const emptyRegionMarkup = sourceReportRenderers.renderSourceReportRegionMap();
const chadRegionMarkup = sourceReportRenderers.renderSourceReportRegionMap(chadWestportReport);
const chadVarietiesMarkup = sourceReportRenderers.renderSourceReportTopVarietiesTable(chadWestportReport, "#sources/chad-westport");
assert(chadDistributionMarkup.includes("source-report-distribution-donut") && chadDistributionMarkup.includes("#7ed957 0% 100%"), "One-session Chad Westport evidence must render a fully populated canonical donut segment.");
assert(chadDistributionMarkup.includes("96–100%") && chadDistributionMarkup.includes("91–95%") && chadDistributionMarkup.includes("86–90%") && chadDistributionMarkup.includes("Below 85%"), "The canonical donut must render all four legend buckets.");
assert((chadDistributionMarkup.match(/100%/g) || []).length >= 2 && (chadDistributionMarkup.match(/0%/g) || []).length >= 3, "Chad Westport must show one 100% bucket and three empty buckets.");
assert(!chadDistributionMarkup.includes("not available") && !chadDistributionMarkup.includes("source-report-contract-limitation"), "Sparse canonical distribution evidence must never render the placeholder.");
assert(chadPerformanceMarkup.includes("source-report-line-chart is-sparse") && chadPerformanceMarkup.includes("<circle") && !chadPerformanceMarkup.includes("<polyline") && chadPerformanceMarkup.includes("Jul 2026") && chadPerformanceMarkup.includes("Additional approved reporting periods are required to establish a trend."), "A single canonical performance period must render as one real plotted point without fabricating a line.");
assert(!chadPerformanceMarkup.includes("Approved Sessions") && !chadPerformanceMarkup.includes("Seeds Tested") && !chadPerformanceMarkup.includes("source-report-sparse-chart-metrics"), "Sparse performance must not repeat the top-row metrics.");
assert(chadActivityMarkup.includes("Approved Community session") && chadActivityMarkup.includes("100% germination") && chadActivityMarkup.includes("Canonical Variety") && chadActivityMarkup.includes("Based on 1 approved Community session."), "Canonical one-session activity must render its event result, variety, and limited-evidence guidance.");
assert(emptyRegionMarkup.includes("world-map.svg") && emptyRegionMarkup.includes("No regional Community evidence has been published yet.") && !emptyRegionMarkup.includes("unavailable"), "The empty regional state must keep the neutral world map visible.");
assert(chadRegionMarkup.includes("Massachusetts") && chadRegionMarkup.includes("United States") && chadRegionMarkup.includes("1 approved session") && !chadRegionMarkup.includes("No regional Community evidence"), "Sparse Massachusetts coverage must render from canonical regional data.");
assert(chadVarietiesMarkup.includes("Canonical Variety") && chadVarietiesMarkup.includes("100%"), "Canonical varieties must render even when only one session exists.");
assert(!chadDistributionMarkup.includes("not available") && !chadPerformanceMarkup.includes("not available") && !chadActivityMarkup.includes("not available") && !chadVarietiesMarkup.includes("not available"), "Present one-session canonical evidence must never render as unavailable.");

const multiPeriodMarkup = sourceReportRenderers.renderSourceReportPerformanceLineChart([
  { key: "2026-06", label: "Jun 2026", averageRate: 80 },
  { key: "2026-07", label: "Jul 2026", averageRate: 100 },
]);
assert(multiPeriodMarkup.includes("<polyline") && (multiPeriodMarkup.match(/<circle/g) || []).length === 2 && multiPeriodMarkup.includes("Jun 2026") && multiPeriodMarkup.includes("Jul 2026"), "Multiple canonical periods must render as an actual multi-point line chart.");
assert(!multiPeriodMarkup.includes("community-insights-trend-bar"), "Source Report performance must not fall back to oversized bar capsules.");

const matureDistributionMarkup = sourceReportRenderers.renderSourceReportGerminationDistribution({
  germinationDistribution: { totalSeeds: 100, buckets: [
    { key: "96_100", label: "96–100%", seedsTested: 40, sharePercent: 40, startPercent: 0, endPercent: 40 },
    { key: "91_95", label: "91–95%", seedsTested: 30, sharePercent: 30, startPercent: 40, endPercent: 70 },
    { key: "86_90", label: "86–90%", seedsTested: 20, sharePercent: 20, startPercent: 70, endPercent: 90 },
    { key: "below_85", label: "Below 85%", seedsTested: 10, sharePercent: 10, startPercent: 90, endPercent: 100 },
  ] },
});
assert(matureDistributionMarkup.includes("#7ed957 0% 40%") && matureDistributionMarkup.includes("#ffbf2f 40% 70%") && matureDistributionMarkup.includes("#ff9d1c 70% 90%") && matureDistributionMarkup.includes("#ff563f 90% 100%"), "Mature canonical evidence must retain the full four-segment donut.");

const emptyReport = { canonicalPresence: {}, relationships: [], monthlyTrends: [] };
assert(sourceReportRenderers.renderSourceReportGerminationDistribution(emptyReport).includes("Canonical germination distribution data is not available"), "Empty distribution must render unavailable only when canonical buckets are absent.");
assert(sourceReportRenderers.renderSourceReportPerformance(emptyReport).includes("Canonical performance periods are not available"), "Empty performance must render unavailable only when canonical periods are absent.");
assert(sourceReportRenderers.renderSourceReportRecentActivity(emptyReport).includes("Canonical recent Community activity is not available"), "Empty activity must render unavailable only when the canonical latest record is absent.");
assert(sourceReportRenderers.renderSourceReportTopVarietiesTable(emptyReport).includes("No approved canonical variety evidence"), "Empty Top Performing Varieties must render its honest empty state.");
assert(sourceReportRenderers.renderSourceReportRankingsTable(emptyReport, []).includes("Not enough approved evidence to display source rankings"), "Empty Source Rankings must render its honest empty state.");

for (const forbidden of [
  "getSessions(",
  "getApprovedPublicGallerySnapshots(",
  "buildGalleryLeaderboardEntries(",
  ".reduce(",
  ".sort(",
  "Community Score",
  "Letter Grade",
  "source-report-cstp",
]) {
  assert(!sourceReport.includes(forbidden) && !sourceReportHelpers.includes(forbidden), `Source Report contains forbidden local or retired UI behavior: ${forbidden}`);
}

assert(!app.includes("Community Analytics Contract"), "User-facing Analytics Contract copy must be retired.");
assert(styles.includes(".source-report-dashboard") && styles.includes("max-width: 1200px;"), "Source Report must retain the compact 1200px dashboard layout.");
assert(styles.includes("@media (max-width: 560px)") && styles.includes(".source-report-snapshot-grid { grid-template-columns: 1fr; }"), "Source Report must retain its single-column mobile layout.");
assert(styles.includes(".source-report-line-chart.is-sparse") && !styles.includes(".source-report-sparse-chart-metrics"), "Source Report must style the real one-point state without retaining duplicate sparse metric cards.");
assert(styles.includes(".source-report-hero-verification") && styles.includes(".source-report-hero-evidence-strength"), "Source Report must retain its premium hero and plain-language confidence presentation system.");
assert(styles.includes(".source-report-region-map") && styles.includes(".source-report-region-map-message"), "Source Report must style the always-visible regional map state.");
assert(!styles.includes(".source-report-result-rate"), "Source Report styles must not retain the stretched result-rate visualization.");

for (const eligibilityRule of [
  "lower(coalesce(status, '')) = 'approved'",
  "coalesce(is_published, false) = true",
  "coalesce(analytics_excluded, false) = false",
  "public.get_gie_scoped_result_rows_v1('community', null)",
]) {
  assert(migration.includes(eligibilityRule), `Canonical GIE eligibility rule is missing: ${eligibilityRule}`);
}

console.log("Source Report redesign regression checks passed.");
