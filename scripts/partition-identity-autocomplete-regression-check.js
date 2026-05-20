const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "const PARTITION_IDENTITY_AUTOCOMPLETE_MIN_CHARS = 2;",
  "const PARTITION_IDENTITY_TYPO_SUGGESTION_MIN_CHARS = 4;",
  "if (normalizedQuery.length < PARTITION_IDENTITY_AUTOCOMPLETE_MIN_CHARS) {",
  "const allowTypoSuggestions = normalizedQuery.length >= PARTITION_IDENTITY_TYPO_SUGGESTION_MIN_CHARS;",
  "allowTypoSuggestions && isHighConfidencePartitionIdentityTypoMatch",
  "allowTypoSuggestions && isMediumConfidencePartitionIdentityMatch",
  'origin: "Known source"',
  'origin: "Previous global sessions"',
  "appState.sourceReviewSessionRows",
  "getGallerySnapshotsForDisplay(appState.gallerySnapshots || [])",
  'reason: isLikelyDuplicate ? "Use existing name" : getPartitionIdentitySuggestionReason(record)',
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing Source/Seed Variety autocomplete behavior: ${needle}`);
  }
}

const suggestionsFunction = appSource.match(/function getPartitionIdentitySuggestions[\s\S]*?\n}\n\nfunction closePartitionIdentitySuggestions/);
if (!suggestionsFunction) {
  throw new Error("Could not locate getPartitionIdentitySuggestions.");
}

if (suggestionsFunction[0].includes("if (!normalizedQuery)")) {
  throw new Error("Autocomplete should not show an unfiltered hot list for empty input.");
}

if (!suggestionsFunction[0].includes(".slice(0, PARTITION_IDENTITY_AUTOCOMPLETE_LIMIT);")) {
  throw new Error("Autocomplete suggestions should remain capped by PARTITION_IDENTITY_AUTOCOMPLETE_LIMIT.");
}

console.log("Source and Seed Variety autocomplete regression check passed.");
