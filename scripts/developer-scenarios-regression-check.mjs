import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const app = read("app.js");
const fixture = read("fixtures/seed-vault-preview.js");
const build = read("scripts/build-config.mjs");
const styles = read("styles.css");
const indexHtml = read("index.html");
const serviceWorker = read("service-worker.js");
const localServer = read("local-server.ps1");

const gateStart = app.indexOf("function isApprovedDeveloperScenariosEnvironment()");
const gateEnd = app.indexOf("\nfunction isDeveloperPreviewAllowed()", gateStart);
const gateSource = app.slice(gateStart, gateEnd);
const evaluateGate = ({ hostname, explicitFlag = false, authReady = false, user = null, founderMembership = false, accessLevel = "none" }) => Function(
  "window",
  "appState",
  "getAdminAccessLevel",
  `${gateSource}; return canUseDeveloperScenarios();`,
)(
  { location: { hostname }, CANNAKAN_SUPABASE_CONFIG: { devPreviewDataEnabled: explicitFlag } },
  { authReady, authSession: user ? { user } : null, currentUserFounderMembership: founderMembership },
  () => ({ level: accessLevel }),
);
const fullGrowStart = app.indexOf("function buildFullGrowDemoGraph()");
const fullGrowEnd = app.indexOf("\nfunction validateFullGrowDemoGraph(", fullGrowStart);
const fullGrowSource = app.slice(fullGrowStart, fullGrowEnd);
const snapshotCatalogStart = app.indexOf("const DEMO_SNAPSHOT_IMAGE_URLS");
const snapshotCatalogEnd = app.indexOf("\n]);", snapshotCatalogStart);
const snapshotCatalogSource = app.slice(snapshotCatalogStart, snapshotCatalogEnd);
const localImageAssetPattern = /\/(?:assets|src\/assets)\/[^\s"'`)]+?\.(?:png|jpe?g|webp|gif|svg|avif)(?:\?[^\s"'`)]*)?/gi;
const localImageAssetUrls = [...new Set([app, fixture, styles, indexHtml]
  .flatMap((source) => [...source.matchAll(localImageAssetPattern)].map((match) => match[0])))]
  .sort();
const localImageAssetExists = (url) => {
  const pathname = decodeURIComponent(String(url || "").split(/[?#]/, 1)[0]).replace(/^\/+/, "");
  return existsSync(resolve(process.cwd(), pathname)) || existsSync(resolve(process.cwd(), "public", pathname));
};
const missingLocalImageAssets = localImageAssetUrls.filter((url) => !localImageAssetExists(url));
const snapshotCatalogFileNames = new Set([...snapshotCatalogSource.matchAll(/\/assets\/demo\/snapshots\/([^"']+?\.(?:jpe?g|png|webp))/gi)]
  .map((match) => decodeURIComponent(match[1])));
const dynamicFullGrowSnapshotFileNames = [...new Set([...fullGrowSource.matchAll(/["']([^"'/]+?\.(?:jpe?g|png|webp))["']/gi)]
  .map((match) => match[1]))];
const uncataloguedFullGrowSnapshotFileNames = dynamicFullGrowSnapshotFileNames.filter((fileName) => !snapshotCatalogFileNames.has(fileName));
const authStart = app.indexOf("async function handleAuthSession(");
const authEnd = app.indexOf("\nasync function loadUserSessions(", authStart);
const authSource = app.slice(authStart, authEnd);

const fixtureContext = { globalThis: {} };
vm.runInNewContext(fixture, fixtureContext);
const seedRegistry = fixtureContext.globalThis.CANNAKAN_SEED_VAULT_PREVIEW_FIXTURES;
const fixturesAreFrozen = Object.isFrozen(seedRegistry)
  && Object.isFrozen(seedRegistry.sets)
  && Object.isFrozen(seedRegistry.sets.small.entries)
  && Object.isFrozen(seedRegistry.sets.small.entries[0]);

const featuredSessionSelectorStart = app.indexOf("function getFullGrowDemoFeaturedCurrentSessionId(");
const featuredSessionSelectorEnd = app.indexOf("\nfunction getHomeCurrentSessionCompanionState(", featuredSessionSelectorStart);
const featuredSessionSelectorSource = app.slice(featuredSessionSelectorStart, featuredSessionSelectorEnd);
const createFeaturedSessionSelector = (unifiedActive) => Function(
  "isUnifiedDeveloperScenarioActive",
  "getVisibleUserSessions",
  "normalizeGrowSessionLifecycleState",
  "normalizeMethodType",
  `${featuredSessionSelectorSource}; return getFullGrowDemoFeaturedCurrentSessionId;`,
)(
  () => unifiedActive,
  (sessions) => sessions,
  (session) => session.lifecycle,
  (method) => String(method || "").trim().toUpperCase(),
);
const fullGrowFeaturedSelector = createFeaturedSessionSelector(true);
const fullGrowPreferredSessionId = fullGrowFeaturedSelector([
  { id: "rockwool", sessionName: "Blue Ridge Berry Rockwool Demo", systemType: "ROCKWOOL", lifecycle: "active" },
  { id: "kan-fallback", sessionName: "Thai Stick KAN Demo", systemType: "KAN", lifecycle: "active" },
  { id: "kan-inactive", sessionName: "Jack Herer KAN Demo", systemType: "KAN", lifecycle: "completed" },
  { id: "kan-preferred", sessionName: "Jack Herer KAN Demo", systemType: "KAN", lifecycle: "active" },
]);
const fullGrowFallbackSessionId = fullGrowFeaturedSelector([
  { id: "rockwool", sessionName: "Blue Ridge Berry Rockwool Demo", systemType: "ROCKWOOL", lifecycle: "active" },
  { id: "kan-fallback", sessionName: "Thai Stick KAN Demo", systemType: "KAN", lifecycle: "active" },
]);
const liveFeaturedSessionId = createFeaturedSessionSelector(false)([
  { id: "kan-live", sessionName: "Jack Herer KAN Demo", systemType: "KAN", lifecycle: "active" },
]);
const checks = [
  ["scenarios default off", app.includes("const DEVELOPER_SCENARIOS_DEFAULT_ENABLED = false;")],
  ["Live Data is the local control default", app.includes('LIVE: "live"') && app.includes("developerScenarioMode: DEVELOPER_SCENARIO_MODES.LIVE") && app.includes('DEVELOPER_UNIFIED_SCENARIO_ID = "full-grow-demo"')],
  ["Full Grow Demo shared graph", app.includes("function buildFullGrowDemoGraph()") && app.includes("function getFullGrowDemoGraph()")],
  ["Full Grow Demo featured Current Session prefers active KAN", featuredSessionSelectorStart >= 0 && featuredSessionSelectorEnd > featuredSessionSelectorStart && fullGrowPreferredSessionId === "kan-preferred" && fullGrowFallbackSessionId === "kan-fallback" && liveFeaturedSessionId === "" && app.includes("selectedSessionId: getFullGrowDemoFeaturedCurrentSessionId(activeSessions)")],
  ["cross-module graph validation", app.includes("function validateFullGrowDemoGraph(") && app.includes("graph.communitySnapshots.forEach") && app.includes("graph.reportProjections.sources.forEach") && app.includes("graph.collectionMemberships.some")],
  ["Full Grow Demo fixture scale", app.includes("graph.sessions.length + drafts.length !== 23") && app.includes("graph.vaultEntries.length !== 50") && app.includes("Array.from({ length: 180 }") && app.includes("graph.activeSessions.length !== 4")],
  ["Full Grow Demo content breadth", app.includes('"Northern Lights Collective"') && app.includes('"Sunset Auto Test 3"') && app.includes("communityEvidenceIndexes") && app.includes("seedTypeRows")],
  ["Preview Studio local image assets resolve", localImageAssetUrls.length > 0 && missingLocalImageAssets.length === 0],
  ["Full Grow Demo dynamic snapshots use the tracked catalog", snapshotCatalogFileNames.size > 0 && uncataloguedFullGrowSnapshotFileNames.length === 0],
  ["cache-busted local image requests resolve by pathname", localServer.includes("$requestUri.AbsolutePath") && !localServer.includes('$path = ($requestLine -split " ")[1]')],
  ["KAN flagship data composition", app.includes('index < 144 ? "KAN"') && app.includes('Array.from({ length: 23 }') && app.includes('completedKanShare < 0.75') && app.includes('"KAN Evidence Leader"')],
  ["Full Grow Demo Rockwool composition", fullGrowSource.includes('["ROCKWOOL", 6') && fullGrowSource.includes('method: "ROCKWOOL", status: "soaking"') && fullGrowSource.includes('index < 152 ? "ROCKWOOL"') && !fullGrowSource.includes('"TRA"') && !fullGrowSource.includes("TRā")],
  ["Full Grow Demo rejects TRā presentation records", app.includes('presentationMethods.includes("TRA")') && app.includes("Full Grow Demo must not contain TRā presentation records.")],
  ["rankings remain data-derived", !app.includes("showcaseSourceBonus") && !app.includes("methodPenalty")],
  ["Full Grow Demo report density", app.includes("mergeMonthlyTrends") && app.includes("mergeRegionalCoverage") && app.includes("mergeRecentActivity") && app.includes("germinationDistribution: makeDistribution")],
  ["Full Grow Demo Explore projection memoized", app.includes('getCachedDeveloperScenarioFixtures("fullGrowDemoExploreProvider", buildProvider)')],
  ["Full Grow Demo supply projection", app.includes("supplyTracking: { count: 84") && app.includes("getFullGrowDemoGraph().supplyTracking")],
  ["three-mode scenario control", app.includes(">Live Data</button>") && app.includes("Full Grow Demo <span") && app.includes(">Mix &amp; Match</button>") && app.includes("One synchronized, fully populated sample ecosystem across Grow.")],
  ["legacy module-state migration", app.includes("function migrateDeveloperScenarioMode(") && app.includes("hasLegacyModuleSelection ? DEVELOPER_SCENARIO_MODES.MIXED")],
  ["unified module selections masked", app.includes("if (isUnifiedDeveloperScenarioActive())") && app.includes('return "live";')],
  ["unified provider invariant", app.includes("function assertUnifiedDeveloperScenarioProvider(") && app.includes('error.code = "DEVELOPER_SCENARIO_UNIFIED_PROVIDER_MISMATCH"')],
  ["Full Grow Demo banner is explicit", app.includes("PREVIEW STUDIO — FULL GROW DEMO — SAMPLE DATA — NOTHING WILL BE SAVED")],
  ["single versioned preference key", app.includes('const DEVELOPER_SCENARIOS_STORAGE_KEY = "grow_developer_scenarios_v1";')],
  ["authoritative eligibility helper", app.includes("function canUseDeveloperScenarios()") && app.includes("function isApprovedDeveloperScenariosEnvironment()")],
  ["localhost accepted at runtime", evaluateGate({ hostname: "localhost" }) === true && evaluateGate({ hostname: "127.0.0.1" }) === true],
  ["hosted authenticated Founder accepted", evaluateGate({ hostname: "grow.cannakan.com", authReady: true, user: { id: "founder-user" }, founderMembership: true, accessLevel: "founder" }) === true],
  ["hosted non-Founder admin denied", evaluateGate({ hostname: "grow.cannakan.com", authReady: true, user: { id: "admin-user" }, accessLevel: "admin" }) === false],
  ["hosted normal user denied", evaluateGate({ hostname: "grow.cannakan.com", authReady: true, user: { id: "normal-user" }, accessLevel: "none" }) === false],
  ["hosted anonymous user denied", evaluateGate({ hostname: "grow.cannakan.com" }) === false],
  ["auth loading denied", evaluateGate({ hostname: "grow.cannakan.com", user: { id: "founder-user" }, founderMembership: true, accessLevel: "founder" }) === false],
  ["production explicit flag cannot bypass authorization", evaluateGate({ hostname: "grow.cannakan.com", explicitFlag: true }) === false && evaluateGate({ hostname: "www.grow.cannakan.com", explicitFlag: true }) === false],
  ["durable Founder result required", app.includes("appState.currentUserFounderMembership !== true") && app.includes('level === "founder"')],
  ["authorization loss clears and hides scenarios", authSource.includes("resetSessionScopedAppState();") && authSource.includes("if (!canUseDeveloperScenarios())") && authSource.includes("readDeveloperScenariosState({ force: true });") && authSource.includes("syncDeveloperScenariosUi();")],
  ["Seed Vault provider boundary", app.includes("function getActiveSeedVaultProvider()")],
  ["Sessions provider boundary", app.includes("function getSessionProvider()")],
  ["Profile provider boundary", app.includes("function getProfileProvider()")],
  ["Community provider boundary", app.includes("function getCommunityProvider(")],
  ["Explore provider boundary", app.includes("function getExploreProvider()")],
  ["scenario analytics adapters", app.includes("function buildSessionScenarioAnalytics(") && app.includes("function buildCommunityScenarioAnalytics(") && app.includes("function buildExploreScenarioAggregate(")],
  ["scenario fixture contract validation", app.includes("function validateDeveloperScenarioRecords(") && app.includes("DEVELOPER_SCENARIO_FIXTURE_INVALID")],
  ["owner analytics use scenario provider", app.includes('if (shouldUseDeveloperScenarioProvider("sessions"))') && app.includes("return getSessionProvider().analytics;")],
  ["community analytics use scenario provider", app.includes("return getCommunityProvider().analytics;")],
  ["Explore analytics use scenario provider", app.includes("return getExploreProvider().aggregate;") && app.includes('Preview Studio — Sample Explore Analytics')],
  ["scenario analytics skip live GEE loaders", app.includes('async function loadGeeOwnerAnalytics') && app.includes('async function loadGeeCommunityAnalytics') && app.includes('async function loadExplorerCompletedSessionAggregate')],
  ["provider scope excludes admin and unrelated reports", app.includes("function shouldUseDeveloperScenarioProvider(") && app.includes("isAdminAreaRawRoute()")],
  ["central write guard", app.includes("function assertDeveloperScenarioWritesAllowed(")],
  ["session writes guarded", app.includes('assertDeveloperScenarioWritesAllowed("sessions", "create a session", session);')],
  ["profile writes guarded", app.includes('assertDeveloperScenarioWritesAllowed("profile", "save profile changes", profileInput);')],
  ["community writes guarded", app.includes('assertDeveloperScenarioWritesAllowed("community", "publish to Community", [session, snapshotData]);')],
  ["Seed Vault writes guarded", app.includes('assertDeveloperScenarioWritesAllowed("seedVault", "save Seed Vault entries", entries);')],
  ["preview records explicitly tagged", app.includes("isPreview: true") && app.includes('scenarioSource: "developer-scenarios"')],
  ["fixtures cloned before use", app.includes("cloneDeveloperScenarioValue(fixtures[selection]")],
  ["fixtures deeply frozen", app.includes("deepFreezeDeveloperScenarioValue(builder())") && fixturesAreFrozen],
  ["stale production preference cleared before read", app.indexOf("localStorage.removeItem(DEVELOPER_SCENARIOS_STORAGE_KEY)") < app.indexOf("localStorage.getItem(DEVELOPER_SCENARIOS_STORAGE_KEY)")],
  ["persistent sample-data warning", app.includes("PREVIEW STUDIO — FULL GROW DEMO — SAMPLE DATA — NOTHING WILL BE SAVED") && app.includes("PREVIEW STUDIO — MIX & MATCH — SAMPLE DATA — NOTHING WILL BE SAVED")],
  ["live data reset", app.includes("function returnToLiveData()")],
  ["production build safeguard", build.includes("Developer Scenarios must remain disabled by default in production builds.")],
  ["responsive control styles", styles.includes(".developer-scenarios-panel") && styles.includes(".developer-scenarios-mode") && styles.includes("@media (max-width: 640px)") && styles.includes(".session-progress-companion-roadmap")],
  ["legacy Dev Mode UI and handlers removed", !app.includes("Mock Community Grow data") && !app.includes("Reset & Reseed Demo") && !app.includes("renderMockDataAdminSection") && !app.includes("setMockDataEnabledAndRefresh")],
  ["legacy Dev Mode CSS removed", !styles.includes(".mock-data-admin-section") && !styles.includes(".mock-data-toggle") && !styles.includes(".mock-data-banner")],
  ["legacy local state cleanup", app.includes("function clearLegacyDevModeState()") && app.includes("LEGACY_DEV_MODE_STORAGE_KEYS") && app.indexOf("clearLegacyDevModeState();") < app.indexOf('[Cannakan App Init] start')],
  ["Shift+D is panel-only", app.includes("appState.developerScenariosPanelOpen = !appState.developerScenariosPanelOpen;") && app.includes("&& canUseDeveloperScenarios()") && !app.includes("setMockDataEnabledAndRefresh")],
  ["authoritative app-shell generation", serviceWorker.includes("cannakan-grow-shell-v36-grow-companion-capability-1") && serviceWorker.includes('"/src/grow-companion-contract.js"') && indexHtml.includes("/src/grow-companion-contract.js?v=20260721-grow-companion-capability-1") && indexHtml.includes("/profile-hero-catalog-data.js?v=20260720-profile-hero-metadata") && indexHtml.includes("/styles.css?v=20260722-grow-companion-capability-1") && indexHtml.includes("/app.js?v=20260722-grow-companion-capability-1")],
  ["Inventory 2.0 lazy profile rendering", app.includes("function renderSeedVaultExpandedProfileMarkup(") && app.includes("seed-vault-entry-details--lazy") && app.includes("function openSeedVaultQuickPeek(")],
  ["Inventory 2.0 collection context", app.includes("function getSeedVaultBrowseContext(") && app.includes("function renderSeedVaultBrowseContextMarkup(") && app.includes("data-seed-vault-clear-collection-context")],
  ["Inventory 2.0 responsive presentation", styles.includes("Seed Vault Inventory 2.0: premium library browsing") && styles.includes(".seed-vault-expanded-profile") && styles.includes(".seed-vault-quick-peek-overlay") && styles.includes("@media (max-width: 560px)")],
];

const failures = checks.filter(([, passed]) => !passed);
checks.forEach(([label, passed]) => console.log(`${passed ? "PASS" : "FAIL"}: ${label}`));
if (failures.length) {
  console.error(`Developer Scenarios regression check failed (${failures.length}/${checks.length}).`);
  process.exit(1);
}
console.log(`Developer Scenarios regression check passed (${checks.length}/${checks.length}).`);
