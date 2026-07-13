const assert = require("assert");
const path = require("path");

const engine = require(path.resolve(__dirname, "..", "src", "session-engine.js"));
const startedAt = "2026-07-13T00:00:00.000Z";

function stateAt(hours, overrides = {}) {
  return engine.calculateSessionState({
    session: {
      methodType: "KAN",
      sessionStartedAt: startedAt,
      sessionStatus: "active",
      ...overrides,
    },
    now: new Date(Date.parse(startedAt) + (hours * engine.HOUR_MS)),
  });
}

const soaking = stateAt(12, { sessionStatus: "germinating", germinationStartedAt: "2026-07-13T01:00:00.000Z" });
assert.equal(soaking.currentPhase.key, "soaking", "Elapsed time must override a legacy germinating status.");
assert.equal(soaking.timelineSteps.find((step) => step.key === "soaking").isCurrent, true);

const germination = stateAt(30, { sessionStatus: "soaking" });
assert.equal(germination.currentPhase.key, "germination", "Elapsed time must override a legacy soaking status.");
assert.equal(germination.timelineSteps.find((step) => step.key === "germination").isCurrent, true);
assert.equal(germination.timelineSteps.find((step) => step.key === "soaking").isComplete, true);

const ready = stateAt(60);
assert.equal(ready.phaseLabel, "Ready to Complete");
assert.equal(ready.timelineSteps.at(-1).isFuture, true, "Completion is not visualized until actually completed.");

const completed = stateAt(60, { completedAt: "2026-07-15T02:00:00.000Z", sessionStatus: "completed" });
assert.equal(completed.timelineSteps.at(-1).isCurrent, true);
assert.equal(completed.timelineSteps.at(-1).isComplete, true);

console.log("Session timeline automatic current-position regression check passed.");
