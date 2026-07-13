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
  SUPABASE_SERVICE_ROLE_KEY

Before running, apply:
  supabase/migrations/20260713120000_community_grow_publication_reset.sql
`);
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.PUBLIC_SUPABASE_URL
    || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_ADMIN_KEY
    || "";

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return {
    url: url.replace(/\/+$/, ""),
    serviceRoleKey,
  };
}

async function callRpc({ url, serviceRoleKey }, functionName, payload = {}) {
  const response = await fetch(`${url}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }

  if (!response.ok) {
    const message = typeof data === "object" && data
      ? [data.message, data.details, data.hint].filter(Boolean).join(" ")
      : text;
    throw new Error(`RPC ${functionName} failed (${response.status}): ${message || response.statusText}`);
  }

  return data;
}

async function removeStorageObjects({ url, serviceRoleKey }, paths = []) {
  const uniquePaths = [...new Set(paths.map((item) => String(item || "").trim()).filter(Boolean))];
  if (!uniquePaths.length) {
    return { removed: 0, skipped: true };
  }

  const response = await fetch(`${url}/storage/v1/object/grow-gallery`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ prefixes: uniquePaths }),
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = text;
  }

  if (!response.ok) {
    const message = typeof data === "object" && data
      ? [data.message, data.error, data.details].filter(Boolean).join(" ")
      : text;
    throw new Error(`Storage cleanup failed (${response.status}): ${message || response.statusText}`);
  }

  return {
    removed: uniquePaths.length,
    response: data,
  };
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
  if (/admin_preview_community_grow_publication_reset|admin_execute_community_grow_publication_reset/.test(error.message)) {
    console.error("Apply supabase/migrations/20260713120000_community_grow_publication_reset.sql before running this script.");
  }
  process.exitCode = 1;
});
