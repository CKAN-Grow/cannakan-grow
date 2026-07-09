const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const engine = require(path.join(repoRoot, "src", "session-engine.js"));

function requireSource(needle, label = needle) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing prepared media setup behavior: ${label}`);
  }
}

function stateFor(method, setup) {
  return engine.calculateSessionState({
    session: {
      methodType: method,
      systemType: method,
      sessionStatus: "active",
      sessionStartedAt: "2026-07-08T12:00:00.000Z",
      date: "2026-07-08",
      time: "12:00",
      methodSetup: setup,
    },
    now: new Date("2026-07-08T12:00:00.000Z"),
  });
}

[
  'question: "Have your rockwool cubes already been prepared?"',
  'readyLabel: "Yes, my cubes are ready"',
  'question: "Have your starter plugs already been prepared?"',
  'readyLabel: "Yes, my plugs are ready"',
  'form.dataset.methodSetupPreparedMedia = normalizedChoice === "prepared" ? "true" : "false";',
  'preparedMedia: form.dataset.methodSetupPreparedMedia === "true"',
  'if (form.dataset.methodSetupMethod && normalizeMethodType(form.dataset.methodSetupMethod) !== nextMethod) {\n        clearFormPreparedMediaSetupChoice(form);\n      }',
  'openPreparedMediaSetupModal(nextMethod);',
  'refreshNewSessionTimelineViews();',
  'if (isPreparedMediaSetupMethod(pendingMethodType) && !getMethodSetupStateFromForm(form).choice) {',
].forEach((needle) => requireSource(needle));

const preparedRockwool = stateFor("ROCKWOOL", { choice: "prepared", preparedMedia: true });
assert.equal(preparedRockwool.currentPhase.key, "seeds-planted");
assert.deepEqual(
  preparedRockwool.timelineSteps.map((step) => step.key),
  ["started", "seeds-planted", "keep-cubes-moist", "watch-sprouts", "complete"],
);

const unpreparedRockwool = stateFor("ROCKWOOL", { choice: "needs-prep", preparedMedia: false });
assert.equal(unpreparedRockwool.currentPhase.key, "prep-cubes");
assert.deepEqual(
  unpreparedRockwool.timelineSteps.map((step) => step.key),
  ["started", "prep-cubes", "seeds-planted", "keep-cubes-moist", "watch-sprouts", "complete"],
);

const preparedStarterPlug = stateFor("RAPID_ROOTER", { choice: "prepared", preparedMedia: true });
assert.equal(preparedStarterPlug.currentPhase.key, "seeds-planted");
assert.deepEqual(
  preparedStarterPlug.timelineSteps.map((step) => step.key),
  ["started", "seeds-planted", "keep-plugs-moist", "watch-sprouts", "complete"],
);

const unpreparedStarterPlug = stateFor("RAPID_ROOTER", { choice: "needs-prep", preparedMedia: false });
assert.equal(unpreparedStarterPlug.currentPhase.key, "prep-plugs");
assert.deepEqual(
  unpreparedStarterPlug.timelineSteps.map((step) => step.key),
  ["started", "prep-plugs", "seeds-planted", "keep-plugs-moist", "watch-sprouts", "complete"],
);

console.log("Prepared media setup regression check passed.");
