import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

const url = process.env.CANNAKAN_SUPABASE_URL || "";
const anonKey = process.env.CANNAKAN_SUPABASE_ANON_KEY || "";
const isVercelBuild = process.env.VERCEL === "1";
const packageJsonPath = resolve(process.cwd(), "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
const buildTimestamp = new Date().toISOString();
const commitHashFromEnv = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "";
const gitHeadPath = resolve(process.cwd(), ".git", "HEAD");

function resolveCommitHashFromGitFiles() {
  if (!existsSync(gitHeadPath)) {
    return "";
  }

  try {
    const headContents = readFileSync(gitHeadPath, "utf8").trim();
    if (!headContents) {
      return "";
    }

    if (!headContents.startsWith("ref:")) {
      return headContents.slice(0, 7);
    }

    const refPath = headContents.replace(/^ref:\s*/, "").trim();
    const resolvedRefPath = resolve(process.cwd(), ".git", refPath);
    if (!existsSync(resolvedRefPath)) {
      return "";
    }

    return readFileSync(resolvedRefPath, "utf8").trim().slice(0, 7);
  } catch {
    return "";
  }
}

const commitHash = String(commitHashFromEnv || (() => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return resolveCommitHashFromGitFiles();
  }
})()).trim();

if ((!url || !anonKey) && isVercelBuild) {
  console.error("Missing required Vercel environment variables: CANNAKAN_SUPABASE_URL and CANNAKAN_SUPABASE_ANON_KEY");
  process.exit(1);
}

const outputPath = resolve(process.cwd(), "supabase-config.js");
const appJsPath = resolve(process.cwd(), "app.js");
const indexHtmlPath = resolve(process.cwd(), "index.html");
const serviceWorkerPath = resolve(process.cwd(), "service-worker.js");
const configContents = `window.CANNAKAN_SUPABASE_CONFIG = {
  url: ${JSON.stringify(url)},
  anonKey: ${JSON.stringify(anonKey)},
};
`;
const buildInfoPath = resolve(process.cwd(), "build-info.js");
const buildInfoJsonPath = resolve(process.cwd(), "build-info.json");
const buildInfoPayload = {
  version: String(packageJson.version || "0.0.0"),
  buildTimestamp,
  commitHash,
};
const buildVersionToken = [
  buildInfoPayload.version,
  buildInfoPayload.commitHash || "local",
  buildInfoPayload.buildTimestamp.replace(/[^0-9A-Za-z]/g, ""),
].join("-");
const buildInfoContents = `window.CANNAKAN_BUILD_INFO = {
  version: ${JSON.stringify(buildInfoPayload.version)},
  buildTimestamp: ${JSON.stringify(buildInfoPayload.buildTimestamp)},
  commitHash: ${JSON.stringify(buildInfoPayload.commitHash)},
};
`;
const appJsContents = readFileSync(appJsPath, "utf8");
const indexHtmlContents = readFileSync(indexHtmlPath, "utf8");
const serviceWorkerContents = readFileSync(serviceWorkerPath, "utf8");
const updatedAppJsContents = appJsContents.replace(
  /const CURRENT_APP_BUILD_INFO = Object\.freeze\(\{\s*version: ".*?",\s*buildTimestamp: ".*?",\s*commitHash: ".*?",\s*\}\);/,
  `const CURRENT_APP_BUILD_INFO = Object.freeze({
  version: ${JSON.stringify(buildInfoPayload.version)},
  buildTimestamp: ${JSON.stringify(buildInfoPayload.buildTimestamp)},
  commitHash: ${JSON.stringify(buildInfoPayload.commitHash)},
});`,
);
const updatedIndexHtmlContents = indexHtmlContents
  .replace(/href="styles\.css(?:\?v=[^"]*)?"/, `href="styles.css?v=${buildVersionToken}"`)
  .replace(/src="supabase-config\.js(?:\?v=[^"]*)?"/, `src="supabase-config.js?v=${buildVersionToken}"`)
  .replace(/src="build-info\.js(?:\?v=[^"]*)?"/, `src="build-info.js?v=${buildVersionToken}"`)
  .replace(/src="app\.js(?:\?v=[^"]*)?"/, `src="app.js?v=${buildVersionToken}"`);
const updatedServiceWorkerContents = serviceWorkerContents.replace(
  /const CACHE_VERSION = ".*?";/,
  `const CACHE_VERSION = ${JSON.stringify(buildVersionToken)};`,
);

writeFileSync(outputPath, configContents, "utf8");
writeFileSync(buildInfoPath, buildInfoContents, "utf8");
writeFileSync(buildInfoJsonPath, `${JSON.stringify(buildInfoPayload, null, 2)}\n`, "utf8");
writeFileSync(appJsPath, updatedAppJsContents, "utf8");
writeFileSync(indexHtmlPath, updatedIndexHtmlContents, "utf8");
writeFileSync(serviceWorkerPath, updatedServiceWorkerContents, "utf8");

if (!url || !anonKey) {
  console.warn("Supabase runtime config was generated without values. The app will show the setup screen until config values are provided.");
}
