const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  "minmax(118px, 128px)",
  ".partition-seed-age-input-wrap",
  "min-width: 104px;",
  '.partition-seed-age-input-wrap input[name^="seedAgeYears-"]',
  "width: 70px;",
  "min-width: 70px;",
  "flex: 0 0 70px;",
  "font-variant-numeric: tabular-nums;",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing seed age input clipping fix: ${needle}`);
  }
}

const mixedGridMatches = stylesSource.match(/data-seed-age-mode="mixed"[\s\S]{0,260}?minmax\(118px, 128px\)/g) || [];
if (mixedGridMatches.length < 2) {
  throw new Error("KAN/TRA mixed seed-age rows should reserve a wider Seed Age column in both active and setup layouts.");
}

console.log("Seed Age input width regression check passed.");
