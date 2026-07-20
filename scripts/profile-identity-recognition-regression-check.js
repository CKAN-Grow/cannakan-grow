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

requireAll(appSource, [
  "appState.identityRecognitionLoaded = true;",
  "appState.publicIdentityRecognition[normalizedUserId] = null;",
  ".then((recognition) => {",
  "if (recognition && activeRoute.startsWith(\"members/\")) renderPublicMemberProfile(normalizedId);",
  "if (recognition && getCurrentAppRawRoute().split(\"/\")[0] === \"grow-profile\") renderMyGrowProfilePage();",
], "idempotent Profile Recognition failure handling");
const sharedProfileStart = appSource.indexOf("function renderPersonGrowProfileMarkup(context = {})");
const sharedProfileEnd = appSource.indexOf("function bindPersonGrowProfileInteractions", sharedProfileStart);
const publicProfileStart = appSource.indexOf("function renderPublicMemberProfile(memberId)");
const publicProfileEnd = appSource.indexOf("function normalizeCanonicalGrowNetworkRelationship", publicProfileStart);
const ownProfileStart = appSource.indexOf("function renderMyGrowProfilePage()");
const ownProfileEnd = appSource.indexOf("function getSessionDetailElements", ownProfileStart);
if ([sharedProfileStart, sharedProfileEnd, publicProfileStart, publicProfileEnd, ownProfileStart, ownProfileEnd].some((position) => position < 0)) {
  throw new Error("Could not inspect canonical Person Grow Profile renderers.");
}
const sharedProfileBody = appSource.slice(sharedProfileStart, sharedProfileEnd);
const publicProfileBody = appSource.slice(publicProfileStart, publicProfileEnd);
const ownProfileBody = appSource.slice(ownProfileStart, ownProfileEnd);
const outputStart = sharedProfileBody.lastIndexOf("return [");
const renderedProfileBody = sharedProfileBody.slice(outputStart);
const heroPosition = renderedProfileBody.indexOf("person-profile-hero ");
const notePosition = renderedProfileBody.indexOf("noteMarkup");
const collectionPosition = renderedProfileBody.indexOf("collectionsMarkup");
const featuredPosition = renderedProfileBody.indexOf("renderPersonProfileFeaturedSectionsMarkup");
const footerPosition = renderedProfileBody.indexOf("person-profile-footer-cta");
if (!(heroPosition >= 0 && heroPosition < notePosition
  && notePosition < collectionPosition && collectionPosition < featuredPosition && featuredPosition < footerPosition)) {
  throw new Error("Person Grow Profile order must remain Hero → From the Grower + Grow ID → Featured Collections → Featured Sections → supporting footer.");
}

requireAll(appSource, [
  "data-person-grow-profile",
  "data-profile-viewer",
  "data-public-preview",
  "data-person-profile-module-count",
  "buildPersonProfileFeaturedModules",
  "return modules.slice(0, 3)",
  "getApprovedPublicSnapshotsForMember",
  "getPersonProfileCollectionCards(true)",
  "appState.canonicalGrowNetwork.connections",
], "canonical curated Person Profile composition");

["Germination Trend", "Total Followers", "People You Follow", "Your Grow Summary", "aria-label=\"My Grow Home identity\""].forEach((obsoleteCopy) => {
  if (publicProfileBody.includes(obsoleteCopy) || ownProfileBody.includes(obsoleteCopy)) {
    throw new Error("Canonical Person Profile must not retain obsolete dashboard presentation: " + obsoleteCopy);
  }
});

requireAll(appSource, [
  "From the Grower",
  "Featured Collections",
  "GROW JOURNEY",
  "SHARED SNAPSHOTS",
  "GROW NETWORK",
  "Connections that help Grow",
  "Public Profile",
  "Edit Profile",
], "canonical Person Profile language");
const renderedHeroBody = renderedProfileBody.slice(0, notePosition);
if (/Share Profile|data-grow-id-open|data-person-profile-share/.test(renderedHeroBody)) {
  throw new Error("Person Profile Hero must leave sharing to the Grow ID experience.");
}
requireAll(sharedProfileBody, [
  "data-person-profile-editorial-identity",
  "data-profile-note-source",
  "This grower’s story is still taking root.",
  "My Grow ID",
  "data-person-profile-grow-id-target",
  "data-grow-id-qr",
  "getGrowProfilePublicUrl(growIdHandle)",
], "Person Profile editorial identity and canonical Grow ID composition");
requireAll(appSource, [
  "function renderGrowIdQrCode(target, profileUrl = \"\", options = {})",
  "function renderGrowIdQrCodes(scope = document)",
  "renderGrowIdQrCode(target, target.getAttribute(\"data-grow-id-qr\")",
  "void renderGrowIdQrCodes(app)",
], "canonical Grow ID QR renderer reuse");
if (/new QRCode|new QRCodeCtor/.test(sharedProfileBody)) {
  throw new Error("Person Profile must reuse the canonical Grow ID QR renderer instead of creating a second QR implementation.");
}
const locationMetaPosition = sharedProfileBody.indexOf("context.locationLabel");
const joinedMetaPosition = sharedProfileBody.indexOf("context.joinedLabel");
if (!(locationMetaPosition >= 0 && locationMetaPosition < joinedMetaPosition)) {
  throw new Error("Person Profile Hero metadata must render privacy-safe Location before Member since.");
}
if (/Followers|Following|Message|Messaging/.test(sharedProfileBody)) {
  throw new Error("Person Profile must use Connections terminology and must not expose messaging.");
}
requireAll(stylesSource, [
  ".profile-recognition-section",
  ".profile-recognition-gallery-card.is-locked",
  "/* Canonical Person Grow Profile */",
  ".person-grow-profile",
  "width: min(100%, 1280px)",
  ".person-profile-hero",
  "rgba(3, 7, 6, 0.84)",
  "rgba(4, 8, 7, 0.08)",
  "filter: saturate(0.96) contrast(1.06) brightness(1.02)",
  "min-height: 480px",
  "width: clamp(136px, 14vw, 184px)",
  ".person-grow-profile .profile-featured-recognition",
  "background: transparent",
  "text-shadow: 0 0 14px",
  ".person-profile-note-section",
  ".person-profile-collections",
  ".person-profile-featured-sections.is-count-1",
  ".person-profile-featured-sections.is-count-2",
  ".person-profile-featured-sections.is-count-3",
  "@media (max-width: 680px)",
  "@media (prefers-reduced-motion: reduce)",
], "responsive canonical Person Profile styles");

requireNeedle(appSource, "function renderCommunityRecognitionIconMarkup", "existing Community Award renderer");
requireNeedle(migrationSource, "Community Awards remain session-scoped", "Community Award data-model separation");
if (migrationSource.includes("update public.grow_gallery_snapshots set")
  || migrationSource.includes("alter table public.grow_gallery_snapshots")) {
  throw new Error("Identity & Recognition migration must not mutate Community Award/report storage.");
}

console.log("Profile Identity & Recognition regression check passed.");
