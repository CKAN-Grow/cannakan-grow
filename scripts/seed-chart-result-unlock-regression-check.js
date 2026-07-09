const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  'function setSeedChartResultsUnlocked(chartShell, chartHeader, partitionContainer, unlocked, options = {})',
  'function syncNewSessionSeedChartResultsUnlockState(form, options = {})',
  'function showSeedChartExpandedModal()',
  'Seed Chart Expanded',
  'New result columns are now unlocked: # Germinated and Success %.',
  'form.dataset.seedChartExpandedModalShown = "true";',
  'form.dataset.seedChartResultsUnlocked = "true";',
  'syncNewSessionSeedChartResultsUnlockState(form, { highlight: true });',
  'setSeedChartResultsUnlocked(detail.chartShell, detail.chartHeader, partitions, true);',
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing seed chart result unlock behavior: ${needle}`);
  }
}

for (const needle of [
  'data-partition-header="germinated"># Germinated',
  'data-partition-header="success">Success %',
]) {
  if (!indexSource.includes(needle)) {
    throw new Error(`Missing result column header markup: ${needle}`);
  }
}

for (const needle of [
  '.chart-shell[data-results-unlocked="false"] .chart-header [data-partition-header="germinated"]',
  '.partition-table[data-results-unlocked="false"] .partition-row label:has(input[name="plantedCount"])',
  '.seed-chart-result-column-unlocked',
  '@keyframes seed-chart-result-column-unlock-glow',
  '.seed-chart-expanded-modal-overlay',
  '.seed-chart-expanded-modal',
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing seed chart unlock styling: ${needle}`);
  }
}

console.log("Seed chart result unlock regression check passed.");
