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

for (const needle of [
  'const NEW_SESSION_SAVE_BUTTON_SAVED_LABEL = "Saved";',
  'function setNewSessionSaveButtonState(form, state = "default")',
  'button.textContent = isSaved ? NEW_SESSION_SAVE_BUTTON_SAVED_LABEL : NEW_SESSION_SAVE_BUTTON_DEFAULT_LABEL;',
  'button.disabled = isSaved;',
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

if (!stylesSource.includes('content: "✓";')) {
  throw new Error("Saved state should include a visible check icon.");
}

console.log("New session save button state regression check passed.");
