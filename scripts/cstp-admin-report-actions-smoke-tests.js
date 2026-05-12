"use strict";

const assert = require("assert/strict");

const {
  generateCstpReportAction,
  inspectCstpReportLineageAction,
  inspectCstpReportValidationAction,
  listCstpReportsAction,
  prepareCstpReportAction,
  regenerateCstpReportAction,
  supersedeCstpReportAction,
  validateAdminActionContext,
} = require("../src/services/cstp/internal/admin-report-actions");
const {
  assembleImmutableReportSnapshotCandidate,
} = require("../src/services/cstp/internal/immutable-snapshot-assembler");

const REPORT_ID = "11111111-1111-4111-8111-111111111111";
const SNAPSHOT_ONE_ID = "22222222-2222-4222-8222-222222222222";
const SNAPSHOT_TWO_ID = "33333333-3333-4333-8333-333333333333";
const REQUEST_ID = "44444444-4444-4444-8444-444444444444";
const TEST_ID = "55555555-5555-4555-8555-555555555555";
const SOURCE_ID = "66666666-6666-4666-8666-666666666666";
const ADMIN_ID = "77777777-7777-4777-8777-777777777777";
const TEST_SESSION_ID = "88888888-8888-4888-8888-888888888888";
const GROW_SESSION_ID = "99999999-9999-4999-8999-999999999999";
const WORKFLOW_TIMESTAMP = "2026-05-12T20:00:00.000Z";

async function main() {
  assertAdminActionContextValidation();
  await assertDelegatedActionHandlers();
  await assertReadOnlyInspectionActions();
  assertListAction();

  console.log("CSTP admin report actions smoke checks passed.");
}

function assertAdminActionContextValidation() {
  const valid = validateAdminActionContext({
    adminContext: createAdminContext(),
    workflowTimestamp: WORKFLOW_TIMESTAMP,
  }, {
    actionName: "smoke_admin_action",
    workflowMode: "smoke",
  });
  assert.equal(valid.ok, true);

  const rejected = validateAdminActionContext({
    adminContext: {
      anonymous: true,
    },
    workflowTimestamp: "",
  }, {
    actionName: "smoke_admin_action",
    workflowMode: "smoke",
  });
  assert.equal(rejected.ok, false);
  assert.equal(
    rejected.issues.some((issue) => (
      issue.code === "CSTP_ADMIN_ACTION_ADMIN_CONTEXT_REQUIRED"
    )),
    true
  );
  assert.equal(
    rejected.issues.some((issue) => (
      issue.code === "CSTP_ADMIN_ACTION_PUBLIC_CONTEXT_REJECTED"
    )),
    true
  );
  assert.equal(
    rejected.issues.some((issue) => (
      issue.code === "CSTP_ADMIN_ACTION_TIMESTAMP_REQUIRED"
    )),
    true
  );
}

async function assertDelegatedActionHandlers() {
  const generated = await generateCstpReportAction(createOperationalInput());
  assert.equal(generated.ok, true);
  assert.equal(generated.adminAction, "generate_cstp_report_for_admin");
  assert.equal(generated.workflowMode, "generate");
  assert.equal(generated.serviceResult.workflowResult.generatedCandidate.snapshotRecord.status, "generated");
  assert.equal(generated.persistenceSummary, null);
  assert.equal(generated.safety.publicApi, false);
  assert.equal(generated.safety.renderingImplemented, false);
  assert.equal(generated.safety.certificationImplemented, false);

  const prepared = await prepareCstpReportAction(createOperationalInput({
    snapshotId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  }));
  assert.equal(prepared.ok, true);
  assert.equal(prepared.workflowMode, "prepare");
  assert.equal(prepared.serviceResult.workflowResult.generatedCandidate.snapshotRecord.status, "prepared");

  const dbClient = createMockDbClient();
  const persisted = await generateCstpReportAction(createOperationalInput({
    dbClient,
    persist: true,
    snapshotId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  }));
  assert.equal(persisted.ok, true);
  assert.equal(persisted.status, "persisted");
  assert.equal(dbClient.calls.length, 5);
  assert.equal(dbClient.realSupabaseCalls, 0);
  assert.equal(persisted.persistenceSummary.insertedRowCounts.reports, 1);

  const publicRejected = await generateCstpReportAction(createOperationalInput({
    adminContext: {
      adminUserId: ADMIN_ID,
      public: true,
    },
  }));
  assert.equal(publicRejected.ok, false);
  assert.equal(publicRejected.status, "admin_action_preflight_failed");
  assert.equal(
    publicRejected.blockingErrors.some((issue) => (
      issue.code === "CSTP_ADMIN_ACTION_PUBLIC_CONTEXT_REJECTED"
    )),
    true
  );

  const lineageInput = createOperationalInput({
    existingReport: createExistingReport(),
    existingSnapshots: createExistingSnapshots(),
    snapshotId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  });
  const regenerated = await regenerateCstpReportAction(lineageInput);
  assert.equal(regenerated.ok, true);
  assert.equal(regenerated.workflowMode, "regenerate");
  assert.equal(regenerated.lineageSummary.nextSnapshotVersion, 2);

  const supersedeDb = createMockDbClient();
  const superseded = await supersedeCstpReportAction({
    ...lineageInput,
    dbClient: supersedeDb,
    persist: true,
    targetSnapshotId: SNAPSHOT_ONE_ID,
    snapshotId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  });
  assert.equal(superseded.ok, false);
  assert.equal(superseded.workflowMode, "supersede");
  assert.equal(superseded.status, "admin_preflight_failed");
  assert.equal(supersedeDb.calls.length, 0);
  assert.equal(
    superseded.blockingErrors.some((issue) => (
      issue.code === "CSTP_ADMIN_REPORT_REGENERATE_SUPERSEDE_PERSISTENCE_DEFERRED"
    )),
    true
  );
}

