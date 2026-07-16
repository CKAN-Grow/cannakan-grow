import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const read = (path) => readFileSync(resolve(process.cwd(), path), "utf8");
const app = read("app.js");
const fixture = read("fixtures/seed-vault-preview.js");
const build = read("scripts/build-config.mjs");
const styles = read("styles.css");

const gateStart = app.indexOf("function isDeveloperScenariosAllowed()");
const gateEnd = app.indexOf("\nfunction isDeveloperPreviewAllowed()", gateStart);
const gateSource = app.slice(gateStart, gateEnd);
const evaluateGate = (hostname, explicitFlag = false) => Function("window", `${gateSource}; return isDeveloperScenariosAllowed();`)({
  location: { hostname },
  CANNAKAN_SUPABASE_CONFIG: { devPreviewDataEnabled: explicitFlag },
});

const fixtureContext = { globalThis: {} };
vm.runInNewContext(fixture, fixtureContext);
const seedRegistry = fixtureContext.globalThis.CANNAKAN_SEED_VAULT_PREVIEW_FIXTURES;
const fixturesAreFrozen = Object.isFrozen(seedRegistry)
  && Object.isFrozen(seedRegistry.sets)
  && Object.isFrozen(seedRegistry.sets.small.entries)
  && Object.isFrozen(seedRegistry.sets.small.entries[0]);

const checks = [
  ["scenarios default off", app.includes("const DEVELOPER_SCENARIOS_DEFAULT_ENABLED = false;")],
  ["Unified Demo is the local mode default", app.includes('UNIFIED: "unified"') && app.includes('DEVELOPER_UNIFIED_SCENARIO_ID = "full-grow-demo"')],
  ["Full Grow Demo shared graph", app.includes("function buildFullGrowDemoGraph()") && app.includes("function getFullGrowDemoGraph()")],
  ["cross-module graph validation", app.includes("function validateFullGrowDemoGraph(") && app.includes("graph.communitySnapshots.forEach") && app.includes("graph.reportProjections.sources.forEach") && app.includes("graph.collectionMemberships.some")],
  ["Full Grow Demo fixture scale", app.includes("graph.sessions.length + drafts.length !== 23") && app.includes("graph.vaultEntries.length !== 50") && app.includes("Array.from({ length: 180 }") && app.includes("graph.activeSessions.length !== 4")],
  ["Full Grow Demo content breadth", app.includes('"Northern Lights Collective"') && app.includes('"Sunset Auto Test 3"') && app.includes("communityEvidenceIndexes") && app.includes("seedTypeRows")],
  ["KAN flagship data composition", app.includes('index < 144 ? "KAN"') && app.includes('Array.from({ length: 23 }') && app.includes('completedKanShare < 0.75') && app.includes('"KAN Evidence Leader"')],
  ["rankings remain data-derived", !app.includes("showcaseSourceBonus") && !app.includes("methodPenalty")],
  ["Full Grow Demo report density", app.includes("mergeMonthlyTrends") && app.includes("mergeRegionalCoverage") && app.includes("mergeRecentActivity") && app.includes("germinationDistribution: makeDistribution")],
  ["Full Grow Demo Explore projection memoized", app.includes('getCachedDeveloperScenarioFixtures("fullGrowDemoExploreProvider", buildProvider)')],
  ["Full Grow Demo supply projection", app.includes("supplyTracking: { count: 84") && app.includes("getFullGrowDemoGraph().supplyTracking")],
  ["Unified and Mix & Match controls", app.includes(">Unified Demo</button>") && app.includes(">Mix &amp; Match</button>") && app.includes("One synchronized sample ecosystem across the entire app.")],
  ["single versioned preference key", app.includes('const DEVELOPER_SCENARIOS_STORAGE_KEY = "grow_developer_scenarios_v1";')],
  ["authoritative eligibility helper", app.includes("function isDeveloperScenariosAllowed()")],
  ["localhost accepted at runtime", evaluateGate("localhost") === true && evaluateGate("127.0.0.1") === true],
  ["production refused even with explicit flag", evaluateGate("grow.cannakan.com", true) === false && evaluateGate("www.grow.cannakan.com", true) === false],
  ["known production hostname denial", app.indexOf("productionHostnames.has(hostname)") < app.indexOf("localStorage.getItem(DEVELOPER_SCENARIOS_STORAGE_KEY)")],
  ["Seed Vault provider boundary", app.includes("function getActiveSeedVaultProvider()")],
  ["Sessions provider boundary", app.includes("function getSessionProvider()")],
  ["Profile provider boundary", app.includes("function getProfileProvider()")],
  ["Community provider boundary", app.includes("function getCommunityProvider(")],
  ["Explore provider boundary", app.includes("function getExploreProvider()")],
  ["scenario analytics adapters", app.includes("function buildSessionScenarioAnalytics(") && app.includes("function buildCommunityScenarioAnalytics(") && app.includes("function buildExploreScenarioAggregate(")],
  ["scenario fixture contract validation", app.includes("function validateDeveloperScenarioRecords(") && app.includes("DEVELOPER_SCENARIO_FIXTURE_INVALID")],
  ["owner analytics use scenario provider", app.includes('if (shouldUseDeveloperScenarioProvider("sessions"))') && app.includes("return getSessionProvider().analytics;")],
  ["community analytics use scenario provider", app.includes("return getCommunityProvider().analytics;")],
  ["Explore analytics use scenario provider", app.includes("return getExploreProvider().aggregate;") && app.includes('Developer Scenario — Sample Explore Analytics')],
  ["scenario analytics skip live GIE loaders", app.includes('async function loadGieOwnerAnalytics') && app.includes('async function loadGieCommunityAnalytics') && app.includes('async function loadExplorerCompletedSessionAggregate')],
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
  ["persistent sample-data warning", app.includes("DEVELOPER SCENARIOS — SAMPLE DATA — NOTHING WILL BE SAVED")],
  ["live data reset", app.includes("function returnToLiveData()")],
  ["production build safeguard", build.includes("Developer Scenarios must remain disabled by default in production builds.")],
  ["responsive control styles", styles.includes(".developer-scenarios-panel") && styles.includes(".developer-scenarios-mode") && styles.includes("@media (max-width: 640px)") && styles.includes(".session-progress-companion-roadmap")],
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
