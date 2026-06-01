const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

const requiredAppNeedles = [
  "seedVault: `",
  "section-title-with-icon app-section-header-main seed-vault-header-main",
  'data-app-icon="seedVault"',
  "hydrateAppIconSlots(seedVaultSection);",
  "normalizeSectionHeaderLayouts(seedVaultSection);",
];

for (const needle of requiredAppNeedles) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing shared section-header app behavior: ${needle}`);
  }
}

const requiredStyleNeedles = [
  ".app-section-header-main {\n  width: 100%;\n  flex: 1 1 360px;\n  min-width: 0;\n  display: grid;\n  grid-template-columns: auto minmax(0, 1fr);",
  ".session-workspace-shell .progress-chart-heading,\n.session-workspace-shell .session-images-heading > div,\n.session-workspace-shell .session-notes-section > .session-notes-field {\n  display: grid;\n  grid-template-columns: 64px minmax(0, 1fr);",
  ".partition-work-heading {\n    grid-template-columns: 56px minmax(0, 1fr);\n    grid-template-areas:\n      \"icon eyebrow\"\n      \"icon title\";",
];

for (const needle of requiredStyleNeedles) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing shared section-header style behavior: ${needle}`);
  }
}

if (stylesSource.includes('grid-template-areas:\n      "icon"\n      "eyebrow"\n      "title";')) {
  throw new Error("Main section header icons should not stack above title text on mobile.");
}

console.log("Global section header alignment regression check passed.");
