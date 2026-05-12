"use strict";

const assert = require("assert/strict");

const {
  generateCstpReportForAdmin,
  inspectCstpReportLineageForAdmin,
  inspectCstpReportValidationForAdmin,
  prepareCstpReportForAdmin,
  regenerateCstpReportForAdmin,
  supersedeCstpReportForAdmin,
  validateAdminManagementInputs,
} = require("../src/services/cstp/internal/admin-report-management-service");
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
const WORKFLOW_TIMESTAMP = "2026-05-12T19:00:00.000Z";

async function main() {
  assertAdminPreflight();
  await assertAdminWorkflowWrappers();
  assertLineageInspection();
  assertValidationInspection();

  console.log("CSTP admin report management service smoke checks passed.");
}

function assertAdminPreflight() {
  const valid = validateAdminManagementInputs(createOperationalInput(), {
    action: "smoke_admin_action",
    requireOperationalData: true,
  });
  assert.equal(valid.ok, true);

  const invalid = validateAdminManagementInputs(createOperationalInput({
    adminContext: {
      anonymous: true,
    },
    workflowTimestamp: "",
  }), {
    action: "smoke_admin_action",
    requireOperationalData: true,
  });
  assert.equal(invalid.ok, false);
  assert.equal(
    invalid.issues.some((issue) => (
      issue.code === "CSTP_ADMIN_REPORT_ADMIN_CONTEXT_REQUIRED"
    )),
    true
  );
  assert.equal(
    invalid.issues.some((issue) => (
      issue.code === "CSTP_ADMIN_REPORT_PUBLIC_CONTEXT_REJECTED"
    )),
    true
  );
  assert.equal(
    invalid.issues.some((issue) => (
      issue.code === "CSTP_ADMIN_REPORT_TIMESTAMP_REQUIRED"
    )),
    true
  );
}

