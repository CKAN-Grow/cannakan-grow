const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8"));
const qaRunnerSource = fs.readFileSync(path.join(repoRoot, "scripts", "run-founder-admin-qa-sweep.js"), "utf8");

function requireSource(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

[
  "function canViewFounderAdminQaTools()",
  "isAdminUser() || isLocalDevQaBypassActive()",
  "function getFounderAdminQaSweepSummary()",
  "function renderFounderAdminQaSweepSectionMarkup()",
  "function bindFounderAdminQaSweepSection(scope = app)",
  "function logFounderAdminQaSweepIssues(summary = getFounderAdminQaSweepSummary())",
  "key: \"founder-admin-qa-sweep\"",
  "bindFounderAdminQaSweepSection(app);",
  "Founder/Admin QA Sweep",
  "Lifecycle Recovery Preview",
  "Snapshot Visibility Conflicts",
  "Reminder/Event Preview",
  "getSessionLifecycleTimestampHealth(session)",
  "getGallerySnapshotIntegrity(snapshot)",
  "shouldSuppressManagedAppNotification(notification)",
  "isPushDeviceCleanupCandidate(record)",
  "isValidSeedAgeYearsInput",
  "getServiceWorkerLifecycleStatus(appState.serviceWorkerRegistration || null)",
].forEach((needle) => requireSource(appSource, needle, "founder/admin QA UI framework"));

if (packageJson.scripts?.["qa:founder"] !== "node ./scripts/run-founder-admin-qa-sweep.js") {
  throw new Error("package.json must expose npm run qa:founder.");
}

[
  "session-lifecycle-cleanup-regression-check.js",
  "session-stabilization-audit-regression-check.js",
  "snapshot-community-integrity-regression-check.js",
  "notification-reminder-orchestration-regression-check.js",
  "push-send-resilience-regression-check.js",
  "seed-age-half-step-regression-check.js",
  "home-gallery-rankings-teaser-regression-check.js",
  "scripts/build-config.mjs",
  "shell: false",
].forEach((needle) => requireSource(qaRunnerSource, needle, "founder/admin QA runner"));

console.log("Founder/admin QA framework regression check passed.");
