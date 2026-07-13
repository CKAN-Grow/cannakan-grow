const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(repoRoot, "styles.css"), "utf8");

function requireNeedle(source, needle, label = needle) {
  if (!source.includes(needle)) {
    throw new Error(`Missing CSTP public presence behavior: ${label}`);
  }
}

for (const needle of [
  "PUBLIC_CSTP_STATUS_DEFINITIONS",
  "\"not-tested\"",
  "Tested",
  "Certified Silver",
  "Certified Gold",
  "Expired",
  "function normalizePublicCstpStatus(value = \"\")",
  "function getPublicCstpPresence(source = {})",
  "function renderPublicCstpStatusBadge(source = {}, options = {})",
  "function renderPublicCstpTrustIndicatorsMarkup(source = {}, options = {})",
  "function renderPublicCstpTestingCertificationPanel(source = {}, options = {})",
  "function getPublicCstpFutureRoutePlaceholder(sourceKey = \"\", routeType = \"report\")",
  "Testing &amp; Certification",
  "CSTP Status",
  "Testing Participation",
  "Gold/Silver Certification",
  "Certification expiration placeholder",
  "View Report",
  "Testing History",
  "Certification History",
  "No public CSTP status is displayed until explicit safe public fields exist.",
  "Displayed from explicit public-safe CSTP fields only.",
  "Tested Source",
  "Certified Source",
  "public-cstp-future-routes",
  "data-public-cstp-status",
  "data-public-cstp-panel=\"testing-certification\"",
]) {
  requireNeedle(appSource, needle);
}

for (const needle of [
  ".public-cstp-status-badge",
  ".public-cstp-trust-chip",
  ".public-cstp-status-badge.is-tested",
  ".public-cstp-status-badge.is-silver",
  ".public-cstp-status-badge.is-gold",
  ".public-cstp-status-badge.is-expired",
  ".public-cstp-panel",
  ".public-cstp-panel-status-row",
  ".public-cstp-action-row",
  ".gallery-card-cstp-trust-row",
]) {
  requireNeedle(stylesSource, needle);
}

const publicCstpBlock = appSource.match(/const PUBLIC_CSTP_STATUS_DEFINITIONS[\s\S]*?function getCommunityInsightsSafeSnapshotPartitions/)?.[0] || "";
if (!publicCstpBlock) {
  throw new Error("Could not locate CSTP public helper block.");
}

for (const forbiddenNeedle of [
  "getAdminCstp",
  "adminCstp",
  "admin_cstp",
  "cstp_private",
  "assignedCstpSession",
  "qualificationScore",
  "certificationScore",
  "getSessions(",
  "appState.seedVaultEntries",
  "public_member_profiles",
  "publicMemberProfiles",
  "admin_users",
]) {
  if (publicCstpBlock.includes(forbiddenNeedle)) {
    throw new Error(`Public CSTP helper layer must not read private/internal CSTP data: ${forbiddenNeedle}`);
  }
}

for (const forbiddenPattern of [
  /[.[]email\b/,
  /\bemailAddress\b/,
  /\bownerEmail\b/,
  /\buserEmail\b/,
]) {
  if (forbiddenPattern.test(publicCstpBlock)) {
    throw new Error(`Public CSTP helper layer must not access email fields: ${forbiddenPattern}`);
  }
}

if (!appSource.includes("presence.hasPublicCstpStatus ? presence.label : \"Pending public CSTP data\"")) {
  throw new Error("CSTP status must remain placeholder-only unless explicit public fields exist.");
}

if (!appSource.includes("No certification inferred") && !appSource.includes("no certification inferred")) {
  throw new Error("CSTP presentation must state that certification is not inferred.");
}

if (appSource.includes("function buildCommunityInsightsCstpPublicHooks")) {
  throw new Error("CSTP public aggregate statistics must originate in GIE, not a snapshot helper.");
}

if (!appSource.includes("renderPublicCstpTestingCertificationPanel(sourceProfile, { sourceKey: report.key })")) {
  throw new Error("Source Reports must retain explicit public-safe CSTP presence without local aggregate statistics.");
}

console.log("CSTP public presence regression check passed.");
