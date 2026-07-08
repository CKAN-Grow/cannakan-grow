const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

const requiredNeedles = [
  "function resetNewSessionMethodSpecificDraftState(form, previousMethodType = \"\", nextMethodType = \"\")",
  "resetNewSessionMethodSpecificDraftState(form, previousMethod, nextMethod);",
  "const isCreateSessionMethodField = Boolean(field.closest(\"#session-form\"));",
  "field.disabled = isCreateSessionMethodField ? false : !allowFullEditing;",
  "previousMethod.isStandardized && !nextMethod.isStandardized",
  "nextMethod.isStandardized && !String(unitIdField.value || \"\").trim()",
];

for (const needle of requiredNeedles) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing new-session method switching guard: ${needle}`);
  }
}

const changeHandlerMatch = appSource.match(/systemTypeField\.addEventListener\("change", \(\) => \{[\s\S]*?\n  \}\);/);
if (!changeHandlerMatch) {
  throw new Error("Could not locate new-session Method Type change handler.");
}

const changeHandler = changeHandlerMatch[0];
const resetIndex = changeHandler.indexOf("resetNewSessionMethodSpecificDraftState(form, previousMethod, nextMethod);");
const renderRowsIndex = changeHandler.indexOf("renderPartitionRows(form, nextMethod, sessionStatusField.value);");
if (resetIndex < 0 || renderRowsIndex < 0 || resetIndex > renderRowsIndex) {
  throw new Error("Method-specific draft reset must run before partition rows are rendered.");
}

console.log("New Session method switching regression check passed.");
