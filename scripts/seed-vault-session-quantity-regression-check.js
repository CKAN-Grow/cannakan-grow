const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

function requireNeedle(needle) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing Seed Vault session quantity behavior: ${needle}`);
  }
}

for (const needle of [
  "function getSeedVaultSessionUsageFromPartitions(partitions = [])",
  "function validateSeedVaultSessionUsage(partitions = [])",
  "function applySeedVaultSessionQuantityUsage(partitions = [])",
  "const seedVaultUsageValidation = validateSeedVaultSessionUsage(partitionEntries);",
  "if (!seedVaultUsageValidation.isValid) {",
  "const savedSession = await createCloudSession(session);",
  "await applySeedVaultSessionQuantityUsage(partitionEntries);",
  "Math.max(0, availableQuantity - usedCount)",
  "Session saved, but Vault quantity could not be updated.",
  "buildSeedVaultEntrySessionSnapshot(normalizedEntry)",
]) {
  requireNeedle(needle);
}

const saveIndex = appSource.indexOf("const savedSession = await createCloudSession(session);");
const decrementIndex = appSource.indexOf("await applySeedVaultSessionQuantityUsage(partitionEntries);");
if (saveIndex < 0 || decrementIndex < 0 || decrementIndex < saveIndex) {
  throw new Error("Seed Vault quantity must decrement only after the session is saved.");
}

const startFlowBlock = appSource.slice(
  appSource.indexOf("function startNewSessionFromSeedVaultEntry(entryId = \"\")"),
  appSource.indexOf("function getActiveSeedVaultEntriesForSessionPicker()"),
);
if (startFlowBlock.includes("applySeedVaultSessionQuantityUsage")) {
  throw new Error("Opening Start Session from Vault must not decrement quantity.");
}

console.log("Seed Vault session quantity regression check passed.");
