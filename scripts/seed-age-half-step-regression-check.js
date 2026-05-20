const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  "function isSeedAgeHalfYearIncrement(value)",
  "function isValidSeedAgeYearsInput(value, options = {})",
  "const halfYearUnits = normalizedValue / 0.5;",
  'name="sessionSeedAgeYears" min="0" max="99" step="0.5"',
  'name="seedAgeYears-${index}" class="partition-input" min="0" step="0.5"',
  "if (!isValidSeedAgeYearsInput(rawValue))",
  "const seedAgeValid = !seedAgeInput || isValidSeedAgeYearsInput(seedAgeValue, { allowBlank: true });",
  "Use 0.5 year increments or leave blank.",
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
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return false;
  }
  const halfYearUnits = parsedValue / 0.5;
  return Math.abs(halfYearUnits - Math.round(halfYearUnits)) < 0.000001;
};

for (const validValue of ["0.5", "1", "1.5", "2", "2.5", "20.5"]) {
  if (!isHalfYearStep(validValue)) {
    throw new Error(`Expected valid half-year Seed Age value: ${validValue}`);
  }
}

for (const invalidValue of ["2.2", "3.7", "-0.5", "abc"]) {
  if (isHalfYearStep(invalidValue)) {
    throw new Error(`Expected invalid Seed Age value: ${invalidValue}`);
  }
}

console.log("Seed Age 0.5-step regression check passed.");
