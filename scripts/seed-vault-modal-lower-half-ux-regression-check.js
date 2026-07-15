const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Seed Vault lower-half UX behavior: ${label}`);
  }
}

for (const needle of [
  'data-seed-vault-optional-section="grow-along"',
  'data-seed-vault-optional-section="testing-program"',
  'data-seed-vault-conditional-choice="grow-along" data-choice-value="false"',
  'data-seed-vault-conditional-choice="grow-along" data-choice-value="true"',
  'data-seed-vault-conditional-choice="testing-program" data-choice-value="false"',
  'data-seed-vault-conditional-choice="testing-program" data-choice-value="true"',
  'panel.hidden = !toggle.checked;',
  'choice.setAttribute("aria-pressed", String(isSelected));',
  'toggle.dispatchEvent(new Event("change", { bubbles: true }));',
  '<details class="seed-vault-visuals-section" open>',
  'seed-vault-visual-control seed-vault-visual-control--primary',
  'seed-vault-visual-control seed-vault-visual-control--secondary',
  'Upload a photo of the seed package, plant, or variety.',
  'This image will be used throughout your Seed Vault, Sessions, and Community reports.',
  'seed-vault-visual-placeholder--photo',
  'data-seed-vault-visual-empty-helper="thumbnail"',
  'emptyHelper.hidden = Boolean(url);',
  'renderSeedVaultThemeStyleAttribute(selectedVaultTheme)',
  'Automatically reused for future entries from this source.',
  '"Replace Photo" : "Upload Photo"',
  '"Replace Logo" : "Upload Logo"',
  'data-seed-vault-visual-remove="thumbnail"',
  'data-seed-vault-visual-remove="source-logo"',
  'void handleSeedVaultVisualFileSelection(form, input);',
  'clearVisualOverride(button.dataset.seedVaultVisualRemove || "")',
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  '.seed-vault-segmented-toggle',
  '.seed-vault-optional-section-panel[hidden]',
  'grid-template-columns: minmax(0, 7fr) minmax(230px, 3fr);',
  '.seed-vault-visual-control--primary',
  '.seed-vault-visual-control--secondary',
  '.seed-vault-visual-preview[data-seed-vault-visual-preview="thumbnail"]:not(.has-image)',
  '.seed-vault-visual-empty-helper[hidden]',
  '.seed-vault-form-section > .button',
  'width: calc(100% - 28px);',
  '@media (max-width: 760px)',
  '@media (max-width: 480px)',
]) {
  requireNeedle(stylesSource, needle);
}

for (const forbidden of [
  'class="seed-vault-check-toggle"',
  '<span>Part of Grow Along</span>',
  '<span>Part of Testing Program</span>',
  '>Upload</span>',
]) {
  if (appSource.includes(forbidden)) {
    throw new Error(`Retired Seed Vault lower-half presentation remains: ${forbidden}`);
  }
}

console.log("Seed Vault modal lower-half UX regression check passed.");
