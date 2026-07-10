const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const chartStart = indexSource.indexOf('id="partition-chart-shell"');
const saveShortcutStart = indexSource.indexOf('class="timeline-save-shortcut session-glass-panel"', chartStart);
const growCompanionStart = indexSource.indexOf('id="session-lifecycle-section"', saveShortcutStart);
assert(chartStart >= 0 && saveShortcutStart > chartStart, "Could not locate the New Session save shortcut after the seed chart.");
assert(growCompanionStart > saveShortcutStart, "Save shortcut should remain before Grow Companion.");

const saveShortcutMarkup = indexSource.slice(saveShortcutStart, growCompanionStart);
[
  '<strong>Every Grow Matters.</strong>',
  "Starting, updating, and completing your session builds more accurate germination data for you and the entire Grow community.",
  'class="session-action-button-row"',
  "Save Session",
  "Complete Session",
].forEach((needle) => {
  assert(saveShortcutMarkup.includes(needle), `Save shortcut is missing: ${needle}`);
});

assert(
  !saveShortcutMarkup.includes("Review your progress and save your session"),
  "New Session save shortcut should not retain the old generic message.",
);

[
  ".session-workspace-shell .timeline-save-shortcut:not(.detail-session-action-bar) .timeline-save-shortcut-text {",
  ".session-workspace-shell .timeline-save-shortcut:not(.detail-session-action-bar) .timeline-save-shortcut-text strong {",
  ".session-workspace-shell .timeline-save-shortcut:not(.detail-session-action-bar) .timeline-save-shortcut-text span {",
  "color: #94d159;",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Missing action callout style: ${needle}`);
});

console.log("New Session action callout regression check passed.");
