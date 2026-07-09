const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "function getSessionDurationStartAt(session = null)",
  "parseCompletedAtValue(session.sessionStartedAt || session.session_started_at || \"\")",
  "parseSessionStartDateTime(session.date, session.time)",
  "parseCompletedAtValue(session.soakStartedAt || session.soak_started_at || \"\")",
  "parseCompletedAtValue(session.timerStartAt || session.timer_start_at || \"\")",
  "return getSessionDurationStartAt(session);",
  "function updateSessionTimingSummary(summaryElement, sectionElement, sessionDate, sessionTime, sessionStatus, completedAt = \"\", timerStartAt = \"\", options = {})",
  "parseCompletedAtValue(options.sessionDurationStartAt || \"\")",
  "sessionDurationStartAt: getSessionDurationStartAt(session)?.toISOString() || \"\"",
  "<strong>Total Session Time</strong>",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing session timeline timing behavior: ${needle}`);
  }
}

const timingSummaryFunction = appSource.match(/function updateSessionTimingSummary\(summaryElement, sectionElement, sessionDate, sessionTime, sessionStatus, completedAt = "", timerStartAt = "", options = {}\) \{[\s\S]*?\n\}/)?.[0] || "";
if (!timingSummaryFunction) {
  throw new Error("Could not inspect updateSessionTimingSummary.");
}
for (const removedNeedle of [
  "timing-card-elapsed",
  "Session Duration",
  "Total Duration",
]) {
  if (timingSummaryFunction.includes(removedNeedle)) {
    throw new Error(`Session Timeline should not render redundant active duration copy: ${removedNeedle}`);
  }
}

const durationStartFunction = appSource.match(/function getSessionDurationStartAt\(session = null\) \{[\s\S]*?\n\}/)?.[0] || "";
if (!durationStartFunction) {
  throw new Error("Could not inspect getSessionDurationStartAt.");
}
if (
  durationStartFunction.indexOf("parseCompletedAtValue(session.sessionStartedAt || session.session_started_at || \"\")")
  > durationStartFunction.indexOf("parseCompletedAtValue(session.soakStartedAt || session.soak_started_at || \"\")")
) {
  throw new Error("Session timeline duration calculations must prefer sessionStartedAt before soakStartedAt.");
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
const sessionStartedAt = new Date("2026-05-18T20:30:00-04:00");
const germinatingStartedAt = new Date("2026-05-19T20:30:00-04:00");
const now = new Date("2026-05-20T08:45:00-04:00");

const sessionDuration = durationBetween(sessionStartedAt, now);
const currentStageElapsed = durationBetween(germinatingStartedAt, now);

assert.equal(sessionDuration, "1d 12h", "Total session time should measure from sessionStartedAt.");
assert.equal(currentStageElapsed, "12h 15m", "Current-stage elapsed should remain separate.");
assert.ok(
  now.getTime() - sessionStartedAt.getTime() > now.getTime() - germinatingStartedAt.getTime(),
  "Total session time should be greater than current-stage elapsed for this Germinating session.",
);

console.log("Session Timeline timing regression check passed.");
