const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(repoRoot, "app.js"), "utf8");

function requireNeedle(needle, label = needle) {
  if (!appSource.includes(needle)) {
    throw new Error(`Missing snapshot footer overlay behavior: ${label}`);
  }
}

requireNeedle("function stripSnapshotFooterDateFromSessionName(sessionName = \"\", dateLabel = \"\")");
requireNeedle("const footerSessionName = stripSnapshotFooterDateFromSessionName(data.sessionName, dateText);");
requireNeedle("truncateTextToWidth(context, footerSessionName || data.sessionName, sessionNameMaxWidth);");
requireNeedle("const profileCenterY = footerTextY - ((profileAscent - profileDescent) / 2);");
requireNeedle("const avatarY = profileCenterY - (profileAvatarSize / 2);");

if (appSource.includes("const avatarY = profileCenterY - (profileAvatarSize / 2) + 20;")) {
  throw new Error("Snapshot profile avatar should not use a manual vertical offset.");
}

console.log("Snapshot footer overlay regression check passed.");
