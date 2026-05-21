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
  "function filterSeedVaultEntriesForCollection(entries = [], options = {})",
  "function sortSeedVaultEntriesForCollection(entries = [], sortValue = appState.seedVaultSort)",
  "data-seed-vault-search=\"true\"",
  "data-seed-vault-favorite-filter=\"true\"",
  "data-seed-vault-status-filter=\"true\"",
  "data-seed-vault-sort=\"true\"",
  "data-seed-vault-toggle",
  "data-seed-vault-delete",
  "Delete this Vault Entry from My Seed Vault?",
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
  ".seed-vault-entry-details[hidden]",
  ".seed-vault-filter-row",
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
]) {
  if (appSource.includes(forbidden) || stylesSource.includes(forbidden)) {
    throw new Error(`Seed Vault should not show developer storage details: ${forbidden}`);
  }
}

console.log("Seed Vault collection controls regression check passed.");
