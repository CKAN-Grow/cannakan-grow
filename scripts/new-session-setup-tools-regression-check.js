const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const setupToolsMatch = indexSource.match(/<div class="session-setup-tools-card"[\s\S]*?<div id="partition-chart-shell"/);
if (!setupToolsMatch) {
  throw new Error("New Session setup tools should render before the partition chart.");
}

const setupToolsMarkup = setupToolsMatch[0];
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

if (!appSource.includes("session-setup-tool--seed-vault new-session-seed-vault-toggle")) {
  throw new Error("Seed Vault setup toggle should use the shared setup-tool styling hook.");
}

const requiredStyleNeedles = [
  ".session-workspace-form .session-setup-tools-card",
  "--session-setup-age-accent: #d9a74e;",
  "--session-setup-vault-accent: #72d7ff;",
  ".session-workspace-form .session-setup-tool--seed-age",
  ".session-workspace-form .session-setup-tool--seed-vault",
  "grid-template-areas:\n    \"heading sequence\"\n    \"setup-tools setup-tools\";",
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
