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
  "return parseCompletedAtValue(germinationStartedAt);",
  "<strong>${setupGraceActive ? \"Setup Grace Period\" : \"Session Duration\"}</strong>",
  "<dt>Stage Duration</dt>",
  "getSessionStageReminderOptions(session)",
  "visibilityStatus = normalizeSessionVisibilityStatus(",
].forEach((needle) => requireSource(appSource, needle, "app session stabilization behavior"));

const analyticsEligibilityMatch = appSource.match(/function isGrowSessionAnalyticsEligible[\s\S]*?\r?\n}\r?\n\r?\nfunction getVisibleUserSessions/);
if (!analyticsEligibilityMatch) {
  throw new Error("Could not locate analytics eligibility helper.");
}
if (analyticsEligibilityMatch[0].includes("isSessionSoftDeleted(normalizedSession)")) {
  throw new Error("Analytics eligibility must preserve user-hidden historical sessions while excluding hard deleted/archived sessions explicitly.");
}
[
  "normalizedSession.isDeleted",
  "String(normalizedSession.deletedAt || normalizedSession.deleted_at || \"\").trim()",
  "[\"deleted\", \"archived\", \"archived_test\"].includes(visibilityStatus)",
].forEach((needle) => requireSource(analyticsEligibilityMatch[0], needle, "analytics visibility filter"));

[
  "return parseTimestamp(session?.germinationStartedAt || session?.germination_started_at || \"\");",
  "parseTimestamp(session?.soakStartedAt || session?.soak_started_at || \"\")",
  "parseTimestamp(session?.sessionStartedAt || session?.session_started_at || \"\")",
  "parseTimestamp(session?.createdAt || session?.created_at || \"\")",
  "function isReminderCandidateSessionVisible(row = {})",
  "session_started_at,soak_started_at,timer_start_at",
  "createdAt: String(row?.created_at || \"\").trim()",
].forEach((needle) => requireSource(reminderSource, needle, "reminder stabilization behavior"));

console.log("Session stabilization audit regression check passed.");
