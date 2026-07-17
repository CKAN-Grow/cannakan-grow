const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

for (const needle of [
  'const SINGLE_SEED_POSITION_METHOD_IDS = Object.freeze(["ROCKWOOL", "RAPID_ROOTER", "DIRECT_SOW"]);',
  "function getSingleSeedPositionMethodRule(methodType = \"\")",
  "function getSingleSeedPositionPartitionRuleState(methodType = \"\", partition = {}, options = {})",
  "function validateSessionSingleSeedPositionRules(session = null, options = {})",
  "function assertSessionSingleSeedPositionRules(session = null, options = {})",
  "attachSingleSeedPositionLegacyBaseline(normalizedSession, session)",
  "assertSessionSingleSeedPositionRules(session);",
  "assertSessionSingleSeedPositionRules(session, { previousSession });",
  'rowLabel: "Cube"',
  'rowLabel: "Plug"',
  'rowLabel: "Planting Position"',
  'return "Planting Positions";',
  'button.textContent = `+ Add ${method.rowLabel}`;',
  'seedInput.readOnly = true;',
  'resultInput.setAttribute("pattern", "[01]");',
  'resultInput.maxLength = 1;',
  "allowLegacyMultiSeedPosition: true",
  "seedCount <= legacySeedCount",
  "groupedPartitionSeeds.flatMap",
  "seedIndex < germinatedSeeds ? 1 : 0",
  "validateSessionSingleSeedPositionRules(session)",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing permanent single-seed position behavior: ${needle}`);
  }
}

const affectedMethods = new Set(["ROCKWOOL", "RAPID_ROOTER", "DIRECT_SOW"]);
const expandFixtureRows = (method, rows) => affectedMethods.has(method)
  ? rows.flatMap((row) => {
    const total = Math.max(0, Math.floor(Number(row.seedCount) || 0));
    const germinated = Math.max(0, Math.min(total, Math.floor(Number(row.plantedCount) || 0)));
    return Array.from({ length: total }, (_, index) => ({
      ...row,
      seedCount: 1,
      plantedCount: index < germinated ? 1 : 0,
    }));
  })
  : rows;

for (const method of affectedMethods) {
  const sourceRows = [
    { seedCount: 7, plantedCount: 6 },
    { seedCount: 5, plantedCount: 3 },
  ];
  const expanded = expandFixtureRows(method, sourceRows);
  if (expanded.length !== 12) throw new Error(`${method} fixture seed total changed during row expansion.`);
  if (expanded.some((row) => row.seedCount !== 1 || ![0, 1].includes(row.plantedCount))) {
    throw new Error(`${method} fixture contains a non-physical seed position.`);
  }
  if (expanded.reduce((sum, row) => sum + row.plantedCount, 0) !== 9) {
    throw new Error(`${method} fixture germination total changed during row expansion.`);
  }
}

const unaffectedRows = [{ seedCount: 12, plantedCount: 10 }];
if (expandFixtureRows("KAN", unaffectedRows) !== unaffectedRows) {
  throw new Error("KAN rows must remain unchanged by the physical-position fixture rule.");
}

console.log("Single-seed position method regression check passed.");
