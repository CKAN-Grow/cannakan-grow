const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function between(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  assert(start >= 0, `Missing ${startNeedle}.`);
  const end = source.indexOf(endNeedle, start + startNeedle.length);
  assert(end > start, `Missing ${endNeedle}.`);
  return source.slice(start, end);
}

const card = between(app, "function renderHomeSeedVaultAccessMarkup", "function renderHome");
const home = between(app, "function renderHome()", "function syncMockDataBanner");
const vaultPage = between(app, "function renderSeedVaultPage", "function closeSeedVaultEntryModal");
const navigation = between(app, "function shouldScrollToTopForNavigation", "function requestNavigationScrollSync");

assert(card.includes("if (!appState.user)") && card.includes('return ""'), "Home Vault access must be authenticated owner content.");
assert(card.includes("My Seed Vault") && card.includes("Manage your seed library, planning, notes, collections, and testing programs."), "Populated Home Vault content is missing.");
assert(card.includes("Start Your Seed Vault") && card.includes("Keep your varieties, sources, notes, and future plans organized in one place."), "Empty Home Vault content is missing.");
assert(card.includes("Add Your First Seed") && card.includes("Open Seed Vault"), "Empty Vault actions must remain available.");
assert(card.includes('href="#seed-vault"') && card.includes('data-home-seed-vault-add="true"'), "Home Vault actions must reuse the canonical Vault route and Add Seed workflow.");
assert(card.includes("getCanonicalOwnerAnalytics().seedVault.overview"), "Home Vault summaries must consume the Owner Analytics Contract.");
for (const field of ["totalVarieties", "totalSeedsOwned", "totalSources"]) {
  assert(card.includes(`vaultOverview.${field}`), `Home Vault summary is missing Owner Analytics ${field}.`);
}
assert(!card.includes("appState.seedVaultEntries") && !card.includes("getSeedVaultCollectionSummary") && !card.includes(".reduce("), "Home must not calculate Vault analytics from operational rows.");
assert(!card.includes("profile") && !card.includes("hasSessionHistory") && !card.includes("firstSession"), "Profile or session state must not gate Home Vault access.");

const vaultPlacement = home.indexOf('insertAdjacentHTML("afterend", renderHomeSeedVaultAccessMarkup())');
const publicPlacement = home.indexOf("renderHomeSecondaryInfoRowMarkup()");
assert(vaultPlacement >= 0 && publicPlacement > vaultPlacement, "Home Vault access must appear before Community and Explorer content.");
assert(home.includes('appState.seedVaultOpenAddOnRender = true'), "Home Add Seed must queue the existing Vault workflow.");
assert(vaultPage.includes("appState.seedVaultOpenAddOnRender") && vaultPage.includes("openSeedVaultEntryModal()"), "Vault route must launch the existing Add Seed modal for a Home intent.");
assert(navigation.includes("return !shouldPreserveScrollForNavigation"), "Standard Vault navigation must retain the global scroll-to-top rule.");

assert(css.includes(".home-seed-vault-card") && css.includes(".home-seed-vault-summary") && css.includes(".home-seed-vault-actions"), "Home Vault styles are missing.");
const mobileCss = css.slice(css.indexOf("@media (max-width: 640px)"));
assert(mobileCss.includes(".home-seed-vault-card") && mobileCss.includes("grid-template-columns: minmax(0, 1fr)") && mobileCss.includes("min-width: 0"), "Mobile Home Vault layout must stack without horizontal overflow.");

console.log("Home Seed Vault access regression checks passed.");
