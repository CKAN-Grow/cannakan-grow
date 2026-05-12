"use strict";

const assert = require("assert/strict");

const {
  REPORT_ROUTE_DEFINITIONS,
  handleCstpReportGenerateRoute,
  handleCstpReportLineageRoute,
  handleCstpReportPrepareRoute,
  handleCstpReportRegenerateRoute,
  handleCstpReportSupersedeRoute,
  handleCstpReportValidationRoute,
  handleCstpReportsListRoute,
  loadCstpAdminReportData,
  loadImmutableReportLineage,
  loadImmutableValidationContext,
} = require("../src/services/cstp/internal/admin-report-route-handlers");
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
const WORKFLOW_TIMESTAMP = "2026-05-12T21:00:00.000Z";

async function main() {
  await assertAuthorizationGate();
  await assertWorkflowRoutes();
  await assertRealOperationalLoaderShadowMode();
  await assertRealImmutableLineageLoader();
  await assertRealImmutableValidationLoader();
  await assertReadOnlyRoutes();
  await assertPublicContextRejection();
  await assertApiWrappersLoad();

  console.log("CSTP admin report route/action smoke checks passed.");
}

async function assertAuthorizationGate() {
  let dataLoaderCalled = false;
  const response = createMockResponse();

  await handleCstpReportGenerateRoute(
    createMockRequest({
      method: "POST",
      headers: {},
      body: createRouteBody(),
    }),
    response,
    {
      dataLoader: async () => {
        dataLoaderCalled = true;
        return createLoadedWorkflowData();
      },
    },
  );

  assert.equal(response.statusCode, 401);
  assert.equal(response.payload.ok, false);
  assert.equal(response.payload.status, "cstp_admin_auth_missing");
  assert.equal(dataLoaderCalled, false);
}

