const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

const requiredAppNeedles = [
  'defaultSessionStatus: "active",',
  'sessionStatusField.value = getMethodDefaultSessionStatus(normalizedSystemType);',
  'sessionStatusField.value = getMethodDefaultSessionStatus(nextMethod);',
  'const defaultStatus = getMethodDefaultSessionStatus(form.elements.systemType?.value || systemTypeField.value || "KAN") || "active";',
  "updateSessionStatusAppearance(sessionStatusField, sessionStatusTrigger);",
];

for (const needle of requiredAppNeedles) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing growth-stage save prompt behavior: ${needle}`);
  }
}

const saveValidationBlock = appSource.match(/if \(!validateSessionStatus\(sessionStatusField, sessionStatusError\)\) \{[\s\S]*?\n    \}/);
if (!saveValidationBlock) {
  throw new Error("Could not find New Session growth-stage validation block.");
}

if (!saveValidationBlock[0].includes("openGrowthStageModal({")) {
  // Expected: save now derives a method default status instead of opening the retired stage modal.
} else {
  throw new Error("Save without a growth stage should not open the retired stage modal.");
}

[
  "maybePromptGrowthStage(form, sessionStatusField, sessionStatusTrigger)",
  "appState.growthStageModalDismissed = false;\n      openGrowthStageModal({ stageField: sessionStatusField, stageTrigger: sessionStatusTrigger });",
  "message: \"Choose a growth stage before saving this session.\"",
  "focusStageOptions: true,",
].forEach((needle) => {
  if (appSource.includes(needle)) {
    throw new Error(`Retired chart/save growth-stage modal trigger is still active: ${needle}`);
  }
});

const detailStatusTriggerBlock = appSource.match(/detail\.statusTrigger\?\.addEventListener\("click", \(\) => \{[\s\S]*?\n    \}\);/);
if (!detailStatusTriggerBlock) {
  throw new Error("Could not find detail status trigger block.");
}

if (detailStatusTriggerBlock[0].includes("openGrowthStageModal({")) {
  throw new Error("Saved session detail status trigger should not open the retired stage modal.");
}

console.log("New session automated status regression check passed.");
