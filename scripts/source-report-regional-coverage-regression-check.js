const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase", "migrations", "20260715210000_gie_community_source_coverage_v1.sql"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const canonicalBoundary of [
  "public.get_gie_community_evidence_v1()",
  "public.safe_public_member_profiles",
  "public.get_gie_canonical_result_row_v1",
  "gie-community.v1.2",
  "2026-07-15.2",
  "public.get_gie_community_source_distribution_v1()",
]) {
  assert(migration.includes(canonicalBoundary), `Missing canonical regional boundary: ${canonicalBoundary}`);
}

for (const normalization of [
  "get_gie_normalize_public_country_v1",
  "get_gie_normalize_public_us_region_v1",
  "united states of america",
  "'MA','Massachusetts'",
  "'CA','California'",
  "when 'DE' then 'Germany'",
  "when 'AT' then 'Austria'",
  "when 'CH' then 'Switzerland'",
]) {
  assert(migration.toLowerCase().includes(normalization.toLowerCase()), `Missing canonical location normalization: ${normalization}`);
}

assert(migration.includes("count(distinct evidence_id)") && migration.includes("sum(seed_count)") && migration.includes("count(distinct contributor_id)"), "Regional totals must be aggregated canonically by approved evidence.");
assert(migration.includes("order by item.published_at desc"), "Canonical activity must preserve reverse chronological ordering in GEE.");
assert(migration.includes("'96_100', '96–100%'") && migration.includes("'91_95', '91–95%'") && migration.includes("'86_90', '86–90%'") && migration.includes("'below_85', 'Below 85%'"), "GEE must define all canonical germination distribution buckets.");
assert(migration.includes("'start_percent', start_percent") && migration.includes("'end_percent', end_percent"), "GEE must provide chart-ready canonical donut boundaries.");
assert(!/street|postal|latitude|longitude|coordinates/i.test(migration), "Regional contract must not expose precise location fields.");

const adapterStart = app.indexOf("function normalizeGeeCommunityAnalyticsPayload");
const adapterEnd = app.indexOf("function getCanonicalCommunityAnalytics", adapterStart);
const adapter = app.slice(adapterStart, adapterEnd);
assert(adapter.includes("regionalCoverage: mapRegionalCoverage") && adapter.includes("recentActivity: mapRecentActivity") && adapter.includes("germinationDistribution: mapGerminationDistribution"), "The shared Community adapter must preserve canonical coverage, activity, and distribution.");

const reportStart = app.indexOf("function renderSourceReportDashboardCardHeader");
const reportEnd = app.indexOf("function getSourceCstpReportDetail", reportStart);
const report = app.slice(reportStart, reportEnd);
assert(report.includes('renderSourceReportDashboardCardHeader("Community Coverage")'), "Source Report must use the Community Coverage title.");
assert(report.includes("report?.regionalCoverage") && report.includes("region.mapX") && report.includes("region.mapY"), "The map must render only contract-supplied canonical regions and marker positions.");
assert(report.includes("No regional Community evidence has been published yet."), "The empty map state must remain explicit and neutral.");
assert(!report.includes("Chad Westport") && !report.includes("Massachusetts / MA"), "Source Report must not contain source-specific location behavior.");
assert(!report.includes("GEE Confidence</span>") && !report.includes("report.confidence?.percent"), "Public Source Report UI must not expose numeric confidence.");

console.log("Source Report regional coverage regression checks passed.");
