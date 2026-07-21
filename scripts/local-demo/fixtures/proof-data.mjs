import { DEMO_OWNER_DISPLAY_NAME, DEMO_OWNER_EMAIL, DEMO_OWNER_JOINED_AT } from "../config.mjs";
import { ids } from "../ids.mjs";

export const LOCAL_DEMO_PASSWORD_HASH = "$2a$10$/qNE4whxuTUAF/GL9ufFZeNs.fFYxVuPnFMnrU7rOMtnscQC6oexG";

export const contributors = Object.freeze([
  { key: "owner", id: ids.users.owner, identityId: ids.identities.owner, publicProfileId: ids.publicProfiles.owner, email: DEMO_OWNER_EMAIL, username: "demo-founder", displayName: DEMO_OWNER_DISPLAY_NAME, handle: "demo-founder", country: "US", region: "MA", joinedAt: DEMO_OWNER_JOINED_AT, bio: "Fictional local founder profile for deterministic demo validation." },
  { key: "california", id: ids.users.california, identityId: ids.identities.california, publicProfileId: ids.publicProfiles.california, email: "mara.fields@example.test", username: "mara-fields", displayName: "Mara Fields", handle: "mara-fields", country: "US", region: "California", bio: "Fictional California contributor for local-only regional evidence." },
  { key: "germany", id: ids.users.germany, identityId: ids.identities.germany, publicProfileId: ids.publicProfiles.germany, email: "jonas.wald@example.test", username: "jonas-wald", displayName: "Jonas Wald", handle: "jonas-wald", country: "DE", region: "Germany", bio: "Fictional German contributor for local-only regional evidence." },
  { key: "massachusetts", id: ids.users.massachusetts, identityId: ids.identities.massachusetts, publicProfileId: ids.publicProfiles.massachusetts, email: "nia.grove@example.test", username: "nia-grove", displayName: "Nia Grove", handle: "nia-grove", country: "US", region: "Massachusetts", bio: "Fictional Massachusetts contributor for local-only community evidence." },
]);

export const sources = Object.freeze([
  { key: "seedsman", id: ids.sources.seedsman, name: "Seedsman", description: "Local demo source with multi-period canonical evidence." },
  { key: "poppinFire", id: ids.sources.poppinFire, name: "Poppin Fire", description: "Local demo source with multi-contributor evidence." },
  { key: "goodGenetix", id: ids.sources.goodGenetix, name: "Good Genetix", description: "Local demo source with a single historical result." },
  { key: "chadWestport", id: ids.sources.chadWestport, name: "Chad Westport", description: "Local demo sparse-evidence source." },
]);

export const varieties = Object.freeze([
  { key: "bananaJealousy", id: ids.varieties.bananaJealousy, name: "Demo Banana Jealousy", sourceKey: "seedsman", type: "photoperiod" },
  { key: "weddingCake", id: ids.varieties.weddingCake, name: "Demo Wedding Cake", sourceKey: "seedsman", type: "photoperiod" },
  { key: "northernLights", id: ids.varieties.northernLights, name: "Demo Northern Lights", sourceKey: "seedsman", type: "photoperiod" },
  { key: "lemonAuto", id: ids.varieties.lemonAuto, name: "Demo Lemon Auto", sourceKey: "seedsman", type: "auto" },
  { key: "massachusettsMint", id: ids.varieties.massachusettsMint, name: "Demo Massachusetts Mint", sourceKey: "chadWestport", type: "photoperiod" },
  { key: "emberOne", id: ids.varieties.emberOne, name: "Demo Ember One", sourceKey: "poppinFire", type: "photoperiod" },
  { key: "solarFlare", id: ids.varieties.solarFlare, name: "Demo Solar Flare", sourceKey: "poppinFire", type: "auto" },
  { key: "gardenSage", id: ids.varieties.gardenSage, name: "Demo Garden Sage", sourceKey: "goodGenetix", type: "herb" },
  { key: "vaultReserve", id: ids.varieties.vaultReserve, name: "Demo Vault Reserve", sourceKey: "goodGenetix", type: "photoperiod", emptyEvidence: true },
]);

