const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8").replace(/\r\n/g, "\n");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

const timelineIndex = indexSource.indexOf('id="session-engine-visual-timeline"');
const chartShellIndex = indexSource.indexOf('id="partition-chart-shell"');
const chartHeaderIndex = indexSource.indexOf('id="partition-chart-header"');

if (timelineIndex === -1) {
  throw new Error("Session Experience v2 should render the visual Session Timeline host.");
}

if (chartShellIndex === -1) {
  throw new Error("Session Experience v2 should render the seed chart shell.");
}

if (chartHeaderIndex === -1) {
  throw new Error("Session Experience v2 should render the seed chart header.");
}

if (timelineIndex > chartShellIndex) {
  throw new Error("Session Timeline should render above the seed chart shell.");
}

const chartShellMarkup = indexSource.slice(chartShellIndex, chartHeaderIndex);
const setupToolsIndex = chartShellMarkup.indexOf('class="session-setup-tools-card"');
if (setupToolsIndex === -1) {
  throw new Error("Session setup tools should render inside the seed chart card header.");
}

const setupToolsMarkup = chartShellMarkup.slice(setupToolsIndex);
const requiredMarkupNeedles = [
  "Session Setup Tools",
  "session-setup-tool--seed-age",
  'id="seed-age-setup-host"',
  'id="new-session-seed-vault-section"',
];

for (const needle of requiredMarkupNeedles) {
  if (!setupToolsMarkup.includes(needle)) {
    throw new Error(`Missing unified setup tools markup: ${needle}`);
  }
}

if (setupToolsMarkup.indexOf('id="new-session-seed-vault-section"') < setupToolsMarkup.indexOf('id="seed-age-setup-host"')) {
  throw new Error("Seed Vault setup should stack below Track Seed Age in the shared setup tools card.");
}

if (indexSource.slice(timelineIndex, chartShellIndex).includes('class="session-setup-tools-card"')) {
  throw new Error("Session setup tools should no longer render in the old pre-chart position.");
}

if (!appSource.includes("session-setup-tool--seed-vault new-session-seed-vault-toggle")) {
  throw new Error("Seed Vault setup toggle should use the shared setup-tool styling hook.");
}

const requiredStyleNeedles = [
  ".session-workspace-form .session-setup-tools-card",
  "--session-setup-age-accent: #d9a74e;",
  "--session-setup-vault-accent: #72d7ff;",
  ".session-workspace-form .session-setup-tool--seed-age",
  ".session-workspace-form .session-setup-tool--seed-vault",
  ".session-workspace-form .session-engine-visual-timeline",
  ".session-workspace-form #partition-chart-shell > .partition-work-header",
];

for (const needle of requiredStyleNeedles) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing unified setup tools style rule: ${needle}`);
  }
}

if (stylesSource.includes('"seed-age seed-age"\n    "seed-age-setup seed-age-setup"')) {
  throw new Error("Track Seed Age should no longer occupy separate oversized partition-header rows in New Session.");
}

console.log("New Session setup tools regression check passed.");
