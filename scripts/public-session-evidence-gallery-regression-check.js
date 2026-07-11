const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireSource(needle, label) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing public Evidence gallery behavior: ${label}`);
  }
}

function requireStyle(needle, label) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing public Evidence gallery style: ${label}`);
  }
}

[
  "function initializePublicSessionEvidenceGallery(scope, images = [])",
  "data-session-image-lightbox-index",
  "openSessionImageLightbox(lightboxState, imageIndex);",
  "initializePublicSessionEvidenceGallery(app, getPublicSessionEvidenceImages(reportSnapshot));",
  "modal.addEventListener(\"touchstart\"",
  "modal.addEventListener(\"touchend\"",
].forEach((needle) => requireSource(needle, needle));

[
  ".public-session-evidence-grid",
  "aspect-ratio: 1 / 1;",
  "object-fit: cover;",
  "object-position: center;",
  "grid-template-columns: repeat(3, minmax(0, 1fr));",
  "grid-template-columns: minmax(0, min(100%, 300px));",
].forEach((needle) => requireStyle(needle, needle));

if (stylesSource.includes("aspect-ratio: 16 / 10;")) {
  throw new Error("Public Evidence gallery should not use the old landscape image ratio.");
}

console.log("Public session Evidence gallery regression check passed.");
