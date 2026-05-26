const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const appJs = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const stylesCss = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");

const requiredAppSnippets = [
  "sessionHistoryExpanded: false",
  "data-session-history-toggle=\"true\"",
  "aria-controls=\"session-history-body\"",
  "session-history-summary",
  "summaryCounts",
  "session-history-collapsible-body",
  "appState.sessionHistoryExpanded = appState.sessionHistoryExpanded !== true",
  "expanded: appState.sessionHistoryExpanded === true",
  "if (String(appState.sessionDashboardScrollTarget || \"\").trim() === \"session-history\")",
];

const requiredStyleSnippets = [
  ".session-history-panel.is-collapsed",
  ".session-history-summary",
  ".session-history-toggle-button",
  ".session-history-panel.is-expanded .session-history-toggle-icon",
  ".session-history-collapsible-body[hidden]",
  "@keyframes session-history-reveal",
];

function assertIncludes(source, snippet, label) {
  if (!source.includes(snippet)) {
    throw new Error(`${label} is missing expected snippet: ${snippet}`);
  }
}

requiredAppSnippets.forEach((snippet) => assertIncludes(appJs, snippet, "app.js"));
requiredStyleSnippets.forEach((snippet) => assertIncludes(stylesCss, snippet, "styles.css"));

console.log("Session History collapsible regression check passed.");
