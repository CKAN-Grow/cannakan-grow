const { spawnSync } = require("child_process");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const nodeBin = process.execPath;

const qaCommands = [
  ["Syntax", nodeBin, ["--check", "app.js"]],
  ["Syntax", nodeBin, ["--check", "api/grow-reminders-run.js"]],
  ["Syntax", nodeBin, ["--check", "api/push-send.js"]],
  ["Syntax", nodeBin, ["--check", "api/grow-reminder-action.js"]],
  ["Lifecycle", nodeBin, ["scripts/session-lifecycle-cleanup-regression-check.js"]],
  ["Lifecycle", nodeBin, ["scripts/session-stabilization-audit-regression-check.js"]],
  ["Timing", nodeBin, ["scripts/session-duration-full-elapsed-regression-check.js"]],
  ["Timing", nodeBin, ["scripts/session-times-recalculation-regression-check.js"]],
  ["Timing", nodeBin, ["scripts/grow-session-save-regression-check.js"]],
  ["Stage UI", nodeBin, ["scripts/stage-color-mapping-regression-check.js"]],
  ["Snapshot", nodeBin, ["scripts/snapshot-community-integrity-regression-check.js"]],
  ["Snapshot", nodeBin, ["scripts/snapshot-sharing-defaults-regression-check.js"]],
  ["Snapshot", nodeBin, ["scripts/public-session-partition-results-regression-check.js"]],
  ["Community Grow", nodeBin, ["scripts/community-grow-schema-warning-regression-check.js"]],
  ["Community Grow", nodeBin, ["scripts/community-grow-note-sharing-regression-check.js"]],
  ["Community Grow", nodeBin, ["scripts/community-grow-country-flags-regression-check.js"]],
  ["Leaderboard", nodeBin, ["scripts/home-gallery-rankings-teaser-regression-check.js"]],
  ["Notifications", nodeBin, ["scripts/notification-reminder-orchestration-regression-check.js"]],
  ["Founder QA", nodeBin, ["scripts/founder-admin-qa-framework-regression-check.js"]],
  ["Notifications", nodeBin, ["scripts/push-send-resilience-regression-check.js"]],
  ["Seed Age", nodeBin, ["scripts/seed-age-half-step-regression-check.js"]],
  ["Seed Age", nodeBin, ["scripts/seed-vault-estimated-age-regression-check.js"]],
  ["PWA/Build", nodeBin, ["scripts/build-config.mjs"]],
];

function runCommand([group, command, args]) {
  console.log(`\n[Founder/Admin QA] ${group}: ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${group} QA command failed with exit code ${result.status}: ${command} ${args.join(" ")}`);
  }
}

try {
  qaCommands.forEach(runCommand);
  console.log("\nFounder/admin QA sweep passed.");
} catch (error) {
  console.error("\nFounder/admin QA sweep failed.");
  console.error(error.message || error);
  process.exit(1);
}
