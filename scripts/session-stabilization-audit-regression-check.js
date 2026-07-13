const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const reminderSource = fs.readFileSync(path.join(repoRoot, "api", "grow-reminders-run.js"), "utf8");

const requireSource = (source, needle, label) => {
  if (!source.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
};

[
  "function getSessionCompletedAtDate(session = null)",
  "function getSessionStageDurationStartAt(session = null)",
  "function getSessionTimingState(session = null, options = {})",
  "sessionStatus: String(session.sessionStatus || session.session_status || \"\").trim()",
  "createdAt: String(session.createdAt || session.created_at || \"\").trim()",
  "parseCompletedAtValue(session.createdAt || session.created_at || \"\")",
  "<strong>Total Session Time</strong>",
  "function getSessionDurationStartAt(session = null)",
  "parseCompletedAtValue(session.sessionStartedAt || session.session_started_at || \"\")",
  "getSessionStageReminderOptions(session)",
  "visibilityStatus = normalizeSessionVisibilityStatus(",
].forEach((needle) => requireSource(appSource, needle, "app session stabilization behavior"));

const durationStartFunction = appSource.match(/function getSessionDurationStartAt\(session = null\) \{[\s\S]*?\n\}/)?.[0] || "";
if (!durationStartFunction) {
  throw new Error("Could not locate getSessionDurationStartAt.");
}
if (
  durationStartFunction.indexOf("parseCompletedAtValue(session.sessionStartedAt || session.session_started_at || \"\")")
  > durationStartFunction.indexOf("parseCompletedAtValue(session.soakStartedAt || session.soak_started_at || \"\")")
) {
  throw new Error("Session timer stabilization must prefer sessionStartedAt before timeline stage timestamps.");
}

const analyticsEligibilityMatch = appSource.match(/function isGrowSessionAnalyticsEligible[\s\S]*?\r?\n}\r?\n\r?\nfunction getVisibleUserSessions/);
if (!analyticsEligibilityMatch) {
  throw new Error("Could not locate analytics eligibility helper.");
}
requireSource(
  analyticsEligibilityMatch[0],
  "return resolveGrowSessionLifecycle(session, options).included === true;",
  "canonical lifecycle analytics eligibility",
);

[
  "function getReminderStartDateTime(session = {})",
  "parseTimestamp(session?.sessionStartedAt || session?.session_started_at || \"\")",
  "parseTimestamp(session?.createdAt || session?.created_at || \"\")",
  "function isReminderCandidateSessionVisible(row = {})",
  "session_started_at,soak_started_at,timer_start_at",
  "createdAt: String(row?.created_at || \"\").trim()",
].forEach((needle) => requireSource(reminderSource, needle, "reminder stabilization behavior"));

const reminderStartFunction = reminderSource.match(/function getReminderStartDateTime[\s\S]*?\r?\n}/)?.[0] || "";
if (
  !reminderStartFunction
  || reminderStartFunction.includes("germinationStartedAt")
  || reminderStartFunction.includes("soakStartedAt")
  || reminderStartFunction.includes("timerStartAt")
) {
  throw new Error("Reminder timing must use the canonical session start, not legacy stage timestamps.");
}

console.log("Session stabilization audit regression check passed.");
