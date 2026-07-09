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
  "button.hidden = !isStarted;",
  'button.disabled = isSaved;',
  'setNewSessionSaveButtonState(form, "default");',
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

if (!stylesSource.includes('content: "✓";')) {
  throw new Error("Saved state should include a visible check icon.");
}

if (!indexSource.includes('data-session-complete-button="true"')) {
  throw new Error("Saved Session detail actions should expose a Complete Session button.");
}

if (!indexSource.includes('data-new-session-complete-button="true"')) {
  throw new Error("New Session action bars should expose a post-save Complete Session button hook.");
}

console.log("New session save button state regression check passed.");
