const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

[
  "const ACTION_BUTTON_ICON_CONFIG = Object.freeze({",
  "iconName: \"check\"",
  "iconName: \"journeyFlag\"",
  "function getActionButtonIconMarkup(actionType = \"save\")",
  "function getActionButtonIconType(button)",
  "function enhanceActionButtonIcon(button)",
  "function enhanceGlobalActionButtonIcons(scope = document)",
  "function initializeGlobalActionButtonIcons()",
  "initializeGlobalActionButtonIcons();",
  "button.dataset[config.dataAttribute] = \"true\";",
  "data-save-icon-button=\"true\">${isEditing ? \"Save Entry\" : \"Add Seeds\"}</button>",
  "[data-unsaved-action='save']",
  "[data-filter-paper-modal-save='true']",
  "[data-filter-paper-setup-save='true']",
  "[data-new-session-complete-button='true']",
  "[data-session-complete-button='true']",
].forEach((needle) => {
  assert(appSource.includes(needle), `Missing global action icon behavior: ${needle}`);
});

[
  "data-session-save-button=\"true\"",
  "Save Profile",
  "Save Note",
  "Save Details",
  "Save Times",
  "Save Session",
  "Complete Session",
  "Mark Session Complete",
].forEach((needle) => {
  assert(indexSource.includes(needle), `Missing action button target in index.html: ${needle}`);
});

[
  ".button.action-button",
  ".button.save-button",
  ".button.complete-button",
  ".action-button-icon",
  ".action-button-icon-svg",
  ".save-button-icon",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Missing shared action icon styling: ${needle}`);
});

assert(
  !indexSource.includes("detail-save-shortcut-icon"),
  "The preferred action icons should come from the shared action icon helper, not duplicated static markup.",
);

console.log("Global action button icon regression check passed.");
