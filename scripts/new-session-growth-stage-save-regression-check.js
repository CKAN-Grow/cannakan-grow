const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const requiredAppNeedles = [
  'function openGrowthStageModal({ stageField, stageTrigger, message = "", focusStageOptions = false } = {})',
  'data-growth-stage-modal-helper',
  'helper.textContent = String(message || "").trim();',
  'helper.hidden = !helper.textContent;',
  'message: "Choose a growth stage before saving this session.",',
  "focusStageOptions: true,",
  'const focusTarget = focusStageOptions',
  '? overlay.querySelector("[data-growth-stage-value]")',
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
  throw new Error("Missing Growth Stage modal prompt when saving without a stage.");
}

if (saveValidationBlock[0].includes("sessionStatusTrigger?.focus();")) {
  throw new Error("Save without a growth stage should open the stage modal, not only focus the trigger.");
}

if (!stylesSource.includes(".growth-stage-modal-helper")) {
  throw new Error("Missing Growth Stage modal helper styling.");
}

console.log("New session growth-stage save regression check passed.");
