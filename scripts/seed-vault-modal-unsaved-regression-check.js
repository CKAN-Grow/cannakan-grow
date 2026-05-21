const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Seed Vault modal UX behavior: ${label}`);
  }
}

for (const needle of [
  "function getSeedVaultEntryFormSignature(form)",
  "function hasSeedVaultEntryFormUnsavedChanges(form)",
  "function ensureSeedVaultUnsavedChangesDialog()",
  "function promptSeedVaultUnsavedChanges(form)",
  "function requestSeedVaultEntryModalClose(options = {})",
  "function bindSeedVaultEntryModalGuards(overlay, form)",
  "window.addEventListener(\"beforeunload\", handleBeforeUnload);",
  "document.addEventListener(\"keydown\", handleKeydown, true);",
  "data-seed-vault-unsaved-action=\"save\"",
  "Save &amp; Exit",
  "Discard Changes",
  "await saveSeedVaultEntryForm(form, { closeOnSuccess: false, messageElement: message });",
  "form.dataset.seedVaultBaselineSignature = getSeedVaultEntryFormSignature(form);",
  "void requestSeedVaultEntryModalClose();",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".seed-vault-entry-modal *",
  "max-width: calc(100vw - 36px);",
  "max-height: min(96dvh, 900px);",
  "overflow-x: hidden;",
  "overscroll-behavior: contain;",
  "position: sticky;",
  ".seed-vault-unsaved-dialog-card",
  "max-height: calc(100dvh - 20px);",
]) {
  requireNeedle(stylesSource, needle);
}

console.log("Seed Vault modal unsaved changes regression check passed.");
