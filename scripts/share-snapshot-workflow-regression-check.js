const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8").replace(/\r\n/g, "\n");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8").replace(/\r\n/g, "\n");

function requireNeedle(source, needle, label) {
  if (!source.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

function getSection(startNeedle, endNeedle) {
  const startIndex = indexSource.indexOf(startNeedle);
  if (startIndex === -1) {
    throw new Error(`Missing section start: ${startNeedle}`);
  }
  const endIndex = indexSource.indexOf(endNeedle, startIndex);
  if (endIndex === -1) {
    throw new Error(`Missing section end after ${startNeedle}: ${endNeedle}`);
  }
  return indexSource.slice(startIndex, endIndex);
}

const newSessionShareSection = getSection(
  '<section id="share-snapshot-section"',
  '<p id="session-success-summary"',
);
const detailShareSection = getSection(
  '<section id="detail-share-snapshot-section"',
  '<p id="detail-save-message"',
);

for (const [label, section] of [
  ["New Session Share Snapshot", newSessionShareSection],
  ["Detail Share Snapshot", detailShareSection],
]) {
  [
    'class="snapshot-workflow-header"',
    'class="snapshot-workflow-step-badge" aria-hidden="true">3</span>',
    "Share Your Grow Snapshot <small>(Optional)</small>",
    "Turn your session into a shareable snapshot",
    "Social + Community Grow",
    "Community Grow only",
    "Social only",
    "Include my profile name &amp; image",
    "Only your profile name and image will be shown.",
    "Capture and share your grow session.",
    "Generating Grow Snapshots?",
    "Generate Snapshot",
    "Visit Community Grow",
    "Explore shared grow sessions.",
    "Browse Community Grow",
    'class="snapshot-help-footer"',
    "Learn how snapshots work and best practices.",
    "Watch Tutorial",
    "Learn More",
  ].forEach((needle) => requireNeedle(section, needle, label));

  if (section.includes("section-title-icon") || section.includes("<p class=\"snapshot-destination-label\">Share to</p>")) {
    throw new Error(`${label} should use the compact step-3 workflow shell, not the old hero/header controls.`);
  }
}

[
  ".session-workspace-shell .share-snapshot-section",
  ".session-workspace-shell .share-snapshot-section::before",
  ".snapshot-workflow-header",
  ".snapshot-workflow-step-badge",
  ".snapshot-workflow-heading-copy",
  ".session-workspace-shell .snapshot-destination-option input:checked + span",
  ".session-workspace-shell .snapshot-profile-toggle",
  ".session-workspace-shell .snapshot-action-row",
  ".session-workspace-shell .snapshot-explore-card",
  ".session-workspace-shell .snapshot-help-footer",
  ".snapshot-help-footer-actions",
  "@media (max-width: 720px)",
].forEach((needle) => requireNeedle(stylesSource, needle, "Share Snapshot workflow styling"));

console.log("Share Snapshot workflow regression check passed.");
