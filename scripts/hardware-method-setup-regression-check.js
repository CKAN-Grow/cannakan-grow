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
  'class="hardware-overview-metrics"',
  'data-method-overview-count-label',
  'data-method-overview-count-helper',
  'data-hardware-method-title',
  'data-hardware-unit-label',
  'data-hardware-session-fields',
  'class="hardware-session-column"',
  'id="session-lifecycle-supplies-anchor"',
  '<select name="unitId">',
]) {
  if (!indexSource.includes(needle)) {
    throw new Error(`Missing hardware card markup: ${needle}`);
  }
}

const hardwareCardStart = indexSource.indexOf('class="system-layout-block hardware-method-card session-glass-panel"');
const hardwareSessionColumnStart = indexSource.indexOf('class="hardware-session-column"');
const lifecycleStart = indexSource.indexOf('id="session-lifecycle-section"');
const visualTimelineStart = indexSource.indexOf('id="session-engine-visual-timeline"');
const suppliesAnchorStart = indexSource.indexOf('id="session-lifecycle-supplies-anchor"');
const chartShellStart = indexSource.indexOf('id="partition-chart-shell"');
const hardwareCardEnd = indexSource.indexOf("</section>", suppliesAnchorStart);
const hardwareCardMarkup = hardwareCardStart >= 0 && hardwareCardEnd > hardwareCardStart
  ? indexSource.slice(hardwareCardStart, hardwareCardEnd)
  : "";
if (!hardwareCardMarkup.includes('<select name="unitId">')) {
  throw new Error("KAN/TRā unit selector must live inside the hardware method card.");
}
if (!hardwareCardMarkup.includes('id="session-engine-visual-timeline"')) {
  throw new Error("Session Timeline should live in the right side of the KAN/TRā hardware setup card.");
}
if (!hardwareCardMarkup.includes('id="session-lifecycle-supplies-anchor"')) {
  throw new Error("KAN filter paper setup anchor should live below the Session Timeline in the hardware setup right column.");
}
if (!(hardwareSessionColumnStart >= 0 && visualTimelineStart > hardwareSessionColumnStart)) {
  throw new Error("Session Timeline should render inside the hardware session right column.");
}
if (!(visualTimelineStart >= 0 && suppliesAnchorStart > visualTimelineStart)) {
  throw new Error("KAN filter paper supply should render directly below Session Progress/Timeline.");
}
if (!(suppliesAnchorStart >= 0 && chartShellStart > suppliesAnchorStart)) {
  throw new Error("Seed chart should render below the KAN filter paper supply anchor.");
}
if (!(chartShellStart >= 0 && lifecycleStart > chartShellStart)) {
  throw new Error("Grow Companion should remain outside the hardware setup flow and render after the seed chart.");
}
if (appSource.includes('class="active-session-supplies-reminder"')) {
  throw new Error("KAN setup Filter Paper Supply card should not render the extra helper text line.");
}

for (const needle of [
  "function getHardwareMethodCardCopy(methodType = \"\")",
  "function getHardwareMethodOverviewCopy(methodType = \"\")",
  "function getMethodOverviewCountLabel(methodType = \"\")",
  "function getVisibleMethodEntryCount(scope = null, methodType = \"\")",
  "function getWorkflowMethodSetupSummary(methodType = \"\", scope = null)",
  "function buildWorkflowMethodVisualMarkup(method, form = null)",
  "function syncHardwareMethodSetupFields(scope, method)",
  "function syncHardwareMethodOverview(scope, method)",
  "unitLabel: \"KAN Unit\"",
  "unitLabel: \"TRā Unit\"",
  "element.dataset.hardwareActive = String(method.supportsLayoutImage)",
  "const svgMarkup = await getInlineSvgMarkup(systemType);",
  "function bindSystemLayoutNodeSelection(container)",
  "function activatePartitionRowFromLayoutNode(container, node)",
  "scope.querySelectorAll(\"[data-hardware-unit-label]\")",
  "scope.querySelectorAll(\"[data-method-overview-count-label]\")",
  "scope.querySelectorAll(\"[data-method-overview-count-helper]\")",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing hardware setup behavior: ${needle}`);
  }
}

for (const forbidden of [
  "function buildHardwareRadialLayoutImage",
  "hardware-layout-slice",
  "data-hardware-partition-count",
  "hardware-session-steps-preview",
  "hardware-session-steps-card",
  "active-session-setup-next",
  "Set Up Filter Paper",
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
  ".session-workspace-shell .hardware-session-column",
  ".session-workspace-form .session-chart-header",
  ".workflow-method-visual-card",
  "grid-template-areas:",
  "\"hero timeline\"",
  "\"supplies supplies\"",
  ".session-workspace-shell .hardware-session-column > .session-engine-visual-timeline",
  ".session-workspace-shell .hardware-session-column > .session-lifecycle-supplies-anchor .active-session-supplies-card .command-icon-svg",
  "width: 34px;",
  "min-height: 34px;",
  ".session-workspace-shell .hardware-overview-metrics",
  ".session-workspace-shell .hardware-session-fields",
  ".hardware-method-card .system-layout-image-kan",
  ".hardware-method-card .partition-node:focus-visible",
  '.session-workspace-form[data-method-standardized="false"] .hardware-method-card',
  'grid-template-areas:\n    "session"\n    "timeline";',
  '.session-workspace-form[data-method-standardized="false"] .hardware-method-hero',
  "display: none;",
  '.session-workspace-form[data-method-standardized="false"] .hardware-session-column > .session-engine-visual-timeline',
  "justify-self: stretch;",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing hardware card styling: ${needle}`);
  }
}

for (const forbidden of [
  '[data-method-standardized="false"] .system-layout-block',
  '.session-workspace-form[data-method-standardized="false"] .hardware-overview-metrics',
]) {
  if (stylesSource.includes(forbidden)) {
    throw new Error(`Non-KAN methods must not fall back to the old collapsed layout: ${forbidden}`);
  }
}

console.log("Hardware method setup regression check passed.");
