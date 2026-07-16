const uuid = (group, number) => `d3a00000-0000-4${group}00-8${group}00-${String(number).padStart(12, "0")}`;

export const ids = Object.freeze({
  users: Object.freeze({ owner: uuid("1", 1), california: uuid("1", 2), germany: uuid("1", 3), massachusetts: uuid("1", 4) }),
  identities: Object.freeze({ owner: uuid("2", 1), california: uuid("2", 2), germany: uuid("2", 3), massachusetts: uuid("2", 4) }),
  publicProfiles: Object.freeze({ owner: uuid("3", 1), california: uuid("3", 2), germany: uuid("3", 3), massachusetts: uuid("3", 4) }),
  sources: Object.freeze({ seedsman: uuid("4", 1), poppinFire: uuid("4", 2), goodGenetix: uuid("4", 3), chadWestport: uuid("4", 4) }),
  varieties: Object.freeze({
    bananaJealousy: uuid("5", 1), weddingCake: uuid("5", 2), northernLights: uuid("5", 3), lemonAuto: uuid("5", 4),
    massachusettsMint: uuid("5", 5), emberOne: uuid("5", 6), solarFlare: uuid("5", 7), gardenSage: uuid("5", 8), vaultReserve: uuid("5", 9),
  }),
  completedSessions: Object.freeze({ seedsman1: uuid("6", 1), seedsman2: uuid("6", 2), seedsman3: uuid("6", 3), seedsman4: uuid("6", 4), chad1: uuid("6", 5), poppin1: uuid("6", 6), poppin2: uuid("6", 7), good1: uuid("6", 8) }),
  activeSessions: Object.freeze({ ownerKan: uuid("6", 9), ownerPlug: uuid("6", 10) }),
  snapshots: Object.freeze({ seedsman1: uuid("7", 1), seedsman2: uuid("7", 2), seedsman3: uuid("7", 3), seedsman4: uuid("7", 4), chad1: uuid("7", 5), poppin1: uuid("7", 6), poppin2: uuid("7", 7), good1: uuid("7", 8) }),
  vaultEntries: Object.freeze({ bananaJealousy: uuid("8", 1), weddingCake: uuid("8", 2), massachusettsMint: uuid("8", 3), emberOne: uuid("8", 4), vaultReserve: uuid("8", 5) }),
  collections: Object.freeze({ currentSeason: uuid("9", 1), archive: uuid("9", 2) }),
  tags: Object.freeze({ priority: uuid("a", 1), fresh: uuid("a", 2), archive: uuid("a", 3), communityTested: uuid("a", 4), planned: uuid("a", 5) }),
  growNotes: Object.freeze({ banana: uuid("b", 1), reserve: uuid("b", 2) }),
  activities: Object.freeze({ owner: uuid("c", 1), california: uuid("c", 2), germany: uuid("c", 3), massachusetts: uuid("c", 4) }),
  collectionLinks: Object.freeze({
    bananaCurrent: `${uuid("8", 1)}:${uuid("9", 1)}`,
    weddingCurrent: `${uuid("8", 2)}:${uuid("9", 1)}`,
    mintCurrent: `${uuid("8", 3)}:${uuid("9", 1)}`,
    emberArchive: `${uuid("8", 4)}:${uuid("9", 2)}`,
    reserveArchive: `${uuid("8", 5)}:${uuid("9", 2)}`,
  }),
  tagLinks: Object.freeze({
    bananaPriority: `${uuid("8", 1)}:${uuid("a", 1)}`, bananaCommunity: `${uuid("8", 1)}:${uuid("a", 4)}`,
    weddingFresh: `${uuid("8", 2)}:${uuid("a", 2)}`, weddingCommunity: `${uuid("8", 2)}:${uuid("a", 4)}`,
    mintPlanned: `${uuid("8", 3)}:${uuid("a", 5)}`, emberArchive: `${uuid("8", 4)}:${uuid("a", 3)}`,
    reserveArchive: `${uuid("8", 5)}:${uuid("a", 3)}`, reservePlanned: `${uuid("8", 5)}:${uuid("a", 5)}`,
  }),
});

export function flattenIds(value = ids) {
  return Object.values(value).flatMap((entry) => (
    entry && typeof entry === "object" ? Object.values(entry) : [entry]
  ));
}
