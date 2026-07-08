const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(needle, label = needle) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing method-aware seed chart row-label behavior: ${label}`);
  }
}

const expectedMethodLabels = [
  ["KAN", "Partition"],
  ["TRA", "Partition"],
  ["PAPER_TOWEL", "Towel"],
  ["PAPER_TOWEL_SOAK", "Towel"],
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
  "function getMethodRowBadgePrefix(methodType = \"\", rowLabel = \"\")",
  "function getMethodRowBadgeLabel(methodType = \"\", rowId = 0, rowLabel = \"\")",
  "function getMethodRowBadgeAccent(methodType = \"\")",
  "return `${getMethodRowBadgePrefix(methodType, rowLabel)} ${numericId}`;",
  "const displayLabel = `${rowLabel} ${partition.id}`;",
  "const badgeLabel = getMethodRowBadgeLabel(options.methodType || \"\", partition.id, rowLabel);",
  "<span class=\"partition-row-badge\">${escapeHtml(badgeLabel)}</span>",
  "const displayLabel = `${rowLabel} ${displayIndex}`;",
  "const badgeLabel = getMethodRowBadgeLabel(options.methodType || \"\", displayIndex, rowLabel);",
  "function syncMethodSeedAgeCopy(scope, method)",
  "syncMethodSeedAgeCopy(scope, method);",
  "syncMethodSeedAgeCopy(form, getMethodConfig(form.elements?.systemType?.value || form.dataset.methodType || \"KAN\"));",
  "rowLabel: method.rowLabel,",
  "methodType: method.id,",
  "return `${method.rowLabel} ${numericId}`;",
  "const rowLabel = method.rowLabel;",
  "Select seeds from your collection to auto-fill ${method.rowLabel.toLowerCase()} details.",
  "displayLabel: `${method.rowLabel} ${partitionNumber}`,",
  "element.hidden = method.isStandardized;",
  "button.textContent = `+ Add ${method.rowLabel}`;",
  "if (method.isStandardized) {",
]) {
  requireNeedle(needle);
}

for (const [methodId, badgePrefix] of [
  ["KAN", "P"],
  ["TRA", "P"],
  ["PAPER_TOWEL", "T"],
  ["PAPER_TOWEL_SOAK", "T"],
  ["WATER_SOAK", "G"],
  ["ROCKWOOL", "C"],
  ["RAPID_ROOTER", "PL"],
  ["DIRECT_SOW", "POT"],
  ["OTHER", "R"],
]) {
  const methodBlock = new RegExp(`case "${methodId}":[\\s\\S]*?return "${badgePrefix}";`);
  if (!methodBlock.test(appSource)) {
    throw new Error(`Expected ${methodId} to use row badge prefix "${badgePrefix}".`);
  }
}

for (const needle of [
  ".partition-row-badge",
  ".session-workspace-shell .partition-number--badge",
  "--partition-badge-accent",
  "min-width: 46px;",
  "min-height: 32px;",
  "padding: 0 14px;",
  "font-size: 0.82rem;",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing method-aware row badge style: ${needle}`);
  }
}

console.log("Method-aware seed chart row label regression check passed.");
