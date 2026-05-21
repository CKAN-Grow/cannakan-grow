const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

[
  "data-session-image-lightbox-index",
  "function ensureSessionImageLightboxModal()",
  "function openSessionImageLightbox(state, requestedIndex = 0)",
  "function closeSessionImageLightbox()",
  "function showSessionImageLightboxIndex(modal, requestedIndex = 0)",
  "session-image-lightbox-modal",
  "session-image-lightbox-image",
  "event.key === \"ArrowLeft\"",
  "event.key === \"ArrowRight\"",
  "event.target === modal",
  "modal.addEventListener(\"cancel\"",
].forEach((needle) => {
  assert(appSource.includes(needle), `Missing session image lightbox behavior: ${needle}`);
});

[
  ".session-image-lightbox-modal",
  ".session-image-lightbox-modal::backdrop",
  ".session-image-lightbox-card",
  ".session-image-lightbox-image",
  "object-fit: contain",
  ".session-image-lightbox-close",
  ".session-image-lightbox-nav",
  "@media (max-width: 720px)",
].forEach((needle) => {
  assert(stylesSource.includes(needle), `Missing session image lightbox styling: ${needle}`);
});

assert(
  appSource.includes("event.target instanceof Element && event.target.closest(\".session-image-remove\")"),
  "Remove button interactions should not open the image lightbox.",
);

console.log("Session image lightbox regression check passed.");
