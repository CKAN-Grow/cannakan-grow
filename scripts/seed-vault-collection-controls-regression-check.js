const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  "seedVaultExpandedEntryIds: new Set()",
  "seedVaultSearchQuery",
  "seedVaultFavoriteFilter",
  "seedVaultStatusFilter",
  "seedVaultSort",
  "seedVaultSourceFilter",
  "seedVaultTypeFilter",
  "seedVaultSexFilter",
  "function filterSeedVaultEntriesForCollection(entries = [], options = {})",
  "function sortSeedVaultEntriesForCollection(entries = [], sortValue = appState.seedVaultSort, analytics = null)",
  "data-seed-vault-search=\"true\"",
  "data-seed-vault-favorite-filter=\"true\"",
  "data-seed-vault-status-filter=\"true\"",
  "data-seed-vault-source-filter=\"true\"",
  "data-seed-vault-type-filter=\"true\"",
  "data-seed-vault-sex-filter=\"true\"",
  "data-seed-vault-sort=\"true\"",
  "value=\"quantity-low\"",
  "value=\"performance\"",
  "data-seed-vault-year-acquired=\"true\"",
  "function renderSeedVaultYearAcquiredOptionsMarkup(selectedYear = \"\")",
  "function renderSeedSexSelectOptions(selectedValue = \"\")",
  "const SEED_VAULT_YEAR_ACQUIRED_MIN = 1980;",
  "data-identity-autocomplete=\"source\"",
  "data-identity-autocomplete=\"seedVariety\"",
  "name=\"seedVariety\"",
  "name=\"seedSex\"",
  "${renderSeedTypeSelectOptions(normalizedEntry?.seedType || \"\")}",
  "${renderSeedSexSelectOptions(normalizedEntry?.seedSex || \"\")}",
  "name=\"storageNotes\"",
  "name=\"visibility\"",
  "initializePartitionIdentityAutocompletes(form);",
  "seed_variety: normalizedEntry.seedVariety || normalizedEntry.seedName",
  "seed_sex: normalizedEntry.seedSex || null",
  "data-seed-vault-toggle",
  "data-seed-vault-edit",
  "data-seed-vault-start-session",
  "function startNewSessionFromSeedVaultEntry(entryId = \"\")",
  "data-seed-vault-delete",
  "seed-vault-favorite-button",
  "Delete this Vault Entry from My Seed Vault?",
  "Edit Vault Entry",
  "Start Session from Vault Entry",
  "seed-vault-entry-details",
  "No Vault Entries match these controls",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing Seed Vault collection control behavior: ${needle}`);
  }
}

for (const needle of [
  ".seed-vault-controls",
  ".seed-vault-entry-collapsed-row",
  ".seed-vault-compact-cell",
  ".seed-vault-compact-status",
  ".seed-vault-entry-form select",
  ".seed-vault-year-estimate",
  ".seed-vault-entry-details[hidden]",
  ".seed-vault-filter-row",
  ".seed-vault-expand-button:hover",
  ".seed-vault-favorite-button.is-active",
  ".seed-vault-favorite-indicator.is-active",
  "fill: currentColor;",
  "#ff6f82",
  ".seed-vault-icon-button--delete",
  ".seed-vault-filter-empty",
  "@media (max-width: 640px)",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing Seed Vault collection control styling: ${needle}`);
  }
}

for (const forbidden of [
  "My Seed Vault account sync is waiting on the latest Supabase migration",
  "Using browser storage for now",
  "seed-vault-sync-note",
  'name="yearAcquired" type="number"',
  "Seed name / variety",
  "Seed type/category",
]) {
  if (appSource.includes(forbidden) || stylesSource.includes(forbidden)) {
    throw new Error(`Seed Vault should not show developer storage details: ${forbidden}`);
  }
}

console.log("Seed Vault collection controls regression check passed.");
