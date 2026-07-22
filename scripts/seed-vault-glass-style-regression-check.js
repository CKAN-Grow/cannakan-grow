const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const marker = "/* Seed Vault 3.0 approved design */";
const markerIndex = stylesSource.indexOf(marker);

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) throw new Error(`${label}: ${needle}`);
}

function assertExcludes(source, needle, label) {
  if (source.includes(needle)) throw new Error(`${label}: ${needle}`);
}

function functionBlock(source, name, nextName) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf(`function ${nextName}(`, start + 1);
  if (start < 0 || end < 0) throw new Error(`Could not locate ${name}`);
  return source.slice(start, end);
}

if (markerIndex < 0) throw new Error("Missing Seed Vault 3.0 approved design marker");
const finalStyles = stylesSource.slice(markerIndex);
const panelRenderer = functionBlock(appSource, "renderMySeedVaultPanelMarkup", "renderMySessionsSeedVaultShortcutMarkup");
const ownerOverviewRenderer = functionBlock(appSource, "renderSeedVaultOwnerOverviewMarkup", "renderMySeedVaultPanelMarkup");
const sharedSummaryRenderer = functionBlock(appSource, "renderSeedVaultInlineSummaryMarkup", "renderSeedVaultIndicatorMarkup");

for (const needle of [
  ".seed-vault-page {",
  "max-width: var(--app-page-max-width, 1280px)",
  ".seed-vault-overview-primary-grid",
  "grid-template-columns: minmax(0, 0.46fr) minmax(0, 0.54fr)",
  ".seed-vault-overview-engagement-grid",
  "grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr)",
  ".seed-vault-library-shell",
  ".seed-vault-more-filters-panel",
  "@media (max-width: 960px)",
  ".seed-vault-overview-primary-grid,\n  .seed-vault-overview-engagement-grid {\n    grid-template-columns: 1fr",
  "@media (max-width: 760px)",
  ".seed-vault-entry-grid--gallery {\n    grid-template-columns: 1fr",
  "overflow-x: auto",
  "@media (prefers-reduced-motion: reduce)",
]) assertIncludes(finalStyles, needle, "Missing approved Seed Vault 3.0 style guard");

assertExcludes(finalStyles, "grid-template-columns: minmax(0, 1fr) 276px", "Persistent sidebar returned in final Vault style layer");
assertIncludes(panelRenderer, "seed-vault-library-shell", "My Library shell missing");
assertIncludes(panelRenderer, "seed-vault-more-filters", "Contained More Filters missing");
assertIncludes(panelRenderer, "data-seed-vault-manage-collections", "Manage Collections missing from advanced filters");
assertExcludes(panelRenderer, "seed-vault-collection-layout", "Legacy inventory/sidebar layout still rendered");
assertExcludes(panelRenderer, "renderSeedVaultSummaryPanelMarkup", "Persistent inventory support sidebar still rendered");

for (const needle of [
  "seed-vault-approved-hero",
  "Your personal seed library.",
  "Collect. Learn. Plan. Grow.",
  "seed-vault-overview-primary-grid",
  "seed-vault-overview-engagement-grid",
  "renderSeedVaultSharingHubMarkup()",
  "Recent Activity",
]) assertIncludes(ownerOverviewRenderer, needle, "Approved owner overview composition missing");

for (const quickFilter of ["All Seeds", "In Stock", "Planned", "Testing", "Low Stock", "Favorites"]) {
  assertIncludes(appSource, quickFilter, "Approved Library quick filter missing");
}

for (const filterAttribute of [
  "data-seed-vault-source-filter",
  "data-seed-vault-breeder-filter",
  "data-seed-vault-type-filter",
  "data-seed-vault-sex-filter",
  "data-seed-vault-age-filter",
  "data-seed-vault-grow-along-filter",
  "data-seed-vault-testing-program-filter",
]) assertIncludes(panelRenderer, filterAttribute, "Advanced filter missing");

assertIncludes(appSource, 'appState.supabase.rpc("get_gie_my_analytics")', "Canonical owner GEE RPC missing");
assertIncludes(appSource, "function getCanonicalOwnerAnalytics()", "Canonical owner analytics adapter missing");
assertExcludes(ownerOverviewRenderer, "getSessions()", "Approved overview introduced a raw-session analytics read");
assertExcludes(ownerOverviewRenderer, "getCanonicalOwnerAnalytics()", "Inventory overview bypassed its Vault provider analytics input");
assertExcludes(sharedSummaryRenderer, "getCanonicalOwnerAnalytics()", "Shared Vault summary exposes private owner analytics");
assertIncludes(sharedSummaryRenderer, "analytics?.overview", "Shared Vault summary is not scoped to its authorized provider payload");

console.log("Seed Vault 3.0 approved design regression check passed.");
