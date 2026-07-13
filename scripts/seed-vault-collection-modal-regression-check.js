const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, message = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Seed Vault collection modal behavior: ${message}`);
  }
}

for (const needle of [
  "function openSeedVaultCollectionModal(options = {})",
  "function closeSeedVaultCollectionModal(options = {})",
  "function validateSeedVaultCollectionName(value = \"\", options = {})",
  "function persistSeedVaultCollectionMutation(action = \"create\", options = {})",
  "function assertSeedVaultCollectionWritesAllowed(sourceElement = null)",
  "Create Collection",
  "Group seed entries for future grows, projects, sources, or favorites.",
  "Rename Collection",
  "Save Changes",
  "Delete Collection?",
  "Deleting this collection will not delete any Seed Vault entries. Seeds currently in this collection will remain in your Vault.",
  "A collection with this name already exists.",
  "Enter a collection name.",
  'form.dataset.submitting === "true"',
  'data-seed-vault-collection-action="create"',
  'data-seed-vault-collection-action="rename"',
  'data-seed-vault-collection-action="delete"',
  "View Collection",
  'role="dialog" aria-modal="true"',
  'event.key === "Escape"',
  'event.key !== "Tab"',
  "changedEntryIds.has(entry.id)",
  'setSeedVaultCollectionStateValue("owner", "CollectionFilter", "all")',
  "refreshSeedVaultViewAfterMutation();",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".seed-vault-collection-modal",
  ".seed-vault-collection-card-menu",
  ".seed-vault-collection-manager-row",
  ".seed-vault-collection-modal-actions",
  "@media (max-width: 600px)",
]) {
  requireNeedle(stylesSource, needle);
}

for (const forbidden of [
  "Type: create, rename, or delete",
  "manageSeedVaultCollections",
  "New collection name",
  "Rename collection to",
]) {
  if (appSource.includes(forbidden)) {
    throw new Error(`Legacy Seed Vault collection prompt behavior remains: ${forbidden}`);
  }
}

const collectionDialogCall = /window\.(?:prompt|confirm)\([^)]*collection/gi;
if (collectionDialogCall.test(appSource)) {
  throw new Error("A browser-native collection prompt or confirmation remains.");
}

console.log("Seed Vault collection modal regression check passed.");
