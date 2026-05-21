const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const partitionMetadataMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260521152000_add_grow_gallery_partition_result_metadata.sql"),
  "utf8",
);

function pct(germinated, total) {
  return total > 0 ? Math.round((germinated / total) * 100) : null;
}

function buildSummary(partitions) {
  const sourceGroups = new Map();
  const varietyGroups = new Map();
  const partitionResults = partitions.map((partition, index) => {
    const totalCount = Math.max(0, Number(partition.seedCount) || 0);
    const raw = String(partition.plantedCount ?? "").trim();
    const value = Number(raw);
    const valid = raw !== "" && Number.isFinite(value) && value >= 0 && value <= totalCount;
    const germinatedCount = valid ? value : 0;
    const result = {
      label: `P${index + 1}`,
      source: partition.source || "",
      variety: partition.seedVariety || "",
      totalCount,
      germinatedCount,
      percentage: valid && totalCount > 0 ? pct(germinatedCount, totalCount) : null,
    };
    if (result.source) {
      const group = sourceGroups.get(result.source) || { total: 0, germinated: 0, partitions: [] };
      group.total += totalCount;
      group.germinated += germinatedCount;
      group.partitions.push(result.label);
      sourceGroups.set(result.source, group);
    }
    if (result.variety) {
      const group = varietyGroups.get(result.variety) || { total: 0, germinated: 0, partitions: [] };
      group.total += totalCount;
      group.germinated += germinatedCount;
      group.partitions.push(result.label);
      varietyGroups.set(result.variety, group);
    }
    return result;
  });
  const total = partitionResults.reduce((sum, result) => sum + result.totalCount, 0);
  const germinated = partitionResults.reduce((sum, result) => sum + result.germinatedCount, 0);
  return {
    overall: { total, germinated, percentage: pct(germinated, total) },
    partitions: partitionResults,
    sourceGroups,
    varietyGroups,
  };
}

const mixed = buildSummary([
  { source: "Strong Source", seedVariety: "Alpha", seedCount: 4, plantedCount: "4" },
  { source: "Strong Source", seedVariety: "Alpha", seedCount: 4, plantedCount: "4" },
  { source: "Strong Source", seedVariety: "Beta", seedCount: 4, plantedCount: "4" },
  { source: "Weak Source", seedVariety: "Gamma", seedCount: 3, plantedCount: "1" },
]);

const mixedKan = buildSummary([
  { source: "Strong Source", seedVariety: "Alpha", seedCount: 4, plantedCount: "4" },
  { source: "Strong Source", seedVariety: "Alpha", seedCount: 4, plantedCount: "4" },
  { source: "Strong Source", seedVariety: "Beta", seedCount: 4, plantedCount: "4" },
  { source: "Strong Source", seedVariety: "Beta", seedCount: 4, plantedCount: "4" },
  { source: "Strong Source", seedVariety: "Delta", seedCount: 4, plantedCount: "4" },
  { source: "Strong Source", seedVariety: "Delta", seedCount: 4, plantedCount: "4" },
  { source: "Weak Source", seedVariety: "Gamma", seedCount: 3, plantedCount: "1" },
  { source: "Weak Source", seedVariety: "Gamma", seedCount: 3, plantedCount: "1" },
]);

assert.equal(mixed.overall.germinated, 13, "Overall germinated count should include all partitions.");
assert.equal(mixed.overall.total, 15, "Overall total should include all seeds.");
assert.equal(mixed.overall.percentage, 87, "Overall rate should be total germinated divided by total seeds.");
assert.equal(mixed.partitions[0].percentage, 100, "Partition result should stay independent.");
assert.equal(pct(mixed.sourceGroups.get("Strong Source").germinated, mixed.sourceGroups.get("Strong Source").total), 100);
assert.equal(pct(mixed.sourceGroups.get("Weak Source").germinated, mixed.sourceGroups.get("Weak Source").total), 33);
assert.deepEqual(mixed.sourceGroups.get("Weak Source").partitions, ["P4"]);
assert.equal(mixedKan.overall.germinated, 26, "Mixed KAN overall germinated count should include all 8 partitions.");
assert.equal(mixedKan.overall.total, 30, "Mixed KAN overall total should include all 8 partition seed counts.");
assert.equal(mixedKan.overall.percentage, 87, "Mixed KAN overall percentage should remain total germinated divided by total seeds.");
assert.equal(mixedKan.partitions[0].percentage, 100, "Strong partitions should retain their independent 100% result.");
assert.equal(mixedKan.partitions[6].percentage, 33, "Weak partitions should retain their independent 33% result.");
assert.equal(pct(mixedKan.sourceGroups.get("Strong Source").germinated, mixedKan.sourceGroups.get("Strong Source").total), 100);
assert.equal(pct(mixedKan.sourceGroups.get("Weak Source").germinated, mixedKan.sourceGroups.get("Weak Source").total), 33);

[
  "function getSessionResultSummary",
  "function buildSnapshotPartitionResultMetadata",
  "function buildSnapshotResultSummaryMetadata",
  "const snapshotPartitionMaxItems = String(snapshotSystemType).trim().toUpperCase() === \"TRA\" ? 16 : 8;",
  "sourceGroups",
  "varietyGroups",
  "mixedContext",
  "renderSessionResultBreakdownMarkup",
  "drawSnapshotPartitionResultGrid",
  "identityLabel",
  "getSnapshotPartitionResultItems",
  "partitionResults: Array.isArray(row.partition_results) ? row.partition_results : []",
  "resultSummary: row.result_summary && typeof row.result_summary === \"object\"",
  "partition_results: Array.isArray(snapshotData?.partitionResults)",
  "result_summary: snapshotData?.resultSummaryMetadata",
  "isSupabaseColumnMissingError(error, \"grow_gallery_snapshots\", [\"partition_results\", \"result_summary\"])",
  "buildGalleryLeaderboardEntries",
  "getSessionResultSummary(linkedSession)",
].forEach((needle) => {
  assert(appSource.includes(needle), `Expected app.js to include ${needle}`);
});

[
  "alter table public.grow_gallery_snapshots",
  "add column if not exists partition_results jsonb not null default '[]'::jsonb",
  "add column if not exists result_summary jsonb not null default '{}'::jsonb",
].forEach((needle) => {
  assert(partitionMetadataMigration.includes(needle), `Expected partition metadata migration to include ${needle}`);
});

console.log("Session result summary regression check passed.");
