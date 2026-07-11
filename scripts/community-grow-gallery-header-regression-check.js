const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing Community Grow gallery header behavior: ${label}`);
  }
}

function forbidNeedle(source, needle, label = needle) {
  if (source.includes(needle)) {
    throw new Error(`Obsolete Community Grow gallery header behavior remains: ${label}`);
  }
}

const galleryTemplateStart = indexSource.indexOf('<template id="gallery-template">');
const galleryTemplateEnd = indexSource.indexOf('<template id="gallery-review-template">', galleryTemplateStart);
if (galleryTemplateStart === -1 || galleryTemplateEnd === -1) {
  throw new Error("Could not locate gallery template.");
}
const galleryTemplate = indexSource.slice(galleryTemplateStart, galleryTemplateEnd);
const feedHeaderStart = galleryTemplate.indexOf('<section id="latest-grow-reports"');
const feedHeaderEnd = galleryTemplate.indexOf('<div id="gallery-grid"', feedHeaderStart);
if (feedHeaderStart === -1 || feedHeaderEnd === -1) {
  throw new Error("Could not locate latest grow reports header.");
}
const feedHeader = galleryTemplate.slice(feedHeaderStart, feedHeaderEnd);

[
  'class="gallery-feed-heading-main"',
  "Browse public grow reports shared by growers around the world.",
  'class="gallery-active-summary"',
  'id="gallery-viewing-state"',
  'id="gallery-sort-state"',
  'id="gallery-sort-order-state"',
  'id="gallery-count-state"',
].forEach((needle) => requireNeedle(feedHeader, needle));

[
  "data-app-icon=\"uploadImage\"",
  "section-title-icon",
  "Showing standardized Grow methods",
  "Sorted by:",
  "Showing 0 of 0 reports",
].forEach((needle) => forbidNeedle(feedHeader, needle));

[
  "const syncGalleryHeaderSummary = (visibleCount = 0, totalCount = 0) => {",
  "galleryViewingState.textContent = getGalleryExploreFilterLabel(appState.galleryExploreFilter);",
  "gallerySortState.textContent = getGallerySortLabel(appState.gallerySort);",
  "gallerySortOrderState.textContent = getGallerySortOrderLabel(appState.gallerySort, appState.gallerySortOrder);",
  "galleryCountState.textContent = `${Number(visibleCount).toLocaleString()} of ${Number(totalCount).toLocaleString()} reports`;",
  "Showing KAN and TRā sessions. Switch to All Methods to explore every community session.",
  "Showing community sessions across all germination methods.",
].forEach((needle) => requireNeedle(appSource, needle));

[
  ".gallery-feed-heading-main",
  ".gallery-feed-copy",
  ".gallery-active-summary",
  ".gallery-active-summary-item",
].forEach((needle) => requireNeedle(stylesSource, needle));

console.log("Community Grow gallery header regression check passed.");
