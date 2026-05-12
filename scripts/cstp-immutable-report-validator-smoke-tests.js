"use strict";

const assert = require("assert/strict");

const {
  VALIDATION_STATUSES,
  validateActiveSnapshotChainShape,
  validateAuditLinkConsistencyShape,
  validateDuplicateActiveLineageShape,
  validateFrozenPayloadPresence,
  validateImmutableReportSnapshotCandidate,
  validatePublicationReadinessShape,
  validateSupersessionSelfReference,
  validateTimestampOrdering,
} = require("../src/services/cstp/internal/immutable-report-validator");

const REPORT_ID = "11111111-1111-4111-8111-111111111111";
const SNAPSHOT_ID = "22222222-2222-4222-8222-222222222222";
const TEST_ID = "33333333-3333-4333-8333-333333333333";
const REQUEST_ID = "44444444-4444-4444-8444-444444444444";
const SOURCE_ID = "55555555-5555-4555-8555-555555555555";
const SESSION_LINK_ID = "66666666-6666-4666-8666-666666666666";
const GROW_SESSION_ID = "77777777-7777-4777-8777-777777777777";
const ADMIN_EVENT_ID = "88888888-8888-4888-8888-888888888888";

function run() {
  const validContext = buildValidPublicationContext();

  const candidateResult = validateImmutableReportSnapshotCandidate(validContext, {
    requireSnapshot: true,
    requireNonEmptyPayload: true,
  });
  assert.equal(candidateResult.status, VALIDATION_STATUSES.passed);
  assert.equal(candidateResult.ok, true);
  assert.equal(candidateResult.summary.blocking, 0);

  const publicationResult = validatePublicationReadinessShape(validContext, {
    requireAuditLink: true,
  });
  assert.equal(publicationResult.status, VALIDATION_STATUSES.passed);
  assert.equal(publicationResult.ok, true);

  const invalidTimestampResult = validateTimestampOrdering({
    generated_at: "2026-05-12T12:00:00.000Z",
    prepared_at: "2026-05-12T11:00:00.000Z",
  });
  assert.equal(invalidTimestampResult.status, VALIDATION_STATUSES.failed);
  assert.equal(
    invalidTimestampResult.issues[0].code,
    "CSTP_TIMESTAMP_ORDER_INVALID",
  );

  const missingPayloadResult = validateFrozenPayloadPresence({
    frozen_report_payload: {},
  });
  assert.equal(missingPayloadResult.status, VALIDATION_STATUSES.failed);
  assert.equal(
    missingPayloadResult.issues[0].code,
    "CSTP_FROZEN_PAYLOAD_EMPTY",
  );

  const selfReferenceResult = validateSupersessionSelfReference({
    id: SNAPSHOT_ID,
    supersedes_snapshot_id: SNAPSHOT_ID,
  });
  assert.equal(selfReferenceResult.status, VALIDATION_STATUSES.failed);
  assert.equal(
    selfReferenceResult.issues[0].code,
    "CSTP_SNAPSHOT_SUPERSEDES_SELF",
  );

  const duplicateActiveResult = validateDuplicateActiveLineageShape({
    snapshots: [
      {
        id: SNAPSHOT_ID,
        report_id: REPORT_ID,
        status: "prepared",
      },
      {
        id: "99999999-9999-4999-8999-999999999999",
        report_id: REPORT_ID,
        status: "published",
      },
    ],
  });
  assert.equal(duplicateActiveResult.status, VALIDATION_STATUSES.failed);
  assert.equal(
    duplicateActiveResult.issues[0].code,
    "CSTP_DUPLICATE_ACTIVE_SNAPSHOT_LINEAGE",
  );

  const activeChainResult = validateActiveSnapshotChainShape({
    report: {
      id: REPORT_ID,
      current_snapshot_id: SNAPSHOT_ID,
    },
    snapshots: [
      {
        id: SNAPSHOT_ID,
        report_id: REPORT_ID,
        status: "published",
      },
    ],
  });
  assert.equal(activeChainResult.ok, true);

  const auditLinkResult = validateAuditLinkConsistencyShape({
    report: {
      id: REPORT_ID,
    },
    snapshots: [
      {
        id: SNAPSHOT_ID,
        report_id: REPORT_ID,
      },
    ],
    auditLinks: [
      {
        report_id: REPORT_ID,
        snapshot_id: "99999999-9999-4999-8999-999999999999",
        created_by: ADMIN_EVENT_ID,
      },
    ],
  });
  assert.equal(auditLinkResult.ok, false);
  assert.equal(auditLinkResult.issues[0].code, "CSTP_AUDIT_LINK_SNAPSHOT_MISSING");

  console.log("CSTP immutable report validator smoke checks passed.");
}

function buildValidPublicationContext() {
  return {
    report: {
      id: REPORT_ID,
      cstp_test_id: TEST_ID,
      cstp_request_id: REQUEST_ID,
      source_id: SOURCE_ID,
      status: "prepared",
    },
    snapshot: {
      id: SNAPSHOT_ID,
      report_id: REPORT_ID,
      cstp_test_id: TEST_ID,
      cstp_request_id: REQUEST_ID,
      source_id: SOURCE_ID,
      snapshot_version: 1,
      status: "prepared",
      frozen_report_payload: {
        reportSchemaVersion: "cstp_report_schema_v1",
        summary: {
          cstpTestId: TEST_ID,
          sessionCount: 1,
        },
      },
      generated_at: "2026-05-12T10:00:00.000Z",
      prepared_at: "2026-05-12T11:00:00.000Z",
    },
    cstpTest: {
      id: TEST_ID,
      request_id: REQUEST_ID,
      source_id: SOURCE_ID,
      status: "completed",
    },
    cstpRequest: {
      id: REQUEST_ID,
      source_id: SOURCE_ID,
      status: "accepted",
    },
    source: {
      id: SOURCE_ID,
    },
    sessionLinks: [
      {
        id: SESSION_LINK_ID,
        cstp_test_id: TEST_ID,
        session_id: GROW_SESSION_ID,
        included_in_report: true,
      },
    ],
    growSessions: [
      {
        id: GROW_SESSION_ID,
      },
    ],
    adminEvent: {
      id: ADMIN_EVENT_ID,
      cstp_test_id: TEST_ID,
    },
    auditLinks: [
      {
        reportId: REPORT_ID,
        snapshotId: SNAPSHOT_ID,
        cstpAdminEventId: ADMIN_EVENT_ID,
      },
    ],
  };
}

run();
