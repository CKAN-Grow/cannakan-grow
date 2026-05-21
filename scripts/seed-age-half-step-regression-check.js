const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "function isSeedAgeHalfYearIncrement(value)",
  "function isValidSeedAgeYearsInput(value, options = {})",
  "const SEED_AGE_MIN_YEARS = 1;",
  "const SEED_AGE_STEP_YEARS = 0.5;",
  "const halfYearUnits = parsedValue / SEED_AGE_STEP_YEARS;",
  "return normalizeSeedAgeYears(rawValue) !== null;",
  'name="sessionSeedAgeYears" min="${SEED_AGE_MIN_YEARS}" max="${SEED_AGE_MAX_YEARS}" step="${SEED_AGE_STEP_YEARS}"',
  'name="seedAgeYears-${index}" class="partition-input" min="${SEED_AGE_MIN_YEARS}" max="${SEED_AGE_MAX_YEARS}" step="${SEED_AGE_STEP_YEARS}"',
  'name="seedAgeYears" type="number" min="${SEED_AGE_MIN_YEARS}" max="${SEED_AGE_MAX_YEARS}" step="${SEED_AGE_STEP_YEARS}"',
  "if (!isValidSeedAgeYearsInput(rawValue))",
  "const seedAgeValid = !seedAgeInput || isValidSeedAgeYearsInput(seedAgeValue, { allowBlank: true });",
  "Use 0.5 year increments starting at 1 year, or leave blank.",
  "Seed age must start at 1 year and use 0.5 year increments.",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing Seed Age 0.5-step behavior: ${needle}`);
  }
}

if (appSource.includes('step="0.1"')) {
  throw new Error('Seed Age inputs should not use step="0.1".');
}

const isHalfYearStep = (value) => {
  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue < 1 || parsedValue > 99) {
    return false;
  }
  const halfYearUnits = parsedValue / 0.5;
  return Math.abs(halfYearUnits - Math.round(halfYearUnits)) < 0.000001;
};

for (const validValue of ["1", "1.5", "2", "2.5", "20.5", "99"]) {
  if (!isHalfYearStep(validValue)) {
    throw new Error(`Expected valid half-year Seed Age value: ${validValue}`);
  }
}

for (const invalidValue of ["0.4", "0.5", "2.2", "3.7", "-0.5", "99.5", "abc"]) {
  if (isHalfYearStep(invalidValue)) {
    throw new Error(`Expected invalid Seed Age value: ${invalidValue}`);
  }
}

console.log("Seed Age 0.5-step regression check passed.");
