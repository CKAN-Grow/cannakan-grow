const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

const renderPartitionRowsSource = appSource.slice(
  appSource.indexOf("function renderPartitionRows"),
  appSource.indexOf("function updateGrowthStageLock"),
);
if (!renderPartitionRowsSource.includes("const showSeedAgeField = seedAgeState.trackingEnabled;")) {
  throw new Error("New Session should use one shared Seed Age visibility rule from the toggle state.");
}
if (!renderPartitionRowsSource.includes("showSeedAgeInput: showSeedAgeField,")) {
  throw new Error("KAN/TRa rows should show Seed Age inputs for every partition when tracking is enabled.");
}
if (renderPartitionRowsSource.includes("showSeedAgeInput: showSeedAgeField && shouldShowPartitionSeedAgeFieldForPartition")) {
  throw new Error("KAN/TRa Seed Age inputs must not be gated by populated partition content.");
}
if (renderPartitionRowsSource.includes("shouldShowSeedAgeInput: (partition) => shouldShowPartitionSeedAgeFieldForPartition(partition)")) {
  throw new Error("TRa sections must not use a separate populated-partition Seed Age gate.");
}

const detailRendererSource = appSource.slice(
  appSource.indexOf("const renderDetailPartitions = () =>"),
  appSource.indexOf("const bindDetailPartitionInputListeners = () =>"),
);
if (!detailRendererSource.includes("showSeedAgeInput: currentSeedAgeMetadata.trackingEnabled,")) {
  throw new Error("Saved session detail rows should use the shared Seed Age tracking state.");
}
if (detailRendererSource.includes("showSeedAgeInput: currentSeedAgeMetadata.trackingEnabled && shouldShowPartitionSeedAgeFieldForPartition")) {
  throw new Error("Saved session detail rows should not hide KAN/TRa Seed Age inputs for empty partitions.");
}

const syncFieldSource = appSource.slice(
  appSource.indexOf("function syncPartitionSeedAgeFieldState"),
  appSource.indexOf("function syncCompletedSessionPartitionVisibility"),
);
const disabledBranch = syncFieldSource.slice(
  syncFieldSource.indexOf("if (!trackingEnabled)"),
  syncFieldSource.indexOf("if (seedAgeMode === \"same\")"),
);
if (disabledBranch.includes("seedAgeInput.value = \"\";")) {
  throw new Error("Turning Track Seed Age off should hide values without deleting entered ages.");
}
if (!syncFieldSource.includes("seedAgeLabel.hidden = false;")) {
  throw new Error("Track Seed Age enabled should make each rendered age input visible immediately.");
}

const applyValuesSource = appSource.slice(
  appSource.indexOf("function applySeedAgeValuesToPartitions"),
  appSource.indexOf("function getEffectivePartitionSeedAgeFromRow"),
);
if (!applyValuesSource.includes("partition.seedAgeYears = currentValue;")) {
  throw new Error("Seed Age drafts should be preserved while tracking is disabled.");
}
if (applyValuesSource.includes("partition.seedAgeYears = isActive ? sessionSeedAgeYears : null;")) {
  throw new Error("Session-wide Seed Age should apply to every visible row, including KAN/TRa partitions.");
}
if (!applyValuesSource.includes("partition.seedAgeYears = sessionSeedAgeYears;")) {
  throw new Error("Session-wide Seed Age should populate all partition rows when enabled.");
}

const vaultApplySource = appSource.slice(
  appSource.indexOf("function applySeedVaultEntryToPartitionRow"),
  appSource.indexOf("function clearSeedVaultAssignmentFromPartitionRow"),
);
if (!vaultApplySource.includes("getSeedVaultEntrySessionSeedAgeYears(normalizedEntry)") || !vaultApplySource.includes("seedAgeInput.value = formatSeedAgeInputValue(seedAgeYears);")) {
  throw new Error("Seed Vault autofill should continue to populate visible Seed Age inputs when available.");
}

console.log("KAN/TRa Seed Age toggle regression check passed.");
