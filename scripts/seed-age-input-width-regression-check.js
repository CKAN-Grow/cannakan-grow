const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  'data-seed-age-enabled="true"',
  "minmax(96px, 104px)",
  "minmax(92px, 100px)",
  ".partition-seed-age-input-wrap",
  "max-width: 96px;",
  "min-width: 0;",
  '.partition-seed-age-input-wrap input[name^="seedAgeYears-"]',
  "width: 52px;",
  "flex: 0 0 52px;",
  "font-variant-numeric: tabular-nums;",
  '.chart-header [data-partition-header="age"]',
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing seed age input clipping fix: ${needle}`);
  }
}

const newSessionHeader = indexSource.slice(
  indexSource.indexOf('id="partition-chart-header"'),
  indexSource.indexOf('id="partition-fields"'),
);
if (!(newSessionHeader.indexOf("Seed Variety") < newSessionHeader.indexOf('data-partition-header="age"')
  && newSessionHeader.indexOf('data-partition-header="age"') < newSessionHeader.indexOf("<span>Type</span>"))) {
  throw new Error("New Session AGE header must sit between Seed Variety and Type.");
}

const editableRowMarkup = appSource.slice(
  appSource.indexOf("function buildPartitionFormCard"),
  appSource.indexOf("function ensureSourceCatalogDatalist"),
);
if (!(editableRowMarkup.indexOf('name="seedVariety-${index}"') < editableRowMarkup.indexOf("data-partition-seed-age-field")
  && editableRowMarkup.indexOf("data-partition-seed-age-field") < editableRowMarkup.indexOf('name="seedType-${index}"'))) {
  throw new Error("Editable Seed Age field must render between Seed Variety and Type.");
}
if (editableRowMarkup.includes("partition-seed-age-input-unit") || editableRowMarkup.includes(">years</span>")) {
  throw new Error("Editable Seed Age fields should not repeat a per-row years unit label.");
}
if (stylesSource.includes(".partition-seed-age-input-unit")) {
  throw new Error("Seed Age unit suffix styles should be removed with the per-row years label.");
}

const seedAgeGridMatches = stylesSource.match(/data-seed-age-enabled="true"[\s\S]{0,260}?minmax\(9[26]px, 10[04]px\)/g) || [];
if (seedAgeGridMatches.length < 2) {
  throw new Error("Seed-age enabled rows should reserve a compact AGE column in both setup and result-unlocked layouts.");
}

console.log("Seed Age input width regression check passed.");
