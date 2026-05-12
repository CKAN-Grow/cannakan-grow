"use strict";

const assert = require("assert/strict");

const {
  buildLineageAuditContext,
  buildRegenerationPlan,
  buildSupersessionPlan,
  detectDuplicateActiveLineage,
  detectLineageCycle,
  resolveActiveSnapshotLineage,
  sortLineageSnapshotsStable,
  validateRegenerationEligibility,
  validateSupersessionPlan,
} = require("../src/services/cstp/internal/immutable-report-lineage-orchestrator");

const REPORT_ID = "11111111-1111-4111-8111-111111111111";
const TEST_ID = "22222222-2222-4222-8222-222222222222";
const ADMIN_ID = "33333333-3333-4333-8333-333333333333";
const SNAPSHOT_ONE_ID = "44444444-4444-4444-8444-444444444444";
const SNAPSHOT_TWO_ID = "55555555-5555-4555-8555-555555555555";
const SNAPSHOT_THREE_ID = "66666666-6666-4666-8666-666666666666";
const LINEAGE_TIMESTAMP = "2026-05-12T16:00:00.000Z";

function createReport() {
  return {
    id: REPORT_ID,
    cstp_test_id: TEST_ID,
    current_snapshot_id: SNAPSHOT_TWO_ID,
    status: "published",
  };
}

function createSnapshots() {
  return [
    {
      id: SNAPSHOT_TWO_ID,
      report_id: REPORT_ID,
      cstp_test_id: TEST_ID,
      snapshot_version: 2,
      status: "published",
      locked: true,
      generated_at: "2026-05-12T14:00:00.000Z",
      prepared_at: "2026-05-12T14:30:00.000Z",
      published_at: "2026-05-12T15:00:00.000Z",
      supersedes_snapshot_id: SNAPSHOT_ONE_ID,
    },
    {
      id: SNAPSHOT_ONE_ID,
      report_id: REPORT_ID,
      cstp_test_id: TEST_ID,
      snapshot_version: 1,
      status: "superseded",
      locked: true,
      generated_at: "2026-05-11T14:00:00.000Z",
      prepared_at: "2026-05-11T14:30:00.000Z",
      published_at: "2026-05-11T15:00:00.000Z",
      superseded_by_snapshot_id: SNAPSHOT_TWO_ID,
    },
  ];
}

function createSuccessorSnapshot() {
  return {
    id: SNAPSHOT_THREE_ID,
    report_id: REPORT_ID,
    cstp_test_id: TEST_ID,
    snapshot_version: 3,
    status: "prepared",
    locked: false,
    frozen_report_payload: {
      reportId: REPORT_ID,
      internalOnly: true,
    },
    generated_at: "2026-05-12T15:30:00.000Z",
    prepared_at: "2026-05-12T15:45:00.000Z",
    supersedes_snapshot_id: SNAPSHOT_TWO_ID,
  };
}

function createAdminContext() {
  return {
    adminUserId: ADMIN_ID,
    cstpAdminEventId: "77777777-7777-4777-8777-777777777777",
  };
}

