"use strict";

const assert = require("assert/strict");

const {
  buildImmutableReportWorkflowPlan,
  generateImmutableReportSnapshot,
  prepareImmutableReportSnapshot,
  regenerateImmutableReportSnapshot,
  supersedeImmutableReportSnapshot,
  validateImmutableReportWorkflowInputs,
} = require("../src/services/cstp/internal/immutable-report-orchestrator");

const REPORT_ID = "11111111-1111-4111-8111-111111111111";
const SNAPSHOT_ONE_ID = "22222222-2222-4222-8222-222222222222";
const SNAPSHOT_TWO_ID = "33333333-3333-4333-8333-333333333333";
const REQUEST_ID = "44444444-4444-4444-8444-444444444444";
const TEST_ID = "55555555-5555-4555-8555-555555555555";
const SOURCE_ID = "66666666-6666-4666-8666-666666666666";
const ADMIN_ID = "77777777-7777-4777-8777-777777777777";
const TEST_SESSION_ID = "88888888-8888-4888-8888-888888888888";
const GROW_SESSION_ID = "99999999-9999-4999-8999-999999999999";
const WORKFLOW_TIMESTAMP = "2026-05-12T17:00:00.000Z";

function createBaseInput(overrides = {}) {
  return {
    reportId: REPORT_ID,
    snapshotId: SNAPSHOT_TWO_ID,
    workflowTimestamp: WORKFLOW_TIMESTAMP,
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
        id: TEST_SESSION_ID,
        cstp_test_id: TEST_ID,
        grow_session_id: GROW_SESSION_ID,
        kan_label: "KAN-A",
        included_in_report: true,
        created_at: "2026-05-10T14:00:00.000Z",
      },
    ],
    growSessions: [
      {
        id: GROW_SESSION_ID,
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
    adminContext: {
      adminUserId: ADMIN_ID,
      cstpAdminEventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    },
    auditEvents: [
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        event_type: "snapshot_generated",
        created_at: "2026-05-12T16:50:00.000Z",
      },
    ],
    metrics: {
      reviewed_session_count: {
        metric_value: 1,
        metric_type: "count",
        metric_unit: "sessions",
        calculated_at: "2026-05-12T16:55:00.000Z",
      },
    },
    ...overrides,
  };
}

function createExistingReport() {
  return {
    id: REPORT_ID,
    cstp_test_id: TEST_ID,
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

function createMockDbClient() {
  const calls = [];

  return {
    calls,
    async insert(table, records) {
      const rows = Array.isArray(records) ? records : [records];
      calls.push({
        table,
        records: rows.map((record) => ({ ...record })),
      });

      return rows.map((record, index) => ({
        ...record,
        id: record.id || `${table}-${calls.length}-${index}`,
      }));
    },
  };
}

async function main() {
  const generateInput = createBaseInput();
  const inputValidation = validateImmutableReportWorkflowInputs(generateInput, {
    mode: "generate",
  });
  assert.equal(inputValidation.ok, true);

  const workflowPlan = buildImmutableReportWorkflowPlan(generateInput, {
    mode: "generate",
  });
  assert.equal(workflowPlan.ok, true);
  assert.equal(workflowPlan.workflowMode, "generate");
  assert.equal(workflowPlan.assemblyPlanSummary.status, "generated");
  assert.equal(workflowPlan.safety.publicVisibility, false);

  const generated = await generateImmutableReportSnapshot(generateInput);
  assert.equal(generated.ok, true);
  assert.equal(generated.workflowMode, "generate");
  assert.equal(generated.status, "candidate_generated");
  assert.equal(generated.generatedCandidate.snapshotRecord.status, "generated");
  assert.equal(generated.persistenceResultSummary, null);
  assert.equal(generated.safety.mutatesGrowSessions, false);

  const prepared = await prepareImmutableReportSnapshot(createBaseInput({
    snapshotId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  }));
  assert.equal(prepared.ok, true);
  assert.equal(prepared.workflowMode, "prepare");
  assert.equal(prepared.generatedCandidate.snapshotRecord.status, "prepared");
  assert.equal(prepared.generatedCandidate.snapshotRecord.prepared_at, WORKFLOW_TIMESTAMP);

  const regenerateInput = createBaseInput({
    snapshotId: SNAPSHOT_TWO_ID,
    existingReport: createExistingReport(),
    existingSnapshots: createExistingSnapshots(),
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
  assert.equal(regenerated.generatedCandidate.snapshotRecord.status, "generated");

  const dbClient = createMockDbClient();
  const superseded = await supersedeImmutableReportSnapshot({
    ...regenerateInput,
    persist: true,
    dbClient,
    targetSnapshotId: SNAPSHOT_ONE_ID,
  });
  assert.equal(superseded.ok, true);
  assert.equal(superseded.workflowMode, "supersede");
  assert.equal(superseded.status, "persisted");
  assert.equal(superseded.generatedCandidate, null);
  assert.equal(superseded.lineagePlanSummary.actionType, "supersede_snapshot");
  assert.equal(superseded.lineagePlanSummary.snapshotsToMarkSuperseded, 1);
  assert.deepEqual(superseded.insertedRowCounts, {
    reports: 0,
    snapshots: 1,
    metrics: 5,
    sessions: 1,
    auditLinks: 1,
  });
  assert.deepEqual(
    dbClient.calls.map((call) => call.table),
    [
      "cstp_report_snapshots",
      "cstp_report_metrics",
      "cstp_report_sessions",
      "cstp_report_audit_links",
    ]
  );

  const invalid = await generateImmutableReportSnapshot(createBaseInput({
    workflowTimestamp: "",
    adminContext: {},
  }));
  assert.equal(invalid.ok, false);
  assert.equal(invalid.status, "workflow_validation_failed");

  console.log("CSTP immutable report orchestrator smoke checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
