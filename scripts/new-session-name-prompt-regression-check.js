const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

function assertIncludes(needle, message) {
  if (!appSource.includes(needle)) {
    throw new Error(message);
  }
}

assertIncludes(
  "function applyNewSessionNamePromptValue(form, value = \"\")",
  "Missing centralized First Action session-name apply helper.",
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
  "dismissNewSessionNamePrompt(form);",
  "Skip/close paths should dismiss without applying the modal input.",
);

assertIncludes(
  "session_name: session.sessionName",
  "Supabase grow_sessions payload must continue persisting session.sessionName.",
);

console.log("New session name prompt regression check passed.");
