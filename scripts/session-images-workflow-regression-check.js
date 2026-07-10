const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8").replace(/\r\n/g, "\n");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8").replace(/\r\n/g, "\n");
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

const newSessionImagesSection = getSection(
  '<section class="session-images-section session-glass-panel" aria-labelledby="session-images-label">',
  '<section id="share-snapshot-section"',
);
const detailImagesSection = getSection(
  '<section class="session-images-section session-glass-panel" aria-labelledby="detail-session-images-label">',
  '<section id="detail-share-snapshot-section"',
);

for (const [label, section] of [
  ["New Session Images", newSessionImagesSection],
  ["Detail Images", detailImagesSection],
]) {
  [
    'class="session-images-heading session-images-workflow-heading"',
    'class="session-images-step-badge" aria-hidden="true">2</span>',
    'class="session-images-heading-copy"',
    'class="eyebrow">Images</p>',
    "Add up to 3 images for this session",
    "Up to 3 images",
    'class="session-images-input-home" hidden',
    'class="file-upload-input" type="file" accept="image/*" multiple',
    'class="session-images-grid"',
  ].forEach((needle) => requireNeedle(section, needle, label));

  if (section.includes("Session Images") || section.includes("section-title-icon")) {
    throw new Error(`${label} should use the compact step-2 workflow header, not the old icon title.`);
  }
}

[
  "function createSessionImageUploadSlot(state)",
  "session-image-slot session-image-slot--upload",
  "session-image-upload-plus",
  "Choose Image",
  "JPG, PNG up to 10MB",
  "function createSessionImagePlaceholderSlot(index = 0)",
  "session-image-slot session-image-slot--placeholder",
  "for (let index = allImages.length + (state.editable && allImages.length < MAX_SESSION_IMAGES ? 1 : 0); index < MAX_SESSION_IMAGES; index += 1)",
  "No images added yet.",
  'renderLearnEmptyStateCtaMarkup("using-notes-and-images", "Using Notes & Images")',
  'control?.classList.contains("session-image-upload-control")',
].forEach((needle) => requireNeedle(appSource, needle, "shared Images renderer behavior"));

[
  ".session-workspace-shell .session-images-section",
  ".session-workspace-shell .session-images-workflow-heading",
  ".session-workspace-shell .session-images-workflow-heading > .session-images-heading-copy",
  "grid-template-areas: none;",
  ".session-images-step-badge",
  "white-space: nowrap;",
  ".session-workspace-shell .session-images-grid",
  "grid-template-columns: repeat(3, minmax(0, 1fr));",
  ".session-workspace-shell .session-image-slot",
  ".session-workspace-shell .session-image-slot--upload",
  ".session-workspace-shell .session-image-slot--placeholder",
  ".session-workspace-shell .session-image-slot--placeholder .session-image-placeholder-icon",
  "width: 84px;",
  "height: 84px;",
  ".session-workspace-shell .session-images-empty .learn-empty-state-cta-button",
  "@media (max-width: 720px)",
  "white-space: normal;",
].forEach((needle) => requireNeedle(stylesSource, needle, "Images workflow styling"));

console.log("Session Images workflow regression check passed.");
