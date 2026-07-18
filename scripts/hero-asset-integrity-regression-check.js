const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const styles = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const app = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const serviceWorker = fs.readFileSync(path.join(repoRoot, "service-worker.js"), "utf8");
const assets = [
  {
    url: "/assets/images/seed-vault-hero-bg.png",
    file: "public/assets/images/seed-vault-hero-bg.png",
    source: styles,
  },
  {
    url: "/assets/images/methods/kan-grow-companion-bg.png",
    file: "public/assets/images/methods/kan-grow-companion-bg.png",
    source: styles + app,
  },
  {
    url: "/assets/images/tutorials/placeholders/kan-system-walkthrough.webp",
    file: "public/assets/images/tutorials/placeholders/kan-system-walkthrough.webp",
    source: app,
  },
  {
    url: "/assets/images/tutorials/placeholders/germination-stages.webp",
    file: "public/assets/images/tutorials/placeholders/germination-stages.webp",
    source: app,
  },
];

for (const asset of assets) {
  const absolutePath = path.join(repoRoot, ...asset.file.split("/"));
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Missing tracked hero/tutorial asset: ${asset.file}`);
  }
  if (fs.statSync(absolutePath).size < 1024) {
    throw new Error(`Hero/tutorial asset is unexpectedly empty: ${asset.file}`);
  }
  execFileSync("git", ["ls-files", "--error-unmatch", asset.file], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  const fileName = path.basename(asset.url);
  if (!asset.source.includes(fileName)) {
    throw new Error(`Authoritative application source no longer references ${asset.url}`);
  }
}

const obsoleteKanPath = "/assets/images/methods/kan-grow-companion-hero.png";
if (styles.includes(obsoleteKanPath) || app.includes(obsoleteKanPath) || serviceWorker.includes(obsoleteKanPath)) {
  throw new Error("Obsolete KAN Grow Companion hero alias remains in an application source.");
}
if (serviceWorker.includes("seed-vault-hero-bg.png") || serviceWorker.includes("kan-grow-companion-hero.png")) {
  throw new Error("The service worker must not preserve stale hero-specific cache entries.");
}

console.log(`Hero asset integrity regression passed (${assets.length} tracked assets).`);
