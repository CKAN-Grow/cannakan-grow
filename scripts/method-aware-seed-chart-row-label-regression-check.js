const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

function requireNeedle(needle, label = needle) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing method-aware seed chart row-label behavior: ${label}`);
  }
}

const expectedMethodLabels = [
  ["KAN", "Partition"],
  ["TRA", "Partition"],
  ["PAPER_TOWEL", "Row"],
  ["PAPER_TOWEL_SOAK", "Row"],
  ["ROCKWOOL", "Cube"],
  ["RAPID_ROOTER", "Plug"],
  ["WATER_SOAK", "Glass"],
  ["DIRECT_SOW", "Pot"],
  ["OTHER", "Row"],
];

for (const [methodId, rowLabel] of expectedMethodLabels) {
  const methodBlock = new RegExp(`${methodId}: Object\\.freeze\\(\\{[\\s\\S]*?rowLabel: "${rowLabel}"`);
  if (!methodBlock.test(appSource)) {
    throw new Error(`Expected ${methodId} to use rowLabel "${rowLabel}".`);
  }
}

for (const needle of [
  "function syncMethodChartHeader(chartHeader, methodType = \"\")",
  "firstHeader.textContent = method.rowLabel;",
  "function syncMethodSeedAgeCopy(scope, method)",
  "syncMethodSeedAgeCopy(scope, method);",
  "syncMethodSeedAgeCopy(form, getMethodConfig(form.elements?.systemType?.value || form.dataset.methodType || \"KAN\"));",
  "rowLabel: method.rowLabel,",
  "return `${method.rowLabel} ${numericId}`;",
  "const rowLabel = method.rowLabel;",
  "Select seeds from your collection to auto-fill ${method.rowLabel.toLowerCase()} details.",
  "displayLabel: `${method.rowLabel} ${partitionNumber}`,",
]) {
  requireNeedle(needle);
}

console.log("Method-aware seed chart row label regression check passed.");
