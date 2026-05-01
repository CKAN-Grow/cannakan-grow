import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const url = process.env.CANNAKAN_SUPABASE_URL || "";
const anonKey = process.env.CANNAKAN_SUPABASE_ANON_KEY || "";
const isVercelBuild = process.env.VERCEL === "1";

if ((!url || !anonKey) && isVercelBuild) {
  console.error("Missing required Vercel environment variables: CANNAKAN_SUPABASE_URL and CANNAKAN_SUPABASE_ANON_KEY");
  process.exit(1);
}

const outputPath = resolve(process.cwd(), "supabase-config.js");
const configContents = `window.CANNAKAN_SUPABASE_CONFIG = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)},
};
`;

writeFileSync(outputPath, configContents, "utf8");

if (!url || !anonKey) {
  console.warn("Supabase runtime config was generated without values. The app will show the setup screen until config values are provided.");
}
