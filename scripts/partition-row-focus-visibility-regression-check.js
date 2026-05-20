const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const requiredSelectors = [
  ".session-workspace-shell .partition-row:focus-within",
  "body.theme-dark .partition-row:focus-within",
  "body.theme-dark .partition-table .partition-row:focus-within",
  "body.theme-dark .session-workspace-shell .partition-row:focus-within",
  "body.theme-dark .session-workspace-shell .partition-row:focus-within input",
  "body.theme-dark .session-workspace-shell .partition-row:focus-within select",
  "body.theme-dark .session-workspace-shell .partition-row:focus-within .custom-select-trigger",
];

for (const selector of requiredSelectors) {
  if (!stylesSource.includes(selector)) {
    throw new Error(`Missing partition focus selector: ${selector}`);
  }
}

const requiredDeclarations = [
  "inset 4px 0 0 rgba(148, 209, 89, 0.44)",
  "border-color: rgba(148, 209, 89, 0.44) !important;",
  "0 0 22px rgba(148, 209, 89, 0.11)",
  "background: rgba(148, 209, 89, 0.05) !important;",
  "background: #223126 !important;",
];

for (const declaration of requiredDeclarations) {
  if (!stylesSource.includes(declaration)) {
    throw new Error(`Missing partition focus visual treatment: ${declaration}`);
  }
}

console.log("Partition row focus visibility regression check passed.");
