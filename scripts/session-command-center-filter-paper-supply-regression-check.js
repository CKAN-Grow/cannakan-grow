const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

function extractFunction(name) {
  const start = appSource.indexOf(`function ${name}`);
  assert.ok(start >= 0, `Missing ${name}.`);
  const nextFunction = appSource.indexOf("\nfunction ", start + 1);
  assert.ok(nextFunction > start, `Could not isolate ${name}.`);
  return appSource.slice(start, nextFunction);
}

const helperSource = [
  "const METHOD_TYPE_CONFIG = { KAN: {}, TRA: {}, PAPER_TOWEL: {}, PAPER_TOWEL_SOAK: {}, ROCKWOOL: {}, RAPID_ROOTER: {}, WATER_SOAK: {}, DIRECT_SOW: {}, OTHER: {} };",
  "function hasFilterPaperInventoryBeenSet() { return false; }",
  extractFunction("normalizeMethodType"),
  extractFunction("isFilterPaperSupplyRelevantMethod"),
  extractFunction("getSessionRawMethodType"),
  extractFunction("hasExplicitFilterPaperInventoryCount"),
  extractFunction("hasFilterPaperSupplyRelevantSession"),
  extractFunction("shouldShowFilterPaperSupply"),
  "return { isFilterPaperSupplyRelevantMethod, shouldShowFilterPaperSupply };",
].join("\n");

const {
  isFilterPaperSupplyRelevantMethod,
  shouldShowFilterPaperSupply,
} = new Function(helperSource)();

assert.equal(isFilterPaperSupplyRelevantMethod("KAN"), true, "KAN should qualify.");
assert.equal(isFilterPaperSupplyRelevantMethod("KAN System"), true, "Legacy KAN System should qualify.");
assert.equal(isFilterPaperSupplyRelevantMethod("TRā"), true, "TRā should qualify.");
assert.equal(isFilterPaperSupplyRelevantMethod("TRA"), true, "TRA should qualify.");
assert.equal(isFilterPaperSupplyRelevantMethod("Soak + Paper Towel"), false, "Paper Towel should not qualify.");

assert.equal(
  shouldShowFilterPaperSupply([{ methodType: "Soak + Paper Towel" }, { methodType: "Paper Towel" }], {}),
  false,
  "Case A: Paper Towel-only users should not see filter paper supply.",
);
assert.equal(
  shouldShowFilterPaperSupply([{ methodType: "Rockwool" }], {}),
  false,
  "Case B: Rockwool-only users should not see filter paper supply.",
);
assert.equal(
  shouldShowFilterPaperSupply([{ methodType: "KAN", sessionStatus: "completed" }], {}),
  true,
  "Case C: completed KAN history should show filter paper supply.",
);
assert.equal(
  shouldShowFilterPaperSupply([{ systemType: "TRā", id: "saved-tra-session" }], {}),
  true,
  "Case D: saved TRā history should show filter paper supply.",
);
assert.equal(
  shouldShowFilterPaperSupply([], { count: 12 }),
  true,
  "Case E: configured filter paper inventory should show filter paper supply.",
);
assert.equal(
  shouldShowFilterPaperSupply([], {}),
  false,
  "Case F: no sessions and no configured inventory should hide filter paper supply.",
);

for (const needle of [
  "const shouldRenderSupply = showSupply && shouldShowFilterPaperSupply(supplyEligibilitySessions);",
  "${shouldRenderSupply ? renderSessionCommandCenterFilterPaperSupplyMarkup() : \"\"}",
]) {
  assert.ok(appSource.includes(needle), `Command Center must use centralized visibility rule: ${needle}`);
}

console.log("Session Command Center filter paper supply visibility regression check passed.");
