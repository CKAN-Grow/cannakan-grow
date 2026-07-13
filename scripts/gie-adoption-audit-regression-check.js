const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const docs = fs.readFileSync(path.join(root, "docs", "architecture", "grow-intelligence-engine.md"), "utf8");
const browserConfig = fs.readFileSync(path.join(root, "supabase-config.js"), "utf8");
const buildConfig = fs.readFileSync(path.join(root, "scripts", "build-config.mjs"), "utf8");

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

const consumers = [
  ["Home", "⚠ Compatibility Wrapper"],
  ["Sessions", "❌ Legacy"],
  ["Session Analytics", "❌ Legacy"],
  ["Community", "❌ Legacy"],
  ["Community Reports", "❌ Legacy"],
  ["Seed Explorer", "✅ Uses GIE"],
  ["Source Explorer", "✅ Uses GIE"],
  ["Variety Reports", "✅ Uses GIE"],
  ["Source Reports", "❌ Legacy"],
  ["Profile", "❌ Legacy"],
  ["Grow Network", "❌ Legacy"],
  ["Seed Vault summaries", "❌ Legacy"],
  ["Admin", "❌ Legacy"],
  ["Grow Intelligence Health", "✅ Uses GIE"],
  ["Rankings", "❌ Legacy"],
  ["Leaderboards", "❌ Legacy"],
  ["Community Confidence", "⚠ Compatibility Wrapper"],
  ["Recommendations", "❌ Legacy"],
  ["AI integration hooks", "⚠ Compatibility Wrapper"],
  ["Cached aggregate / RPC compatibility", "⚠ Compatibility Wrapper"],
];

for (const [consumer, status] of consumers) {
  assert(docs.includes(`| ${consumer} | ${status} |`), `Missing adoption classification for ${consumer}.`);
}
assert(consumers.filter(([, status]) => status === "✅ Uses GIE").length === 4, "Strict adoption numerator changed; update the documented audit percentage.");
assert(docs.includes("4 of 20 audited consumer groups") && docs.includes("(20%)"), "Strict GIE adoption percentage is missing or stale.");
assert(docs.includes("No analytics without GIE."), "Permanent GIE development rule is missing.");

const aggregateAdapter = getBetween(app, "function buildExplorerCompletedSessionAggregate", "function getSeedExplorerRecords");
const normalizer = getBetween(app, "function normalizeExplorerCompletedSessionAggregatePayload", "function buildExplorerAggregateFromCachedPayload");
const cachedAdapter = getBetween(app, "function buildExplorerAggregateFromCachedPayload", "function isExplorerRouteActive");

assert(aggregateAdapter.includes("buildExplorerAggregateFromCachedPayload(appState.explorerCompletedSessionAggregate)"), "Explorer must read the cached GIE payload.");
assert(!aggregateAdapter.includes("getSessions(") && !aggregateAdapter.includes(".reduce(") && !aggregateAdapter.includes("getSessionResultSummary"), "Explorer must not contain a local analytics fallback.");
assert(!app.includes("function getExplorerAggregateEligibleCompletedSessions"), "Obsolete local Explorer aggregate eligibility collector must remain removed.");
assert(!normalizer.includes("Math.round((totalGerminated / seedsTracked)") && !normalizer.includes("getSourceDirectoryCommunityConfidenceLabel({ communitySessions"), "GIE payload normalization must not recalculate rates or confidence.");
assert(cachedAdapter.includes("engineVersion: normalizedPayload.engineVersion") && cachedAdapter.includes("schemaVersion: normalizedPayload.schemaVersion") && cachedAdapter.includes("dataQualityVersion: normalizedPayload.dataQualityVersion"), "Cached consumers must share canonical engine/schema/data-quality versions.");

for (const legacyHelper of [
  "calculateProfileAnalyticsFromOwnerSessions",
  "calculateProfileAnalyticsFromPublicSnapshots",
  "buildCommunityInsightsState",
  "buildSeedVaultAnalytics",
  "buildPrivateAnalyticsDashboardState",
  "renderMySessionsAnalyticsPanelMarkup",
  "buildHomeGalleryRankingsTeaserState",
  "getSourceDirectoryTrustScore",
]) {
  assert(app.includes(`function ${legacyHelper}`), `Known legacy helper ${legacyHelper} changed; update the adoption audit.`);
}

const canonicalRpcCalls = app.match(/appState\.supabase\.rpc\("get_grow_intelligence_engine_analytics"\)/g) || [];
assert(canonicalRpcCalls.length === 1, "Browser code should have one canonical GIE request implementation.");
assert(browserConfig.includes("anonKey") && !/service.?role|secret.?key/i.test(browserConfig), "Browser config must contain only a public anon/publishable key slot.");
assert(buildConfig.includes("CANNAKAN_SUPABASE_ANON_KEY") && !/SERVICE_ROLE|SECRET_KEY/.test(buildConfig), "Client build config must never read server secrets.");
assert(!/SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY/.test(app), "Browser application code must not reference service-role or secret keys.");

console.log("GIE adoption audit regression checks passed (20% strict adoption; 12 known legacy consumer groups)." );
