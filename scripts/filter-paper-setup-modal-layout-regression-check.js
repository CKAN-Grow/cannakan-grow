const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");

[
  'modal.id = "filter-paper-setup-modal";',
  'modal.className = "snapshot-modal filter-paper-setup-modal";',
  'class="snapshot-modal-card filter-paper-setup-modal-card"',
  'name="filterPaperSetupCount"',
  'data-filter-paper-setup-save="true"',
  'data-filter-paper-setup-skip="true"',
].forEach((needle) => {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing filter paper setup modal markup: ${needle}`);
  }
});

[
  ".filter-paper-setup-modal-card {\n  width: min(calc(100vw - 32px), 400px);",
  "  justify-self: center;",
  ".filter-paper-setup-field input {\n  width: 100%;\n  min-width: 0;\n}",
  ".filter-paper-setup-actions .button {\n  width: 100%;\n}",
  ".filter-paper-setup-modal-card {\n    width: min(calc(100vw - 28px), 400px);\n    padding: 20px;\n  }",
].forEach((needle) => {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing focused filter paper setup modal layout style: ${needle}`);
  }
});

console.log("Filter paper setup modal layout regression check passed.");
