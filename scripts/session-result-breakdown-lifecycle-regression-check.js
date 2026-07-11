const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  "const isCompletedSession = normalizedResultStatus === \"completed\";",
  "const isSetupSession = !isCompletedSession",
  "const isInProgressSession = !isCompletedSession && !isSetupSession;",
  "Setup Required",
  "Results Pending",
  "Awaiting germination results",
  "Final classifications appear after completion.",
  "compact || !isCompletedSession ? \"\" : performanceLegendMarkup",
  "? pendingStatus",
  "getPartitionSuccessStatus(partition.percentage, partition.germinatedCount, partition.totalCount)",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing lifecycle-aware result breakdown behavior: ${needle}`);
  }
}

for (const needle of [
  "partition-success--setup",
  "partition-success--pending",
  "--partition-success-accent: #62b3ff;",
  "body.theme-dark .partition-success--pending",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing lifecycle-aware result breakdown styling: ${needle}`);
  }
}

console.log("Session result breakdown lifecycle regression check passed.");
