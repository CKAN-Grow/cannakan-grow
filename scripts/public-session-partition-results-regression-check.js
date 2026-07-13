const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

[
  "function renderPublicSessionPartitionResultsMarkup",
  "function renderSessionResultBreakdownMarkup",
  "const maxPartitions = systemType === \"TRA\" ? 16 : 8;",
  "const partitionDisplayLabel = partitionLabelMatch",
  "`${method.rowLabel} ${partitionLabelMatch[1]}`",
  "public-session-partition-result-variety",
  "session-result-partition-variety",
  "seedTypeLabel: getSeedTypeLabel(seedType) || \"\"",
  "sexLabel: getSeedSexLabel(seedSex) || \"\"",
  "seedType: partition.seedType || partition.type || partition.seedTypeLabel || \"\"",
  "feminized: partition.sex || partition.sexValue || partition.seedSex || partition.feminized || partition.sexLabel || \"\"",
].forEach((needle) => {
  assert(appSource.includes(needle), `Expected public session partition result behavior: ${needle}`);
});

[
  ".public-session-partition-results",
  ".public-session-partition-results-grid",
  "grid-template-columns: repeat(4, minmax(0, 1fr));",
  "@media (min-width: 721px) and (max-width: 1100px)",
  "grid-template-columns: repeat(2, minmax(0, 1fr));",
  ".public-session-partition-result-topline",
  ".session-result-partition-grid",
  ".session-result-partition-chip",
  "text-transform: uppercase;",
  "margin-top: auto;",
  "body.theme-dark .public-session-partition-results",
  "body.theme-dark .public-session-partition-result",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Expected public session partition result styling: ${needle}`);
});

console.log("Public session partition results regression check passed.");
