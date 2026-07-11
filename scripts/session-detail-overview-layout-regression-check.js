const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

for (const needle of [
  "function renderSessionDetailMetaCards(container, cards = [])",
  "<div class=\"detail-header-label\">Session Overview</div>",
  "{ key: \"status\", label: \"Status\"",
  "{ key: \"method\", label: \"Method Type\"",
  "{ key: \"unit\", label: \"Unit ID\"",
  "{ key: \"date\", label: \"Session Date\"",
  "{ key: \"time\", label: \"Session Time\"",
  "label: \"Seed Age\"",
]) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing session overview card source: ${needle}`);
  }
}

for (const needle of [
  ".session-workspace-shell--detail .session-top-grid,",
  ".session-workspace-shell--detail .detail-top-stack,",
  ".session-workspace-shell--detail #detail-meta",
  "grid-template-columns: repeat(6, minmax(0, 1fr));",
  "grid-template-columns: repeat(3, minmax(0, 1fr));",
  "grid-template-columns: repeat(2, minmax(0, 1fr));",
  ".session-result-breakdown-head",
  "grid-template-columns: minmax(0, 1.65fr) minmax(320px, 0.92fr);",
  "font-size: clamp(2.15rem, 3.45vw, 3.35rem);",
]) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing active session detail layout styling: ${needle}`);
  }
}

console.log("Session detail overview layout regression check passed.");
