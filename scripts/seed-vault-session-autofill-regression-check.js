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
  "newSessionSeedVaultExpanded",
  "newSessionSeedVaultActivePartitionId",
  "function getActiveSeedVaultEntriesForSessionPicker()",
  "function renderNewSessionSeedVaultPicker(section, systemType = \"KAN\", form = null)",
  "Select seeds from your collection to auto-fill partition details.",
  "function bindNewSessionSeedVaultPicker(section, form, options = {})",
  "data-seed-vault-session-toggle",
  "data-seed-vault-partition-entry",
  "data-seed-vault-partition-count",
  "data-seed-vault-apply-partition",
  "data-seed-vault-clear-partition",
  "Apply this Vault Entry and overwrite details in this populated partition?",
  "Clear this partition's Vault Entry assignment and copied fields?",
  "function applySeedVaultEntryToPartitionRow(row, entry = {}, seedCount = 0)",
  "function clearSeedVaultAssignmentFromPartitionRow(row)",
  "syncCustomSelect(typeSelect);",
  "syncCustomSelect(sexSelect);",
  "row.dataset.seedVaultEntrySnapshot = JSON.stringify({",
  "TODO: Add inventory depletion only after My Seed Vault has a dedicated, reversible quantity transaction model.",
  "seedVaultEntryId: String(row?.dataset.seedVaultEntryId || \"\").trim()",
  "seedVaultEntrySnapshot: readPartitionSeedVaultSnapshotFromRow(row)",
  "refreshNewSessionSeedVaultPicker();",
  "getSystemType: () => systemTypeField.value",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".new-session-seed-vault-section",
  ".new-session-seed-vault-toggle",
  ".new-session-seed-vault-panel",
  ".new-session-seed-vault-assignment-grid",
  ".new-session-seed-vault-assignment-trigger",
  ".new-session-seed-vault-controls",
  ".new-session-seed-vault-controls--partition",
  ".new-session-seed-vault-assignment-actions",
  ".new-session-seed-vault-message.is-success",
]) {
  requireNeedle(stylesSource, needle);
}

for (const retiredNeedle of [
  "data-seed-vault-apply-to-session",
  "data-seed-vault-partition-choice",
  "Seeds per selected partition",
]) {
  if (appSource.includes(retiredNeedle)) {
    throw new Error(`Retired one-entry multi-partition Seed Vault flow is still present: ${retiredNeedle}`);
  }
}

console.log("Seed Vault session autofill regression check passed.");
