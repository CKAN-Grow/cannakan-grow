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
const topbarNavStart = indexSource.indexOf('<nav class="topbar-nav" aria-label="Primary">');
const topbarNavEnd = indexSource.indexOf("</nav>", topbarNavStart);
assert(topbarNavStart > -1 && topbarNavEnd > topbarNavStart, "Expected topbar navigation markup.");
const topbarNav = indexSource.slice(topbarNavStart, topbarNavEnd);

assert(
  sessionsTemplate.includes('<section id="seed-vault-shortcut-section"></section>'),
  "My Sessions should keep only a compact My Seed Vault shortcut slot.",
);
assert(
  !sessionsTemplate.includes('<section id="seed-vault-section"></section>'),
  "My Sessions should not embed the full My Seed Vault manager.",
);
assert(
  /href="#sessions"[\s\S]*href="#seed-vault"[\s\S]*href="#learn"/.test(topbarNav),
  "Top navigation should include Vault between Sessions and Learn.",
);

[
  'function renderSeedVaultPage()',
  'function renderMySessionsSeedVaultShortcutMarkup()',
  'function renderSeedVaultPanelIntoSection(seedVaultSection)',
  'function bindSeedVaultPanelControls(seedVaultSection, renderSeedVaultSection = () => {})',
  'if (route === "seed-vault") {',
  'renderSeedVaultPage();',
  '<nav class="seed-vault-page-nav" aria-label="Seed Vault navigation">',
  'seed-vault-back-button',
  'href="#sessions">Back to My Sessions</a>',
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
  '<a class="mobile-nav-link" href="#seed-vault" data-mobile-nav-link="true">Vault</a>',
  'const vaultRoutes = new Set(["seed-vault"]);',
  'activeNav = "seed-vault";',
].forEach((needle) => {
  assert(appSource.includes(needle), `Expected dedicated Seed Vault route behavior: ${needle}`);
});

[
  ".seed-vault-page",
  ".seed-vault-page-nav",
  ".seed-vault-back-button.button",
  ".seed-vault-shortcut-card",
  ".seed-vault-shortcut-main",
  ".seed-vault-shortcut-button",
  ".mobile-nav-link.is-active",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Expected dedicated Seed Vault/shortcut styling: ${needle}`);
});

[
  "seed-vault-page-actions",
].forEach((forbidden) => {
  assert(!appSource.includes(forbidden) && !stylesSource.includes(forbidden), `Seed Vault page should not use oversized page action hook: ${forbidden}`);
});

console.log("Seed Vault dedicated page regression check passed.");
