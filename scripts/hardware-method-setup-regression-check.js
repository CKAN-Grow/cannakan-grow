const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

if (indexSource.includes("Method ID (if using multiple)")) {
  throw new Error("Create Grow Session should no longer render the standalone Method ID field.");
}

for (const needle of [
  'class="system-layout-block hardware-method-card session-glass-panel"',
  'data-hardware-method-title',
  'data-hardware-unit-label',
  'data-hardware-session-fields',
  'id="session-lifecycle-supplies-anchor"',
  '<select name="unitId">',
]) {
  if (!indexSource.includes(needle)) {
    throw new Error(`Missing hardware card markup: ${needle}`);
  }
}

const hardwareCardStart = indexSource.indexOf('class="system-layout-block hardware-method-card session-glass-panel"');
const lifecycleStart = indexSource.indexOf('id="session-lifecycle-section"');
const hardwareCardMarkup = indexSource.slice(hardwareCardStart, lifecycleStart);
if (!hardwareCardMarkup.includes('<select name="unitId">')) {
  throw new Error("KAN/TRā unit selector must live inside the hardware method card.");
}
if (!hardwareCardMarkup.includes('id="session-lifecycle-supplies-anchor"')) {
  throw new Error("KAN filter paper setup anchor must live inside the hardware method card.");
}

for (const needle of [
  "function getHardwareMethodCardCopy(methodType = \"\")",
  "function syncHardwareMethodSetupFields(scope, method)",
  "unitLabel: \"KAN Unit\"",
  "unitLabel: \"TRā Unit\"",
  "const svgMarkup = await getInlineSvgMarkup(systemType);",
  "function bindSystemLayoutNodeSelection(container)",
  "function activatePartitionRowFromLayoutNode(container, node)",
  "scope.querySelectorAll(\"[data-hardware-unit-label]\")",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing hardware setup behavior: ${needle}`);
  }
}

for (const forbidden of [
  "function buildHardwareRadialLayoutImage",
  "hardware-layout-slice",
  "data-hardware-partition-count",
]) {
  if (appSource.includes(forbidden) || indexSource.includes(forbidden) || stylesSource.includes(forbidden)) {
    throw new Error(`Hardware setup must not use the old radial diagram implementation: ${forbidden}`);
  }
}

const kanConfigStart = appSource.indexOf("KAN: Object.freeze({");
const traConfigStart = appSource.indexOf("TRA: Object.freeze({");
const paperTowelConfigStart = appSource.indexOf("PAPER_TOWEL: Object.freeze({");
const kanConfig = kanConfigStart >= 0 && traConfigStart > kanConfigStart
  ? appSource.slice(kanConfigStart, traConfigStart)
  : "";
if (!kanConfig.includes("supportsFilterInventory: true")) {
  throw new Error("KAN must keep filter paper inventory support.");
}

const traConfig = traConfigStart >= 0 && paperTowelConfigStart > traConfigStart
  ? appSource.slice(traConfigStart, paperTowelConfigStart)
  : "";
if (!traConfig.includes("supportsFilterInventory: false")) {
  throw new Error("TRā must not track filter paper inventory.");
}

for (const needle of [
  ".session-workspace-shell .hardware-method-card",
  ".session-workspace-shell .hardware-session-fields",
  ".hardware-method-card .system-layout-image-kan",
  ".hardware-method-card .partition-node:focus-visible",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing hardware card styling: ${needle}`);
  }
}

console.log("Hardware method setup regression check passed.");
