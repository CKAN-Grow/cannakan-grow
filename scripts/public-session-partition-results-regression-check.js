const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

[
  "function renderPublicSessionPartitionResultsMarkup",
  "${renderGallerySnapshotMediaMarkup(snapshot, getGallerySnapshotFeedDetails(snapshot))}",
  "renderPublicSessionPartitionResultsMarkup(publicDetails.resultSummary, { systemType: snapshot.systemType })",
  "const maxPartitions = systemType === \"TRA\" ? 16 : 8;",
  "<dt>Source</dt>",
  "<dt>Seed Variety</dt>",
  "<dt>Type</dt>",
  "<dt>Sex</dt>",
  "<dt>Seed Age</dt>",
  "<dt>Germinated</dt>",
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
  ".public-session-partition-result-topline",
  "body.theme-dark .public-session-partition-results",
  "body.theme-dark .public-session-partition-result",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Expected public session partition result styling: ${needle}`);
});

assert(
  appSource.indexOf("${renderGallerySnapshotMediaMarkup(snapshot, getGallerySnapshotFeedDetails(snapshot))}")
    < appSource.indexOf("renderPublicSessionPartitionResultsMarkup(publicDetails.resultSummary, { systemType: snapshot.systemType })"),
  "Public Session partition results should render directly below the snapshot media.",
);

console.log("Public session partition results regression check passed.");
