const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

[
  "--button-primary-bg:",
  "--button-primary-bg-hover:",
  "--button-primary-bg-active:",
  "--button-primary-text: #f6fbf3;",
  "--button-secondary-bg:",
  "--button-secondary-bg-hover:",
  "--button-complete-bg:",
  "--button-complete-bg-hover:",
  "--button-complete-text:",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Missing centralized button token: ${needle}`);
});

[
  ".button-primary,\n.button-new-session",
  "background: var(--button-primary-bg);",
  "background: var(--button-primary-bg-hover);",
  "background: var(--button-primary-bg-active);",
  ".button-secondary {\n  background: var(--button-secondary-bg);",
  ".button.complete-button {\n  border-color: var(--button-complete-border);",
  ".button.snapshot-generate-button",
  ".session-workspace-shell .button-primary",
  ".seed-vault-panel .seed-vault-header-actions .seed-vault-add-button.button",
  "#grow-sessions-header .hero-action-button--primary",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Missing token-backed button rule: ${needle}`);
});

[
  ".button.snapshot-generate-button",
  ".session-workspace-shell .button-primary",
  "body.theme-dark .button-primary",
  "#grow-sessions-header .hero-action-button--primary",
  ".seed-vault-panel .seed-vault-header-actions .seed-vault-add-button.button",
].forEach((selector) => {
  const start = stylesSource.indexOf(selector);
  assert(start >= 0, `Missing selector for token audit: ${selector}`);
  const nextRule = stylesSource.indexOf("\n}", start);
  const block = stylesSource.slice(start, nextRule);
  [
    "#9ee76a",
    "#a8ef73",
    "#b2f57f",
    "#b9fa88",
    "#78b546",
    "#6da83f",
    "#79bc47",
  ].forEach((brightColor) => {
    assert(!block.includes(brightColor), `${selector} should use button tokens instead of ${brightColor}.`);
  });
});

console.log("Button design system regression check passed.");
