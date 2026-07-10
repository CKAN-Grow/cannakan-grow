const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireIncludes(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing shared session tool behavior: ${label}`);
  }
}

for (const methodId of [
  "KAN",
  "TRA",
  "PAPER_TOWEL",
  "ROCKWOOL",
  "RAPID_ROOTER",
  "WATER_SOAK",
  "DIRECT_SOW",
  "OTHER",
]) {
  requireIncludes(appSource, methodId, `method ${methodId}`);
}

for (const needle of [
  'id="seed-age-setup-host"',
  'id="new-session-seed-vault-section"',
  'name="seedAgeTrackingEnabled"',
  'name="seedAgeMode"',
  'value="same"',
  'value="mixed"',
]) {
  requireIncludes(indexSource, needle);
}

const renderRowsSource = appSource.slice(
  appSource.indexOf("function renderPartitionRows"),
  appSource.indexOf("function updateGrowthStageLock"),
);
for (const needle of [
  "const seedAgeState = getSeedAgeSettingsFromForm(form);",
  "const showSeedAgeField = seedAgeState.trackingEnabled;",
  "showSeedAgeInput: showSeedAgeField,",
  "renderTraPartitionSections(partitionFields, partitions, {",
  "applySeedAgeValuesToPartitions(partitions, {",
  "mixedSeedAgeDrafts: getMixedSeedAgeDrafts(form),",
]) {
  requireIncludes(renderRowsSource, needle);
}
for (const forbidden of [
  "showSeedAgeInput: showSeedAgeField && shouldShowPartitionSeedAgeFieldForPartition",
  "shouldShowSeedAgeInput: (partition) => shouldShowPartitionSeedAgeFieldForPartition(partition)",
]) {
  if (renderRowsSource.includes(forbidden)) {
    throw new Error(`Shared Seed Age rendering regressed to method/row-specific gating: ${forbidden}`);
  }
}

const seedAgeSetupSource = appSource.slice(
  appSource.indexOf("function syncSeedAgeSetupUi"),
  appSource.indexOf("function primeNewSessionSeedAgeDefaults"),
);
for (const needle of [
  'sameField.hidden = !(state.trackingEnabled && state.mode === "same");',
  'form.dataset.seedAgeTrackingEnabled = state.trackingEnabled ? "true" : "false";',
  'form.dataset.seedAgeMode = state.mode || "";',
]) {
  requireIncludes(seedAgeSetupSource, needle);
}
requireIncludes(stylesSource, ".session-seed-age-same-field[hidden]");
requireIncludes(stylesSource, ".session-seed-age-value[hidden]");

const seedAgeStateSource = appSource.slice(
  appSource.indexOf("function applySeedAgeValuesToPartitions"),
  appSource.indexOf("function getEffectivePartitionSeedAgeFromRow"),
);
for (const needle of [
  "partition.seedAgeYears = currentValue;",
  "partition.seedAgeYears = sessionSeedAgeYears;",
  "mixedDraftValue !== null",
]) {
  requireIncludes(seedAgeStateSource, needle);
}
if (seedAgeStateSource.includes("partition.seedAgeYears = null;")) {
  throw new Error("Track Seed Age off/on should not delete row age drafts while the UI is hidden.");
}

const vaultPickerSource = appSource.slice(
  appSource.indexOf("function renderNewSessionSeedVaultPicker"),
  appSource.indexOf("function consumeNewSessionSeedVaultStarterIntentIfApplied"),
);
for (const needle of [
  "const method = getMethodConfig(systemType);",
  "method.isStandardized",
  "getNewSessionSeedVaultPartitionRows(form).length",
  "data-seed-vault-session-toggle",
  "data-seed-vault-session-panel",
  "No active Vault entries are available yet.",
  'const expanded = Boolean(appState.newSessionSeedVaultExpanded);',
  "${expanded ? \"checked\" : \"\"}",
  "${expanded ? \"\" : \"hidden\"}",
]) {
  requireIncludes(vaultPickerSource, needle);
}
if (/data-seed-vault-session-toggle[^>]*disabled/.test(vaultPickerSource)) {
  throw new Error("Add from My Seed Vault must remain usable in the no-active-entries empty state.");
}

const vaultBindSource = appSource.slice(
  appSource.indexOf("function bindNewSessionSeedVaultPicker"),
  appSource.indexOf("function renderMySessionsHistoryPanelMarkup"),
);
for (const needle of [
  "appState.newSessionSeedVaultExpanded = target.checked;",
  "appState.newSessionSeedVaultActivePartitionId",
  "applySeedVaultEntryToPartitionRow(initialRow, entry, seedCount);",
  "const didSyncSeedAgeMode = syncSeedAgeModeFromVaultAssignments(form);",
  "rerenderPartitions();",
  "rerenderPicker();",
]) {
  requireIncludes(vaultBindSource, needle);
}

const vaultApplySource = appSource.slice(
  appSource.indexOf("function applySeedVaultEntryToPartitionRow"),
  appSource.indexOf("function clearSeedVaultAssignmentFromPartitionRow"),
);
for (const needle of [
  "setPartitionIdentityInputFromVault",
  "setVarietyDirectoryInputFromVault",
  "typeSelect.value = normalizeSeedTypeId(normalizedEntry.seedType);",
  "sexSelect.value = normalizeSeedSexValue(normalizedEntry.seedSex);",
  "seedAgeInput.value = formatSeedAgeInputValue(seedAgeYears);",
  "row.dataset.seedVaultEntryId = normalizedEntry.id;",
  "row.dataset.seedVaultEntrySnapshot = JSON.stringify(buildSeedVaultEntrySessionSnapshot(normalizedEntry));",
]) {
  requireIncludes(vaultApplySource, needle);
}

const methodChangeSource = appSource.slice(
  appSource.indexOf("systemTypeField.addEventListener(\"change\""),
  appSource.indexOf("addSeedRowButton?.addEventListener"),
);
for (const needle of [
  "renderPartitionRows(form, nextMethod, sessionStatusField.value);",
  "refreshNewSessionSeedVaultPicker();",
  "updateMethodTypeLayout(form, nextMethod);",
]) {
  requireIncludes(methodChangeSource, needle);
}

const detailSource = appSource.slice(
  appSource.indexOf("const renderDetailPartitions = () =>"),
  appSource.indexOf("const bindDetailPartitionInputListeners = () =>"),
);
requireIncludes(detailSource, "showSeedAgeInput: currentSeedAgeMetadata.trackingEnabled,");

console.log("Shared session tools regression check passed.");
