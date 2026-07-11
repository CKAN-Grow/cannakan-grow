const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  "/* Seed Vault modern glass alignment */",
  ".seed-vault-panel[data-seed-vault-theme]",
  "linear-gradient(180deg, rgba(16, 22, 18, 0.96) 0%, rgba(9, 14, 12, 0.97) 100%)",
  ".seed-vault-theme-control",
  ".seed-vault-panel[data-seed-vault-theme] .seed-vault-view-toggle-button.is-active",
  ".seed-vault-panel[data-seed-vault-theme] .seed-vault-quick-view.is-active",
  ".seed-vault-panel[data-seed-vault-theme] .seed-vault-entry-card:hover",
  ".seed-vault-search-field input:focus",
  ".seed-vault-insights-cta.button:hover",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing Seed Vault modern glass styling guard: ${needle}`);
  }
}

console.log("Seed Vault glass style regression check passed.");
