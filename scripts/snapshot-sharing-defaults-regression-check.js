const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing snapshot sharing default behavior: ${label}`);
  }
}

for (const needle of [
  'snapshotSharingPreferences: {',
  'destination: "",',
  "includeProfileInGallery: null",
  "function getInitialSnapshotDestinationValue(state)",
  'const preferredDestination = rememberedDestination || "social-gallery";',
  "function getInitialSnapshotIncludeProfileValue(persistedSnapshotState = null)",
  "return preference === null || preference === undefined ? true : Boolean(preference);",
  "setSnapshotDestinationValue(state, getInitialSnapshotDestinationValue(state));",
  "rememberSnapshotDestinationPreference(getSnapshotDestination(state));",
  "rememberSnapshotIncludeProfilePreference(state.includeProfileToggle.checked);",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  '<input id="snapshot-destination-social-gallery" type="radio" name="snapshot-destination" value="social-gallery" checked>',
  '<input id="snapshot-destination-social" type="radio" name="snapshot-destination" value="social">',
  '<input id="snapshot-include-profile" type="checkbox" name="snapshot-include-profile" checked>',
  '<input id="detail-snapshot-destination-social-gallery" type="radio" name="detail-snapshot-destination" value="social-gallery" checked>',
  '<input id="detail-snapshot-destination-social" type="radio" name="detail-snapshot-destination" value="social">',
  '<input id="detail-snapshot-include-profile" type="checkbox" name="detail-snapshot-include-profile" checked>',
]) {
  requireNeedle(indexSource, needle);
}

console.log("Snapshot sharing defaults regression check passed.");
