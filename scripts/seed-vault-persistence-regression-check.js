const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "function mergeSeedVaultEntryCollections(primaryEntries = [], secondaryEntries = [])",
  "function syncSeedVaultEntriesToBackend(entries = [], userId = appState.user?.id || \"\")",
  "seed_variety: normalizedEntry.seedVariety || normalizedEntry.seedName",
  "sex: normalizedEntry.seedSex || null",
  "seed_sex: normalizedEntry.seedSex || null",
  "seed_count: normalizedEntry.seedCount",
  "remaining_count: normalizedEntry.remainingCount",
  "year_acquired: normalizedEntry.yearAcquired",
  "seed_age_years: normalizedEntry.seedAgeYears",
  "acquired_at: normalizedEntry.acquiredAt || null",
  "return normalizedUserId ? `${SEED_VAULT_STORAGE_KEY}:${normalizedUserId}` : SEED_VAULT_STORAGE_KEY;",
  "function getSeedVaultMissingOptionalRestColumn(error = null)",
  "function omitSeedVaultRestColumns(row = {}, omittedColumns = [])",
  "function upsertSeedVaultRowsWithSchemaCompatibility(rowsOrRow, options = {})",
  ".upsert(payload, { onConflict: \"id\" })",
  "Supabase REST schema is missing optional column; retrying without it.",
  "const localEntries = loadStoredSeedVaultEntries(userId);",
  "const mergedEntries = mergeSeedVaultEntryCollections(backendEntries, localEntries);",
  "return saveSeedVaultEntries(mergedEntries, userId);",
  "throwOnFailure: true",
  "upsertSeedVaultRowsWithSchemaCompatibility(row, { single: true })",
  "upsertSeedVaultRowsWithSchemaCompatibility(rows)",
  "Backend save succeeded with optional REST columns omitted.",
  "function isSeedVaultEntriesColumnMissingError(error)",
  "function isSeedVaultEntriesSchemaError(error)",
  "function getSeedVaultSupabaseErrorMessage(error = null, action = \"save\")",
  "console.error(\"[My Seed Vault] Backend save failed.\"",
  "console.error(\"[My Seed Vault] Backend delete failed.\"",
  "showSeedVaultSaveFailureToast(error.message || \"My Seed Vault could not be updated. Please try again.\");",
  "My Seed Vault could not be saved. Please try again.",
  "function handleSeedVaultEntriesSchemaMissing(error = null)",
  "My Seed Vault table is missing from Supabase REST schema cache. Apply the latest seed_vault_entries migration.",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing Seed Vault persistence safeguard: ${needle}`);
  }
}

for (const forbidden of [
  "My Seed Vault account sync is waiting on the latest Supabase migration",
  "Using browser storage for now",
  "seed-vault-sync-note",
  "Backend sync skipped; local entries remain available",
]) {
  if (appSource.includes(forbidden)) {
    throw new Error(`Seed Vault should not show technical persistence details: ${forbidden}`);
  }
}

console.log("Seed Vault persistence regression check passed.");