export const completedSessions = Object.freeze([
  { key: "seedsman1", id: ids.completedSessions.seedsman1, snapshotId: ids.snapshots.seedsman1, contributor: "owner", source: "seedsman", variety: "bananaJealousy", method: "KAN", started: "2025-11-28T12:00:00Z", completed: "2025-12-02T12:00:00Z", seeds: 10, germinated: 10, age: 0.5 },
  { key: "seedsman2", id: ids.completedSessions.seedsman2, snapshotId: ids.snapshots.seedsman2, contributor: "california", source: "seedsman", variety: "weddingCake", method: "Paper Towel", started: "2026-02-05T12:00:00Z", completed: "2026-02-09T12:00:00Z", seeds: 12, germinated: 11, age: 1.5 },
  { key: "seedsman3", id: ids.completedSessions.seedsman3, snapshotId: ids.snapshots.seedsman3, contributor: "germany", source: "seedsman", variety: "northernLights", method: "Rockwool / Starter Plug", started: "2026-04-10T12:00:00Z", completed: "2026-04-15T12:00:00Z", seeds: 10, germinated: 9, age: 3 },
  { key: "seedsman4", id: ids.completedSessions.seedsman4, snapshotId: ids.snapshots.seedsman4, contributor: "massachusetts", source: "seedsman", variety: "lemonAuto", method: "Direct Sow", started: "2026-07-01T12:00:00Z", completed: "2026-07-06T12:00:00Z", seeds: 10, germinated: 8, age: 4 },
  { key: "chad1", id: ids.completedSessions.chad1, snapshotId: ids.snapshots.chad1, contributor: "owner", source: "chadWestport", variety: "massachusettsMint", method: "KAN", started: "2026-07-08T12:00:00Z", completed: "2026-07-12T12:00:00Z", seeds: 10, germinated: 10, age: 0.5 },
  { key: "poppin1", id: ids.completedSessions.poppin1, snapshotId: ids.snapshots.poppin1, contributor: "california", source: "poppinFire", variety: "emberOne", method: "Paper Towel", started: "2026-03-02T12:00:00Z", completed: "2026-03-06T12:00:00Z", seeds: 10, germinated: 9, age: 2 },
  { key: "poppin2", id: ids.completedSessions.poppin2, snapshotId: ids.snapshots.poppin2, contributor: "germany", source: "poppinFire", variety: "solarFlare", method: "Rockwool / Starter Plug", started: "2026-06-12T12:00:00Z", completed: "2026-06-17T12:00:00Z", seeds: 10, germinated: 8, age: 5 },
  { key: "good1", id: ids.completedSessions.good1, snapshotId: ids.snapshots.good1, contributor: "massachusetts", source: "goodGenetix", variety: "gardenSage", method: "Direct Sow", started: "2026-01-14T12:00:00Z", completed: "2026-01-20T12:00:00Z", seeds: 12, germinated: 10, age: 2.5 },
]);

export const activeSessions = Object.freeze([
  { key: "ownerKan", id: ids.activeSessions.ownerKan, name: "Demo Founder KAN Run", method: "KAN", variety: "weddingCake", source: "seedsman", started: "2026-07-13T12:00:00Z", seeds: 8 },
  { key: "ownerPlug", id: ids.activeSessions.ownerPlug, name: "Demo Founder Starter Plug Run", method: "Rockwool / Starter Plug", variety: "vaultReserve", source: "goodGenetix", started: "2026-07-14T12:00:00Z", seeds: 6 },
]);

export const vaultEntries = Object.freeze([
  { key: "bananaJealousy", id: ids.vaultEntries.bananaJealousy, variety: "bananaJealousy", quantity: 18, acquired: "2026-01-15", age: 0.5, breeder: "Seedsman Demo Breeding", planning: "inventory", collections: ["currentSeason"], tags: ["fresh", "communityTested"] },
  { key: "weddingCake", id: ids.vaultEntries.weddingCake, variety: "weddingCake", quantity: 12, acquired: "2024-05-10", age: 2, breeder: "West Garden Demo Genetics", planning: "planned", collections: ["currentSeason"], tags: ["priority", "planned"] },
  { key: "massachusettsMint", id: ids.vaultEntries.massachusettsMint, variety: "massachusettsMint", quantity: 9, acquired: "2025-09-08", age: 1, breeder: "Chad Westport Demo Line", planning: "planned", collections: ["currentSeason"], tags: ["planned", "communityTested"] },
  { key: "emberOne", id: ids.vaultEntries.emberOne, variety: "emberOne", quantity: 7, acquired: "2023-03-11", age: 3.5, breeder: "Poppin Fire Demo Breeding", planning: "inventory", collections: ["archive"], tags: ["archive"] },
  { key: "vaultReserve", id: ids.vaultEntries.vaultReserve, variety: "vaultReserve", quantity: 5, acquired: "2021-08-21", age: 5, breeder: "Good Genetix Demo Breeding", planning: "inventory", collections: ["archive"], tags: ["archive"] },
]);

export const collections = Object.freeze([
  { key: "currentSeason", id: ids.collections.currentSeason, name: "Current Season" },
  { key: "archive", id: ids.collections.archive, name: "Archive Reserve" },
]);

export const tags = Object.freeze([
  { key: "priority", id: ids.tags.priority, name: "Priority" },
  { key: "fresh", id: ids.tags.fresh, name: "Fresh" },
  { key: "archive", id: ids.tags.archive, name: "Archive" },
  { key: "communityTested", id: ids.tags.communityTested, name: "Community Tested" },
  { key: "planned", id: ids.tags.planned, name: "Planned" },
]);
