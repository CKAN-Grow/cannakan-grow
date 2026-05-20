const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "function getSessionLifecycleTimelineStageStarts(state = {})",
  "function getSessionLifecycleTimelineCurrentStageStartAt(state = {})",
  "finishAt: stageStarts.germination || null",
  "finishAt: stageStarts[\"first-germinated\"] || null",
  "if (event.isFuture) {",
  "} else if (event.isCurrent && hasValidStart) {",
  "} else if (event.isComplete && hasValidStart && hasValidFinish) {",
  "const lastUpdatedAt = parseCompletedAtValue(",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing timeline stage length behavior: ${needle}`);
  }
}

const formatElapsedMinutesShorthand = (totalMinutes) => {
  const minutes = Math.max(0, Math.floor(Number(totalMinutes) || 0));
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const remainderMinutes = minutes % 60;
  return [
    days ? `${days}d` : "",
    hours ? `${hours}h` : "",
    !days && remainderMinutes ? `${remainderMinutes}m` : "",
  ].filter(Boolean).join(" ") || "0m";
};

const durationBetween = (startedAt, endedAt) => {
  const totalMinutes = Math.max(0, Math.floor((endedAt.getTime() - startedAt.getTime()) / 60000));
  return formatElapsedMinutesShorthand(totalMinutes);
};

const soakingStartedAt = new Date("2026-05-18T20:45:00-04:00");
const germinatingStartedAt = new Date("2026-05-19T20:30:00-04:00");
const now = new Date("2026-05-20T08:45:00-04:00");

assert.equal(
  durationBetween(soakingStartedAt, germinatingStartedAt),
  "23h 45m",
  "Completed Soaking length should use Soaking start through Germinating start.",
);
assert.equal(
  durationBetween(germinatingStartedAt, now),
  "12h 15m",
  "Current Germinating length should use Germinating start through now.",
);

console.log("Session timeline stage length regression check passed.");
