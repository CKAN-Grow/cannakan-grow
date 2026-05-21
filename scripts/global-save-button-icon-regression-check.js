const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

[
  "function getSaveButtonIconMarkup()",
  "class=\"save-button-icon\"",
  "function isSaveButtonIconCandidate(button)",
  "function enhanceSaveButtonIcon(button)",
  "function enhanceGlobalSaveButtonIcons(scope = document)",
  "function initializeGlobalSaveButtonIcons()",
  "initializeGlobalSaveButtonIcons();",
  "button.dataset.saveIconButton = \"true\";",
  "data-save-icon-button=\"true\">Add Seeds</button>",
  "[data-unsaved-action='save']",
  "[data-filter-paper-modal-save='true']",
  "[data-filter-paper-setup-save='true']",
].forEach((needle) => {
  assert(appSource.includes(needle), `Missing global save icon behavior: ${needle}`);
});

[
  "data-session-save-button=\"true\"",
  "Save Profile",
  "Save Note",
  "Save Details",
  "Save Times",
  "Save Session",
].forEach((needle) => {
  assert(indexSource.includes(needle), `Missing save button target in index.html: ${needle}`);
});

[
  ".button.save-button",
  ".save-button-icon",
  ".save-button-icon svg",
  ".detail-save-shortcut-icon",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Missing shared save icon styling: ${needle}`);
});

assert(
  !indexSource.includes("detail-save-shortcut-icon"),
  "The preferred Save Session icon should come from the shared save icon helper, not duplicated static markup.",
);

console.log("Global save button icon regression check passed.");
