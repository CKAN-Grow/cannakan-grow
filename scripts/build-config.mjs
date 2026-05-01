import { copyFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const url = process.env.CANNAKAN_SUPABASE_URL || "";
const anonKey = process.env.CANNAKAN_SUPABASE_ANON_KEY || "";
const isVercelBuild = process.env.VERCEL === "1";

if ((!url || !anonKey) && isVercelBuild) {
  console.error("Missing required Vercel environment variables: CANNAKAN_SUPABASE_URL and CANNAKAN_SUPABASE_ANON_KEY");
  process.exit(1);
}

const outputPath = resolve(process.cwd(), "supabase-config.js");
const manifestPath = resolve(process.cwd(), "manifest.json");
const iconsFallbackDir = resolve(process.cwd(), "Assets", "Icons");
const configContents = `window.CANNAKAN_SUPABASE_CONFIG = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)},
};
`;

const requiredPwaRootAssets = [
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
  short_name: "Grow",
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

requiredPwaRootAssets.forEach(({ name, fallbackName }) => {
  const targetPath = resolve(process.cwd(), name);
  if (existsSync(targetPath)) {
    return;
  }

  const fallbackPath = resolve(iconsFallbackDir, fallbackName);
  if (!existsSync(fallbackPath)) {
    throw new Error(`Missing required PWA asset: ${name}`);
  }

  copyFileSync(fallbackPath, targetPath);
});

writeFileSync(outputPath, configContents, "utf8");
writeFileSync(manifestPath, `${JSON.stringify(manifestContents, null, 2)}\n`, "utf8");

if (!url || !anonKey) {
  console.warn("Supabase runtime config was generated without values. The app will show the setup screen until config values are provided.");
}
