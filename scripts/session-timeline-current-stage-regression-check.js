const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "function resolveGrowSessionCurrentProgressKey(source = {})",
  "return resolveGrowSessionCurrentProgressKey({",
  "function getSessionProgressKeyFromSession(session = {})",
  "currentProgressKey: getSessionProgressKeyFromSession(session)",
  "const currentProgressKey = String(state.currentProgressKey || \"\").trim();",
  "const progressKeyIndex = events.findIndex((event) => event.key === resolvedProgressKey);",
  "index < resolvedCurrentIndex || (event.complete && resolvedCurrentIndex >= index)",
  "const currentProgressKey = session ? getSessionProgressKeyFromSession(session) : \"\";",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing shared current-stage timeline behavior: ${needle}`);
  }
}

const timelineBoundsMatch = appSource.match(/function getSessionLifecycleTimelineStageBounds[\s\S]*?\n}\n\nfunction getSessionLifecycleTimelineCardMeta/);
if (!timelineBoundsMatch) {
  throw new Error("Could not locate timeline stage bounds.");
}

if (!timelineBoundsMatch[0].includes('case "soaking"')
  || !timelineBoundsMatch[0].includes("startAt: stageStarts.soaking || null")
  || !timelineBoundsMatch[0].includes("finishAt: stageStarts.germination || null")) {
  throw new Error("Soaking stage length must use soak start through germination-start transition.");
}

const resolveGrowSessionCurrentProgressKey = (source = {}) => {
  const normalizedStatus = String(source.sessionStatus || source.status || source.value || "").trim().toLowerCase() || "unselected";
  const completedAt = String(source.completedAt || source.completed_at || "").trim();
  const firstPlantedAt = String(source.firstPlantedAt || source.first_planted_at || "").trim();
  const germinationStartedAt = String(source.germinationStartedAt || source.germination_started_at || "").trim();

  if (normalizedStatus === "completed" || completedAt) {
    return "completed";
  }
  if (firstPlantedAt) {
    return "first-germinated";
  }
  if (normalizedStatus === "germinating" || germinationStartedAt) {
    return "germination";
  }
  if (normalizedStatus === "soaking") {
    return "soaking";
  }
  return "";
};

const stageEvents = ["soaking", "germination", "first-germinated", "completed"];
const currentProgressKey = resolveGrowSessionCurrentProgressKey({
  sessionStatus: "germinating",
  completedAt: "",
  firstPlantedAt: "",
  germinationStartedAt: "",
});
const currentIndex = stageEvents.indexOf(currentProgressKey);

assert.equal(currentProgressKey, "germination", "Germinating status should resolve to the Germinating timeline stage.");
assert.equal(stageEvents[currentIndex], "germination", "Timeline current index should highlight Germinating.");
assert.equal(stageEvents[0], "soaking", "Soaking remains the previous stage, not the current stage.");

console.log("Session timeline current-stage regression check passed.");