async function assertAdminWorkflowWrappers() {
  const generated = await generateCstpReportForAdmin(createOperationalInput());
  assert.equal(generated.ok, true);
  assert.equal(generated.adminAction, "generate_cstp_report_for_admin");
  assert.equal(generated.workflowMode, "generate");
  assert.equal(generated.workflowResult.generatedCandidate.snapshotRecord.status, "generated");
  assert.equal(generated.persistenceSummary, null);
  assert.equal(generated.safety.publicAccess, false);
  assert.equal(generated.safety.renderingImplemented, false);
  assert.equal(generated.safety.certificationImplemented, false);

  const prepared = await prepareCstpReportForAdmin(createOperationalInput({
    snapshotId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  }));
  assert.equal(prepared.ok, true);
  assert.equal(prepared.workflowMode, "prepare");
  assert.equal(prepared.workflowResult.generatedCandidate.snapshotRecord.status, "prepared");

  const dbClient = createMockDbClient();
  const persisted = await generateCstpReportForAdmin(createOperationalInput({
    dbClient,
    persist: true,
    snapshotId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  }));
  assert.equal(persisted.ok, true);
  assert.equal(persisted.status, "persisted");
  assert.deepEqual(persisted.persistenceSummary.insertedRowCounts, {
    reports: 1,
    snapshots: 1,
    metrics: 5,
    sessions: 1,
    auditLinks: 1,
  });
  assert.equal(dbClient.calls.length, 5);
  assert.equal(dbClient.realSupabaseCalls, 0);

  const missingDb = createMockDbClient();
  const rejectedBeforePersistence = await generateCstpReportForAdmin(createOperationalInput({
    dbClient: null,
    persist: true,
  }));
  assert.equal(rejectedBeforePersistence.ok, false);
  assert.equal(rejectedBeforePersistence.status, "admin_preflight_failed");
  assert.equal(missingDb.calls.length, 0);

  const lineageInput = createOperationalInput({
    existingReport: createExistingReport(),
    existingSnapshots: createExistingSnapshots(),
    snapshotId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  });
  const regenerated = await regenerateCstpReportForAdmin(lineageInput);
  assert.equal(regenerated.ok, true);
  assert.equal(regenerated.workflowMode, "regenerate");
  assert.equal(regenerated.lineageSummary.nextSnapshotVersion, 2);
  assert.equal(regenerated.lineageSummary.supersessionRequired, true);

  const supersedeDb = createMockDbClient();
  const superseded = await supersedeCstpReportForAdmin({
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

function assertLineageInspection() {
  const cleanLineage = inspectCstpReportLineageForAdmin({
    adminContext: createAdminContext(),
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    existingReport: createExistingReport(),
    existingSnapshots: createExistingSnapshots(),
  });
  assert.equal(cleanLineage.ok, true);
  assert.equal(cleanLineage.adminAction, "inspect_cstp_report_lineage_for_admin");
  assert.equal(cleanLineage.lineageSummary.currentSnapshotId, SNAPSHOT_ONE_ID);
  assert.equal(cleanLineage.lineageSummary.publicVisibility, false);

  const duplicateLineage = inspectCstpReportLineageForAdmin({
    adminContext: createAdminContext(),
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    existingReport: createExistingReport(),
    existingSnapshots: [
      ...createExistingSnapshots(),
      {
        id: SNAPSHOT_TWO_ID,
        report_id: REPORT_ID,
        cstp_test_id: TEST_ID,
        snapshot_version: 2,
        status: "prepared",
      },
    ],
  });
  assert.equal(duplicateLineage.ok, false);
  assert.equal(
    duplicateLineage.blockingErrors.some((issue) => (
      issue.code === "CSTP_DUPLICATE_ACTIVE_SNAPSHOT_LINEAGE"
    )),
    true
  );
}

function assertValidationInspection() {
  const candidate = assembleImmutableReportSnapshotCandidate(createOperationalInput(), {
    requireAdminContext: true,
  });
  const validInspection = inspectCstpReportValidationForAdmin({
    ...createOperationalInput(),
    candidate,
  });
  assert.equal(validInspection.ok, true);
  assert.equal(validInspection.adminAction, "inspect_cstp_report_validation_for_admin");

  const invalidInspection = inspectCstpReportValidationForAdmin({
    adminContext: createAdminContext(),
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    validationContext: {
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
      },
      cstpTest: {
        id: TEST_ID,
      },
      sessionLinks: [],
      growSessions: [],
      actor: {},
    },
    validationOptions: {
      requireReport: true,
      requireSnapshot: true,
      requireSessions: true,
      requireNonEmptyPayload: true,
      requireAdminContext: true,
    },
  });
  assert.equal(invalidInspection.ok, false);
  assert.equal(invalidInspection.validationSummary.blocking > 0, true);

  const persistedInspection = inspectCstpReportValidationForAdmin({
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
  assert.equal(persistedInspection.ok, true);
  assert.equal(persistedInspection.validationEvidenceSummary.metricCount, 1);

  const emptyPersistedInspection = inspectCstpReportValidationForAdmin({
    adminContext: createAdminContext(),
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    validationContext: {
      report: {},
      snapshot: {},
    },
    validationEvidenceSummary: {
      mode: "real_persisted_immutable_validation",
      persistedReportCount: 0,
      persistedSnapshotCount: 0,
      metricCount: 0,
      sessionEvidenceCount: 0,
      auditLinkCount: 0,
      emptyState: true,
      publicVisibility: false,
    },
  });
  assert.equal(emptyPersistedInspection.ok, true);
  assert.equal(
    emptyPersistedInspection.validation.issues.some((issue) => (
      issue.code === "CSTP_PERSISTED_REPORT_NOT_FOUND"
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
        created_at: "2026-05-12T18:50:00.000Z",
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
  console.error("CSTP admin report management service smoke checks failed.");
  console.error(error);
  process.exitCode = 1;
});