async function assertWorkflowRoutes() {
  const prepare = await invokeRoute(handleCstpReportPrepareRoute, {
    body: createRouteBody({
      snapshotId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    }),
  });
  assert.equal(prepare.statusCode, 200);
  assert.equal(prepare.payload.ok, true);
  assert.equal(prepare.payload.workflowMode, "prepare");
  assert.equal(prepare.payload.routeSafety.publicAccess, false);

  const generate = await invokeRoute(handleCstpReportGenerateRoute, {
    body: createRouteBody(),
  });
  assert.equal(generate.statusCode, 200);
  assert.equal(generate.payload.ok, true);
  assert.equal(generate.payload.actionName, "generate_cstp_report_for_admin");
  assert.equal(generate.payload.routeSafety.renderingImplemented, false);
  assert.equal(generate.payload.routeSafety.certificationImplemented, false);

  const unsafePersistence = await invokeRoute(handleCstpReportGenerateRoute, {
    body: createRouteBody({
      persist: true,
      snapshotId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    }),
  });
  assert.equal(unsafePersistence.statusCode, 400);
  assert.equal(
    unsafePersistence.payload.code,
    "CSTP_ADMIN_REPORT_GENERATE_PERSISTENCE_NOT_ALLOWED",
  );

  const dbClient = createMockDbClient();
  const liveGenerate = await invokeRoute(handleCstpReportGenerateRoute, {
    body: createRouteBody({
      persist: true,
      persistenceMode: "live_guarded",
      reportId: "",
      snapshotId: "",
    }),
    routeOptions: {
      dbClient,
    },
  });
  assert.equal(liveGenerate.statusCode, 200, JSON.stringify(liveGenerate.payload));
  assert.equal(liveGenerate.payload.ok, true);
  assert.equal(
    liveGenerate.payload.serviceResult.workflowResult.workflowPlanSummary.persist,
    true,
  );
  assert.equal(liveGenerate.payload.operationalLoadingSummary.persistenceRequested, true);
  assert.equal(liveGenerate.payload.operationalLoadingSummary.persistenceEffective, true);
  assert.equal(liveGenerate.payload.routeSafety.guardedGeneratePersistence, true);
  assert.equal(liveGenerate.payload.persistenceSummary.insertedRowCounts.reports, 1);
  assert.deepEqual(dbClient.calls.map((call) => call.table), [
    "cstp_reports",
    "cstp_report_snapshots",
    "cstp_report_metrics",
    "cstp_report_sessions",
    "cstp_report_audit_links",
  ]);
  assert.equal(dbClient.realSupabaseCalls, 0);

  const incompleteOperationalData = await invokeRoute(handleCstpReportGenerateRoute, {
    body: createRouteBody({
      persist: true,
      persistenceMode: "live_guarded",
    }),
    loadedData: createLoadedWorkflowData({
      cstpTestSessions: [],
      growSessions: [],
    }),
  });
  assert.equal(incompleteOperationalData.statusCode, 400);
  assert.equal(
    incompleteOperationalData.payload.code,
    "CSTP_ADMIN_REPORT_PERSISTENCE_SESSIONS_REQUIRED",
  );

  const existingLineageConflict = await invokeRoute(handleCstpReportGenerateRoute, {
    body: createRouteBody({
      persist: true,
      persistenceMode: "live_guarded",
    }),
    loadedData: createLoadedWorkflowData({
      existingReport: createExistingReport(),
      existingSnapshots: createExistingSnapshots(),
    }),
  });
  assert.equal(existingLineageConflict.statusCode, 400);
  assert.equal(
    existingLineageConflict.payload.code,
    "CSTP_ADMIN_REPORT_GENERATE_CONFLICT",
  );

  const lineageInput = createRouteBody({
    existingReport: createExistingReport(),
    existingSnapshots: createExistingSnapshots(),
    snapshotId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  });
  const regenerated = await invokeRoute(handleCstpReportRegenerateRoute, {
    body: lineageInput,
    loadedData: createLoadedWorkflowData({
      existingReport: createExistingReport(),
      existingSnapshots: createExistingSnapshots(),
    }),
  });
  assert.equal(regenerated.statusCode, 200);
  assert.equal(regenerated.payload.workflowMode, "regenerate");
  assert.equal(regenerated.payload.lineageSummary.nextSnapshotVersion, 2);

  const regeneratePersistRejected = await invokeRoute(handleCstpReportRegenerateRoute, {
    body: {
      ...lineageInput,
      persist: true,
      persistenceMode: "live_guarded",
    },
    loadedData: createLoadedWorkflowData({
      existingReport: createExistingReport(),
      existingSnapshots: createExistingSnapshots(),
    }),
  });
  assert.equal(regeneratePersistRejected.statusCode, 400);
  assert.equal(
    regeneratePersistRejected.payload.code,
    "CSTP_ADMIN_REPORT_PERSISTENCE_WORKFLOW_REJECTED",
  );

  const superseded = await invokeRoute(handleCstpReportSupersedeRoute, {
    body: {
      ...lineageInput,
      targetSnapshotId: SNAPSHOT_ONE_ID,
      snapshotId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    },
    loadedData: createLoadedWorkflowData({
      existingReport: createExistingReport(),
      existingSnapshots: createExistingSnapshots(),
    }),
  });
  assert.equal(superseded.statusCode, 200);
  assert.equal(superseded.payload.workflowMode, "supersede");
  assert.equal(superseded.payload.lineageSummary.actionType, "supersede_snapshot");

  const supersedePersistRejected = await invokeRoute(handleCstpReportSupersedeRoute, {
    body: {
      ...lineageInput,
      persist: true,
      persistenceMode: "live_guarded",
      targetSnapshotId: SNAPSHOT_ONE_ID,
    },
    loadedData: createLoadedWorkflowData({
      existingReport: createExistingReport(),
      existingSnapshots: createExistingSnapshots(),
    }),
  });
  assert.equal(supersedePersistRejected.statusCode, 400);
  assert.equal(
    supersedePersistRejected.payload.code,
    "CSTP_ADMIN_REPORT_PERSISTENCE_WORKFLOW_REJECTED",
  );
}

