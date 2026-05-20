const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");

function assertIncludes(needle, message) {
  if (!appSource.includes(needle)) {
    throw new Error(message);
  }
}

assertIncludes(
  "function applyNewSessionNamePromptValue(form, value = \"\")",
  "Missing centralized First Action session-name apply helper.",
);

if (!indexSource.includes('name="sessionName"')) {
  throw new Error("The New Session form must expose the session name as input[name=\"sessionName\"].");
}

assertIncludes(
  'document.querySelector(\'#session-form input[name="sessionName"]\')',
  "First Action close/focus behavior should target the visible New Session sessionName input.",
);

assertIncludes(
  'overlay.querySelector("#new-session-name-modal-input")',
  "First Action prompt must read from the modal input before applying the chosen name.",
);

assertIncludes(
  "function getCurrentNewSessionForm()",
  "First Action prompt should resolve the live #session-form at Continue time.",
);

assertIncludes(
  "const targetForm = getCurrentNewSessionForm() || form;",
  "First Action prompt Continue must write to the current visible New Session form, not a stale captured form.",
);

assertIncludes(
  "function shouldApplyNewSessionPromptName(form, initialFieldValue = \"\")",
  "Missing guard that prevents the prompt from overwriting a manually edited main session name.",
);

assertIncludes(
  "overlay.dataset.initialSessionName = String(sessionNameField.value || \"\").trim();",
  "First Action prompt should remember the main field value from prompt-open time.",
);

assertIncludes(
  "sessionNameField.value = nextName;",
  "First Action prompt no longer writes the chosen name into the real session name field.",
);

assertIncludes(
  "sessionNameField.defaultValue = nextName;",
  "First Action prompt should update the field defaultValue so later form logic sees the chosen name.",
);

assertIncludes(
  "sessionNameField.dispatchEvent(new Event(\"input\", { bubbles: true }));",
  "First Action prompt must dispatch input so the main form refreshes immediately.",
);

assertIncludes(
  "sessionNameField.dispatchEvent(new Event(\"change\", { bubbles: true }));",
  "First Action prompt must dispatch change so draft/signature logic observes the chosen name.",
);

assertIncludes(
  "const skipPrompt = () => {",
  "Missing separate skip path for the First Action session-name prompt.",
);

assertIncludes(
  "dismissNewSessionNamePrompt(getCurrentNewSessionForm() || form);",
  "Skip/close paths should dismiss without applying the modal input.",
);

assertIncludes(
  "session_name: session.sessionName",
  "Supabase grow_sessions payload must continue persisting session.sessionName.",
);

console.log("New session name prompt regression check passed.");
