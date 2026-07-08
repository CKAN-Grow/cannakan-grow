const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

function requireNeedle(needle, label = needle) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing KAN-only filter paper behavior: ${label}`);
  }
}

function rejectInBlock(block, needle, label = needle) {
  if (block.includes(needle)) {
    throw new Error(`Retired filter paper trigger still present in ${label}.`);
  }
}

const seedVaultStartIndex = appSource.indexOf("function startNewSessionFromSeedVaultEntry");
const seedVaultNextIndex = appSource.indexOf("function getActiveSeedVaultEntriesForSessionPicker", seedVaultStartIndex);
if (seedVaultStartIndex === -1 || seedVaultNextIndex === -1) {
  throw new Error("Could not locate startNewSessionFromSeedVaultEntry.");
}
const seedVaultStartBlock = appSource.slice(seedVaultStartIndex, seedVaultNextIndex);
requireNeedle("function maybePromptKanFilterPaperSetup(methodType = \"\")");
requireNeedle("if (normalizedMethod !== \"KAN\")");
requireNeedle("dismissFilterPaperSetupBeforeNewSession();");
requireNeedle("void promptFilterPaperSetupBeforeNewSession();");
requireNeedle("maybePromptKanFilterPaperSetup(systemTypeField.value);");
requireNeedle("maybePromptKanFilterPaperSetup(nextMethod);");
requireNeedle("const canProceedWithoutFilterPapers = selectedMethod.supportsFilterInventory");
requireNeedle("? await promptFilterPaperPreSessionWarning()");
requireNeedle("supportsFilterInventory: true");
requireNeedle("TRA: Object.freeze({");
requireNeedle("supportsFilterInventory: false");
rejectInBlock(seedVaultStartBlock, "promptFilterPaperSetupBeforeNewSession()", "Seed Vault new-session starter");

const newSessionTriggerIndex = appSource.indexOf("if (newSessionTrigger instanceof HTMLAnchorElement)");
const newSessionTriggerEndIndex = appSource.indexOf("if (!(event.target instanceof Node)", newSessionTriggerIndex);
if (newSessionTriggerIndex === -1 || newSessionTriggerEndIndex === -1) {
  throw new Error("Could not locate New Session click handler.");
}
const newSessionClickBlock = appSource.slice(newSessionTriggerIndex, newSessionTriggerEndIndex);
requireNeedle("openNewSessionSystemModal();");
rejectInBlock(newSessionClickBlock, "promptFilterPaperSetupBeforeNewSession()", "New Session click handler");

console.log("Filter paper KAN-only regression check passed.");
