const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Seed Vault estimated age behavior: ${label}`);
  }
}

for (const needle of [
  "function getEstimatedSeedVaultAgeYears(yearAcquiredValue = \"\")",
  "return Math.max(SEED_AGE_MIN_YEARS, currentYear - Math.floor(year));",
  "function getSeedVaultEstimatedAgeHelperText(yearAcquiredValue = \"\")",
  "return getSeedVaultEstimatedAgeHelperText(yearValue);",
  "return `${formatSeedAgeYearsLabel(estimatedSeedAgeYears)} estimated`;",
  "seedAgeYears: seedAgeYearsValue ? normalizeSeedAgeYears(seedAgeYearsValue) : null",
  "data-seed-vault-age-estimate",
  "const helperText = String(seedAgeInput?.value || \"\").trim()",
  "seedAgeInput?.addEventListener(\"input\", syncSeedVaultAgeEstimate);",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".seed-vault-seed-age-estimate",
  ".seed-vault-seed-age-estimate:empty",
  ".seed-vault-year-estimate:empty",
]) {
  requireNeedle(stylesSource, needle);
}

console.log("Seed Vault estimated age regression check passed.");
