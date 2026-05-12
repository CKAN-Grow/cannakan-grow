"use strict";

const assert = require("assert/strict");

const {
  validateImmutableReportSnapshotCandidate,
} = require("../src/services/cstp/internal/immutable-report-validator");
const {
  assembleImmutableReportSnapshotCandidate,
} = require("../src/services/cstp/internal/immutable-snapshot-assembler");
const {
  buildImmutablePersistencePlan,
  persistImmutableSnapshotCandidate,
} = require("../src/services/cstp/internal/immutable-snapshot-persistence-orchestrator");
const {
  buildRegenerationPlan,
  buildSupersessionPlan,
  detectDuplicateActiveLineage,
} = require("../src/services/cstp/internal/immutable-report-lineage-orchestrator");
const {
  generateImmutableReportSnapshot,
  prepareImmutableReportSnapshot,
  regenerateImmutableReportSnapshot,
  supersedeImmutableReportSnapshot,
} = require("../src/services/cstp/internal/immutable-report-orchestrator");

const REPORT_ID = "11111111-1111-4111-8111-111111111111";
const SNAPSHOT_ONE_ID = "22222222-2222-4222-8222-222222222222";
const SNAPSHOT_TWO_ID = "33333333-3333-4333-8333-333333333333";
const REQUEST_ID = "44444444-4444-4444-8444-444444444444";
const TEST_ID = "55555555-5555-4555-8555-555555555555";
const SOURCE_ID = "66666666-6666-4666-8666-666666666666";
const ADMIN_ID = "77777777-7777-4777-8777-777777777777";
const SESSION_A_ID = "88888888-8888-4888-8888-888888888888";
const SESSION_B_ID = "99999999-9999-4999-8999-999999999999";
const GROW_A_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const GROW_B_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ADMIN_EVENT_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const WORKFLOW_TIMESTAMP = "2026-05-12T18:00:00.000Z";

async function main() {
  assertValidatorRejectsInvalidCandidates();
  assertAssemblerDeterminismAndOrdering();
  await assertPersistencePlanAndMockExecution();
  assertLineageGovernance();
  await assertUnifiedWorkflowModes();

  console.log("CSTP immutable report end-to-end smoke checks passed.");
}

function assertValidatorRejectsInvalidCandidates() {
  const invalid = validateImmutableReportSnapshotCandidate({
    report: {
      id: REPORT_ID,
      cstp_test_id: TEST_ID,
      status: "published",
    },
    snapshot: {
      id: SNAPSHOT_TWO_ID,
      report_id: REPORT_ID,
      cstp_test_id: TEST_ID,
      status: "published",
      locked: false,
      frozen_report_payload: {},
      generated_at: "2026-05-12T18:00:00.000Z",
      prepared_at: "2026-05-12T17:00:00.000Z",
    },
    cstpTest: {
      id: TEST_ID,
    },
    cstpRequest: {
      id: REQUEST_ID,
    },
    source: {
      id: SOURCE_ID,
    },
    sessionLinks: [],
    growSessions: [],
    actor: {},
    snapshots: [],
  }, {
    requireReport: true,
    requireSnapshot: true,
    requireSessions: true,
    requireNonEmptyPayload: true,
    requireAdminContext: true,
  });

  assert.equal(invalid.ok, false);
  assert.equal(invalid.summary.blocking > 0, true);
  assert.equal(
    invalid.issues.some((issue) => issue.code === "CSTP_SESSION_LINKS_REQUIRED"),
    true
  );
  assert.equal(
    invalid.issues.some((issue) => issue.code === "CSTP_ADMIN_CONTEXT_REQUIRED"),
    true
  );
}

function assertAssemblerDeterminismAndOrdering() {
  const input = createOperationalInput();
  const beforeJson = JSON.stringify(input);
  const first = assembleImmutableReportSnapshotCandidate(input, {
    requireAdminContext: true,
  });
  const second = assembleImmutableReportSnapshotCandidate(input, {
    requireAdminContext: true,
  });

  assert.equal(first.validation.ok, true);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(input), beforeJson);
  assert.deepEqual(
    first.frozenSessionSummaries.map((session) => session.cstpTestSessionId),
    [SESSION_A_ID, SESSION_B_ID]
  );

  const metricKeys = first.frozenMetricPayload.map((metric) => metric.metricKey);
  assert.deepEqual(metricKeys, [...metricKeys].sort());
  assert.equal(first.snapshotRecord.generated_at, WORKFLOW_TIMESTAMP);
  assert.equal(first.snapshotRecord.frozen_report_payload.operationalReferences.cstpTestId, TEST_ID);
  assert.equal(first.mutatesGrowSessions, false);
}

