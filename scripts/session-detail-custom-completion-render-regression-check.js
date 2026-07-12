const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

const functionMatch = appSource.match(/const syncCustomCompletionAction = \(\) => \{[\s\S]*?\n  \};/);
if (!functionMatch) {
  throw new Error("Could not locate syncCustomCompletionAction.");
}

const functionSource = functionMatch[0];
[
  "target.getAttribute",
  "renderSeedVaultSection();",
  "setSeedVaultCollectionStateValue(",
].forEach((needle) => {
  if (functionSource.includes(needle)) {
    throw new Error(`syncCustomCompletionAction contains unrelated or undefined target logic: ${needle}`);
  }
});

[
  "const isCustomMethod = usesCustomMethodWorkflow(sessionMethod.id);",
  "const isCompleted = normalizeSessionStatus(detail.statusField?.value || session.sessionStatus || \"\") === \"completed\";",
  "detail.customCompletionActions.hidden = !isCustomMethod || isCompleted;",
  "detail.customCompleteButton.disabled = !isCustomMethod || isCompleted;",
].forEach((needle) => {
  if (!functionSource.includes(needle)) {
    throw new Error(`syncCustomCompletionAction is missing expected completion visibility logic: ${needle}`);
  }
});

console.log("Session detail custom completion render regression check passed.");
