const assert = require("assert");
const path = require("path");

const engine = require(path.resolve(__dirname, "..", "src", "session-engine.js"));

const START = "2026-07-08T12:00:00.000Z";

function stateFor(method, hours = 0, methodSetup = {}) {
  return engine.calculateSessionState({
    session: {
      methodType: method,
      systemType: method,
      sessionStatus: "active",
      sessionStartedAt: START,
      date: "2026-07-08",
      time: "12:00",
      methodSetup,
    },
    now: new Date(new Date(START).getTime() + (hours * engine.HOUR_MS)),
  });
}

function stepLabels(method, methodSetup = {}) {
  return stateFor(method, 0, methodSetup).timelineSteps.map((step) => `${step.label}|${step.timing}`);
}

const directStart = stateFor("DIRECT_SOW", 0);
assert.equal(directStart.currentPhase.key, "seeds-planted");
assert.equal(directStart.currentPhase.label, "Seeds Planted");
assert.deepEqual(
  stepLabels("DIRECT_SOW"),
  [
    "Start|Session started",
    "Seeds Planted|Day 0",
    "Keep Moist|Day 1-3",
    "Watch for Sprouts|Day 2-5",
    "Complete|Day 5+",
  ],
);
assert.equal(directStart.timelineSteps[0].isComplete, true, "Start should be complete once the session has started.");
assert.equal(directStart.timelineSteps[1].isCurrent, true, "Direct Soil should advance into Seeds Planted at session start.");
assert.equal(directStart.nextMilestone.title, "Keep moist");

assert.deepEqual(
  stepLabels("PAPER_TOWEL_SOAK"),
  [
    "Start|Session started",
    "Soak|0-12h",
    "Move to Paper Towel|12-18h",
    "Paper Towel|0-24h",
    "Check Seeds|24-48h",
    "Complete|48h+",
  ],
);
assert.deepEqual(
  stepLabels("PAPER_TOWEL"),
  [
    "Start|Session started",
    "Paper Towel|0-12h",
    "First Check|12-24h",
    "Check Seeds|24-48h",
    "Complete|48h+",
  ],
);
assert.deepEqual(
  stepLabels("WATER_SOAK"),
  [
    "Start|Session started",
    "Soak|0-12h",
    "Check Seeds|12-24h",
    "Complete|24h+",
  ],
);
assert.deepEqual(
  stepLabels("ROCKWOOL"),
  [
    "Start|Session started",
    "Prep Cubes|Day 0",
    "Plant Seeds|Day 0",
    "Keep Cubes Moist|Day 1-3",
    "Watch for Sprouts|Day 2-5",
    "Complete|Day 5+",
  ],
);
const preparedRockwool = stateFor("ROCKWOOL", 0, { choice: "prepared", preparedMedia: true });
assert.deepEqual(
  stepLabels("ROCKWOOL", { choice: "prepared", preparedMedia: true }),
  [
    "Prep Cubes|Already prepared",
    "Start|Session started",
    "Seeds Planted|Day 0",
    "Keep Cubes Moist|Day 1-3",
    "Watch for Sprouts|Day 2-5",
    "Complete|Day 5+",
  ],
);
assert.equal(preparedRockwool.currentPhase.key, "seeds-planted");
assert.equal(preparedRockwool.timelineSteps[0].preparationComplete, true);
assert.equal(preparedRockwool.timelineSteps[0].statusLabel, "Already Complete");
assert.equal(preparedRockwool.timelineSteps[0].isComplete, true);
assert.deepEqual(
  stepLabels("RAPID_ROOTER"),
  [
    "Start|Session started",
    "Prep Plugs|Day 0",
    "Plant Seeds|Day 0",
    "Keep Plugs Moist|Day 1-3",
    "Watch for Sprouts|Day 2-5",
    "Complete|Day 5+",
  ],
);
const preparedStarterPlug = stateFor("RAPID_ROOTER", 0, { choice: "prepared", preparedMedia: true });
assert.deepEqual(
  stepLabels("RAPID_ROOTER", { choice: "prepared", preparedMedia: true }),
  [
    "Prep Plugs|Already prepared",
    "Start|Session started",
    "Seeds Planted|Day 0",
    "Keep Plugs Moist|Day 1-3",
    "Watch for Sprouts|Day 2-5",
    "Complete|Day 5+",
  ],
);
assert.equal(preparedStarterPlug.currentPhase.key, "seeds-planted");
assert.equal(preparedStarterPlug.timelineSteps[0].preparationComplete, true);
assert.equal(preparedStarterPlug.timelineSteps[0].statusLabel, "Already Complete");
assert.equal(preparedStarterPlug.timelineSteps[0].isComplete, true);
assert.deepEqual(
  stepLabels("OTHER"),
  [
    "Start|Session started",
    "Seeds Started|0-48h",
    "Complete|48h+",
  ],
);

console.log("Session engine method timeline wording regression check passed.");
