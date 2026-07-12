const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const migrationSource = fs.readFileSync(path.join(repoRoot, "supabase", "migrations", "20260712120000_seed_vault_phase1_foundation.sql"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Seed Vault Phase 1 behavior: ${label}`);
  }
}

[
  "source_notes",
  "personal_notes",
  "grow_notes",
  "collections",
  "tags",
  "planning_status",
  "grow_along_enabled",
  "testing_program_enabled",
  "acquired_from",
  "acquisition_date",
  "order_number",
  "price",
  "breeder",
  "function normalizeSeedVaultGrowNotes(value = [])",
  "function getSeedVaultEffectivePlanningStatus(entry = null, entryAnalytics = null)",
  "data-seed-vault-collection-filter=\"true\"",
  "data-seed-vault-tag-filter=\"true\"",
  "data-seed-vault-grow-along-filter=\"true\"",
  "data-seed-vault-testing-program-filter=\"true\"",
  "data-seed-vault-breeder-filter=\"true\"",
  "data-seed-vault-age-filter=\"true\"",
  "name=\"sourceNotes\"",
  "name=\"personalNotes\"",
  "data-seed-vault-grow-note-row",
  "data-seed-vault-add-grow-note=\"true\"",
].forEach((needle) => requireNeedle(appSource, needle));

[
  ".seed-vault-entry-indicator",
  ".seed-vault-form-section",
  ".seed-vault-grow-note-row",
  ".seed-vault-note-type-grid",
].forEach((needle) => requireNeedle(stylesSource, needle));

[
  "create table if not exists public.seed_vault_collections",
  "create table if not exists public.seed_vault_entry_collections",
  "create table if not exists public.seed_vault_tags",
  "create table if not exists public.seed_vault_entry_tags",
  "create table if not exists public.seed_vault_grow_notes",
  "personal_notes = nullif(coalesce(nullif(personal_notes, ''), nullif(notes, '')), '')",
  "auth.uid() = user_id",
].forEach((needle) => requireNeedle(migrationSource, needle));

console.log("Seed Vault Phase 1 regression check passed.");
