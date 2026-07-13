const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

function requireNeedle(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Grow Companion left summary behavior: ${label}`);
  }
}

const rendererStart = appSource.indexOf("function renderSessionProgressCommandCenterMarkup(engineState = null, options = {})");
const rendererEnd = appSource.indexOf("function getSessionProgressControlForSummary", rendererStart);
const rendererSource = rendererStart >= 0 && rendererEnd > rendererStart
  ? appSource.slice(rendererStart, rendererEnd)
  : "";

const ringPanelStart = rendererSource.indexOf('<section class="session-progress-companion-ring-panel"');
const ringPanelEnd = rendererSource.indexOf('<div class="session-progress-companion-right">', ringPanelStart);
const ringPanelMarkup = ringPanelStart >= 0 && ringPanelEnd > ringPanelStart
  ? rendererSource.slice(ringPanelStart, ringPanelEnd)
  : "";

const rightColumnStart = rendererSource.indexOf('<div class="session-progress-companion-right">');
const rightColumnEnd = rendererSource.indexOf("</div>\n      </div>", rightColumnStart);
const rightColumnMarkup = rightColumnStart >= 0 && rightColumnEnd > rightColumnStart
  ? rendererSource.slice(rightColumnStart, rightColumnEnd)
  : "";

if (!ringPanelMarkup.includes("session-progress-companion-ring")) {
  throw new Error("Left column should still render the radial progress ring.");
}

[
  '<span class="session-progress-companion-method-badge"',
  '<section class="session-progress-companion-metrics" aria-label="Session supporting summary">',
  "${summaryMetricItems}",
].forEach((needle) => requireNeedle(ringPanelMarkup, needle, needle));

if (rightColumnMarkup.includes("session-progress-companion-metrics")) {
  throw new Error("Right column should not render the supporting summary cards beneath the roadmap.");
}

[
  '<section class="session-progress-companion-hero" aria-label="Current phase">',
  '<section class="session-progress-companion-roadmap" aria-label="Compact session roadmap">',
].forEach((needle) => requireNeedle(rightColumnMarkup, needle, needle));

[
  ".session-progress-companion-main",
  "align-items: start;",
  ".session-progress-companion-ring-panel",
  "align-content: start;",
  ".session-progress-companion-metrics",
  "grid-template-columns: minmax(0, 1fr);",
  "justify-self: stretch;",
  "width: 100%;",
  ".session-progress-companion-metric:first-child strong",
  ".session-progress-companion-metric:nth-child(2) strong",
  "@media (max-width: 900px)",
].forEach((needle) => requireNeedle(stylesSource, needle, needle));

if (/\.session-progress-companion-metrics \{[\s\S]*?grid-template-columns: minmax\(0, 2\.05fr\)/.test(stylesSource)) {
  throw new Error("Supporting summary cards should not use the old horizontal row proportions.");
}

console.log("Session Progress companion left summary regression check passed.");
