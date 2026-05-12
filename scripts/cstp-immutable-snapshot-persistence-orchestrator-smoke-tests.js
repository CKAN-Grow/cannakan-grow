"use strict";

const assert = require("assert/strict");

const {
  assembleImmutableReportSnapshotCandidate,
} = require("../src/services/cstp/internal/immutable-snapshot-assembler");
const {
  buildImmutablePersistencePlan,
  persistImmutableSnapshotCandidate,
  validatePersistenceCandidateShape,
} = require("../src/services/cstp/internal/immutable-snapshot-persistence-orchestrator");

const REPORT_ID = "11111111-1111-4111-8111-111111111111";
const SNAPSHOT_ID = "22222222-2222-4222-8222-222222222222";
const REQUEST_ID = "33333333-3333-4333-8333-333333333333";
const TEST_ID = "44444444-4444-4444-8444-444444444444";
const SOURCE_ID = "55555555-5555-4555-8555-555555555555";
const ADMIN_ID = "66666666-6666-4666-8666-666666666666";
const PREVIOUS_SNAPSHOT_ID = "77777777-7777-4777-8777-777777777777";
const PERSISTENCE_TIMESTAMP = "2026-05-12T15:00:00.000Z";

function createOperationalInput() {
  return {
    reportId: REPORT_ID,
    snapshotId: SNAPSHOT_ID,
    reportStatus: "preparing",
    snapshotStatus: "generated",
    generatedAt: "2026-05-12T14:00:00.000Z",
    preparedAt: "2026-05-12T14:30:00.000Z",
    cstpRequest: {
      id: REQUEST_ID,
      source_id: SOURCE_ID,
      status: "approved",
      requested_at: "2026-05-10T12:00:00.000Z",
    },
    cstpTest: {
      id: TEST_ID,
      cstp_request_id: REQUEST_ID,
      status: "completed",
      started_at: "2026-05-10T13:00:00.000Z",
      completed_at: "2026-05-12T13:00:00.000Z",
      planned_kan_count: 2,
    },
    cstpTestSessions: [
      {
        id: "88888888-8888-4888-8888-888888888888",
        cstp_test_id: TEST_ID,
        grow_session_id: "99999999-9999-4999-8999-999999999999",
        kan_label: "KAN-B",
        included_in_report: true,
      },
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        cstp_test_id: TEST_ID,
        grow_session_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        kan_label: "KAN-A",
        included_in_report: true,
      },
    ],
    growSessions: [
      {
        id: "99999999-9999-4999-8999-999999999999",
        name: "Batch B",
        status: "completed",
        created_at: "2026-05-10T15:00:00.000Z",
        updated_at: "2026-05-12T10:00:00.000Z",
        germinated_count: 8,
        seed_count: 10,
        started_at: "2026-05-10T15:00:00.000Z",
        completed_at: "2026-05-12T10:00:00.000Z",
        environment: {
          humidity_percent: 62,
          temperature_f: 74,
        },
      },
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        name: "Batch A",
        status: "completed",
        created_at: "2026-05-10T14:00:00.000Z",
        updated_at: "2026-05-12T09:00:00.000Z",
        germinated_count: 9,
        seed_count: 10,
        started_at: "2026-05-10T14:00:00.000Z",
        completed_at: "2026-05-12T09:00:00.000Z",
        environment: {
          humidity_percent: 60,
          temperature_f: 73,
        },
      },
    ],
    source: {
      id: SOURCE_ID,
      name: "Internal Source",
      status: "active",
    },
    adminContext: {
      adminUserId: ADMIN_ID,
      role: "cstp_admin",
    },
    auditEvents: [
      {
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        event_type: "integrity_review",
        created_at: "2026-05-12T14:15:00.000Z",
      },
    ],
    existingSnapshots: [
      {
        id: PREVIOUS_SNAPSHOT_ID,
        report_id: REPORT_ID,
        snapshot_version: 1,
        status: "superseded",
      },
    ],
    metrics: {
      reviewed_session_count: {
        metric_value: 2,
        metric_type: "count",
        metric_unit: "sessions",
        calculated_at: "2026-05-12T14:00:00.000Z",
      },
    },
  };
}

