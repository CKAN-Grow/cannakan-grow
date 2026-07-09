const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const saveButtonMatches = indexSource.match(/data-new-session-save-button="true"/g) || [];
if (saveButtonMatches.length < 2) {
  throw new Error("Both New Session Save Session buttons should expose data-new-session-save-button.");
}
const sharedSaveButtonMatches = indexSource.match(/data-session-save-button="true"/g) || [];
if (sharedSaveButtonMatches.length < 4) {
  throw new Error("New Session and Session Detail Save Session buttons should expose shared saved-state hooks.");
}

for (const needle of [
  'const SESSION_SAVE_BUTTON_SAVED_LABEL = "Session Saved.";',
  'const SESSION_UPDATE_BUTTON_LABEL = "Update Session";',
  'const SESSION_COMPLETE_BUTTON_LABEL = "Complete Session";',
  "const SESSION_SAVE_BUTTON_SAVED_RESET_MS = 2200;",
  "function setSessionSaveButtonLabel(button, label)",
  "function getNewSessionCompleteButtons(form)",
  'function setNewSessionSaveButtonState(form, state = "default")',
  "const defaultLabel = isStarted ? SESSION_UPDATE_BUTTON_LABEL : NEW_SESSION_SAVE_BUTTON_DEFAULT_LABEL;",
  "setSessionSaveButtonLabel(button, isSaved ? SESSION_SAVE_BUTTON_SAVED_LABEL : defaultLabel);",
  "const isCompleted = normalizeSessionStatus(form?.elements?.sessionStatus?.value || form?.dataset?.currentStage || \"\") === \"completed\";",
  "button.hidden = !isStarted || isCompleted;",
  'button.disabled = isSaved;',
  "button.disabled = isSaved || isCompleted;",
  'setNewSessionSaveButtonState(form, "default");',
  "resetNewSessionSaveButtonState(form);",
  "function confirmSessionCompletion()",
  'id="session-complete-confirm-modal-title">Complete Session?</h2>',
  "Once completed, this session will be locked as finished. You can review the results, but active tracking and reminders will stop.",
  'data-session-complete-cancel',
  'data-session-complete-confirm',
  "const requestedSessionStatus = normalizeSessionStatus(formData.get(\"sessionStatus\"));",
  'const normalizedInitialStatus = requestedSessionStatus === "completed"',
  'const confirmed = await confirmSessionCompletion();',
  "clearSessionTimerInterval();",
  "syncSessionProgressionReminderNotifications(getSessions());",
  'queueDueGrowReminderEvaluation("session-completed:new-session");',
  'queueDueGrowReminderEvaluation("session-completed:detail");',
  'function setSessionDetailSaveButtonState(detail, state = "default", options = {})',
  "function syncSessionDetailCompletionActions(detail, session = null)",
  'setSessionDetailSaveButtonState(detail, "saved", {',
  'setNewSessionSaveButtonState(form, "saved");',
  'await waitForNewSessionSavedStateVisibility();',
  'resetNewSessionSaveButtonState(form);',
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing save button state behavior: ${needle}`);
  }
}

if (!stylesSource.includes('[data-new-session-save-button="true"].is-saved')) {
  throw new Error("Missing visual saved state styling for the New Session save button.");
}
if (!stylesSource.includes('[data-session-save-button="true"].is-saved')) {
  throw new Error("Missing visual saved state styling for shared session save buttons.");
}
if (!stylesSource.includes(".session-complete-confirm-modal-overlay")) {
  throw new Error("Missing Complete Session confirmation modal overlay styles.");
}
if (!stylesSource.includes(".session-complete-confirm-modal-actions")) {
  throw new Error("Missing Complete Session confirmation modal action layout.");
}

if (!stylesSource.includes('content: "✓";')) {
  throw new Error("Saved state should include a visible check icon.");
}

if (!indexSource.includes('data-session-complete-button="true"')) {
  throw new Error("Saved Session detail actions should expose a Complete Session button.");
}

if (!indexSource.includes('data-new-session-complete-button="true"')) {
  throw new Error("New Session action bars should expose a post-save Complete Session button hook.");
}

if (appSource.includes("navigateWithUnsavedChangesBypass(`#sessions/${savedSessionId}`);")) {
  throw new Error("New Session Complete Session should open the completion flow, not just route to the detail page.");
}

console.log("New session save button state regression check passed.");