function main() {
  const report = createReport();
  const snapshots = createSnapshots();
  const successorSnapshot = createSuccessorSnapshot();
  const adminContext = createAdminContext();
  const sorted = sortLineageSnapshotsStable(snapshots);

  assert.deepEqual(sorted.map((snapshot) => snapshot.id), [
    SNAPSHOT_ONE_ID,
    SNAPSHOT_TWO_ID,
  ]);

  const activeLineage = resolveActiveSnapshotLineage({ report, snapshots });
  assert.equal(activeLineage.currentSnapshotId, SNAPSHOT_TWO_ID);
  assert.equal(activeLineage.activeSnapshotIds.length, 1);
  assert.equal(activeLineage.duplicateActiveLineage, false);

  const duplicateResult = detectDuplicateActiveLineage([
    ...snapshots,
    {
      ...successorSnapshot,
      status: "prepared",
    },
  ]);
  assert.equal(duplicateResult.ok, false);
  assert.equal(duplicateResult.issues[0].code, "CSTP_DUPLICATE_ACTIVE_SNAPSHOT_LINEAGE");

  const cycleResult = detectLineageCycle([
    {
      id: "88888888-8888-4888-8888-888888888888",
      report_id: REPORT_ID,
      snapshot_version: 1,
      status: "superseded",
      supersedes_snapshot_id: "99999999-9999-4999-8999-999999999999",
    },
    {
      id: "99999999-9999-4999-8999-999999999999",
      report_id: REPORT_ID,
      snapshot_version: 2,
      status: "prepared",
      supersedes_snapshot_id: "88888888-8888-4888-8888-888888888888",
    },
  ]);
  assert.equal(cycleResult.ok, false);
  assert.equal(cycleResult.issues[0].code, "CSTP_LINEAGE_CYCLE_DETECTED");

  const plan = buildSupersessionPlan({
    report,
    snapshots,
    supersedingSnapshot: successorSnapshot,
    adminContext,
    supersessionTimestamp: LINEAGE_TIMESTAMP,
    options: {
      reason: "internal regeneration review",
    },
  });

  assert.equal(plan.ok, true);
  assert.equal(plan.actionType, "supersede_snapshot");
  assert.equal(plan.targetReportId, REPORT_ID);
  assert.equal(plan.targetSnapshotId, SNAPSHOT_TWO_ID);
  assert.equal(plan.supersedingSnapshotId, SNAPSHOT_THREE_ID);
  assert.equal(plan.snapshotsToMarkSuperseded.length, 1);
  assert.equal(
    plan.snapshotsToMarkSuperseded[0].superseded_by_snapshot_id,
    SNAPSHOT_THREE_ID
  );
  assert.equal(plan.reportStateChangesNeeded.current_snapshot_id, SNAPSHOT_THREE_ID);
  assert.equal(plan.auditContext.eventRole, "snapshot_superseded");
  assert.equal(plan.immutableSafety.destructiveReplacement, false);
  assert.equal(plan.immutableSafety.deletesHistoricalSnapshots, false);
  assert.equal(plan.immutableSafety.publicVisibility, false);

  const directValidation = validateSupersessionPlan({
    report,
    targetSnapshot: snapshots[0],
    supersedingSnapshot: {
      ...snapshots[0],
      supersedes_snapshot_id: SNAPSHOT_ONE_ID,
    },
    snapshots,
    plannedSnapshots: snapshots,
    adminContext,
    supersessionTimestamp: LINEAGE_TIMESTAMP,
  });
  assert.equal(directValidation.ok, false);

  const missingAdminPlan = buildSupersessionPlan({
    report,
    snapshots,
    supersedingSnapshot: successorSnapshot,
    adminContext: {},
    supersessionTimestamp: LINEAGE_TIMESTAMP,
  });
  assert.equal(missingAdminPlan.ok, false);
  assert.equal(
    missingAdminPlan.errors.some((issue) => (
      issue.code === "CSTP_SUPERSESSION_ADMIN_CONTEXT_REQUIRED"
    )),
    true
  );

  const alreadySupersededPlan = buildSupersessionPlan({
    report,
    snapshots,
    targetSnapshotId: SNAPSHOT_ONE_ID,
    supersedingSnapshot: successorSnapshot,
    adminContext,
    supersessionTimestamp: LINEAGE_TIMESTAMP,
  });
  assert.equal(alreadySupersededPlan.ok, false);
  assert.equal(
    alreadySupersededPlan.errors.some((issue) => (
      issue.code === "CSTP_SUPERSESSION_TARGET_ALREADY_SUPERSEDED"
    )),
    true
  );

  const regenerationPlan = buildRegenerationPlan({
    report,
    snapshots,
    adminContext,
    regenerationTimestamp: LINEAGE_TIMESTAMP,
    reason: "internal data correction",
  });
  assert.equal(regenerationPlan.ok, true);
  assert.equal(regenerationPlan.nextSnapshotVersion, 3);
  assert.equal(regenerationPlan.supersessionRequired, true);
  assert.equal(regenerationPlan.immutableSafety.requiresNewSnapshotVersion, true);

  const eligibility = validateRegenerationEligibility({
    report,
    snapshots,
    adminContext,
    regenerationTimestamp: LINEAGE_TIMESTAMP,
  });
  assert.equal(eligibility.ok, true);

  const auditContext = buildLineageAuditContext({
    actionType: "supersede_snapshot",
    report,
    targetSnapshot: snapshots[1],
    supersedingSnapshot: successorSnapshot,
    adminContext,
    timestamp: LINEAGE_TIMESTAMP,
    reason: "internal review",
  });
  assert.equal(auditContext.createdBy, ADMIN_ID);
  assert.equal(auditContext.publicVisibility, false);

  console.log("CSTP immutable report lineage orchestrator smoke checks passed.");
}

main();
