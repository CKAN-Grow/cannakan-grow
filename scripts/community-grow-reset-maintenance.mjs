#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONFIRM_FLAG = "--confirm-community-grow-reset";
const EXECUTE_FLAG = "--execute";
const DELETE_STORAGE_FLAG = "--delete-public-storage";

const DEPENDENCY_MAP = {
  communitySubmissions: "public.grow_gallery_snapshots where is_mock=false",
  publishedSnapshots: "public.grow_gallery_snapshots status=approved and/or is_published=true",
  pendingReviewItems: "public.grow_gallery_snapshots status=pending_review",
  removedHiddenSnapshots: "public.grow_gallery_snapshots status in hidden/removed/rejected",
  likes: "public.grow_gallery_snapshot_likes linked by snapshot_id",
  communityActivity: "public.community_activity linked by snapshot_id or publication activity_type/session_id",
  communityReports: "Derived from approved public grow_gallery_snapshots",
  communityCards: "Derived from approved public grow_gallery_snapshots",
  communityDiscoveries: "Derived from approved snapshots, leaderboard rows, and community activity",
  recognition: "Derived in app UI from approved snapshots/activity; no standalone recognition table found in current schema",
  publicSnapshotImages: "Supabase Storage bucket grow-gallery paths from grow_gallery_snapshots.snapshot_image_path",
  developerPreviewData: "Excluded by is_mock=true",
  protectedData: "auth.users, profiles, public_member_profiles, user_notification_preferences, grow_sessions, seed_vault_entries",
};

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const content = fs.readFileSync(filePath, "utf8");
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      return;
    }
    const equalsIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    if (!key || process.env[key]) {
      return;
    }
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  });
}

function loadLocalEnv() {
  [
    ".env.local",
    ".env",
    "supabase/.env",
    "supabase/.env.local",
  ].forEach((fileName) => readEnvFile(path.join(ROOT_DIR, fileName)));
}

function getArgSet() {
  return new Set(process.argv.slice(2));
}

function printHelp() {
  console.log(`
Community Grow publication reset maintenance

Dry run:
  node scripts/community-grow-reset-maintenance.mjs

Execute database reset:
  node scripts/community-grow-reset-maintenance.mjs ${EXECUTE_FLAG} ${CONFIRM_FLAG}

Execute and remove publication-only generated storage objects:
  node scripts/community-grow-reset-maintenance.mjs ${EXECUTE_FLAG} ${CONFIRM_FLAG} ${DELETE_STORAGE_FLAG}

Required environment:
  SUPABASE_URL
  SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY

Before running, apply:
  supabase/migrations/20260713120000_community_grow_publication_reset.sql
  supabase/migrations/20260713123000_community_grow_reset_service_role_grants.sql
`);
}