async function assertPersistencePlanAndMockExecution() {
  const input = createOperationalInput();
  const candidate = assembleImmutableReportSnapshotCandidate(input, {
    requireAdminContext: true,
  });
  const plan = buildImmutablePersistencePlan(candidate, {
    adminContext: input.adminContext,
    persistenceTimestamp: WORKFLOW_TIMESTAMP,
  });

  assert.equal(plan.summary.recordCounts.reports, 1);
  assert.equal(plan.summary.recordCounts.snapshots, 1);
  assert.equal(plan.summary.recordCounts.sessions, 2);
  assert.equal(plan.summary.recordCounts.metrics, 6);
  assert.equal(plan.summary.destructiveUpdates, false);
  assert.equal(plan.summary.publicVisibility, false);

  const dbClient = createMockDbClient();
  const result = await persistImmutableSnapshotCandidate({
    dbClient,
    candidate,
    adminContext: input.adminContext,
    persistenceTimestamp: WORKFLOW_TIMESTAMP,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.insertedRowCounts, {
    reports: 1,
    snapshots: 1,
    metrics: 6,
    sessions: 2,
    auditLinks: 1,
  });
  assert.deepEqual(dbClient.calls.map((call) => call.table), [
    "cstp_reports",
    "cstp_report_snapshots",
    "cstp_report_metrics",
    "cstp_report_sessions",
    "cstp_report_audit_links",
  ]);
  assert.equal(
    dbClient.calls.every((call) => call.table.startsWith("cstp_report")),
    true
  );
  assert.equal(dbClient.realSupabaseCalls, 0);
  assert.equal(dbClient.rows.cstp_reports[0].created_at, WORKFLOW_TIMESTAMP);
  assert.equal(dbClient.rows.cstp_report_snapshots[0].generated_at, WORKFLOW_TIMESTAMP);
}

function assertLineageGovernance() {
  const report = createExistingReport();
  const snapshots = createExistingSnapshots();
  const duplicateActive = detectDuplicateActiveLineage([
    ...snapshots,
    {
      id: SNAPSHOT_TWO_ID,
      report_id: REPORT_ID,
      cstp_test_id: TEST_ID,
      snapshot_version: 2,
      status: "prepared",
    },
  ]);

  assert.equal(duplicateActive.ok, false);
  assert.equal(
    duplicateActive.issues.some((issue) => (
      issue.code === "CSTP_DUPLICATE_ACTIVE_SNAPSHOT_LINEAGE"
    )),
    true
  );

  const regenerationPlan = buildRegenerationPlan({
    report,
    snapshots,
    adminContext: createAdminContext(),
    regenerationTimestamp: WORKFLOW_TIMESTAMP,
    reason: "internal e2e smoke regeneration",
  });

  assert.equal(regenerationPlan.ok, true);
  assert.equal(regenerationPlan.nextSnapshotVersion, 2);
  assert.equal(regenerationPlan.supersessionRequired, true);
  assert.equal(regenerationPlan.immutableSafety.deletesHistoricalSnapshots, false);
  assert.equal(regenerationPlan.immutableSafety.destructiveReplacement, false);

  const successorCandidate = assembleImmutableReportSnapshotCandidate(createOperationalInput({
    existingReport: report,
    existingSnapshots: snapshots,
    snapshotId: SNAPSHOT_TWO_ID,
    snapshotVersion: 2,
    supersedesSnapshotId: SNAPSHOT_ONE_ID,
    status: "prepared",
    reportStatus: "prepared",
    preparedAt: WORKFLOW_TIMESTAMP,
  }), {
    requireAdminContext: true,
  });
  const supersessionPlan = buildSupersessionPlan({
    report,
    snapshots,
    targetSnapshotId: SNAPSHOT_ONE_ID,
    snapshotCandidate: successorCandidate,
    adminContext: createAdminContext(),
    supersessionTimestamp: WORKFLOW_TIMESTAMP,
    options: {
      reason: "internal e2e smoke supersession",
    },
  });

  assert.equal(supersessionPlan.ok, true);
  assert.equal(supersessionPlan.snapshotsToMarkSuperseded.length, 1);
  assert.equal(supersessionPlan.snapshotsToMarkSuperseded[0].id, SNAPSHOT_ONE_ID);
  assert.equal(supersessionPlan.immutableSafety.deletesHistoricalSnapshots, false);
  assert.equal(supersessionPlan.immutableSafety.destructiveReplacement, false);
}

async function assertUnifiedWorkflowModes() {
  const generateDeferred = await generateImmutableReportSnapshot(createOperationalInput());
  assert.equal(generateDeferred.ok, true);
  assert.equal(generateDeferred.workflowMode, "generate");
  assert.equal(generateDeferred.status, "candidate_generated");
  assert.equal(generateDeferred.generatedCandidate.snapshotRecord.status, "generated");
  assert.equal(generateDeferred.persistenceResultSummary, null);
  assert.equal(generateDeferred.safety.publicVisibility, false);
  assert.equal(generateDeferred.safety.renderingImplemented, false);
  assert.equal(generateDeferred.safety.certificationImplemented, false);

  const prepareDeferred = await prepareImmutableReportSnapshot(createOperationalInput({
    snapshotId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  }));
  assert.equal(prepareDeferred.ok, true);
  assert.equal(prepareDeferred.workflowMode, "prepare");
  assert.equal(prepareDeferred.generatedCandidate.snapshotRecord.status, "prepared");
  assert.equal(prepareDeferred.generatedCandidate.snapshotRecord.prepared_at, WORKFLOW_TIMESTAMP);

  const generatePersistedDb = createMockDbClient();
  const generatePersisted = await generateImmutableReportSnapshot(createOperationalInput({
    persist: true,
    dbClient: generatePersistedDb,
    snapshotId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  }));
  assert.equal(generatePersisted.ok, true);
  assert.equal(generatePersisted.status, "persisted");
  assert.deepEqual(generatePersisted.insertedRowCounts, {
    reports: 1,
    snapshots: 1,
    metrics: 6,
    sessions: 2,
    auditLinks: 1,
  });
  assert.equal(generatePersisted.generatedCandidate, null);
  assert.equal(generatePersistedDb.realSupabaseCalls, 0);

  const regenerateInput = createOperationalInput({
    existingReport: createExistingReport(),
    existingSnapshots: createExistingSnapshots(),
    snapshotId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
  });
  const regenerated = await regenerateImmutableReportSnapshot(regenerateInput);
  assert.equal(regenerated.ok, true);
  assert.equal(regenerated.workflowMode, "regenerate");
  assert.equal(regenerated.lineagePlanSummary.nextSnapshotVersion, 2);
  assert.equal(regenerated.lineagePlanSummary.supersessionRequired, true);
  assert.equal(
    regenerated.generatedCandidate.snapshotRecord.supersedes_snapshot_id,
    SNAPSHOT_ONE_ID
  );

  const supersedeDb = createMockDbClient();
  const superseded = await supersedeImmutableReportSnapshot({
    ...regenerateInput,
    dbClient: supersedeDb,
    persist: true,
    targetSnapshotId: SNAPSHOT_ONE_ID,
    snapshotId: "12345678-1234-4234-8234-123456789abc",
  });
  assert.equal(superseded.ok, true);
  assert.equal(superseded.workflowMode, "supersede");
  assert.equal(superseded.status, "persisted");
  assert.equal(superseded.lineagePlanSummary.actionType, "supersede_snapshot");
  assert.equal(superseded.lineagePlanSummary.snapshotsToMarkSuperseded, 1);
  assert.deepEqual(superseded.insertedRowCounts, {
    reports: 0,
    snapshots: 1,
    metrics: 6,
    sessions: 2,
    auditLinks: 1,
  });
  assert.deepEqual(supersedeDb.calls.map((call) => call.table), [
    "cstp_report_snapshots",
    "cstp_report_metrics",
    "cstp_report_sessions",
    "cstp_report_audit_links",
  ]);
}

function createOperationalInput(overrides = {}) {
  return {
    reportId: REPORT_ID,
    snapshotId: SNAPSHOT_TWO_ID,
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    generatedAt: WORKFLOW_TIMESTAMP,
    calculatedAt: WORKFLOW_TIMESTAMP,
    cstpRequest: {
      id: REQUEST_ID,
      source_id: SOURCE_ID,
      status: "approved",
      created_at: "2026-05-10T12:00:00.000Z",
    },
    cstpTest: {
      id: TEST_ID,
      request_id: REQUEST_ID,
      source_id: SOURCE_ID,
      status: "completed",
      started_at: "2026-05-10T13:00:00.000Z",
      completed_at: "2026-05-12T13:00:00.000Z",
    },
    cstpTestSessions: [
      {
        id: SESSION_B_ID,
        cstp_test_id: TEST_ID,
        grow_session_id: GROW_B_ID,
        kan_label: "KAN-B",
        included_in_report: true,
        created_at: "2026-05-10T15:00:00.000Z",
      },
      {
        id: SESSION_A_ID,
        cstp_test_id: TEST_ID,
        grow_session_id: GROW_A_ID,
        kan_label: "KAN-A",
        included_in_report: true,
        created_at: "2026-05-10T14:00:00.000Z",
      },
    ],
    growSessions: [
      {
        id: GROW_B_ID,
        status: "completed",
        started_at: "2026-05-10T15:00:00.000Z",
        completed_at: "2026-05-12T11:00:00.000Z",
      },
      {
        id: GROW_A_ID,
        status: "completed",
        started_at: "2026-05-10T14:00:00.000Z",
        completed_at: "2026-05-12T10:00:00.000Z",
      },
    ],
    source: {
      id: SOURCE_ID,
      name: "Internal Source",
      status: "active",
    },
    adminContext: createAdminContext(),
    auditEvents: [
      {
        id: ADMIN_EVENT_ID,
        event_type: "snapshot_generated",
        created_at: "2026-05-12T17:50:00.000Z",
      },
    ],
    metrics: {
      z_reviewed_session_count: {
        metric_value: 2,
        metric_type: "count",
        metric_unit: "sessions",
        calculated_at: WORKFLOW_TIMESTAMP,
      },
      alpha_internal_score: {
        metric_value: 95,
        metric_type: "count",
        metric_unit: "points",
        calculated_at: WORKFLOW_TIMESTAMP,
      },
    },
    ...overrides,
  };
}

function createExistingReport() {
  return {
    id: REPORT_ID,
    cstp_test_id: TEST_ID,
    cstp_request_id: REQUEST_ID,
    source_id: SOURCE_ID,
    current_snapshot_id: SNAPSHOT_ONE_ID,
    status: "published",
  };
}

function createExistingSnapshots() {
  return [
    {
      id: SNAPSHOT_ONE_ID,
      report_id: REPORT_ID,
      cstp_test_id: TEST_ID,
      cstp_request_id: REQUEST_ID,
      source_id: SOURCE_ID,
      snapshot_version: 1,
      status: "published",
      locked: true,
      frozen_report_payload: {
        internalOnly: true,
      },
      generated_at: "2026-05-11T14:00:00.000Z",
      prepared_at: "2026-05-11T14:30:00.000Z",
      published_at: "2026-05-11T15:00:00.000Z",
    },
  ];
}

function createAdminContext() {
  return {
    adminUserId: ADMIN_ID,
    cstpAdminEventId: ADMIN_EVENT_ID,
  };
}

function createMockDbClient() {
  const calls = [];
  const rows = {
    cstp_reports: [],
    cstp_report_snapshots: [],
    cstp_report_metrics: [],
    cstp_report_sessions: [],
    cstp_report_audit_links: [],
  };

  return {
    calls,
    rows,
    realSupabaseCalls: 0,
    async insert(table, records) {
      assert.equal(Object.prototype.hasOwnProperty.call(rows, table), true);
      const normalizedRecords = (Array.isArray(records) ? records : [records])
        .map((record, index) => ({
          ...record,
          id: record.id || `${table}-${calls.length + 1}-${index}`,
        }));

      calls.push({
        table,
        records: normalizedRecords.map((record) => ({ ...record })),
      });
      rows[table].push(...normalizedRecords);
      return normalizedRecords;
    },
  };
}

main().catch((error) => {
  console.error("CSTP immutable report end-to-end smoke checks failed.");
  console.error(error);
  process.exitCode = 1;
});
