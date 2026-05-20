const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "function syncSessionTimeDependentDetailViews(detail, session, options = {})",
  "detail.statusField.value = session.sessionStatus || detail.statusField.value || \"soaking\";",
  "startedAt: getSessionStatusStartedAtValue(session)",
  "updateSessionStatusAppearance(detail.statusField, detail.statusTrigger);",
  "updateSessionStatusReminder(",
  "options.refreshDerivedViews",
  "populateSessionTimesForm(detail.timesForm, session);",
  "const savedSession = normalizeStoredSession(applySessionTimePayload({",
  "...mapRowToSession(data),",
  "filterPaperDeducted: getSessionFilterPaperDeducted(session),",
  "}, payload));",
  "syncSessionTimeDependentDetailViews(detail, session, {",
  "refreshDerivedViews: refreshDetailDerivedViews,",
  "syncSessionProgressionReminderNotifications(getSessions());",
  "queueDueGrowReminderEvaluation(\"session-times:updated\");",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing session time recalculation behavior: ${needle}`);
  }
}

const timesSubmitMatch = appSource.match(/detail\.timesForm\?\.addEventListener\("submit"[\s\S]*?\n  \}\);/);
if (!timesSubmitMatch) {
  throw new Error("Could not locate Edit Session Times submit handler.");
}

const timesSubmitSource = timesSubmitMatch[0];
if (timesSubmitSource.includes("updateSessionTimingSummary(") || timesSubmitSource.includes("updateSessionLifecycleTimeline(")) {
  throw new Error("Edit Session Times should use the shared time-dependent detail sync helper instead of one-off widget updates.");
}

if (
  timesSubmitSource.indexOf("Object.assign(session, savedSession);")
  > timesSubmitSource.indexOf("syncSessionTimeDependentDetailViews(detail, session, {")
) {
  throw new Error("Session object must receive saved timestamps before recalculating detail views.");
}

console.log("Session times recalculation regression check passed.");