function getApiKeyKind(apiKey = "") {
  const normalizedKey = String(apiKey || "").trim();
  if (normalizedKey.startsWith("sb_secret_")) {
    return "secret";
  }
  if (normalizedKey.startsWith("sb_publishable_")) {
    return "publishable";
  }
  if (normalizedKey.split(".").length === 3) {
    return "legacy-jwt";
  }
  return "unknown";
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.PUBLIC_SUPABASE_URL
    || "";
  const apiKeyEntries = [
    ["SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY],
    ["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY],
    ["SUPABASE_SERVICE_KEY", process.env.SUPABASE_SERVICE_KEY],
    ["SUPABASE_ADMIN_KEY", process.env.SUPABASE_ADMIN_KEY],
  ];
  const [apiKeyEnvName, apiKey] = apiKeyEntries.find(([, value]) => String(value || "").trim()) || ["", ""];

  if (!url || !apiKey) {
    throw new Error("Missing SUPABASE_URL and elevated Supabase key. Set SUPABASE_SECRET_KEY for current Supabase projects, or SUPABASE_SERVICE_ROLE_KEY for legacy projects.");
  }

  let parsedUrl = null;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    throw new Error(`SUPABASE_URL is not a valid URL: ${url}`);
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error(`SUPABASE_URL must start with http:// or https://. Received: ${url}`);
  }

  const apiKeyKind = getApiKeyKind(apiKey);
  if (apiKeyKind === "publishable") {
    throw new Error(`${apiKeyEnvName} is a publishable key. This maintenance script requires an elevated Supabase Secret Key (sb_secret_...) or legacy service_role JWT.`);
  }

  return {
    url: parsedUrl.toString().replace(/\/+$/, ""),
    apiKey: String(apiKey || "").trim(),
    apiKeyEnvName,
    apiKeyKind,
  };
}

function buildSupabaseHeaders({ apiKey, apiKeyKind }) {
  const headers = {
    apikey: apiKey,
    "content-type": "application/json",
    accept: "application/json",
  };

  if (apiKeyKind === "legacy-jwt") {
    headers.authorization = `Bearer ${apiKey}`;
  }

  return headers;
}

function formatApiErrorBody(data, fallback = "") {
  if (typeof data === "object" && data) {
    return [
      data.message,
      data.msg,
      data.error,
      data.error_description,
      data.details,
      data.hint,
      data.code ? `code=${data.code}` : "",
    ].filter(Boolean).join(" ");
  }
  return String(data || fallback || "").trim();
}

function formatNetworkError(error, endpoint) {
  const cause = error?.cause || null;
  const causeParts = [
    cause?.code,
    cause?.errno,
    cause?.syscall,
    cause?.hostname,
    cause?.message,
  ].filter(Boolean);
  const suffix = causeParts.length ? ` (${causeParts.join(" ")})` : "";
  return `Network request failed before Supabase responded: ${endpoint}${suffix}. Check SUPABASE_URL, DNS/network access, firewall/proxy settings, and project availability.`;
}

async function requestSupabaseJson(supabase, pathName, options = {}) {
  const endpoint = `${supabase.url}${pathName}`;
  let response;
  try {
    response = await fetch(endpoint, {
      ...options,
      headers: {
        ...buildSupabaseHeaders(supabase),
        ...(options.headers || {}),
      },
    });
  } catch (error) {
    throw new Error(formatNetworkError(error, endpoint));
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }

  if (!response.ok) {
    const message = formatApiErrorBody(data, response.statusText);
    const authHint = [401, 403].includes(response.status)
      ? ` Authentication failed or was refused. This run used ${supabase.apiKeyEnvName} as a ${supabase.apiKeyKind} key. Use SUPABASE_SECRET_KEY=sb_secret_... for current Supabase projects or SUPABASE_SERVICE_ROLE_KEY for legacy projects.`
      : "";
    throw new Error(`Supabase API request failed (${response.status} ${response.statusText}) at ${pathName}: ${message || "No response body."}${authHint}`);
  }

  return data;
}

async function callRpc(supabase, functionName, payload = {}) {
  try {
    return await requestSupabaseJson(supabase, `/rest/v1/rpc/${functionName}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(`RPC ${functionName} failed: ${error.message}`);
  }
}

async function removeStorageObjects(supabase, paths = []) {
  const uniquePaths = [...new Set(paths.map((item) => String(item || "").trim()).filter(Boolean))];
  if (!uniquePaths.length) {
    return { removed: 0, skipped: true };
  }

  try {
    const data = await requestSupabaseJson(supabase, "/storage/v1/object/grow-gallery", {
      method: "DELETE",
      body: JSON.stringify({ prefixes: uniquePaths }),
    });
    return {
      removed: uniquePaths.length,
      response: data,
    };
  } catch (error) {
    throw new Error(`Storage cleanup failed: ${error.message}`);
  }
}

function printSection(title, value) {
  console.log(`\n${title}`);
  console.log("-".repeat(title.length));
  console.log(typeof value === "string" ? value : JSON.stringify(value, null, 2));
}

function getStorageCandidates(summary) {
  return Array.isArray(summary?.publicationOnlyStoragePaths)
    ? summary.publicationOnlyStoragePaths
    : Array.isArray(summary?.dryRunBeforeExecution?.publicationOnlyStoragePaths)
      ? summary.dryRunBeforeExecution.publicationOnlyStoragePaths
      : [];
}

async function main() {
  loadLocalEnv();
  const args = getArgSet();

  if (args.has("--help") || args.has("-h")) {
    printHelp();
    return;
  }

  const shouldExecute = args.has(EXECUTE_FLAG);
  const hasConfirmation = args.has(CONFIRM_FLAG);
  const shouldDeleteStorage = args.has(DELETE_STORAGE_FLAG);
  const supabase = getSupabaseConfig();

  printSection("Dependency Map", DEPENDENCY_MAP);

  if (shouldExecute && !hasConfirmation) {
    throw new Error(`Refusing to execute without ${CONFIRM_FLAG}. Run dry-run first and then rerun with explicit confirmation.`);
  }

  const dryRun = await callRpc(supabase, "admin_preview_community_grow_publication_reset");
  console.log(`\nAuthentication succeeded. Supabase accepted ${supabase.apiKeyEnvName} as a ${supabase.apiKeyKind} key for the reset preview RPC.`);
  printSection("Dry Run Summary", dryRun);

  if (!shouldExecute) {
    console.log("\nDry run complete. No records were changed.");
    console.log(`Execute with: node scripts/community-grow-reset-maintenance.mjs ${EXECUTE_FLAG} ${CONFIRM_FLAG}`);
    return;
  }

  const executed = await callRpc(supabase, "admin_execute_community_grow_publication_reset");
  printSection("Execution Summary", executed);

  const storageCandidates = getStorageCandidates(dryRun);
  if (shouldDeleteStorage) {
    const storageResult = await removeStorageObjects(supabase, storageCandidates);
    printSection("Storage Cleanup", storageResult);
  } else {
    printSection("Storage Cleanup", {
      skipped: true,
      reason: `Pass ${DELETE_STORAGE_FLAG} to remove publication-only generated objects after reviewing candidates.`,
      publicationOnlyStoragePaths: storageCandidates,
    });
  }

  const verify = await callRpc(supabase, "admin_preview_community_grow_publication_reset");
  printSection("Post-Reset Verification", verify);
}

main().catch((error) => {
  console.error(`\nCommunity Grow reset failed: ${error.message}`);
  if (/PGRST202|Could not find the function|function .* does not exist|schema cache|404/i.test(error.message)) {
    console.error("Apply supabase/migrations/20260713120000_community_grow_publication_reset.sql before running this script.");
  }
  process.exitCode = 1;
});
