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
  "Source Rankings",
  "Powered by <strong>GIE</strong>",
]) {
  assert(sourceReport.includes(label), `Source Report redesign is missing ${label}.`);
}

for (const unavailable of [
  "Canonical germination result data is not available for this source.",
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
  "Trend unavailable until additional evidence is collected.",
  "Latest approved session",
  "Germinated",
]) {
  assert(sourceReport.includes(canonicalEvidence) || sourceReportHelpers.includes(canonicalEvidence), `Source Report is missing limited-evidence presentation: ${canonicalEvidence}`);
}

assert(adapter.includes("canonicalPresence") && adapter.includes("hasCanonicalValue"), "The Community adapter must preserve canonical field presence for truthful unavailable states.");
assert(!sourceReport.includes("Not enough canonical distribution data.") && !sourceReportHelpers.includes("Not enough canonical distribution data.") && !sourceReport.includes("Not enough approved evidence to display performance trends.") && !sourceReportHelpers.includes("Not enough approved evidence to display performance trends."), "Evidence volume must not trigger Source Report unavailable states.");
assert(!sourceReport.includes("<progress") && !sourceReportHelpers.includes("source-report-result-rate"), "Source Report must not use stretched progress bars as primary visualizations.");
assert(!sourceReport.includes("Community Growth by Region") && !sourceReport.includes("Canonical regional data is not available for this source."), "Unsupported regional data must not occupy an oversized placeholder card.");

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
    }],
  },
});
const chadWestportReport = chadWestportContract.analytics.sourceReports[0];
assert(chadWestportReport.sessionCount === 1, "A single canonical Chad Westport session must survive adapter normalization.");
assert(chadWestportReport.totalSeeds === 10 && chadWestportReport.totalGerminated === 10 && chadWestportReport.averageRate === 100, "Canonical Chad Westport result totals must survive adapter normalization.");
assert(chadWestportReport.varietyCount === 1 && chadWestportReport.relationships.length === 1 && chadWestportReport.monthlyTrends.length === 1, "Canonical Chad Westport variety and period evidence must survive adapter normalization.");
assert(chadWestportReport.confidence.label === "Growing" && chadWestportReport.performanceRank === 1 && chadWestportReport.latestAt, "Canonical Chad Westport confidence, rank, and latest evidence must survive adapter normalization.");
assert(Object.values(chadWestportReport.canonicalPresence).every(Boolean), "The Chad Westport fixture must retain canonical presence metadata for every supplied field.");

const sourceReportRenderers = new Function(
  "escapeHtml",
  "renderMySessionsInlineIconMarkup",
  "formatPrivateAnalyticsNumber",
  "formatPrivateAnalyticsPercent",
  "renderCommunityInsightsTrendChart",
  "parseCompletedAtValue",
  `${sourceReportHelpers}; return { renderSourceReportGerminationDistribution, renderSourceReportPerformance, renderSourceReportPerformanceLineChart, renderSourceReportRecentActivity, renderSourceReportTopVarietiesTable };`,
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
const chadVarietiesMarkup = sourceReportRenderers.renderSourceReportTopVarietiesTable(chadWestportReport, "#sources/chad-westport");
assert(chadDistributionMarkup.includes("10") && chadDistributionMarkup.includes("Germinated") && chadDistributionMarkup.includes("100%") && chadDistributionMarkup.includes("Growing Evidence"), "One-session canonical result evidence must render in Germination Distribution.");
assert(chadPerformanceMarkup.includes("source-report-growing-evidence-card") && chadPerformanceMarkup.includes("Jul 2026") && chadPerformanceMarkup.includes("Trend unavailable until additional evidence is collected."), "A single canonical performance period must render as a compact Growing Evidence summary without fabricating a trend.");
assert(chadActivityMarkup.includes("Latest approved session") && chadActivityMarkup.includes("10 germinated") && chadActivityMarkup.includes("Based on 1 approved Community session."), "Latest one-session canonical activity must render with limited-evidence guidance.");
assert(chadVarietiesMarkup.includes("Canonical Variety") && chadVarietiesMarkup.includes("100%"), "Canonical varieties must render even when only one session exists.");
assert(!chadDistributionMarkup.includes("not available") && !chadPerformanceMarkup.includes("not available") && !chadActivityMarkup.includes("not available") && !chadVarietiesMarkup.includes("not available"), "Present one-session canonical evidence must never render as unavailable.");

const multiPeriodMarkup = sourceReportRenderers.renderSourceReportPerformanceLineChart([
  { key: "2026-06", label: "Jun 2026", averageRate: 80 },
  { key: "2026-07", label: "Jul 2026", averageRate: 100 },
]);
assert(multiPeriodMarkup.includes("<polyline") && multiPeriodMarkup.includes("Jun 2026") && multiPeriodMarkup.includes("Jul 2026"), "Multiple canonical periods must render as an actual line chart.");
assert(!multiPeriodMarkup.includes("community-insights-trend-bar"), "Source Report performance must not fall back to oversized bar capsules.");

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
assert(styles.includes(".source-report-growing-evidence-card") && styles.includes(".source-report-line-chart"), "Source Report must style compact one-period evidence and multi-period line-chart states.");
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
