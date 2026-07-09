const assert = require("assert");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");
const engine = require(path.join(repoRoot, "src", "session-engine.js"));

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing method theme behavior: ${label}`);
  }
}

function rejectNeedle(source, needle, label = needle) {
  if (source.includes(needle)) {
    throw new Error(`Retired method theme color is still present: ${label}`);
  }
}

function assertMethodTone(methodKey, expectedTone) {
  const definition = engine.getMethodDefinition(methodKey);
  assert.equal(definition.tone, expectedTone, `${methodKey} should use ${expectedTone} method tone`);
  const startedPhase = definition.phases.find((phase) => phase.key === "started");
  assert.equal(startedPhase?.tone, expectedTone, `${methodKey} start phase should use ${expectedTone} tone`);
}

[
  'PAPER_TOWEL_SOAK: Object.freeze({ key: "paper-towel-soak", accent: "#f4f6f2", accentSoft: "rgba(244, 246, 242, 0.15)", glow: "rgba(244, 246, 242, 0.26)" })',
  'PAPER_TOWEL: Object.freeze({ key: "paper-towel", accent: "#f4f6f2", accentSoft: "rgba(244, 246, 242, 0.15)", glow: "rgba(244, 246, 242, 0.26)" })',
  'ROCKWOOL: Object.freeze({ key: "rockwool", accent: "#d88947", accentSoft: "rgba(216, 137, 71, 0.16)", glow: "rgba(216, 137, 71, 0.28)" })',
  'case "SOAK_PAPER_TOWEL":\n      return {\n        title: "Soak + Paper Towel",\n        tone: "silver"',
  'case "PAPER_TOWEL":\n      return {\n        title: "Paper Towel Only",\n        tone: "silver"',
  'case "ROCKWOOL":\n      return {\n        title: "Rockwool",\n        tone: "orange"',
].forEach((needle) => requireNeedle(appSource, needle));

[
  ".session-command-roadmap-card--silver",
  "--roadmap-accent: #f4f6f2;",
  "--roadmap-accent-strong: #ffffff;",
  ".session-command-roadmap-card--orange",
  "--roadmap-accent: #d88947;",
  "--roadmap-accent-strong: #f0ad6c;",
  "border: 1px solid rgba(244, 246, 242, 0.24);",
  "radial-gradient(circle at top right, rgba(244, 246, 242, 0.14), transparent 48%)",
  "border-color: rgba(244, 246, 242, 0.6);",
].forEach((needle) => requireNeedle(stylesSource, needle));

assertMethodTone("PAPER_TOWEL_SOAK", "silver");
assertMethodTone("PAPER_TOWEL", "silver");
assertMethodTone("ROCKWOOL", "orange");

[
  "#e9c84b",
  "#f1b65b",
  "#9cab8d",
  "rgba(233, 200, 75",
  "rgba(241, 182, 91",
  "rgba(156, 171, 141",
].forEach((needle) => {
  rejectNeedle(appSource, needle, `${needle} in app.js`);
  rejectNeedle(stylesSource, needle, `${needle} in styles.css`);
});

console.log("Method theme regression check passed.");