async function assertRealOperationalLoaderShadowMode() {
  const loaded = await loadCstpAdminReportData({
    definition: REPORT_ROUTE_DEFINITIONS.generate,
    payload: createRouteBody({
      cstpRequestId: REQUEST_ID,
      cstpTestId: TEST_ID,
      persist: true,
    }),
    options: {
      config: {
        supabaseUrl: "https://example.supabase.co",
        supabaseServiceRoleKey: "service-role-key",
      },
      fetchImpl: createOperationalLoaderFetch(),
    },
  });

  assert.equal(loaded.cstpRequest.id, REQUEST_ID);
  assert.equal(loaded.cstpTest.id, TEST_ID);
  assert.equal(loaded.cstpTestSessions.length, 1);
  assert.equal(loaded.cstpTestSessions[0].session_id, GROW_SESSION_ID);
  assert.equal(loaded.cstpTestSessions[0].grow_session_id, GROW_SESSION_ID);
  assert.equal(loaded.growSessions.length, 1);
  assert.equal(loaded.source.id, SOURCE_ID);
}

async function assertRealImmutableLineageLoader() {
  const loaded = await loadImmutableReportLineage({
    context: {
      reportId: REPORT_ID,
    },
    config: {
      supabaseUrl: "https://example.supabase.co",
      supabaseServiceRoleKey: "service-role-key",
    },
    fetchImpl: createOperationalLoaderFetch(),
  });

  assert.equal(loaded.existingReport.id, REPORT_ID);
  assert.equal(loaded.existingSnapshots.length, 2);
  assert.equal(loaded.immutableLineageSummary.snapshotCount, 2);
  assert.equal(loaded.immutableLineageSummary.activeSnapshotId, SNAPSHOT_TWO_ID);
  assert.equal(loaded.immutableLineageSummary.activeSnapshotVersion, 2);
  assert.equal(loaded.immutableLineageSummary.supersededSnapshotCount, 1);
  assert.equal(loaded.immutableLineageSummary.metricCount, 2);
  assert.equal(loaded.immutableLineageSummary.sessionCount, 2);
  assert.equal(loaded.immutableLineageSummary.publicVisibility, false);
}

async function assertRealImmutableValidationLoader() {
  const loaded = await loadCstpAdminReportData({
    definition: REPORT_ROUTE_DEFINITIONS.inspectValidation,
    payload: createRouteBody({
      cstpRequestId: REQUEST_ID,
      cstpTestId: TEST_ID,
    }),
    options: {
      config: {
        supabaseUrl: "https://example.supabase.co",
        supabaseServiceRoleKey: "service-role-key",
      },
      fetchImpl: createOperationalLoaderFetch(),
    },
  });

  assert.equal(loaded.validationContext.report.id, REPORT_ID);
  assert.equal(loaded.validationContext.snapshot.id, SNAPSHOT_TWO_ID);
  assert.equal(loaded.validationEvidenceSummary.mode, "real_persisted_immutable_validation");
  assert.equal(loaded.validationEvidenceSummary.persistedReportCount, 1);
  assert.equal(loaded.validationEvidenceSummary.persistedSnapshotCount, 2);
  assert.equal(loaded.validationEvidenceSummary.metricCount, 2);
  assert.equal(loaded.validationEvidenceSummary.sessionEvidenceCount, 2);
  assert.equal(loaded.validationEvidenceSummary.auditLinkCount, 1);
  assert.equal(loaded.validationEvidenceSummary.publicVisibility, false);

  const direct = await loadImmutableValidationContext({
    context: {
      cstpTestId: TEST_ID,
    },
    operationalContext: loaded,
    adminContext: createAdminContext(),
    config: {
      supabaseUrl: "https://example.supabase.co",
      supabaseServiceRoleKey: "service-role-key",
    },
    fetchImpl: createOperationalLoaderFetch(),
  });
  assert.equal(direct.validationOptions.requirePublicationReadiness, true);
  assert.equal(direct.evidenceSummary.immutableSnapshotsPubliclyVisible, false);

  const empty = await loadCstpAdminReportData({
    definition: REPORT_ROUTE_DEFINITIONS.inspectValidation,
    payload: createRouteBody({
      reportId: "",
      cstpRequestId: "",
      cstpTestId: "aaaaaaaa-1111-4111-8111-111111111111",
    }),
    options: {
      config: {
        supabaseUrl: "https://example.supabase.co",
        supabaseServiceRoleKey: "service-role-key",
      },
      fetchImpl: createOperationalLoaderFetch(),
    },
  });
  assert.equal(empty.validationEvidenceSummary.emptyState, true);
  assert.equal(empty.validationEvidenceSummary.persistedReportCount, 0);
}

