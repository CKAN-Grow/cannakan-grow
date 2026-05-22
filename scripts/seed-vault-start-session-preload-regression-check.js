const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

[
  "const NEW_SESSION_SEED_VAULT_START_STORAGE_KEY = \"cannakan-grow-new-session-seed-vault-start\";",
  "newSessionSeedVaultStarterIntent: null",
  "newSessionSeedVaultStarterLoadPromise: null",
  "function persistNewSessionSeedVaultStarterIntent(intent = null)",
  "function getPendingNewSessionSeedVaultStarterIntent()",
  "function consumeNewSessionSeedVaultStarterIntentIfApplied(section, form = null)",
  "persistNewSessionSeedVaultStarterIntent({",
  "entryId: entry.id",
  "appState.newSessionSeedVaultExpanded = true;",
  "appState.newSessionSeedVaultActivePartitionId = 1;",
  "const pendingSeedVaultStarterIntent = getPendingNewSessionSeedVaultStarterIntent();",
  "form.dataset.seedVaultStarterEntryId = pendingSeedVaultStarterIntent.entryId;",
  "appState.newSessionSeedVaultExpanded = Boolean(pendingSeedVaultStarterIntent || starterSeedVaultEntry);",
  "appState.newSessionSeedVaultActivePartitionId = Math.max(1, Number(pendingSeedVaultStarterIntent?.activePartitionId) || 1);",
  "consumeNewSessionSeedVaultStarterIntentIfApplied(section, form);",
].forEach((needle) => {
  assert(appSource.includes(needle), `Expected durable Seed Vault start handoff behavior: ${needle}`);
});

[
  "toggle.checked",
  "!panel.hidden",
  "card.classList.contains(\"is-active\")",
  "!body.hidden",
  "select.value === pendingStarterIntent.entryId",
  "String(countInput.value || \"\").trim() === \"\"",
  "clearNewSessionSeedVaultStarterIntent({ preserveFormDataset: true });",
].forEach((needle) => {
  assert(appSource.includes(needle), `Expected preload to be consumed only after open/selected UI state is applied: ${needle}`);
});

const renderFormBlock = appSource.slice(
  appSource.indexOf("const pendingSeedVaultStarterIntent = getPendingNewSessionSeedVaultStarterIntent();"),
  appSource.indexOf("syncNewSessionNameState(form);"),
);
assert(
  !renderFormBlock.includes("clearNewSessionSeedVaultStarterIntent"),
  "New Session render should not clear the pending Seed Vault start intent before the picker applies it.",
);

const pickerBlock = appSource.slice(
  appSource.indexOf("function renderNewSessionSeedVaultPicker(section, systemType = \"KAN\", form = null)"),
  appSource.indexOf("function getSelectedSeedVaultEntryForSession(section, partitionId = \"\")"),
);
assert(
  pickerBlock.includes("Loading your Seed Vault entries...") && pickerBlock.includes("ensureSeedVaultEntriesForUser(appState.user)"),
  "Picker should wait for Seed Vault entries before consuming pending preload state.",
);

console.log("Seed Vault start session preload regression check passed.");
