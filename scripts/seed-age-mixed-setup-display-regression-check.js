const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const syncSetupSource = appSource.slice(
  appSource.indexOf("function syncSeedAgeSetupUi"),
  appSource.indexOf("function primeNewSessionSeedAgeDefaults"),
);

for (const needle of [
  'const sameField = form.querySelector("#session-seed-age-same-field") || form.querySelector("[data-seed-age-same-value]");',
  'sameField.hidden = !(state.trackingEnabled && state.mode === "same");',
]) {
  if (!syncSetupSource.includes(needle)) {
    throw new Error(`Missing Seed Age setup same-field mixed-mode behavior: ${needle}`);
  }
}

for (const needle of [
  'data-seed-age-mode-card="mixed"',
  'name="sessionSeedAgeYears"',
  'id="session-seed-age-same-field"',
]) {
  if (!indexSource.includes(needle)) {
    throw new Error(`Missing Seed Age setup template behavior: ${needle}`);
  }
}

if (!stylesSource.includes(".session-seed-age-same-field[hidden]") || !stylesSource.includes(".session-seed-age-value[hidden]")) {
  throw new Error("Mixed Seed Age mode must visually hide the top-level Seed Age input despite grid display styling.");
}

if (stylesSource.includes(".session-seed-age-same-field[hidden] {\n  display: grid;")) {
  throw new Error("Hidden same-age setup field must not keep grid display in Mixed mode.");
}

console.log("Seed Age mixed setup display regression check passed.");
