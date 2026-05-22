const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

const sourceFieldNeedle = `<label class="partition-identity-field" data-identity-autocomplete="source">
          <span>Source</span>
          <input name="source"`;
const varietyFieldNeedle = `<label class="partition-identity-field" data-identity-autocomplete="seedVariety">
          <span>Seed Variety</span>
          <input name="seedVariety"`;

for (const needle of [sourceFieldNeedle, varietyFieldNeedle]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing My Seed Vault autocomplete field markup: ${needle}`);
  }
}

const scopedSuggestionBlock = stylesSource.match(
  /\.seed-vault-entry-form \.partition-identity-field \.partition-identity-suggestions \{[\s\S]*?\n\}/,
);

if (!scopedSuggestionBlock) {
  throw new Error("Missing Seed Vault scoped autocomplete suggestion spacing styles.");
}

for (const needle of [
  "position: static;",
  "max-height: 148px;",
  "overflow-x: hidden;",
  "overflow-y: auto;",
  "margin-top: 2px;",
]) {
  if (!scopedSuggestionBlock[0].includes(needle)) {
    throw new Error(`Seed Vault autocomplete suggestions should reserve safe form space: ${needle}`);
  }
}

if (!stylesSource.includes(".seed-vault-entry-form .partition-identity-field .partition-identity-suggestions[hidden]")) {
  throw new Error("Seed Vault hidden autocomplete suggestions should remain collapsed.");
}

const sharedPartitionBlock = stylesSource.match(/\.partition-identity-suggestions \{[\s\S]*?\n\}/);
if (!sharedPartitionBlock || !sharedPartitionBlock[0].includes("position: absolute;")) {
  throw new Error("Partition chart autocomplete overlay behavior should remain unchanged.");
}

console.log("Seed Vault autocomplete spacing regression check passed.");