async function assertReadOnlyRoutes() {
  const lineage = await invokeRoute(handleCstpReportLineageRoute, {
    method: "GET",
    query: {
      reportId: REPORT_ID,
      workflowTimestamp: WORKFLOW_TIMESTAMP,
    },
    loadedData: {
      existingReport: createExistingReport(),
      existingSnapshots: createExistingSnapshots(),
    },
  });
  assert.equal(lineage.statusCode, 200);
  assert.equal(lineage.payload.workflowMode, "inspect_lineage");
  assert.equal(lineage.payload.lineageSummary.publicVisibility, false);
  assert.equal(lineage.payload.lineageSummary.timelineSummary.entryCount, 1);
  assert.equal(
    lineage.payload.lineageSummary.timelineSummary.labels[0],
    "Internal-only immutable report history",
  );

  const emptyLineage = await invokeRoute(handleCstpReportLineageRoute, {
    method: "GET",
    query: {
      cstpTestId: TEST_ID,
      workflowTimestamp: WORKFLOW_TIMESTAMP,
    },
    loadedData: {
      existingReport: null,
      existingSnapshots: [],
      immutableLineageSummary: {
        mode: "real_persisted_immutable_lineage",
        snapshotCount: 0,
        chain: [],
        internalOnly: true,
        publicVisibility: false,
      },
    },
  });
  assert.equal(emptyLineage.statusCode, 200);
  assert.equal(emptyLineage.payload.lineageSummary.snapshotCount, 0);

  const duplicateActive = await invokeRoute(handleCstpReportLineageRoute, {
    method: "GET",
    query: {
      reportId: REPORT_ID,
      workflowTimestamp: WORKFLOW_TIMESTAMP,
    },
    loadedData: {
      existingReport: createExistingReport(),
      existingSnapshots: [
        createExistingSnapshots()[0],
        {
          ...createExistingSnapshots()[0],
          id: SNAPSHOT_TWO_ID,
          snapshot_version: 2,
        },
      ],
    },
  });
  assert.equal(duplicateActive.statusCode, 400);
  assert.equal(duplicateActive.payload.lineageSummary.duplicateActiveLineage, true);

  const candidate = assembleImmutableReportSnapshotCandidate(
    createOperationalInput(),
    { requireAdminContext: true },
  );
  const validation = await invokeRoute(handleCstpReportValidationRoute, {
    body: createRouteBody({
      candidate,
    }),
    loadedData: createLoadedWorkflowData(),
  });
  assert.equal(validation.statusCode, 200);
  assert.equal(validation.payload.workflowMode, "inspect_validation");

  const persistedValidation = await invokeRoute(handleCstpReportValidationRoute, {
    body: createRouteBody({
      cstpRequestId: REQUEST_ID,
      cstpTestId: TEST_ID,
    }),
    loadedData: {
      ...createLoadedWorkflowData({
        existingReport: createPersistedLineageReport(),
        existingSnapshots: createPersistedLineageSnapshots(),
      }),
      validationContext: {
        report: createPersistedLineageReport(),
        snapshot: createPersistedLineageSnapshots()[1],
        snapshots: createPersistedLineageSnapshots(),
        cstpRequest: createLoadedWorkflowData().cstpRequest,
        cstpTest: createLoadedWorkflowData().cstpTest,
        source: createLoadedWorkflowData().source,
        sessionLinks: createLoadedWorkflowData().cstpTestSessions,
        growSessions: createLoadedWorkflowData().growSessions,
        auditLinks: [
          {
            id: "50505050-5050-4050-8050-505050505050",
            report_id: REPORT_ID,
            snapshot_id: SNAPSHOT_TWO_ID,
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
        persistedSnapshotCount: 2,
        metricCount: 2,
        sessionEvidenceCount: 1,
        auditLinkCount: 1,
        reportId: REPORT_ID,
        snapshotId: SNAPSHOT_TWO_ID,
        publicVisibility: false,
      },
    },
  });
  assert.equal(persistedValidation.statusCode, 200);
  assert.equal(persistedValidation.payload.validationEvidenceSummary.metricCount, 2);
  assert.equal(
    persistedValidation.payload.evidenceExplorerSummary.mode,
    "internal_immutable_evidence_explorer",
  );
  assert.equal(persistedValidation.payload.evidenceExplorerSummary.counts.auditLinks, 1);
  assert.equal(persistedValidation.payload.routeSafety.publicAccess, false);

  const listed = await invokeRoute(handleCstpReportsListRoute, {
    method: "GET",
    query: {
      cstpRequestId: REQUEST_ID,
      workflowTimestamp: WORKFLOW_TIMESTAMP,
    },
    loadedData: {
      reports: [createExistingReport()],
      snapshots: createExistingSnapshots(),
    },
  });
  assert.equal(listed.statusCode, 200);
  assert.equal(listed.payload.workflowMode, "list_internal_reports");
  assert.equal(listed.payload.serviceResult.resultCount, 1);

  const missingScope = await invokeRoute(handleCstpReportsListRoute, {
    method: "GET",
    query: {
      workflowTimestamp: WORKFLOW_TIMESTAMP,
    },
    loadedData: {
      reports: [createExistingReport()],
      snapshots: createExistingSnapshots(),
    },
  });
  assert.equal(missingScope.statusCode, 400);
  assert.equal(missingScope.payload.status, "admin_action_list_rejected");
}

async function assertPublicContextRejection() {
  const rejected = await invokeRoute(handleCstpReportGenerateRoute, {
    body: createRouteBody({
      adminContext: {
        public: true,
      },
    }),
  });
  assert.equal(rejected.statusCode, 400);
  assert.equal(rejected.payload.code, "CSTP_ADMIN_REPORT_PUBLIC_CONTEXT_REJECTED");
}

async function assertApiWrappersLoad() {
  const modules = [
    "../api/cstp-admin-report-prepare",
    "../api/cstp-admin-report-generate",
    "../api/cstp-admin-report-regenerate",
    "../api/cstp-admin-report-supersede",
    "../api/cstp-admin-report-lineage",
    "../api/cstp-admin-report-validation",
    "../api/cstp-admin-reports-list",
  ];

  modules.forEach((modulePath) => {
    const handler = require(modulePath);
    assert.equal(typeof handler, "function");
    assert.equal(typeof handler._private, "object");
  });
}

async function invokeRoute(handler, {
  method = "POST",
  query = {},
  body = createRouteBody(),
  loadedData = createLoadedWorkflowData(),
  routeOptions = {},
} = {}) {
  const response = createMockResponse();
  await handler(
    createMockRequest({
      method,
      query,
      body,
    }),
    response,
    {
      authorizationOptions: createAuthorizationOptions(),
      dataLoader: async () => loadedData,
      ...routeOptions,
    },
  );
  return response;
}

function createRouteBody(overrides = {}) {
  return {
    cstpRequestId: REQUEST_ID,
    cstpTestId: TEST_ID,
    reportId: REPORT_ID,
    snapshotId: SNAPSHOT_TWO_ID,
    workflowTimestamp: WORKFLOW_TIMESTAMP,
    generatedAt: WORKFLOW_TIMESTAMP,
    calculatedAt: WORKFLOW_TIMESTAMP,
    ...overrides,
  };
}

function createLoadedWorkflowData(overrides = {}) {
  return {
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
    auditEvents: [
      {
        id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        event_type: "snapshot_generated",
        created_at: "2026-05-12T20:50:00.000Z",
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

function createOperationalInput(overrides = {}) {
  return {
    ...createRouteBody(),
    ...createLoadedWorkflowData(),
    adminContext: {
      adminUserId: ADMIN_ID,
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

function createPersistedLineageSnapshots() {
  return [
    {
      ...createExistingSnapshots()[0],
      status: "superseded",
      superseded_by_snapshot_id: SNAPSHOT_TWO_ID,
    },
    {
      id: SNAPSHOT_TWO_ID,
      report_id: REPORT_ID,
      cstp_test_id: TEST_ID,
      cstp_request_id: REQUEST_ID,
      source_id: SOURCE_ID,
      snapshot_version: 2,
      status: "published",
      locked: true,
      supersedes_snapshot_id: SNAPSHOT_ONE_ID,
      frozen_report_payload: {
        internalOnly: true,
      },
      generated_at: "2026-05-12T14:00:00.000Z",
      prepared_at: "2026-05-12T14:30:00.000Z",
      published_at: "2026-05-12T15:00:00.000Z",
    },
  ];
}

function createPersistedLineageReport() {
  return {
    ...createExistingReport(),
    current_snapshot_id: SNAPSHOT_TWO_ID,
  };
}

function createMockRequest({
  method = "POST",
  headers = {
    authorization: "Bearer smoke-token",
  },
  query = {},
  body = {},
} = {}) {
  return {
    method,
    headers,
    query,
    body,
    url: buildUrlFromQuery(query),
  };
}

function createMockResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

function createAuthorizationOptions() {
  return {
    config: {
      supabaseUrl: "https://example.supabase.co",
      supabaseServiceRoleKey: "service-role-key",
    },
    fetchImpl: async (url) => {
      const textUrl = String(url);
      if (textUrl.includes("/auth/v1/user")) {
        return createFetchResponse(200, {
          id: ADMIN_ID,
          email: "admin@example.com",
        });
      }
      if (textUrl.includes("/rest/v1/admin_users")) {
        return createFetchResponse(200, [
          {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            user_id: ADMIN_ID,
            email: "admin@example.com",
          },
        ]);
      }
      throw new Error(`Unexpected smoke auth fetch: ${textUrl}`);
    },
  };
}

function createOperationalLoaderFetch() {
  return async (url) => {
    const textUrl = String(url);
    if (textUrl.includes("/rest/v1/cstp_tests?")) {
      if (textUrl.includes("aaaaaaaa-1111-4111-8111-111111111111")) {
        return createFetchResponse(200, []);
      }
      return createFetchResponse(200, [
        {
          id: TEST_ID,
          request_id: REQUEST_ID,
          source_id: SOURCE_ID,
          status: "completed",
        },
      ]);
    }
    if (textUrl.includes("/rest/v1/cstp_requests?")) {
      if (textUrl.includes("aaaaaaaa-1111-4111-8111-111111111111")) {
        return createFetchResponse(200, []);
      }
      return createFetchResponse(200, [
        {
          id: REQUEST_ID,
          source_id: SOURCE_ID,
          status: "accepted",
        },
      ]);
    }
    if (textUrl.includes("/rest/v1/sources?")) {
      return createFetchResponse(200, [
        {
          id: SOURCE_ID,
          name: "Internal Source",
        },
      ]);
    }
    if (textUrl.includes("/rest/v1/cstp_test_sessions?")) {
      return createFetchResponse(200, [
        {
          id: TEST_SESSION_ID,
          cstp_test_id: TEST_ID,
          session_id: GROW_SESSION_ID,
          kan_label: "KAN-A",
          included_in_report: true,
          created_at: "2026-05-10T14:00:00.000Z",
        },
      ]);
    }
    if (textUrl.includes("/rest/v1/grow_sessions?")) {
      return createFetchResponse(200, [
        {
          id: GROW_SESSION_ID,
          status: "completed",
        },
      ]);
    }
    if (textUrl.includes("/rest/v1/cstp_reports?")) {
      if (textUrl.includes(`id=eq.${REPORT_ID}`) || textUrl.includes(`cstp_test_id=eq.${TEST_ID}`)) {
        return createFetchResponse(200, [createPersistedLineageReport()]);
      }
      return createFetchResponse(200, []);
    }
    if (textUrl.includes("/rest/v1/cstp_report_snapshots?")) {
      return createFetchResponse(200, createPersistedLineageSnapshots());
    }
    if (textUrl.includes("/rest/v1/cstp_report_metrics?")) {
      return createFetchResponse(200, [
        {
          id: "10101010-1010-4010-8010-101010101010",
          report_id: REPORT_ID,
          snapshot_id: SNAPSHOT_ONE_ID,
          cstp_test_id: TEST_ID,
          metric_key: "reviewed_session_count",
          metric_type: "count",
          metric_value: 1,
          frozen_metric_payload: { internalOnly: true },
          calculated_at: "2026-05-11T14:30:00.000Z",
        },
        {
          id: "20202020-2020-4020-8020-202020202020",
          report_id: REPORT_ID,
          snapshot_id: SNAPSHOT_TWO_ID,
          cstp_test_id: TEST_ID,
          metric_key: "reviewed_session_count",
          metric_type: "count",
          metric_value: 1,
          frozen_metric_payload: { internalOnly: true },
          calculated_at: "2026-05-12T14:30:00.000Z",
        },
      ]);
    }
    if (textUrl.includes("/rest/v1/cstp_report_sessions?")) {
      return createFetchResponse(200, [
        {
          id: "30303030-3030-4030-8030-303030303030",
          report_id: REPORT_ID,
          snapshot_id: SNAPSHOT_ONE_ID,
          cstp_test_id: TEST_ID,
          cstp_test_session_id: TEST_SESSION_ID,
          grow_session_id: GROW_SESSION_ID,
          included_in_report: true,
          frozen_session_summary: { internalOnly: true },
        },
        {
          id: "40404040-4040-4040-8040-404040404040",
          report_id: REPORT_ID,
          snapshot_id: SNAPSHOT_TWO_ID,
          cstp_test_id: TEST_ID,
          cstp_test_session_id: TEST_SESSION_ID,
          grow_session_id: GROW_SESSION_ID,
          included_in_report: true,
          frozen_session_summary: { internalOnly: true },
        },
      ]);
    }
    if (textUrl.includes("/rest/v1/cstp_report_audit_links?")) {
      return createFetchResponse(200, [
        {
          id: "50505050-5050-4050-8050-505050505050",
          report_id: REPORT_ID,
          snapshot_id: SNAPSHOT_TWO_ID,
          cstp_admin_event_id: "60606060-6060-4060-8060-606060606060",
          event_role: "snapshot_published",
          created_by: ADMIN_ID,
        },
      ]);
    }
    if (textUrl.includes("/rest/v1/cstp_admin_events?")) {
      return createFetchResponse(200, []);
    }
    throw new Error(`Unexpected smoke operational fetch: ${textUrl}`);
  };
}

function createFetchResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
    async text() {
      return JSON.stringify(payload);
    },
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

function buildUrlFromQuery(query = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });
  const suffix = params.toString();
  return suffix ? `/api/cstp-admin-report-smoke?${suffix}` : "/api/cstp-admin-report-smoke";
}

main().catch((error) => {
  console.error("CSTP admin report route/action smoke checks failed.");
  console.error(error);
  process.exitCode = 1;
});
