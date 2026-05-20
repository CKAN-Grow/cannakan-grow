"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const vm = require("vm");

const appSource = fs.readFileSync("app.js", "utf8");
const startToken = "function formatHomeGalleryRankingMetric";
const endToken = "function renderHomeGalleryRankingRowIcon";
const startIndex = appSource.indexOf(startToken);
const endIndex = appSource.indexOf(endToken);

assert.notEqual(startIndex, -1, "Home gallery ranking formatter should exist.");
assert.notEqual(endIndex, -1, "Home gallery ranking icon renderer should exist.");

const snippet = appSource.slice(startIndex, endIndex);
const context = {
  appState: {
    gallerySnapshots: undefined,
  },
  GALLERY_TOP_MEMBERS_MOCK_ENTRIES: [],
  Date,
  Math,
  Number,
  String,
  Array,
  getApprovedPublicGallerySnapshots() {
    return Array.isArray(context.appState.gallerySnapshots)
      ? context.appState.gallerySnapshots.filter(context.isGallerySnapshotAnalyticsEligible)
      : [];
  },
  getLeaderboardMonthKey() {
    return "2026-05";
  },
  parseLeaderboardSnapshotDate() {
    return new Date("2026-05-19T12:00:00.000Z");
  },
  buildGalleryTopMemberEntries(snapshots = []) {
    assert.equal(Array.isArray(snapshots), true);
    return [];
  },
  buildGalleryLeaderboardEntries(snapshots = []) {
    assert.equal(Array.isArray(snapshots), true);
    return [];
  },
  buildGallerySeedTypeHighlightEntry(snapshots = []) {
    assert.equal(Array.isArray(snapshots), true);
    return null;
  },
  isGallerySnapshotAnalyticsEligible(snapshot = null) {
    return Boolean(
      snapshot
      && snapshot.status === "approved"
      && snapshot.analyticsExcluded !== true
      && snapshot.isMock !== true
      && snapshot.isTest !== true
      && snapshot.deleted !== true,
    );
  },
  isMockDataEnabled() {
    return false;
  },
};

vm.createContext(context);
vm.runInContext(`${snippet}; this.buildHomeGalleryRankingsTeaserState = buildHomeGalleryRankingsTeaserState;`, context);

const unloadedState = context.buildHomeGalleryRankingsTeaserState();
assert.equal(Array.isArray(Array.from(unloadedState.snapshots)), true);
assert.equal(unloadedState.snapshots.length, 0);
assert.equal(unloadedState.approvedPublicSnapshots.length, 0);
assert.equal(unloadedState.monthlySnapshots.length, 0);
assert.equal(unloadedState.rankings.topMember, null);
assert.equal(unloadedState.rankings.topSource, null);
assert.equal(unloadedState.rankings.topVariety, null);
assert.equal(unloadedState.rankings.topSeedType, null);

context.appState.gallerySnapshots = [
  { id: "deleted", status: "approved", deleted: true },
  { id: "excluded", status: "approved", analyticsExcluded: true },
  { id: "test", status: "approved", isTest: true },
];

const excludedState = context.buildHomeGalleryRankingsTeaserState();
assert.equal(excludedState.snapshots.length, 3);
assert.equal(excludedState.approvedPublicSnapshots.length, 0);
assert.equal(excludedState.monthlySnapshots.length, 0);

console.log("Home gallery rankings teaser regression check passed.");
