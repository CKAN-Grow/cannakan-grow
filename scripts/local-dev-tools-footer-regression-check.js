const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing local developer tools footer behavior: ${label}`);
  }
}

function rejectNeedle(source, needle, label = needle) {
  if (source.includes(needle)) {
    throw new Error(`Retired top-of-page developer banner behavior is still present: ${label}`);
  }
}

[
  "function syncLocalDevToolsSection()",
  'section.id = "local-dev-tools-section";',
  'section.setAttribute("aria-label", "Developer Tools (Local Only)");',
  'Developer Tools (Local Only)',
  'appFooter.insertAdjacentElement("afterend", section);',
  'function getLocalDevToolsContentElement()',
  "const content = getLocalDevToolsContentElement();",
  "content.prepend(banner);",
  "content.append(banner);",
  "isDownloadRouteActive() || !isLocalDevQaBypassActive() || !isMockDataEnabled()",
].forEach((needle) => requireNeedle(appSource, needle));

[
  ".local-dev-tools-section",
  ".local-dev-tools-panel",
  ".local-dev-tools-summary",
  ".local-dev-tools-content",
  ".local-dev-tools-content .local-dev-qa-bypass-banner",
  ".local-dev-tools-content .mock-data-banner",
  'content: "Collapse";',
].forEach((needle) => requireNeedle(stylesSource, needle));

[
  "(installBanner || topbar).insertAdjacentElement(\"afterend\", banner);",
  "app.prepend(banner);",
].forEach((needle) => rejectNeedle(appSource, needle));

console.log("Local developer tools footer regression check passed.");
