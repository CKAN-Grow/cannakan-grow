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
  "function getCalculatedSeedVaultAgeYears(yearAcquiredValue = \"\")",
  "function normalizeSeedVaultYearAcquired(yearAcquiredValue = \"\")",
  "function getEstimatedSeedVaultAgeYears(yearAcquiredValue = \"\")",
  "return Math.max(SEED_AGE_MIN_YEARS, currentYear - year);",
  "return getCalculatedSeedVaultAgeYears(yearAcquiredValue);",
  "function getSeedVaultCalculatedAgeHelperText(yearAcquiredValue = \"\")",
  "function getSeedVaultEstimatedAgeHelperText(yearAcquiredValue = \"\")",
  "return getSeedVaultCalculatedAgeHelperText(yearAcquiredValue);",
  "return getSeedVaultCalculatedAgeHelperText(yearValue);",
  "const seedAgeYears = getCalculatedSeedVaultAgeYears(yearAcquired);",
  "seedAgeYears,",
  "data-seed-vault-age-display",
  "const helperText = getSeedVaultCalculatedAgeHelperText(yearAcquiredSelect?.value || \"\");",
  "yearAcquiredSelect?.addEventListener(\"change\", syncSeedVaultAgeEstimate);",
  "return getCalculatedSeedVaultAgeYears(normalizedEntry.yearAcquired);",
  "return getCalculatedSeedVaultAgeYears(normalizedEntry?.yearAcquired);",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".seed-vault-calculated-age",
  ".seed-vault-calculated-age:empty",
  ".seed-vault-year-estimate:empty",
]) {
  requireNeedle(stylesSource, needle);
}

for (const forbidden of [
  "seedAgeYearsValue",
  'name="seedAgeYears" type="number"',
  "data-seed-vault-age-estimate",
  "seed-vault-seed-age-estimate",
  "seedAgeInput?.addEventListener(\"input\", syncSeedVaultAgeEstimate);",
]) {
  if (appSource.includes(forbidden) || stylesSource.includes(forbidden)) {
    throw new Error(`Seed Vault should not retain manual Seed Age behavior: ${forbidden}`);
  }
}

console.log("Seed Vault estimated age regression check passed.");
