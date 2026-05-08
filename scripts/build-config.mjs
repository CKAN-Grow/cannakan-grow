import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";

const url = process.env.CANNAKAN_SUPABASE_URL || "";
const anonKey = process.env.CANNAKAN_SUPABASE_ANON_KEY || "";
const pushPublicKey = process.env.VAPID_PUBLIC_KEY
  || process.env.CANNAKAN_PUSH_PUBLIC_KEY
  || process.env.CANNAKAN_PUSH_VAPID_PUBLIC_KEY
  || "";
const isVercelBuild = process.env.VERCEL === "1";

if ((!url || !anonKey) && isVercelBuild) {
  console.error("Missing required Vercel environment variables: CANNAKAN_SUPABASE_URL and CANNAKAN_SUPABASE_ANON_KEY");
  process.exit(1);
}

const outputPath = resolve(process.cwd(), "supabase-config.js");
const manifestPath = resolve(process.cwd(), "manifest.json");
const publicDir = resolve(process.cwd(), "public");
const publicManifestPath = resolve(publicDir, "manifest.json");
const announcementSlidesDir = resolve(process.cwd(), "src", "assets", "Announcement-Slides");
const announcementSlidesManifestPath = resolve(process.cwd(), "announcement-slides-manifest.js");
const publicAnnouncementSlidesManifestPath = resolve(publicDir, "announcement-slides-manifest.js");
const iconsFallbackDir = resolve(process.cwd(), "Assets", "Icons");
const configContents = `window.CANNAKAN_SUPABASE_CONFIG = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)},
  pushPublicKey: ${JSON.stringify(pushPublicKey)},
};
`;

const requiredPwaAssets = [
  { name: "apple-touch-icon.png", fallbackName: "apple-touch-icon.png" },
  { name: "icon-192.png", fallbackName: "icon-192.png" },
  { name: "icon-512.png", fallbackName: "icon-512.png" },
  { name: "icon-maskable-512.png", fallbackName: "icon-512.png" },
  { name: "favicon-32x32.png", fallbackName: "ck-grow-favicon.png" },
  { name: "favicon-16x16.png", fallbackName: "ck-grow-favicon.png" },
  { name: "favicon.ico", fallbackName: "ck-grow-favicon.png" },
];

const manifestContents = {
  name: "Cannakan Grow",
  short_name: "Cannakan Grow",
  id: "/",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#10140f",
  theme_color: "#94d159",
  icons: [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "/icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};

const announcementSlideExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function buildAnnouncementSlidesManifestContents() {
  const slidePaths = existsSync(announcementSlidesDir)
    ? readdirSync(announcementSlidesDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((fileName) => announcementSlideExtensions.has(extname(fileName).toLowerCase()))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }))
      .map((fileName) => `/src/assets/Announcement-Slides/${encodeURIComponent(fileName)}`)
    : [];

  return `globalThis.CANNAKAN_ANNOUNCEMENT_SLIDES = Object.freeze(${JSON.stringify(slidePaths, null, 2)});\n`;
}

mkdirSync(publicDir, { recursive: true });

function ensurePwaAsset(targetDir, name, fallbackName) {
  const targetPath = resolve(targetDir, name);
  if (existsSync(targetPath)) {
    return;
  }

  const candidatePaths = [
    resolve(process.cwd(), name),
    resolve(iconsFallbackDir, fallbackName),
  ];
  const sourcePath = candidatePaths.find((candidatePath) => existsSync(candidatePath) && candidatePath !== targetPath);
  if (!sourcePath) {
    throw new Error(`Missing required PWA asset: ${name}`);
  }

  copyFileSync(sourcePath, targetPath);
}

requiredPwaAssets.forEach(({ name, fallbackName }) => {
  ensurePwaAsset(process.cwd(), name, fallbackName);
  ensurePwaAsset(publicDir, name, fallbackName);
});

writeFileSync(outputPath, configContents, "utf8");
writeFileSync(manifestPath, `${JSON.stringify(manifestContents, null, 2)}\n`, "utf8");
writeFileSync(publicManifestPath, `${JSON.stringify(manifestContents, null, 2)}\n`, "utf8");
const announcementSlidesManifestContents = buildAnnouncementSlidesManifestContents();
writeFileSync(announcementSlidesManifestPath, announcementSlidesManifestContents, "utf8");
writeFileSync(publicAnnouncementSlidesManifestPath, announcementSlidesManifestContents, "utf8");

if (!url || !anonKey) {
  console.warn("Supabase runtime config was generated without values. The app will show the setup screen until config values are provided.");
}
