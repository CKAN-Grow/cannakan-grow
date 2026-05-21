const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const buildConfigSource = fs.readFileSync(path.join(repoRoot, "scripts", "build-config.mjs"), "utf8");
const manifestSource = fs.readFileSync(path.join(repoRoot, "public", "announcement-slides-manifest.js"), "utf8");
const publicSlidesDir = path.join(repoRoot, "public", "assets", "announcement-slides");

assert(
  buildConfigSource.includes('const announcementSlidesPublicPath = "/assets/announcement-slides";'),
  "Announcement slide manifest should use public static asset URLs.",
);
assert(
  buildConfigSource.includes("const announcementSlidesPublicDir"),
  "Announcement slides should be copied into public assets during build.",
);
assert(
  buildConfigSource.includes("copyFileSync("),
  "Build config should copy announcement slide assets into the public directory.",
);
assert(
  !manifestSource.includes("/src/assets/Announcement-Slides/"),
  "Generated announcement slide manifest should not reference src asset URLs.",
);
assert(
  manifestSource.includes("/assets/announcement-slides/slide-07.png"),
  "Generated announcement slide manifest should include slide-07 at its static public URL.",
);
assert(
  fs.existsSync(path.join(publicSlidesDir, "slide-07.png")),
  "slide-07 should be available from public/assets/announcement-slides after build.",
);
assert(
  !appSource.includes('console.warn("[Cannakan Feed] Failed to preload default slide image"'),
  "Missing announcement slides should fail gracefully without console warning spam.",
);

console.log("Announcement slides preload regression check passed.");
