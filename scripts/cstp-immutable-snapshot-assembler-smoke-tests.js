"use strict";

const assert = require("assert/strict");

const {
  assembleAuditLinkCandidates,
  assembleFrozenMetricPayload,
  assembleFrozenSessionSummaries,
  assembleImmutableReportSnapshotCandidate,
  assembleOperationalReferenceMap,
  normalizeSnapshotTimestamp,
  sortSnapshotSessionsStable,
} = require("../src/services/cstp/internal/immutable-snapshot-assembler");

const REPORT_ID = "11111111-1111-4111-8111-111111111111";
const SNAPSHOT_ID = "22222222-2222-4222-8222-222222222222";
const TEST_ID = "33333333-3333-4333-8333-333333333333";
const REQUEST_ID = "44444444-4444-4444-8444-444444444444";
const SOURCE_ID = "55555555-5555-4555-8555-555555555555";
const SESSION_LINK_A_ID = "66666666-6666-4666-8666-666666666661";
const SESSION_LINK_B_ID = "66666666-6666-4666-8666-666666666662";
const GROW_SESSION_A_ID = "77777777-7777-4777-8777-777777777771";
const GROW_SESSION_B_ID = "77777777-7777-4777-8777-777777777772";
const ADMIN_EVENT_ID = "88888888-8888-4888-8888-888888888888";

function run() {
  const input = buildAssemblyInput();
  const originalInputJson = JSON.stringify(input);

  assert.equal(
    normalizeSnapshotTimestamp("2026-05-12T10:00:00-04:00"),
    "2026-05-12T14:00:00.000Z",
  );
  assert.equal(normalizeSnapshotTimestamp(undefined), null);

  const sortedSessions = sortSnapshotSessionsStable(input.cstpTestSessions);
  assert.equal(sortedSessions[0].id, SESSION_LINK_B_ID);
  assert.equal(sortedSessions[1].id, SESSION_LINK_A_ID);

  const sessionSummaries = assembleFrozenSessionSummaries(input);
  assert.equal(sessionSummaries.length, 2);
  assert.equal(sessionSummaries[0].cstpTestSessionId, SESSION_LINK_B_ID);
  assert.equal(sessionSummaries[0].includedInReport, false);
  assert.equal(sessionSummaries[1].cstpTestSessionId, SESSION_LINK_A_ID);
  assert.equal(sessionSummaries[1].includedInReport, true);

  const metrics = assembleFrozenMetricPayload({
    ...input,
    sessionSummaries,
  });
  assert.deepEqual(
    metrics.map((metric) => metric.metricKey),
    [
      "custom_observed_rate",
      "grow_sessions_missing",
      "session_links_archived",
      "session_links_included",
      "session_links_total",
    ],
  );

  const referenceMap = assembleOperationalReferenceMap(input);
  assert.equal(referenceMap.cstpRequestId, REQUEST_ID);
  assert.equal(referenceMap.cstpTestId, TEST_ID);
  assert.equal(referenceMap.sourceId, SOURCE_ID);
  assert.deepEqual(referenceMap.cstpTestSessionIds, [
    SESSION_LINK_B_ID,
    SESSION_LINK_A_ID,
  ]);

  const auditLinks = assembleAuditLinkCandidates(input);
  assert.equal(auditLinks.length, 1);
  assert.equal(auditLinks[0].eventRole, "snapshot_generated");
  assert.equal(auditLinks[0].cstpAdminEventId, ADMIN_EVENT_ID);

  const candidate = assembleImmutableReportSnapshotCandidate(input, {
    requireAdminContext: true,
  });
  assert.equal(candidate.persisted, false);
  assert.equal(candidate.internalOnly, true);
  assert.equal(candidate.snapshotMetadata.snapshotVersion, 3);
  assert.equal(candidate.lineage.supersedesSnapshotId, "99999999-9999-4999-8999-999999999999");
  assert.equal(candidate.validation.ok, true);
  assert.equal(candidate.validation.summary.blocking, 0);
  assert.equal(candidate.snapshotRecord.frozen_report_payload.sessions.length, 2);
  assert.equal(candidate.frozenMetricPayload[0].metricKey, "custom_observed_rate");

  assert.equal(JSON.stringify(input), originalInputJson);

  console.log("CSTP immutable snapshot assembler smoke checks passed.");
}

function buildAssemblyInput() {
  return {
    reportId: REPORT_ID,
    snapshotId: SNAPSHOT_ID,
    snapshotVersion: 3,
    generatedAt: "2026-05-12T14:00:00.000Z",
    calculatedAt: "2026-05-12T14:05:00.000Z",
    reportSchemaVersion: "cstp_report_schema_v1",
    methodologyVersion: "cstp_method_v1",
    calculationVersion: "cstp_metric_calculation_v1",
    cstpRequest: {
      id: REQUEST_ID,
      source_id: SOURCE_ID,
      variety_name: "Example Variety",
      seed_type: "regular",
      breeder_name: "Example Breeder",
      batch_lot: "LOT-1",
      requested_seed_count: 20,
      status: "accepted",
      archived: false,
      created_at: "2026-05-01T12:00:00.000Z",
    },
    cstpTest: {
      id: TEST_ID,
      request_id: REQUEST_ID,
      source_id: SOURCE_ID,
      status: "completed",
      archived: false,
      started_at: "2026-05-02T12:00:00.000Z",
      completed_at: "2026-05-10T12:00:00.000Z",
    },
    source: {
      id: SOURCE_ID,
      name: "Example Source",
    },
    cstpTestSessions: [
      {
        id: SESSION_LINK_A_ID,
        cstp_test_id: TEST_ID,
        session_id: GROW_SESSION_A_ID,
        kan_label: "KAN-A",
        included_in_report: true,
        archived: false,
        created_at: "2026-05-03T12:00:00.000Z",
      },
      {
        id: SESSION_LINK_B_ID,
        cstp_test_id: TEST_ID,
        session_id: GROW_SESSION_B_ID,
        kan_label: "KAN-B",
        included_in_report: false,
        archived: true,
        created_at: "2026-05-03T11:00:00.000Z",
      },
    ],
    growSessions: [
      {
        id: GROW_SESSION_A_ID,
        status: "complete",
        stage: "complete",
        started_at: "2026-05-03T12:00:00.000Z",
      },
      {
        id: GROW_SESSION_B_ID,
        status: "archived",
        stage: "archived",
        started_at: "2026-05-03T11:00:00.000Z",
      },
    ],
    metrics: [
      {
        metricKey: "custom_observed_rate",
        metricType: "rate",
        metricUnit: "percent",
        metricValue: { value: 90 },
        numerator: 18,
        denominator: 20,
      },
    ],
    auditEvents: [
      {
        id: ADMIN_EVENT_ID,
        event_type: "snapshot_generated",
        admin_user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        created_at: "2026-05-12T14:00:00.000Z",
      },
    ],
    adminContext: {
      adminUserId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    },
    existingSnapshots: [
      {
        id: "99999999-9999-4999-8999-999999999999",
        report_id: REPORT_ID,
        cstp_test_id: TEST_ID,
        snapshot_version: 2,
        status: "superseded",
      },
    ],
  };
}

run();
