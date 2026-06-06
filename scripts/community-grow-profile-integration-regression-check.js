"use strict";

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
  "function canLinkToPublicMemberProfile(profile = null)",
  "profile.hasCustomPublicProfile !== false",
  "profile.isDerivedPublicProfile !== true",
  "profile.isPublicVisible !== false",
  "profile.profileVisibility !== \"private\"",
  "function getGallerySnapshotCardMemberProfile(snapshot)",
  "? \"Private Grower\"",
  ": \"Community Member\"",
  "profileRoute: publicProfile && memberId ? getPublicMemberProfileRoute(publicProfile) : \"\"",
  "canLinkProfile: Boolean(publicProfile)",
  "function getGallerySnapshotMemberKey(snapshot = {})",
  "return \"community-member\";",
  "function renderLeaderboardMemberIdentityMarkup(entry = {}, className = \"leaderboard-member-identity\")",
  "leaderboard-member-identity-link",
  "const compactProfileMarkup = member.profileRoute",
  "gallery-tile-profile-link gallery-card-profile-link",
  "renderDisplayNameWithCountryFlag(member.displayName, member.countryCode, \"gallery-card-profile-name\")",
  "renderDisplayNameWithCountryFlag(member.displayName, member.countryCode, \"gallery-tile-profile-name\")",
  "scope.querySelectorAll(\".gallery-card-profile-link\")",
  "event.stopPropagation();",
  "function getPublicMemberProfileTrustHint(profile = null)",
  "buildProfileTrustIndicators(buildProfileTrustHooks(profile))",
  "function getProfileCommunityCardHint(profile = null, snapshots = [])",
].forEach((needle) => requireNeedle(needle, "Community Grow profile integration safety"));

const sharedProfileBody = appSource.match(/function renderGallerySharedProfileMarkup\(snapshot\)[\s\S]*?\r?\n}\r?\n\r?\nfunction getGallerySnapshotCardMemberProfile/);
if (!sharedProfileBody) {
  throw new Error("Could not locate renderGallerySharedProfileMarkup body.");
}
if (sharedProfileBody[0].includes("getPublicMemberProfileRoute(memberId)")) {
  throw new Error("Shared profile markup must not create public profile links from raw member ids.");
}

const cardMemberBody = appSource.match(/function getGallerySnapshotCardMemberProfile\(snapshot\)[\s\S]*?\r?\n}\r?\n\r?\nfunction renderGallerySnapshotMemberMarkup/);
if (!cardMemberBody) {
  throw new Error("Could not locate getGallerySnapshotCardMemberProfile body.");
}
[
  "canLinkToPublicMemberProfile(cachedProfile)",
  "buildCurrentUserPublicMemberProfileFallback",
  "Private profile",
  "canShowPrivateViewerContext",
].forEach((needle) => {
  if (!cardMemberBody[0].includes(needle)) {
    throw new Error(`Profile card member context missing privacy behavior: ${needle}`);
  }
});

const memberLabelBody = appSource.match(/function getGallerySnapshotMemberLabel\(snapshot = {}\)[\s\S]*?\r?\n}\r?\n\r?\nfunction getGallerySnapshotMemberAvatarUrl/);
if (!memberLabelBody || memberLabelBody[0].includes("submittedBy") || memberLabelBody[0].includes("profileName")) {
  throw new Error("Leaderboard member labels must use profile-safe card context, not raw submitted profile fields.");
}

const leaderboardBody = appSource.match(/function renderLeaderboardMemberIdentityMarkup\(entry = {}, className = "leaderboard-member-identity"\)[\s\S]*?\r?\n}\r?\n\r?\nfunction renderGalleryTopMemberRows/);
if (!leaderboardBody) {
  throw new Error("Could not locate renderLeaderboardMemberIdentityMarkup body.");
}
[
  "const profileRoute = String(entry?.profileRoute || \"\").trim();",
  "const wrapperTag = profileRoute ? \"a\" : \"span\";",
  "View ${displayName}'s public profile",
  "Community Member",
  "renderDisplayNameWithCountryFlag(displayName, entry?.countryCode || \"\", \"leaderboard-member-name\")",
].forEach((needle) => {
  if (!leaderboardBody[0].includes(needle)) {
    throw new Error(`Leaderboard profile integration missing safe link behavior: ${needle}`);
  }
});

console.log("Community Grow profile integration regression check passed.");
