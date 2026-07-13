"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");
const migrationSource = fs.readFileSync(
  path.join(repoRoot, "supabase", "migrations", "20260713234000_profile_identity_and_recognition.sql"),
  "utf8",
);

function requireNeedle(source, needle, label) {
  if (!source.includes(needle)) throw new Error(`Missing ${label}: ${needle}`);
}

function requireAll(source, needles, label) {
  needles.forEach((needle) => requireNeedle(source, needle, label));
}

const recognitionIds = [
  "founding-grower", "early-supporter", "community-pioneer", "product-tester",
  "first-session", "session-builder", "consistent-grower", "vault-builder",
  "collection-creator", "grow-planner", "detailed-record", "reliable-reporter", "source-tracker",
];
recognitionIds.forEach((id) => requireNeedle(migrationSource, `('${id}'`, "recognition catalog definition"));

requireAll(migrationSource, [
  "create table if not exists public.recognition_definitions",
  "create table if not exists public.user_recognitions",
  "unique (user_id, recognition_id, award_key)",
  "manual_assignment boolean",
  "repeatable boolean",
  "featured_eligible boolean",
  "assignment_source text",
  "earned_at timestamptz",
  "featured boolean",
  "get_recognition_qualification_candidates_v1",
  "reconcile_user_recognitions_v1(\n  p_user_id uuid,",
  "if not p_dry_run then",
  "p_assignment_source text default 'reconciliation'",
  "new.user_id, false, 'automatic'",
  "on conflict (user_id, recognition_id, award_key) do nothing",
  "coalesce(is_mock, false) = false",
  "coalesce(dev_mode_only, false) = false",
  "public.is_community_intelligence_session_eligible(grow_sessions.id)",
  "grow_sessions_reconcile_recognition_v1",
  "seed_vault_entries_reconcile_recognition_v1",
  "seed_vault_collections_reconcile_recognition_v1",
], "central recognition persistence and reconciliation");

requireAll(migrationSource, [
  "identity_label text := 'Grower'",
  "identity_label := 'Administrator'",
  "identity_label := 'Product Tester'",
  "identity_label := 'Source'",
  "identity_label := 'Breeder'",
  "identity_label := 'Community Contributor'",
], "single server-resolved Identity role");

requireAll(migrationSource, [
  "get_my_identity_and_recognition()",
  "get_public_identity_and_recognition(p_user_id uuid)",
  "set_my_featured_recognition(p_recognition_id text)",
  "user_recognitions_one_featured_idx",
  "admin_manage_user_recognition(p_user_id uuid, p_recognition_id text, p_action text)",
  "Administrator access required",
  "manual_assignment",
  "assignment_source = 'manual'",
  "revoked_at = timezone('utc', now())",
  "p_include_hidden",
], "featured, public, and administrator contracts");

requireAll(appSource, [
  "normalizeIdentityRecognitionPayload",
  'rpc("get_my_identity_and_recognition")',
  'rpc("get_public_identity_and_recognition"',
  "renderProfileFeaturedRecognitionMarkup",
  "renderProfileRecognitionSectionMarkup",
  "sortProfileRecognitions",
  "slice(0, 6)",
  "Recognition Gallery",
  'const categories = ["all", "founding", "participation", "documentation", "community", "testing"]',
  'recognition.earned ? "RECOGNITION" : "LOCKED"',
  "How it is earned",
  "Earned date",
  "Set as Featured Recognition",
  'rpc("set_my_featured_recognition"',
  'rpc("admin_manage_user_recognition"',
], "profile Recognition presentation");

const ownProfileStart = appSource.indexOf("function renderGrowNetworkPage()");
const ownProfileEnd = appSource.indexOf("function getSessionDetailElements", ownProfileStart);
if (ownProfileStart < 0 || ownProfileEnd < 0) throw new Error("Could not inspect My Grow Profile renderer.");
const ownProfileBody = appSource.slice(ownProfileStart, ownProfileEnd);
const identityPosition = ownProfileBody.indexOf('aria-label="My Grow Home identity"');
const recognitionPosition = ownProfileBody.indexOf("renderProfileRecognitionSectionMarkup");
const summaryPosition = ownProfileBody.indexOf('aria-label="Your Grow Summary"');
const trendPosition = ownProfileBody.indexOf('aria-label="Germination Trend"');
if (!(identityPosition >= 0 && identityPosition < recognitionPosition
  && recognitionPosition < summaryPosition && summaryPosition < trendPosition)) {
  throw new Error("Grow Profile order must remain Identity → Recognition → Summary → Trend.");
}

requireAll(stylesSource, [
  ".profile-recognition-section",
  ".profile-recognition-row",
  "grid-template-columns: repeat(3, minmax(0, 1fr))",
  "@media (max-width: 640px)",
  "overflow-x: auto",
  "scroll-snap-type: inline proximity",
  ".profile-recognition-gallery-card.is-locked",
], "responsive compact Recognition styles");

requireNeedle(appSource, "function renderCommunityRecognitionIconMarkup", "existing Community Award renderer");
requireNeedle(migrationSource, "Community Awards remain session-scoped", "Community Award data-model separation");
if (migrationSource.includes("update public.grow_gallery_snapshots set")
  || migrationSource.includes("alter table public.grow_gallery_snapshots")) {
  throw new Error("Identity & Recognition migration must not mutate Community Award/report storage.");
}

console.log("Profile Identity & Recognition regression check passed.");
