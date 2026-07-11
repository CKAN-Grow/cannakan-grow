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
  'Session Started',
  'Your session is now active.',
  'Unlocked',
  'Germinated Seeds',
  'Now available',
  'Success %',
  'Automatically calculated',
  'Return anytime to record germination results and complete the session.',
  'seed-chart-expanded-modal-visual',
  'seed-chart-expanded-modal-unlocked',
  '}, 3000);',
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
  '.chart-shell:not([data-results-unlocked="true"]) .chart-header [data-partition-header="germinated"]',
  '.partition-table:not([data-results-unlocked="true"]) .partition-row label:has(input[name="plantedCount"])',
  '.chart-shell[data-results-unlocked="true"] .chart-row',
  '.partition-table[data-results-unlocked="true"] .chart-row',
  '.partition-table[data-results-unlocked="true"] .partition-row label:has(input[name="plantedCount"])',
  '.seed-chart-result-column-unlocked',
  'animation: seed-chart-result-column-unlock-glow 3s ease-out both;',
  'transform: translateX(12px);',
  '@keyframes seed-chart-result-column-unlock-glow',
  '.seed-chart-expanded-modal-overlay',
  '.seed-chart-expanded-modal',
  '.seed-chart-expanded-modal-visual',
  '.seed-chart-expanded-modal-section-label',
  '.seed-chart-expanded-modal-unlocked',
  '@keyframes seed-chart-expanded-modal-enter',
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing seed chart unlock styling: ${needle}`);
  }
}

for (const retiredNeedle of [
  '.chart-shell[data-results-unlocked="false"] .chart-header [data-partition-header="germinated"]',
  '.partition-table[data-method-standardized="false"][data-session-status="active"] .partition-row label:has(input[name="plantedCount"])',
  '.partition-table[data-method-standardized="false"] .partition-row {\n    grid-template-areas:',
  'New result columns are now unlocked: # Germinated and Success %.',
  'Your session has been started.',
  'The Germinated Seeds and Success % columns are now unlocked.',
  'Return here during your session to record germination results and complete your session.',
]) {
  if (stylesSource.includes(retiredNeedle) || appSource.includes(retiredNeedle)) {
    throw new Error(`Retired seed chart workflow behavior remains: ${retiredNeedle}`);
  }
}

console.log("Seed chart result unlock regression check passed.");
