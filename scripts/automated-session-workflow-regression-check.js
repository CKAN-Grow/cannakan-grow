const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const engine = require(path.join(repoRoot, "src", "session-engine.js"));
const START = "2026-07-13T12:00:00.000Z";

function stateAt(methodType, hours, overrides = {}) {
  return engine.calculateSessionState({
    session: {
      id: "workflow-regression",
      methodType,
      sessionStatus: "active",
      sessionStartedAt: START,
      partitions: [{ seedCount: 4, plantedCount: "" }],
      ...overrides,
    },
    now: new Date(Date.parse(START) + (hours * engine.HOUR_MS)),
  });
}

const kanScenarios = [
  [10, "soaking"],
  [20, "transfer-window"],
  [30, "germination"],
  [38, "check-window"],
  [48, "check-window"],
  [60, "complete"],
];
for (const [hours, expectedPhase] of kanScenarios) {
  assert.equal(stateAt("KAN", hours).currentPhase.key, expectedPhase, `KAN ${hours}h phase should be automatic.`);
}

const transferWindow = stateAt("KAN", 20);
assert.equal(transferWindow.phaseLabel, "Transfer Window");
assert.equal(transferWindow.timelineSteps.find((step) => step.key === "transfer-window").isCurrent, true);
assert.equal(transferWindow.requiredUserActions.length, 0, "Transfer guidance must not become a stage-transition action.");

const readyToComplete = stateAt("KAN", 60);
assert.equal(readyToComplete.phaseLabel, "Ready to Complete");
assert.equal(readyToComplete.timelineSteps.at(-1).label, "Complete");
assert.equal(readyToComplete.timelineSteps.at(-1).isCurrent, false);
assert.equal(readyToComplete.timelineSteps.at(-1).isFuture, true, "Complete remains future until actual completion.");

const completed = stateAt("KAN", 60, {
  sessionStatus: "completed",
  completedAt: new Date(Date.parse(START) + (50 * engine.HOUR_MS)).toISOString(),
});
assert.equal(completed.phaseLabel, "Complete");
assert.equal(completed.timelineSteps.at(-1).isCurrent, true);
assert.equal(completed.timelineSteps.at(-1).isComplete, true);

for (const legacyStatus of ["soaking", "germinating", "first-germinated"]) {
  const legacyState = stateAt("KAN", 30, {
    sessionStatus: legacyStatus,
    germinationStartedAt: "2026-07-13T13:00:00.000Z",
    firstPlantedAt: "2026-07-13T14:00:00.000Z",
  });
  assert.equal(legacyState.currentPhase.key, "germination", `Legacy ${legacyStatus} must not control KAN guidance.`);
}

assert.equal(stateAt("TRA", 20).currentPhase.key, "transfer-window");
assert.equal(stateAt("PAPER_TOWEL", 20).currentPhase.key, "first-check");
assert.equal(stateAt("PAPER_TOWEL_SOAK", 20, {
  germinationStartedAt: "2030-01-01T00:00:00.000Z",
  paperTowelStartedAt: "2030-01-01T00:00:00.000Z",
}).currentPhase.key, "paper-towel", "Soak + Paper Towel must estimate its transition from elapsed time.");
assert.equal(stateAt("ROCKWOOL", 30).currentPhase.key, "keep-cubes-moist");
assert.equal(stateAt("WATER_SOAK", 15).currentPhase.key, "check-seeds");
assert.equal(stateAt("DIRECT_SOW", 30).currentPhase.key, "keep-moist");
assert.equal(stateAt("OTHER", 30).currentPhase.key, "seeds-started");

for (const method of ["PAPER_TOWEL", "ROCKWOOL", "WATER_SOAK", "DIRECT_SOW", "OTHER"]) {
  assert.equal(
    stateAt(method, 20).timelineSteps.some((step) => step.key === "transfer-window"),
    false,
    `${method} must not inherit KAN/TRa transfer guidance.`,
  );
}

const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const engineSource = fs.readFileSync(path.join(repoRoot, "src", "session-engine.js"), "utf8");
const reminderRunnerSource = fs.readFileSync(path.join(repoRoot, "api", "grow-reminders-run.js"), "utf8");
const serviceWorkerSource = fs.readFileSync(path.join(repoRoot, "service-worker.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const forbidden of [
  "Confirm moved to germination",
  "Move to Germination if needed",
  "SESSION_STAGE_OPTIONS",
  "ADMIN_CSTP_STAGE_OPTIONS",
  "openGrowthStageModal",
  "maybePromptGrowthStage",
  "openAdminCstpStageModal",
  "ensureGrowthStageModal",
  "getSessionCommandCenterMethodRoadmapTemplate",
  "getSessionCommandCenterRoadmapCurrentIndex",
  "buildPersistedStageSession",
  "confirm-transfer-ready",
]) {
  assert.equal(`${appSource}\n${engineSource}`.includes(forbidden), false, `Legacy workflow remains: ${forbidden}`);
}

for (const forbiddenAction of [
  "session-update-stage",
  "session-stage-germinating",
  "session-stage-first-germinated",
  "Mark Germination Started",
  "Mark Germinating",
  "Update Stage",
]) {
  assert.equal(`${reminderRunnerSource}\n${serviceWorkerSource}`.includes(forbiddenAction), false, `Legacy notification action remains: ${forbiddenAction}`);
}

for (const forbiddenDependency of ["missing_germination_started_at", "session-left-soaking-before-reminder"]) {
  assert.equal(`${appSource}\n${reminderRunnerSource}`.includes(forbiddenDependency), false, `Legacy reminder dependency remains: ${forbiddenDependency}`);
}

assert.ok(appSource.includes("linkedSessionEngineState?.phaseLabel"), "Community snapshot phase must use the session engine.");
assert.ok(appSource.includes("stageLabel: snapshotEngineState?.phaseLabel"), "Shared report snapshots must use the session engine phase.");
assert.ok(appSource.includes("getSessionEngineActionList(engineState).length"), "Companion CTA visibility must use real engine actions.");
assert.ok(reminderRunnerSource.includes("&& engineState?.startedAt"), "Scheduled reminders must accept any automatically tracked active status.");
assert.ok(reminderRunnerSource.includes("function getReminderStartDateTime"), "Scheduled reminders must use the canonical session start.");
assert.ok(appSource.includes("session-progress-companion-roadmap-dot"), "Companion roadmap should use informational markers.");
const companionRoadmapRenderer = appSource.match(/function renderSessionProgressCompanionRoadmapMarkup[\s\S]*?\r?\n}\r?\n\r?\nfunction renderSessionProgressCompanionMetricMarkup/)?.[0] || "";
assert.ok(companionRoadmapRenderer, "Companion roadmap renderer must exist.");
assert.equal(companionRoadmapRenderer.includes("escapeHtml(String(index + 1))"), false, "Companion roadmap must not render manual stage numbers.");
assert.equal(appSource.includes("session-engine-visual-timeline-index"), false, "Session timelines must not render legacy stage numbers.");
assert.equal(stylesSource.includes("growth-stage-modal"), false, "Retired growth-stage modal CSS must be removed.");

const spotlightEvents = appSource.match(/function getSpotlightLifecycleEvents[\s\S]*?\r?\n}\r?\n\r?\nfunction renderSpotlightLifecycleMarkup/)?.[0] || "";
assert.ok(spotlightEvents.includes("return [];"), "Session cards must show an unavailable state instead of a persisted-stage fallback.");
assert.equal(spotlightEvents.includes("getSessionProgressKeyFromSession"), false, "Session cards must not use persisted stage values for guidance.");

console.log("Automated session workflow regression check passed.");
