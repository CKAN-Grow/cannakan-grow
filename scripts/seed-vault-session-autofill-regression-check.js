const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Seed Vault session autofill behavior: ${label}`);
  }
}

for (const needle of [
  "id=\"new-session-seed-vault-section\"",
]) {
  requireNeedle(htmlSource, needle);
}

for (const needle of [
  "Add from My Seed Vault",
  "function getActiveSeedVaultEntriesForSessionPicker()",
  "function renderNewSessionSeedVaultPicker(section, systemType = \"KAN\")",
  "Select seeds from your collection to auto-fill partition details.",
  "function bindNewSessionSeedVaultPicker(section, form, options = {})",
  "data-seed-vault-apply-to-session",
  "Seeds per selected partition",
  "Count per partition uses ${totalRequested} seeds total",
  "Apply this Vault Entry and overwrite details in the selected populated partition(s)?",
  "function applySeedVaultEntryToPartitionRow(row, entry = {}, seedCount = 0)",
  "syncCustomSelect(typeSelect);",
  "syncCustomSelect(sexSelect);",
  "row.dataset.seedVaultEntrySnapshot = JSON.stringify({",
  "TODO: Add inventory depletion only after My Seed Vault has a dedicated, reversible quantity transaction model.",
  "seedVaultEntryId: String(row?.dataset.seedVaultEntryId || \"\").trim()",
  "seedVaultEntrySnapshot: readPartitionSeedVaultSnapshotFromRow(row)",
  "refreshNewSessionSeedVaultPicker();",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".new-session-seed-vault-section",
  ".new-session-seed-vault-controls",
  ".new-session-seed-vault-partition-grid",
  ".new-session-seed-vault-partition-option:has(input:checked)",
  ".new-session-seed-vault-message.is-success",
]) {
  requireNeedle(stylesSource, needle);
}

console.log("Seed Vault session autofill regression check passed.");