async function assertReadOnlyInspectionActions() {
  const lineage = await inspectCstpReportLineageAction({
    adminContext: createAdminContext(),
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    existingReport: createExistingReport(),
    existingSnapshots: createExistingSnapshots(),
  });
  assert.equal(lineage.ok, true);
  assert.equal(lineage.adminAction, "inspect_cstp_report_lineage_for_admin");
  assert.equal(lineage.workflowMode, "inspect_lineage");
  assert.equal(lineage.lineageSummary.publicVisibility, false);

  const candidate = assembleImmutableReportSnapshotCandidate(createOperationalInput(), {
    requireAdminContext: true,
  });
  const validation = await inspectCstpReportValidationAction({
    ...createOperationalInput(),
    candidate,
  });
  assert.equal(validation.ok, true);
  assert.equal(validation.adminAction, "inspect_cstp_report_validation_for_admin");
  assert.equal(validation.workflowMode, "inspect_validation");

  const persistedValidation = await inspectCstpReportValidationAction({
    ...createOperationalInput(),
    validationContext: {
      report: createExistingReport(),
      snapshot: createExistingSnapshots()[0],
      snapshots: createExistingSnapshots(),
      cstpRequest: createOperationalInput().cstpRequest,
      cstpTest: createOperationalInput().cstpTest,
      source: createOperationalInput().source,
      sessionLinks: createOperationalInput().cstpTestSessions,
      growSessions: createOperationalInput().growSessions,
      auditLinks: [
        {
          id: "abababab-abab-4aba-8aba-abababababab",
          report_id: REPORT_ID,
          snapshot_id: SNAPSHOT_ONE_ID,
          created_by: ADMIN_ID,
          event_role: "snapshot_published",
        },
      ],
      actor: createAdminContext(),
    },
    validationOptions: {
      mode: "persisted_immutable_validation_inspection",
      requireReport: true,
      requireSnapshot: true,
      requireSessions: true,
      requireAdminContext: true,
      requireNonEmptyPayload: true,
      requirePublicationReadiness: true,
      requireAuditLink: true,
    },
    validationEvidenceSummary: {
      mode: "real_persisted_immutable_validation",
      persistedReportCount: 1,
      persistedSnapshotCount: 1,
      metricCount: 1,
      sessionEvidenceCount: 1,
      auditLinkCount: 1,
      reportId: REPORT_ID,
      snapshotId: SNAPSHOT_ONE_ID,
      publicVisibility: false,
    },
  });
  assert.equal(persistedValidation.ok, true);
  assert.equal(persistedValidation.validationEvidenceSummary.auditLinkCount, 1);
}

function assertListAction() {
  const listed = listCstpReportsAction({
    adminContext: createAdminContext(),
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    cstpRequestId: REQUEST_ID,
    reports: [
      createExistingReport(),
      {
        id: "aaaaaaaa-1111-4111-8111-111111111111",
        cstp_request_id: "bbbbbbbb-1111-4111-8111-111111111111",
        cstp_test_id: "cccccccc-1111-4111-8111-111111111111",
        status: "prepared",
      },
    ],
    snapshots: createExistingSnapshots(),
  });
  assert.equal(listed.ok, true);
  assert.equal(listed.adminAction, "list_cstp_reports_for_admin");
  assert.equal(listed.workflowMode, "list_internal_reports");
  assert.equal(listed.serviceResult.resultCount, 1);
  assert.equal(listed.lineageSummary.publicVisibility, false);

  const missingScope = listCstpReportsAction({
    adminContext: createAdminContext(),
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    reports: [createExistingReport()],
  });
  assert.equal(missingScope.ok, false);
  assert.equal(
    missingScope.blockingErrors.some((issue) => (
      issue.code === "CSTP_ADMIN_ACTION_LIST_SCOPE_REQUIRED"
    )),
    true
  );
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
    },
    cstpTest: {
      id: TEST_ID,
      request_id: REQUEST_ID,
      source_id: SOURCE_ID,
      status: "completed",
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
      },
    ],
    source: {
      id: SOURCE_ID,
      name: "Internal Source",
    },
    adminContext: createAdminContext(),
    auditEvents: [
      {
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        event_type: "snapshot_generated",
        created_at: "2026-05-12T19:50:00.000Z",
      },
    ],
    metrics: {
      reviewed_session_count: {
        metric_value: 1,
        metric_type: "count",
        metric_unit: "sessions",
        calculated_at: WORKFLOW_TIMESTAMP,
      },
    },
    ...overrides,
  };
}

function createAdminContext() {
  return {
    adminUserId: ADMIN_ID,
    cstpAdminEventId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
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
  console.error("CSTP admin report actions smoke checks failed.");
  console.error(error);
  process.exitCode = 1;
});