function createMockDbClient() {
  const calls = [];

  return {
    calls,
    async insert(table, records, options) {
      const rows = Array.isArray(records) ? records : [records];
      calls.push({
        table,
        records: rows.map((row) => ({ ...row })),
        options,
      });

      return rows.map((row, index) => ({
        ...row,
        id: row.id || `${table}-${calls.length}-${index}`,
      }));
    },
  };
}

async function main() {
  const input = createOperationalInput();
  const candidate = assembleImmutableReportSnapshotCandidate(input);

  assert.equal(candidate.validation.ok, true);

  const originalCandidateJson = JSON.stringify(candidate);
  const shapeValidation = validatePersistenceCandidateShape(candidate, {
    adminContext: input.adminContext,
    persistenceTimestamp: PERSISTENCE_TIMESTAMP,
  });

  assert.equal(shapeValidation.ok, true);

  const plan = buildImmutablePersistencePlan(candidate, {
    adminContext: input.adminContext,
    persistenceTimestamp: PERSISTENCE_TIMESTAMP,
  });

  assert.equal(plan.summary.requiresCallerTransaction, true);
  assert.equal(plan.summary.destructiveUpdates, false);
  assert.equal(plan.summary.mutatesGrowSessions, false);
  assert.equal(plan.summary.publicVisibility, false);
  assert.equal(plan.summary.recordCounts.reports, 1);
  assert.equal(plan.summary.recordCounts.snapshots, 1);
  assert.equal(plan.summary.recordCounts.metrics, 5);
  assert.equal(plan.summary.recordCounts.sessions, 2);
  assert.equal(plan.summary.recordCounts.auditLinks, 1);
  assert.equal(plan.steps[0].table, "cstp_reports");
  assert.equal(
    Object.prototype.hasOwnProperty.call(plan.steps[0].records[0], "current_snapshot_id"),
    false
  );
  assert.equal(plan.steps[1].records[0].supersedes_snapshot_id, PREVIOUS_SNAPSHOT_ID);

  const dbClient = createMockDbClient();
  const result = await persistImmutableSnapshotCandidate({
    dbClient,
    candidate,
    adminContext: input.adminContext,
    persistenceTimestamp: PERSISTENCE_TIMESTAMP,
  });

  assert.equal(result.ok, true);
  assert.equal(result.reportId, REPORT_ID);
  assert.equal(result.snapshotId, SNAPSHOT_ID);
  assert.deepEqual(result.insertedRowCounts, {
    reports: 1,
    snapshots: 1,
    metrics: 5,
    sessions: 2,
    auditLinks: 1,
  });
  assert.deepEqual(
    dbClient.calls.map((call) => call.table),
    [
      "cstp_reports",
      "cstp_report_snapshots",
      "cstp_report_metrics",
      "cstp_report_sessions",
      "cstp_report_audit_links",
    ]
  );
  assert.equal(JSON.stringify(candidate), originalCandidateJson);

  const missingTimestampDbClient = createMockDbClient();
  const missingTimestampResult = await persistImmutableSnapshotCandidate({
    dbClient: missingTimestampDbClient,
    candidate,
    adminContext: input.adminContext,
  });

  assert.equal(missingTimestampResult.ok, false);
  assert.equal(missingTimestampDbClient.calls.length, 0);

  const missingAdminDbClient = createMockDbClient();
  const missingAdminResult = await persistImmutableSnapshotCandidate({
    dbClient: missingAdminDbClient,
    candidate,
    adminContext: {},
    persistenceTimestamp: PERSISTENCE_TIMESTAMP,
  });

  assert.equal(missingAdminResult.ok, false);
  assert.equal(missingAdminDbClient.calls.length, 0);

  console.log("CSTP immutable snapshot persistence orchestrator smoke checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
