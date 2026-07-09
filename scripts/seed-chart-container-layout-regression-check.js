const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

const chartStart = indexSource.indexOf('id="partition-chart-shell"');
const saveShortcutStart = indexSource.indexOf('class="timeline-save-shortcut', chartStart);
const lifecycleStart = indexSource.indexOf('id="session-lifecycle-section"', chartStart);
const instructionStart = indexSource.indexOf('class="seed-chart-instruction-callout"', chartStart);
const chartHeaderStart = indexSource.indexOf('id="partition-chart-header"', chartStart);
if (chartStart === -1 || saveShortcutStart === -1) {
  throw new Error("Could not locate New Session seed chart shell boundaries.");
}
if (!(chartStart < saveShortcutStart && saveShortcutStart < lifecycleStart)) {
  throw new Error("Save Session bar must render directly after the Seed Chart and before Grow Companion.");
}
if (!(chartStart < instructionStart && instructionStart < chartHeaderStart && chartHeaderStart < saveShortcutStart)) {
  throw new Error("Seed Chart instructional callout must render inside the chart shell directly above the table header.");
}

const chartShellMarkup = indexSource.slice(chartStart, saveShortcutStart);
[
  'class="partition-work-header',
  'class="session-setup-tools-card"',
  'class="seed-chart-instruction-callout"',
  "Build Your Session",
  "After saving your session, you'll unlock germination results and completion tracking.",
  'id="partition-chart-header"',
  'id="partition-fields"',
  'class="custom-seed-row-actions"',
  'id="add-seed-row"',
].forEach((needle) => {
  if (!chartShellMarkup.includes(needle)) {
    throw new Error(`Seed chart shell is missing unified chart element: ${needle}`);
  }
});

if (chartShellMarkup.includes("custom-seed-row-actions session-glass-panel")) {
  throw new Error("Add-row actions must not render as a detached glass panel.");
}

if (indexSource.includes('</div>\n          <div class="custom-seed-row-actions')) {
  throw new Error("Add-row actions should not render as a sibling after partition-chart-shell.");
}

[
  ".session-workspace-shell .chart-shell {\n  display: grid;\n  gap: 0;",
  ".session-workspace-form #partition-chart-shell > .partition-work-header {\n  padding: 20px 18px 18px;\n  border: 0;\n  background: transparent;\n}",
  ".session-workspace-form .session-setup-tools-card {\n  --session-setup-age-accent: #d9a74e;",
  "  border: 0;\n  border-radius: 0;\n  background: transparent;\n  box-shadow: none;",
  ".seed-chart-instruction-callout {",
  ".seed-chart-instruction-icon {",
  ".seed-chart-instruction-copy strong {",
  ".session-workspace-form #partition-chart-shell > .seed-chart-instruction-callout {",
  ".session-workspace-form #partition-chart-shell > .chart-header {",
  ".session-workspace-form #partition-chart-shell > .partition-table {",
  ".custom-seed-row-actions {\n  display: flex;",
  ".session-workspace-form #partition-chart-shell > .custom-seed-row-actions {\n  padding: 16px 22px 24px;\n  border-top: 0;\n  background: transparent;\n  box-shadow: none;\n}",
].forEach((needle) => {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing unified seed chart container style: ${needle}`);
  }
});

console.log("Seed chart container layout regression check passed.");
