const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  'const SESSION_RESULTS_INCOMPLETE_COMPLETION_MESSAGE = "Finish your results before completing this session. Your counted seeds must match the total seeds started.";',
  "function getSessionSeedResultAccounting(session = null)",
  "function areSessionSeedResultsFullyAccountedFor(session = null)",
  "function autoCompleteSessionWhenResultsAccounted(session = null, referenceDate = new Date())",
  "function showSessionCompletionResultsWarning(messageElement = null)",
  "accounting.totalAccounted === accounting.totalSeeds",
  "state.totalFailed += Math.max(0, seedCount - germinatedCount);",
  "autoCompleteSessionWhenResultsAccounted(session);",
  "isNewCompletion && !areSessionSeedResultsFullyAccountedFor(session)",
  "showSessionCompletionResultsWarning(detail.saveMessage);",
  "showSessionCompletionResultsWarning(formMessage);",
  "previousStatus !== \"completed\" && nextStatus === \"completed\"",
  "buildPartitionDraftValuesFromContainer(partitionFields)",
  "detail.statusField.value = session.sessionStatus || \"soaking\";",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing accounted-results completion behavior: ${needle}`);
  }
}

const getAccounting = (partitions) => partitions.reduce((state, partition) => {
  const seedCount = Math.max(0, Number(partition.seedCount) || 0);
  if (seedCount <= 0) {
    return state;
  }
  const raw = String(partition.plantedCount ?? "").trim();
  const planted = Number(raw);
  const valid = raw !== "" && Number.isFinite(planted) && planted >= 0 && planted <= seedCount;
  state.totalSeeds += seedCount;
  if (!valid) {
    state.hasIncompleteResults = true;
    return state;
  }
  state.totalAccounted += seedCount;
  state.totalGerminated += planted;
  state.totalFailed += seedCount - planted;
  return state;
}, {
  totalSeeds: 0,
  totalAccounted: 0,
  totalGerminated: 0,
  totalFailed: 0,
  hasIncompleteResults: false,
});

const isAccounted = (partitions) => {
  const accounting = getAccounting(partitions);
  return accounting.totalSeeds > 0
    && !accounting.hasIncompleteResults
    && accounting.totalAccounted === accounting.totalSeeds;
};

if (!isAccounted([{ seedCount: 4, plantedCount: "4" }])) {
  throw new Error("All germinated seeds should be treated as fully accounted.");
}
if (!isAccounted([{ seedCount: 4, plantedCount: "3" }, { seedCount: 2, plantedCount: "1" }])) {
  throw new Error("Mixed germinated/failed results should be treated as fully accounted when counts are filled.");
}
if (isAccounted([{ seedCount: 4, plantedCount: "" }])) {
  throw new Error("Blank germination results should not be treated as complete.");
}
if (isAccounted([{ seedCount: 4, plantedCount: "5" }])) {
  throw new Error("Over-counted germination results should not be treated as complete.");
}

console.log("Session completion accounted-results regression check passed.");
