const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

const requireNeedle = (needle, label) => {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
};

[
  "function getSnapshotSessionIntegrity(session = null, options = {})",
  "function getGallerySnapshotIntegrity(snapshot = null)",
  "function isGallerySnapshotPubliclyVisible(snapshot = null, snapshots = getGallerySnapshotsForDisplay())",
  "function canCurrentViewerSeeGallerySnapshot(snapshot = null, options = {})",
  "function getLatestActivePublicGallerySnapshotForSession(sessionId = \"\", snapshots = getGallerySnapshotsForDisplay())",
  "function retireOtherActivePublicGallerySnapshotsForSession(sessionId = \"\", activeSnapshotId = \"\")",
  "function getSnapshotDataIntegrity(snapshotData = null)",
  "function validateSnapshotStateSessionEligibility(state)",
  "const sessionIntegrity = getSnapshotSessionIntegrity(session);",
  "const metadataIntegrity = getSnapshotDataIntegrity(snapshotData);",
  "validateSnapshotStateSessionEligibility(state);",
  "if (!isGallerySnapshotPubliclyVisible(snapshot))",
  "canCurrentViewerSeeGallerySnapshot(entry, { isAdminView })",
  "await retireOtherActivePublicGallerySnapshotsForSession(mapped.sessionId, mapped.id);",
  "status: \"hidden\"",
  "is_published: false",
  "sessionStatus,",
  "stageLabel: getCanonicalSessionStageDisplayLabel(progressKey || sessionStatus) || \"Not Started\"",
].forEach((needle) => requireNeedle(needle, "snapshot/community integrity behavior"));

const publishBody = appSource.match(/async function publishSnapshotToGallery[\s\S]*?\r?\n}\r?\n\r?\nasync function retireOtherActivePublicGallerySnapshotsForSession/);
if (!publishBody) {
  throw new Error("Could not locate publishSnapshotToGallery body.");
}
[
  "getSnapshotSessionIntegrity(session)",
  "getSnapshotDataIntegrity(snapshotData)",
  "getBlockingGallerySnapshotForSession(session.id)",
].forEach((needle) => {
  if (!publishBody[0].includes(needle)) {
    throw new Error(`Publish flow missing integrity guard: ${needle}`);
  }
});

const analyticsBody = appSource.match(/function isGallerySnapshotAnalyticsEligible[\s\S]*?\r?\n}\r?\n\r?\nfunction getGallerySnapshotDebugSignature/);
if (!analyticsBody || !analyticsBody[0].includes("isGallerySnapshotPubliclyVisible(snapshot)")) {
  throw new Error("Community Grow analytics must depend on public snapshot visibility integrity.");
}

console.log("Snapshot and Community Grow integrity regression check passed.");
