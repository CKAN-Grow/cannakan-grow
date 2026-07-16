import { ids } from "./ids.mjs";

const entities = (entityType, records, dependencyOrder, cleanupOrder) => Object.entries(records).map(([demoKey, id]) => ({
  entityType, demoKey, id, dependencyOrder, cleanupOrder, expectedCount: Object.keys(records).length, ownership: "local-demo-phase-1",
}));

export const expectedCounts = Object.freeze({
  authUsers: 4, authIdentities: 4, profiles: 4, publicProfiles: 4,
  sources: 4, directoryVarieties: 9, analyticsVarieties: 8,
  completedSessions: 8, activeSessions: 2, communitySnapshots: 8,
  vaultEntries: 5, collections: 2, tags: 5, planningEntries: 2,
  collectionLinks: 5, tagLinks: 8, growNotes: 2, profileActivities: 4,
});

export const manifest = Object.freeze([
  ...entities("auth.users", ids.users, 1, 100),
  ...entities("auth.identities", ids.identities, 2, 99),
  ...entities("public.profiles", ids.users, 3, 98),
  ...entities("public.public_member_profiles", ids.publicProfiles, 4, 97),
  ...entities("public.sources", ids.sources, 5, 20),
  ...entities("public.variety_directory", ids.varieties, 6, 21),
  ...entities("public.grow_sessions", { ...ids.completedSessions, ...ids.activeSessions }, 7, 80),
  ...entities("public.grow_gallery_snapshots", ids.snapshots, 8, 90),
  ...entities("public.seed_vault_entries", ids.vaultEntries, 9, 70),
  ...entities("public.seed_vault_collections", ids.collections, 10, 60),
  ...entities("public.seed_vault_tags", ids.tags, 10, 60),
  ...entities("public.seed_vault_grow_notes", ids.growNotes, 11, 75),
  ...entities("public.community_activity", ids.activities, 11, 75),
  ...entities("public.seed_vault_entry_collections", ids.collectionLinks, 11, 76),
  ...entities("public.seed_vault_entry_tags", ids.tagLinks, 11, 76),
]);

export const cleanupOrder = Object.freeze([...manifest].sort((a, b) => b.cleanupOrder - a.cleanupOrder));
