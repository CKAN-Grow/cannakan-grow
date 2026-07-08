const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const engineSource = fs.readFileSync(path.join(repoRoot, "src", "session-engine.js"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Method Type selection behavior: ${label}`);
  }
}

function rejectNeedle(source, needle, label = needle) {
  if (source.includes(needle)) {
    throw new Error(`Retired Method Type display is still present: ${label}`);
  }
}

for (const needle of [
  'name: "Starter Plug"',
  'optionLabel: "Starter Plug"',
  'chartEyebrow: "Starter Plug"',
  'chartTitle: "Starter Plug Seed Chart"',
  'const METHOD_TYPE_SELECTION_ORDER = Object.freeze(["KAN", "TRA", "PAPER_TOWEL", "ROCKWOOL", "RAPID_ROOTER", "WATER_SOAK", "DIRECT_SOW", "OTHER"]);',
  'const PAPER_TOWEL_SETUP_METHODS = Object.freeze(["PAPER_TOWEL_SOAK", "PAPER_TOWEL"]);',
  'const PREPARED_MEDIA_SETUP_METHODS = Object.freeze(["ROCKWOOL", "RAPID_ROOTER"]);',
  'const METHOD_SETUP_PREFERENCE_STORAGE_KEY = "cannakanGrowMethodSetupPreferences";',
  'function getMethodTypeSelectionLabel(methodType = "")',
  'isPaperTowelSetupMethod(method.id) ? "Paper Towel" : method.optionLabel',
  'function getPreparedMediaSetupConfig(methodType = "")',
  'function savePreparedMediaSetupPreference(methodType = "", choice = "")',
  'function getSavedPreparedMediaSetupPreference(methodType = "")',
  'function clearPreparedMediaSetupPreference(methodType = "")',
  'function getMethodSetupStateFromForm(form)',
  'METHOD_TYPE_SELECTION_ORDER.map((methodId) =>',
  'hidden>${escapeHtml(getMethodTypeSelectionLabel(nextMethod))}</option>',
  'function openPaperTowelSetupModal()',
  'function applyPaperTowelSetupChoice(methodType = "")',
  'function openPreparedMediaSetupModal(methodType = "")',
  'function applyPreparedMediaSetupChoice(methodType = "", choice = "", remember = false)',
  'id="paper-towel-setup-modal-title">Paper Towel Setup</h2>',
  'id="prepared-media-setup-modal-title">${escapeHtml(setupConfig.title)}</h2>',
  'form.dataset.paperTowelSetupChoice = nextMethod;',
  'form.dataset.methodSetupChoice = normalizedChoice;',
  'delete form.dataset.paperTowelSetupChoice;',
  'openPaperTowelSetupModal();',
  'openPreparedMediaSetupModal(nextMethod);',
  'systemTypeField.dispatchEvent(new Event("change", { bubbles: true }));',
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  '<option value="RAPID_ROOTER">Starter Plug</option>',
]) {
  requireNeedle(htmlSource, needle);
}

for (const needle of [
  ".paper-towel-setup-modal-overlay",
  ".paper-towel-setup-modal-option",
  ".prepared-media-setup-modal-overlay",
  ".prepared-media-setup-modal-option",
  ".prepared-media-setup-modal-remember",
]) {
  requireNeedle(stylesSource, needle);
}

requireNeedle(engineSource, 'displayName: "Starter Plug"');
requireNeedle(engineSource, 'function getEffectiveMethodDefinition(definition, methodKey, session)');
requireNeedle(engineSource, 'function getPreparedMediaPhases(methodKey)');
rejectNeedle(htmlSource, 'id="paper-towel-setup-choice"', "inline Paper Towel setup card");
rejectNeedle(stylesSource, ".paper-towel-setup-choice", "inline Paper Towel setup styles");
rejectNeedle(appSource, "function syncPaperTowelSetupChoice()", "inline Paper Towel setup sync");
rejectNeedle(appSource, 'Rapid Rooter / Starter Plug');
rejectNeedle(appSource, 'name: "Rapid Rooter"');
rejectNeedle(engineSource, 'displayName: "Rapid Rooter"');
rejectNeedle(engineSource, 'timing: "Already prepared"', "prepared media timeline pre-step");

console.log("Method Type selection regression check passed.");
