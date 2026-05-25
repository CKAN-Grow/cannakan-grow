const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const sessionsTemplateStart = indexSource.indexOf('<template id="sessions-template">');
const sessionsTemplateEnd = indexSource.indexOf('<template id="session-detail-template">');
assert(sessionsTemplateStart > -1 && sessionsTemplateEnd > sessionsTemplateStart, "Expected sessions template markup.");
const sessionsTemplate = indexSource.slice(sessionsTemplateStart, sessionsTemplateEnd);

assert(
  sessionsTemplate.includes('<section id="seed-vault-shortcut-section"></section>'),
  "My Sessions should keep only a compact My Seed Vault shortcut slot.",
);
assert(
  !sessionsTemplate.includes('<section id="seed-vault-section"></section>'),
  "My Sessions should not embed the full My Seed Vault manager.",
);

[
  'function renderSeedVaultPage()',
  'function renderMySessionsSeedVaultShortcutMarkup()',
  'function renderSeedVaultPanelIntoSection(seedVaultSection)',
  'function bindSeedVaultPanelControls(seedVaultSection, renderSeedVaultSection = () => {})',
  'if (route === "seed-vault") {',
  'renderSeedVaultPage();',
  'pageLabel: "My Seed Vault"',
  'getCurrentAppPathRoute() === "seed-vault"',
  '"seed-vault": "seed-vault"',
  'route === "seed-vault"',
  '<h3 id="seed-vault-shortcut-title">My Seed Vault</h3>',
  'Catalog seeds, track age, source, quantity, notes, and session history.',
  'Open My Seed Vault',
  'href="#seed-vault"',
  'dropdown?.querySelector("#account-seed-vault-link")?.addEventListener("click"',
  'navigateToSeedVaultRoute();',
  'refreshSeedVaultViewAfterMutation();',
].forEach((needle) => {
  assert(appSource.includes(needle), `Expected dedicated Seed Vault route behavior: ${needle}`);
});

[
  ".seed-vault-page",
  ".seed-vault-page-actions",
  ".seed-vault-shortcut-card",
  ".seed-vault-shortcut-main",
  ".seed-vault-shortcut-button",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Expected dedicated Seed Vault/shortcut styling: ${needle}`);
});

console.log("Seed Vault dedicated page regression check passed.");
