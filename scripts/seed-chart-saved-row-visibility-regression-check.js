const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  "function isSeedChartRowUsed(rowOrPartition = null)",
  "function getVisibleSeedChartRows(rows = [], sessionState = {})",
  "function syncSeedChartRowVisibility(partitionContainer, sessionStatus = \"\", options = {})",
  "function syncSeedChartUnusedRowsRevealControl(partitionContainer, options = {})",
  "function syncCompletedSessionPartitionVisibility(partitionContainer, sessionStatus = \"\", options = {})",
  "options.isSavedSession === true",
  "options.resultsUnlocked === true",
  "partitionContainer.dataset.resultsUnlocked === \"true\"",
  "form?.dataset?.seedChartResultsUnlocked === \"true\"",
  "form?.dataset?.savedSessionId",
  "row.hidden = shouldHide;",
  "data-show-unused-seed-chart-rows",
  "Show unused ${pluralLabel}",
  "seedVaultEntryId",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing saved seed chart row visibility behavior: ${needle}`);
  }
}

for (const needle of [
  "syncSeedChartRowVisibility(partitionContainer, form.elements?.sessionStatus?.value || form.dataset.currentStage || \"\", {",
  "setSeedChartResultsUnlocked(detail.chartShell, detail.chartHeader, partitions, true);",
  "syncCompletedSessionPartitionVisibility(partitions, detail.statusField.value);",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Saved/completed seed chart visibility is not wired into render flow: ${needle}`);
  }
}

for (const needle of [
  ".partition-table .partition-row[hidden]",
  "display: none !important;",
  ".seed-chart-unused-rows-control",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing saved seed chart row visibility styling: ${needle}`);
  }
}

console.log("Seed chart saved row visibility regression check passed.");
