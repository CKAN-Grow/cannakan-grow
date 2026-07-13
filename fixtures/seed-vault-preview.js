(function seedVaultPreviewFixtures(globalObject) {
  "use strict";

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const isoDaysAgo = (daysAgo) => new Date(now - (daysAgo * day)).toISOString();

  function entry(seedName, index, overrides) {
    const base = {
      id: `preview-vault-entry-${String(index).padStart(2, "0")}`,
      userId: "preview-user",
      seedName,
      seedVariety: seedName,
      seedType: index % 4 === 0 ? "auto" : "photoperiod",
      seedSex: index % 5 === 0 ? "regular" : "feminized",
      source: ["Northstar Seed House", "Archive Bench", "Humboldt Field Co.", "Glasshouse Trial Supply"][index % 4],
      breeder: ["Fictional Genetics", "Canopy Works", "Rootline Labs", "Green Signal Breeding", "Compound Genetics"][index % 5],
      seedCount: 4 + (index % 8),
      remainingCount: 2 + (index % 6),
      yearAcquired: 2020 + (index % 6),
      acquisitionDate: `202${index % 6}-0${(index % 8) + 1}-12`,
      acquiredFrom: ["Trade table", "Direct order", "Local event", "Preservation swap"][index % 4],
      orderNumber: `PREVIEW-${1000 + index}`,
      price: 28 + (index * 3),
      storageLocation: ["Vault A", "Cold box", "Project tray", "Archive sleeve"][index % 4],
      storageNotes: "Preview-only record for UI testing. Not connected to Supabase.",
      personalNotes: "Fictional preview genetics used to test Seed Vault layouts and long-form notes.",
      sourceNotes: "Preview supplier note. This source does not represent a real vendor relationship.",
      growNotes: [
        { text: "Preview grow note for layout testing.", createdAt: isoDaysAgo(index + 3), sessionId: "" },
      ],
      collections: [["Next Grow"], ["Outdoor 2027"], ["Purple Hunt"], ["Archive Shelf"], ["Testing Bench"]][index % 5],
      tags: [["preview", "keeper"], ["preview", "outdoor"], ["preview", "testing"], ["preview", "archive"]][index % 4],
      planningStatus: ["planned", "inventory", "testing", "inventory", "active"][index % 5] === "testing" ? "planned" : ["planned", "inventory", "inventory", "inventory", "active"][index % 5],
      growAlongEnabled: index % 7 === 0,
      growAlongName: index % 7 === 0 ? "Preview Community Run" : "",
      testingProgramEnabled: index % 6 === 0,
      testingProgramName: index % 6 === 0 ? "Preview Testing Program" : "",
      testingProgramConnectionType: index % 2 === 0 ? "connected-group" : "independently-marked",
      isFavorite: index % 4 === 0,
      isArchived: false,
      thumbnailUrl: "",
      varietyImageUrl: "",
      sourceLogoUrl: "",
      createdAt: isoDaysAgo(60 + index),
      updatedAt: isoDaysAgo(index),
      isPreview: true,
      is_preview: true,
      devModeOnly: true,
      dev_mode_only: true,
      mockSource: "seed-vault-developer-preview",
      mock_source: "seed-vault-developer-preview",
    };
    return Object.freeze({ ...base, ...(overrides || {}) });
  }

  const largeEntries = Object.freeze([
    entry("Permanent Marker Reserve", 1, { collections: ["Next Grow", "Testing Bench"], planningStatus: "planned", seedCount: 12, remainingCount: 10, breeder: "Compound Genetics", updatedAt: isoDaysAgo(0.2) }),
    entry("Blueberry Muffin Trial Lot", 2, { collections: ["Purple Hunt"], testingProgramEnabled: true, testingProgramName: "Dessert Profile Trial", seedCount: 9, breeder: "Humboldt Seed Co.", updatedAt: isoDaysAgo(1) }),
    entry("Rainbow Belts Archive Cut", 3, { collections: ["Archive Shelf"], source: "Archive Bench", seedCount: 7, remainingCount: 4, updatedAt: isoDaysAgo(3) }),
    entry("Lemon Frost Utility Cross", 4, { collections: ["Outdoor 2027"], seedType: "auto", source: "Glasshouse Trial Supply", seedCount: 14, updatedAt: isoDaysAgo(5) }),
    entry("Northern Archive Long Name Stress Tester", 5, { collections: ["Archive Shelf"], breeder: "Rootline Labs", seedSex: "regular", seedCount: 6, updatedAt: isoDaysAgo(8) }),
    entry("Velvet Runtz Planning Batch", 6, { collections: ["Next Grow"], planningStatus: "planned", testingProgramEnabled: true, seedCount: 16, updatedAt: isoDaysAgo(11) }),
    entry("Glasshouse Pine Trial", 7, { collections: ["Testing Bench"], growAlongEnabled: true, growAlongName: "Local Preview Grow Along", source: "Northstar Seed House", updatedAt: isoDaysAgo(13) }),
    entry("Purple Static Selection", 8, { collections: ["Purple Hunt"], isFavorite: true, breeder: "Green Signal Breeding", updatedAt: isoDaysAgo(15) }),
    entry("Citrus Field Marker", 9, { collections: ["Outdoor 2027"], seedCount: 11, yearAcquired: 2021, acquisitionDate: "2021-04-20", updatedAt: isoDaysAgo(18) }),
    entry("Black Lime Preservation", 10, { collections: ["Archive Shelf"], seedSex: "regular", seedCount: 5, remainingCount: 5, updatedAt: isoDaysAgo(22) }),
    entry("Strawberry Signal Test", 11, { collections: ["Testing Bench"], testingProgramEnabled: true, testingProgramConnectionType: "connected-group", updatedAt: isoDaysAgo(25) }),
    entry("Ocean Air Auto Preview", 12, { collections: ["Outdoor 2027"], seedType: "auto", growAlongEnabled: true, updatedAt: isoDaysAgo(28) }),
    entry("Moonbow Utility Pack", 13, { collections: ["Next Grow"], source: "Archive Bench", updatedAt: isoDaysAgo(34) }),
    entry("Desert Resin Archive", 14, { collections: ["Archive Shelf"], yearAcquired: 2019, acquisitionDate: "2019-10-04", updatedAt: isoDaysAgo(45) }),
    entry("Apricot Glue Mock Lot", 15, { collections: ["Purple Hunt"], isFavorite: true, updatedAt: isoDaysAgo(55) }),
    entry("Pineapple Index Trial", 16, { collections: ["Testing Bench"], testingProgramEnabled: true, seedCount: 18, updatedAt: isoDaysAgo(70) }),
  ]);

  const fixtureSets = Object.freeze({
    empty: Object.freeze({ label: "Empty Vault", entries: Object.freeze([]), collections: Object.freeze([]) }),
    small: Object.freeze({ label: "Small Vault", entries: Object.freeze(largeEntries.slice(0, 3)), collections: Object.freeze(["Next Grow", "Purple Hunt"]) }),
    large: Object.freeze({ label: "Large Vault", entries: largeEntries, collections: Object.freeze(["Next Grow", "Outdoor 2027", "Purple Hunt", "Archive Shelf", "Testing Bench"]) }),
    collector: Object.freeze({ label: "Collector Vault", entries: Object.freeze(largeEntries.filter((item) => item.collections.includes("Archive Shelf") || item.isFavorite).slice(0, 10)), collections: Object.freeze(["Archive Shelf", "Purple Hunt", "Preservation"]) }),
    testing: Object.freeze({ label: "Testing Program Vault", entries: Object.freeze(largeEntries.filter((item) => item.testingProgramEnabled || item.growAlongEnabled)), collections: Object.freeze(["Testing Bench", "Next Grow"]) }),
    stress: Object.freeze({ label: "Mobile Stress Test", entries: largeEntries, collections: Object.freeze(["Collection With A Very Long Preview Name", "Outdoor 2027", "Purple Hunt", "Archive Shelf", "Testing Bench"]) }),
  });

  globalObject.CANNAKAN_SEED_VAULT_PREVIEW_FIXTURES = Object.freeze({
    defaultSetId: "large",
    sets: fixtureSets,
  });
})(globalThis);
