"use strict";

const assert = require("assert/strict");
const fs = require("fs");

const app = fs.readFileSync("app.js", "utf8");
const start = app.indexOf("function buildHomeGalleryRankingsTeaserState");
const end = app.indexOf("function formatInstallPreviewElapsed", start);
assert.notEqual(start, -1, "Home Community teaser adapter should exist.");
assert.ok(end > start, "Home Community teaser adapter range should exist.");
const adapter = app.slice(start, end);

assert.ok(adapter.includes("getCanonicalCommunityAnalytics()"), "Home Community teaser must consume the Community contract.");
assert.ok(adapter.includes("community.leaderboards.contributors[0]"), "Home member teaser must use the canonical contributor leaderboard.");
assert.ok(adapter.includes("community.leaderboards.sources[0]"), "Home source teaser must use the canonical source leaderboard.");
assert.ok(adapter.includes("community.leaderboards.varieties[0]"), "Home variety teaser must use the canonical variety leaderboard.");
for (const forbidden of ["gallerySnapshots", "getApprovedPublicGallerySnapshots", "buildGalleryTopMemberEntries", "buildGalleryLeaderboardEntries", "buildGallerySeedTypeHighlightEntry"]) {
  assert.ok(!adapter.includes(forbidden), `Home Community teaser must not calculate analytics via ${forbidden}.`);
}

console.log("Home gallery rankings teaser regression check passed.");
