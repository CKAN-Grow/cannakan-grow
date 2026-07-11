const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireSource(needle, label) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing Community Grow like/grid behavior: ${label}`);
  }
}

function requireStyle(needle, label) {
  if (!stylesSource.includes(needle)) {
    throw new Error(`Missing Community Grow grid/like style: ${label}`);
  }
}

[
  "function renderGalleryLikeButtonMarkup(snapshot, options = {})",
  "const { variant = \"heart\", className = \"\" } = options;",
  "return renderGalleryLikeButtonMarkup(snapshot, {",
  "className: \"public-session-hero-like\"",
  "function getGallerySnapshotLikeTarget(snapshotId = \"\")",
  "persistMockGallerySnapshotLikeState(snapshotId, {",
  "syncGalleryLikeButtonsForSnapshot(snapshotId)",
].forEach((needle) => requireSource(needle, needle));

[
  "grid-template-columns: repeat(4, minmax(0, 1fr));",
  "@media (max-width: 1180px)",
  "grid-template-columns: repeat(3, minmax(0, 1fr));",
  "@media (max-width: 900px)",
  "grid-template-columns: repeat(2, minmax(0, 1fr));",
  "@media (max-width: 640px)",
  "grid-template-columns: minmax(0, 1fr);",
  ".public-session-hero-like {\n  position: absolute;",
].forEach((needle) => requireStyle(needle, needle));

if (/function renderPublicSessionHeroLikeMarkup[\s\S]*renderAppIconMarkup\("heartLike"/.test(appSource)) {
  throw new Error("Community Grow Report should use the shared gallery Like renderer, not a duplicate heart button.");
}

const galleryGridBlock = stylesSource.match(/\.gallery-grid \{[\s\S]*?\n\}/)?.[0] || "";
if (galleryGridBlock.includes("repeat(auto-fit")) {
  throw new Error("Community Grow Explorer should not use the old auto-fit grid that creates five desktop columns.");
}

if (stylesSource.includes(".public-session-hero-like-icon")) {
  throw new Error("Community Grow Report should not keep the old separate hero Like icon styling.");
}

console.log("Community Grow like/grid regression check passed.");
