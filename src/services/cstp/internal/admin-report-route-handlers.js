"use strict";

const {
  authorizeCstpAdminRequest,
} = require("./auth");
const {
  getCstpSupabaseRuntimeConfig,
  supabaseRest,
} = require("./execution");
const {
  prepareCstpReportAction,
  generateCstpReportAction,
  regenerateCstpReportAction,
  supersedeCstpReportAction,
  inspectCstpReportLineageAction,
  inspectCstpReportValidationAction,
  listCstpReportsAction,
} = require("./admin-report-actions");
const {
  CSTP_REPORT_TABLES,
} = require("./immutable-report-validator");

/*
 * Protected internal CSTP admin report route/action handlers.
 *
 * This module follows the existing CSTP admin API convention: authorize first,
 * load operational records server-side, then delegate to the internal action
 * layer. It does not register public routes, wire UI, render reports, publish
 * certifications, add integrations, mutate grow_sessions, or implement RLS.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const REPORT_ROUTE_DEFINITIONS = Object.freeze({
  prepare: {
    operation: "prepare_cstp_report_for_admin_route",
    actionName: "prepare_cstp_report_for_admin",
    workflowMode: "prepare",
    allowedMethods: ["POST"],
    actionHandler: prepareCstpReportAction,
    loadMode: "workflow",
    requiresWorkflowTimestamp: true,
  },
  generate: {
    operation: "generate_cstp_report_for_admin_route",
    actionName: "generate_cstp_report_for_admin",
    workflowMode: "generate",
    allowedMethods: ["POST"],
    actionHandler: generateCstpReportAction,
    loadMode: "workflow",
    requiresWorkflowTimestamp: true,
  },
  regenerate: {
    operation: "regenerate_cstp_report_for_admin_route",
    actionName: "regenerate_cstp_report_for_admin",
    workflowMode: "regenerate",
    allowedMethods: ["POST"],
    actionHandler: regenerateCstpReportAction,
    loadMode: "workflow_with_lineage",
    requiresWorkflowTimestamp: true,
  },
  supersede: {
    operation: "supersede_cstp_report_for_admin_route",
    actionName: "supersede_cstp_report_for_admin",
    workflowMode: "supersede",
    allowedMethods: ["POST"],
    actionHandler: supersedeCstpReportAction,
    loadMode: "workflow_with_lineage",
    requiresWorkflowTimestamp: true,
  },
  inspectLineage: {
    operation: "inspect_cstp_report_lineage_for_admin_route",
    actionName: "inspect_cstp_report_lineage_for_admin",
    workflowMode: "inspect_lineage",
    allowedMethods: ["GET", "POST"],
    actionHandler: inspectCstpReportLineageAction,
    loadMode: "lineage",
    requiresWorkflowTimestamp: true,
  },
  inspectValidation: {
    operation: "inspect_cstp_report_validation_for_admin_route",
    actionName: "inspect_cstp_report_validation_for_admin",
    workflowMode: "inspect_validation",
    allowedMethods: ["POST"],
    actionHandler: inspectCstpReportValidationAction,
    loadMode: "validation",
    requiresWorkflowTimestamp: true,
  },
  list: {
    operation: "list_cstp_reports_for_admin_route",
    actionName: "list_cstp_reports_for_admin",
    workflowMode: "list_internal_reports",
    allowedMethods: ["GET", "POST"],
    actionHandler: listCstpReportsAction,
    loadMode: "list",
    requiresWorkflowTimestamp: true,
  },
});

function json(response, status, payload) {
  return response.status(status).json(payload);
}

function createCstpAdminReportRouteHandler(actionKey) {
  const definition = REPORT_ROUTE_DEFINITIONS[actionKey];
  if (!definition) {
    throw new Error(`Unknown CSTP admin report route action "${actionKey}".`);
  }

  return async function handleCstpAdminReportRoute(
    request,
    response,
    options = {},
  ) {
    if (request.method === "OPTIONS") {
      response.setHeader("Allow", buildAllowHeader(definition.allowedMethods));
      return response.status(204).end();
    }

    if (!definition.allowedMethods.includes(request.method)) {
      response.setHeader("Allow", buildAllowHeader(definition.allowedMethods));
      return json(response, 405, {
        ok: false,
        success: false,
        status: "cstp_admin_report_method_not_allowed",
        error: "Method not allowed.",
        internalOnly: true,
      });
    }

    /*
     * Admin authorization is the first boundary. Unauthenticated, anonymous,
     * or non-admin callers must not reach CSTP report loading or action code.
     */
    const authorization = await authorizeCstpAdminRequest(
      request,
      options.authorizationOptions || {},
    );
    if (!authorization.ok) {
      return json(response, authorization.httpStatus || 403, authorization);
    }

    let payload;
    try {
      payload = await buildRoutePayload(request, definition);
      assertNoPublicRouteContext(payload);
      if (definition.requiresWorkflowTimestamp) {
        validateWorkflowTimestamp(payload.workflowTimestamp || payload.timestamp);
      }
    } catch (error) {
      return json(response, 400, buildRouteFailure({
        status: "cstp_admin_report_payload_invalid",
        message: error.message || "Invalid CSTP admin report payload.",
        code: error.code || "CSTP_ADMIN_REPORT_PAYLOAD_INVALID",
        definition,
      }));
    }

    try {
      const adminContext = buildAdminContext(authorization.actor, {
        actionName: definition.actionName,
        routePayload: payload,
      });
      const loadedInput = await loadAdminReportActionInput({
        definition,
        payload,
        adminContext,
        options,
      });
      const actionOptions = buildActionOptions({
        payload,
        options,
        loadedInput,
      });
      const result = await definition.actionHandler(loadedInput, actionOptions);

      return json(response, result.ok ? 200 : 400, buildRouteSuccess({
        definition,
        result,
        authorization,
        loadedInput,
      }));
    } catch (error) {
      const clientError = isClientRouteError(error);
      return json(response, clientError ? 400 : 500, buildRouteFailure({
        status: clientError
          ? "cstp_admin_report_route_input_invalid"
          : "cstp_admin_report_route_failed",
        message: clientError
          ? error.message
          : "Could not execute internal CSTP admin report action.",
        code: error?.code || (clientError
          ? "CSTP_ADMIN_REPORT_ROUTE_INPUT_INVALID"
          : "CSTP_ADMIN_REPORT_ROUTE_FAILED"),
        details: normalizeRouteError(error),
        definition,
      }));
    }
  };
}

const handleCstpReportPrepareRoute = createCstpAdminReportRouteHandler("prepare");
const handleCstpReportGenerateRoute = createCstpAdminReportRouteHandler("generate");
const handleCstpReportRegenerateRoute = createCstpAdminReportRouteHandler("regenerate");
const handleCstpReportSupersedeRoute = createCstpAdminReportRouteHandler("supersede");
const handleCstpReportLineageRoute = createCstpAdminReportRouteHandler("inspectLineage");
const handleCstpReportValidationRoute = createCstpAdminReportRouteHandler("inspectValidation");
const handleCstpReportsListRoute = createCstpAdminReportRouteHandler("list");

async function loadAdminReportActionInput({
  definition,
  payload,
  adminContext,
  options,
}) {
  const baseInput = {
    ...payload,
    adminContext,
    workflowTimestamp: normalizeTimestamp(
      payload.workflowTimestamp || payload.timestamp,
    ),
    requestedPersist: normalizeBoolean(payload.persist, false),
    /*
     * Phase 1 real operational loading runs in shadow mode only. Immutable
     * snapshot persistence remains explicitly deferred until a later guarded
     * enablement slice.
     */
    persist: false,
  };

  const loader = options.dataLoader || loadCstpAdminReportData;
  const loaded = await loader({
    definition,
    payload: baseInput,
    options: options.loadOptions || options.readOptions || {},
  });

  return {
    ...baseInput,
    ...loaded,
    operationalLoadingSummary: buildOperationalLoadingSummary(loaded, {
      requestedPersist: baseInput.requestedPersist,
      effectivePersist: false,
      loadMode: definition.loadMode,
    }),
    dbClient: resolveRouteDbClient({
      payload: baseInput,
      options,
      loaded,
    }),
  };
}

async function loadCstpAdminReportData({ definition, payload, options = {} }) {
  const allowPreloadedData = options.allowPreloadedData === true;

  if (
    allowPreloadedData
    && payload.loadedInput
    && typeof payload.loadedInput === "object"
  ) {
    return payload.loadedInput;
  }

  if (allowPreloadedData && hasPreloadedPayload(payload, definition.loadMode)) {
    return pickPreloadedPayload(payload);
  }

  const config = resolveRouteConfig(options);
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const context = createLoadContext(payload);

  if (definition.loadMode === "list") {
    return loadListData({ context, config, fetchImpl });
  }

  if (definition.loadMode === "lineage") {
    return loadLineageData({ context, config, fetchImpl });
  }

  if (definition.loadMode === "validation") {
    if (payload.validationContext || payload.workflowInput) {
      return {};
    }
    if (payload.candidate) {
      return loadWorkflowData({
        context,
        config,
        fetchImpl,
        includeLineage: true,
      });
    }
  }

  return loadWorkflowData({
    context,
    config,
    fetchImpl,
    includeLineage: [
      "workflow_with_lineage",
      "validation",
    ].includes(definition.loadMode),
  });
}

async function loadWorkflowData({
  context,
  config,
  fetchImpl,
  includeLineage = false,
}) {
  return loadCstpOperationalContext({
    context,
    config,
    fetchImpl,
    includeLineage,
  });
}

async function loadCstpOperationalContext({
  context,
  config,
  fetchImpl,
  includeLineage = false,
}) {
  let existingReport = null;

  if (context.reportId) {
    existingReport = await loadSingleById(
      CSTP_REPORT_TABLES.reports,
      context.reportId,
      { config, fetchImpl },
    );
  }

  let cstpRequest = await loadCstpRequestContext({
    context,
    existingReport,
    config,
    fetchImpl,
  });
  const cstpTest = await loadCstpTestContext({
    context,
    existingReport,
    cstpRequest,
    config,
    fetchImpl,
  });
  if (!cstpRequest && cstpTest?.request_id) {
    cstpRequest = await loadSingleById(CSTP_REPORT_TABLES.requests, cstpTest.request_id, {
      config,
      fetchImpl,
    });
  }
  const source = await loadSourceContext({
    context,
    existingReport,
    cstpRequest,
    cstpTest,
    config,
    fetchImpl,
  });
  assertOperationalScopeConsistency({
    context,
    existingReport,
    cstpRequest,
    cstpTest,
    source,
  });

  const cstpRequestId =
    cstpRequest?.id
    || context.cstpRequestId
    || cstpTest?.request_id
    || existingReport?.cstp_request_id;
  const testId = cstpTest?.id || context.cstpTestId || existingReport?.cstp_test_id;
  const cstpTestSessions = testId
    ? normalizeCstpTestSessionRows(await loadMany(CSTP_REPORT_TABLES.testSessions, {
      filter: `cstp_test_id=eq.${encodeURIComponent(testId)}`,
      order: "created_at.asc",
      config,
      fetchImpl,
    }))
    : [];
  const growSessions = await loadGrowSessionContext({
    cstpTestSessions,
    config,
    fetchImpl,
  });
  const reportForLineage = existingReport || await loadReportByScope({
    cstpRequestId,
    cstpTestId: testId,
    config,
    fetchImpl,
  });
  const existingSnapshots = includeLineage && reportForLineage?.id
    ? await loadSnapshotsForReport(reportForLineage.id, { config, fetchImpl })
    : [];
  const auditEvents = await loadAuditEvents({
    cstpRequestId,
    cstpTestId: testId,
    config,
    fetchImpl,
  });

  return pruneUndefined({
    cstpRequest,
    cstpTest,
    cstpTestSessions,
    growSessions,
    source,
    auditEvents,
    existingReport: reportForLineage || undefined,
    existingSnapshots,
  });
}

async function loadCstpRequestContext({
  context,
  existingReport,
  config,
  fetchImpl,
}) {
  const cstpRequestId = context.cstpRequestId || existingReport?.cstp_request_id;
  return cstpRequestId
    ? loadSingleById(CSTP_REPORT_TABLES.requests, cstpRequestId, {
      config,
      fetchImpl,
    })
    : null;
}

async function loadCstpTestContext({
  context,
  existingReport,
  cstpRequest,
  config,
  fetchImpl,
}) {
  const cstpTestId = context.cstpTestId || existingReport?.cstp_test_id;
  if (cstpTestId) {
    return loadSingleById(CSTP_REPORT_TABLES.tests, cstpTestId, {
      config,
      fetchImpl,
    });
  }

  const cstpRequestId = cstpRequest?.id || context.cstpRequestId;
  if (!cstpRequestId) {
    return null;
  }

  const tests = await loadMany(CSTP_REPORT_TABLES.tests, {
    filter: `request_id=eq.${encodeURIComponent(cstpRequestId)}&limit=1`,
    order: "created_at.desc",
    config,
    fetchImpl,
  });
  return tests[0] || null;
}

async function loadGrowSessionContext({
  cstpTestSessions,
  config,
  fetchImpl,
}) {
  const growSessionIds = uniqueNonEmpty(
    cstpTestSessions.map(getGrowSessionIdFromTestSession),
  );

  return growSessionIds.length
    ? loadManyByIds(CSTP_REPORT_TABLES.growSessions, growSessionIds, {
      config,
      fetchImpl,
    })
    : [];
}

async function loadSourceContext({
  context,
  existingReport,
  cstpRequest,
  cstpTest,
  config,
  fetchImpl,
}) {
  const sourceId =
    context.sourceId
    || cstpRequest?.source_id
    || cstpTest?.source_id
    || existingReport?.source_id;

  return sourceId
    ? loadSingleById(CSTP_REPORT_TABLES.sources, sourceId, {
      config,
      fetchImpl,
    })
    : null;
}

function assertOperationalScopeConsistency({
  context,
  existingReport,
  cstpRequest,
  cstpTest,
  source,
}) {
  if (context.cstpRequestId && cstpRequest && cstpRequest.id !== context.cstpRequestId) {
    throwOperationalScopeError(
      "CSTP request scope did not match the loaded request.",
      "cstpRequestId",
    );
  }
  if (context.cstpTestId && cstpTest && cstpTest.id !== context.cstpTestId) {
    throwOperationalScopeError(
      "CSTP test scope did not match the loaded test.",
      "cstpTestId",
    );
  }
  if (
    cstpRequest?.id
    && cstpTest?.request_id
    && cstpTest.request_id !== cstpRequest.id
  ) {
    throwOperationalScopeError(
      "Loaded CSTP test does not belong to the loaded CSTP request.",
      "cstpTest.request_id",
    );
  }
  if (
    existingReport?.cstp_test_id
    && cstpTest?.id
    && existingReport.cstp_test_id !== cstpTest.id
  ) {
    throwOperationalScopeError(
      "Loaded report does not belong to the loaded CSTP test.",
      "existingReport.cstp_test_id",
    );
  }
  if (
    source?.id
    && cstpTest?.source_id
    && cstpTest.source_id !== source.id
  ) {
    throwOperationalScopeError(
      "Loaded source does not match the CSTP test source.",
      "cstpTest.source_id",
    );
  }
}

function throwOperationalScopeError(message, field) {
  const error = new Error(message);
  error.code = "CSTP_ADMIN_REPORT_OPERATIONAL_SCOPE_INVALID";
  error.details = { field };
  throw error;
}

function normalizeCstpTestSessionRows(rows = []) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    ...row,
    grow_session_id: getGrowSessionIdFromTestSession(row),
  }));
}

async function loadLineageData({ context, config, fetchImpl }) {
  const existingReport = context.reportId
    ? await loadSingleById(CSTP_REPORT_TABLES.reports, context.reportId, {
      config,
      fetchImpl,
    })
    : await loadReportByScope({
      cstpRequestId: context.cstpRequestId,
      cstpTestId: context.cstpTestId,
      config,
      fetchImpl,
    });
  const existingSnapshots = existingReport?.id
    ? await loadSnapshotsForReport(existingReport.id, { config, fetchImpl })
    : [];

  return {
    existingReport,
    existingSnapshots,
  };
}

async function loadListData({ context, config, fetchImpl }) {
  if (!context.cstpRequestId && !context.cstpTestId) {
    const error = new Error(
      "Internal CSTP report listing requires a CSTP request id, CSTP test id, or both.",
    );
    error.code = "CSTP_ADMIN_REPORT_LIST_SCOPE_REQUIRED";
    throw error;
  }

  const reports = await loadReportsByScope({
    cstpRequestId: context.cstpRequestId,
    cstpTestId: context.cstpTestId,
    config,
    fetchImpl,
  });
  const reportIds = reports.map((report) => report.id).filter(Boolean);
  const snapshots = reportIds.length
    ? await loadManyByFieldIn(
      CSTP_REPORT_TABLES.snapshots,
      "report_id",
      reportIds,
      {
        config,
        fetchImpl,
        order: "snapshot_version.asc",
      },
    )
    : [];

  return {
    reports,
    snapshots,
  };
}

async function loadSingleById(table, id, { config, fetchImpl }) {
  if (!id) {
    return null;
  }
  validateUuid(`${table}.id`, id);
  const rows = await supabaseRest(
    `${table}?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
    config,
    {
      method: "GET",
      fetchImpl,
    },
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function loadReportByScope({
  cstpRequestId,
  cstpTestId,
  config,
  fetchImpl,
}) {
  const reports = await loadReportsByScope({
    cstpRequestId,
    cstpTestId,
    config,
    fetchImpl,
    limit: 1,
  });
  return reports[0] || null;
}

async function loadReportsByScope({
  cstpRequestId,
  cstpTestId,
  config,
  fetchImpl,
  limit = 100,
}) {
  const filters = ["select=*"];
  if (cstpRequestId) {
    validateUuid("cstpRequestId", cstpRequestId);
    filters.push(`cstp_request_id=eq.${encodeURIComponent(cstpRequestId)}`);
  }
  if (cstpTestId) {
    validateUuid("cstpTestId", cstpTestId);
    filters.push(`cstp_test_id=eq.${encodeURIComponent(cstpTestId)}`);
  }
  filters.push("order=created_at.desc");
  filters.push(`limit=${limit}`);

  return loadMany(CSTP_REPORT_TABLES.reports, {
    filter: filters.slice(1).join("&"),
    selectPrefix: "select=*",
    config,
    fetchImpl,
  });
}

async function loadSnapshotsForReport(reportId, { config, fetchImpl }) {
  validateUuid("reportId", reportId);
  return loadMany(CSTP_REPORT_TABLES.snapshots, {
    filter: `report_id=eq.${encodeURIComponent(reportId)}`,
    order: "snapshot_version.asc",
    config,
    fetchImpl,
  });
}

async function loadAuditEvents({
  cstpTestId,
  config,
  fetchImpl,
}) {
  if (!cstpTestId) {
    return [];
  }
  validateUuid("cstpTestId", cstpTestId);
  const filters = ["select=*"];
  filters.push(`cstp_test_id=eq.${encodeURIComponent(cstpTestId)}`);
  filters.push("order=created_at.desc");
  filters.push("limit=50");

  const rows = await supabaseRest(
    `${CSTP_REPORT_TABLES.adminEvents}?${filters.join("&")}`,
    config,
    {
      method: "GET",
      fetchImpl,
    },
  );
  return Array.isArray(rows) ? rows : [];
}

async function loadManyByIds(table, ids, options = {}) {
  return loadManyByFieldIn(table, "id", ids, options);
}

async function loadManyByFieldIn(
  table,
  field,
  ids,
  {
    config,
    fetchImpl,
    order = "created_at.asc",
  },
) {
  const values = uniqueNonEmpty(ids);
  if (!values.length) {
    return [];
  }
  values.forEach((value) => validateUuid(field, value));
  return loadMany(table, {
    filter: `${field}=in.(${values.map(encodeURIComponent).join(",")})`,
    order,
    config,
    fetchImpl,
  });
}

async function loadMany(
  table,
  {
    filter = "",
    order = "",
    selectPrefix = "select=*",
    config,
    fetchImpl,
  },
) {
  const queryParts = [
    selectPrefix,
    filter,
    order ? `order=${encodeURIComponent(order)}` : "",
  ].filter(Boolean);
  const rows = await supabaseRest(`${table}?${queryParts.join("&")}`, config, {
    method: "GET",
    fetchImpl,
  });
  return Array.isArray(rows) ? rows : [];
}

function createSupabaseInsertDbClient({ config, fetchImpl }) {
  return {
    async insert(table, records) {
      const rows = await supabaseRest(`${table}?select=*`, config, {
        method: "POST",
        body: records,
        prefer: "return=representation",
        fetchImpl,
      });
      return Array.isArray(rows) ? rows : [];
    },
  };
}

function buildActionOptions({ payload, options, loadedInput }) {
  return {
    ...(options.actionOptions || {}),
    workflowTimestamp: loadedInput.workflowTimestamp,
    persist: false,
    dbClient: null,
    routeActionName: payload.actionName,
  };
}

function resolveRouteDbClient({ payload, options, loaded }) {
  void payload;
  void options;
  void loaded;
  /*
   * Shadow/deferred persistence mode intentionally never supplies a database
   * insert client to immutable report orchestration. Real persistence wiring is
   * deferred to a later guarded rollout phase.
   */
  return null;
}

function buildRoutePayload(request = {}, definition = {}) {
  if (request.method === "GET") {
    return {
      ...getRequestQueryParams(request),
      actionName: definition.actionName,
      workflowMode: definition.workflowMode,
    };
  }

  return Promise.resolve(parseRequestBody(request.body)).then((body) => ({
    ...getRequestQueryParams(request),
    ...body,
    actionName: definition.actionName,
    workflowMode: definition.workflowMode,
  }));
}

function parseRequestBody(body) {
  if (body === undefined || body === null || body === "") {
    return {};
  }
  if (typeof body === "string") {
    return JSON.parse(body || "{}");
  }
  if (typeof Buffer !== "undefined" && Buffer.isBuffer?.(body)) {
    return JSON.parse(body.toString("utf8") || "{}");
  }
  if (body instanceof Uint8Array) {
    return JSON.parse(Buffer.from(body).toString("utf8") || "{}");
  }
  if (typeof body === "object") {
    return body;
  }
  throw new Error("Unsupported request body.");
}

function getRequestQueryParams(request = {}) {
  if (request.query && typeof request.query === "object") {
    return normalizeQueryObject(request.query);
  }

  const requestUrl = String(request.url || "").trim();
  if (!requestUrl) {
    return {};
  }

  const parsedUrl = new URL(requestUrl, "http://localhost");
  return Object.fromEntries(parsedUrl.searchParams.entries());
}

function normalizeQueryObject(query = {}) {
  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

function buildAdminContext(actor = {}, { actionName, routePayload = {} } = {}) {
  return {
    adminUserId: actor.userId,
    userId: actor.userId,
    email: actor.email || "",
    authorizationSource: actor.authorizationSource || "",
    adminMembershipId: actor.adminMembershipId || "",
    actionName,
    requestId: routePayload.requestId || routePayload.correlationId || "",
    public: false,
    anonymous: false,
    internalOnly: true,
  };
}

function createLoadContext(payload = {}) {
  return {
    reportId: normalizeNullableText(payload.reportId || payload.id),
    snapshotId: normalizeNullableText(payload.snapshotId),
    targetSnapshotId: normalizeNullableText(payload.targetSnapshotId),
    cstpRequestId: normalizeNullableText(
      payload.cstpRequestId || payload.requestId || payload.cstpRequest?.id,
    ),
    cstpTestId: normalizeNullableText(
      payload.cstpTestId || payload.testId || payload.cstpTest?.id,
    ),
    sourceId: normalizeNullableText(payload.sourceId || payload.source?.id),
  };
}

function hasPreloadedPayload(payload = {}, loadMode = "") {
  if (loadMode === "list") {
    return Array.isArray(payload.reports);
  }
  if (loadMode === "lineage") {
    return Boolean(payload.existingReport && Array.isArray(payload.existingSnapshots));
  }
  if (loadMode === "validation") {
    return true;
  }
  return Boolean(
    payload.cstpRequest
    && payload.cstpTest
    && Array.isArray(payload.cstpTestSessions)
    && Array.isArray(payload.growSessions)
    && payload.source,
  );
}

function pickPreloadedPayload(payload = {}) {
  return {
    cstpRequest: payload.cstpRequest,
    cstpTest: payload.cstpTest,
    cstpTestSessions: normalizeArray(payload.cstpTestSessions),
    growSessions: normalizeArray(payload.growSessions),
    source: payload.source,
    auditEvents: normalizeArray(payload.auditEvents),
    existingReport: payload.existingReport || payload.report,
    existingSnapshots: normalizeArray(payload.existingSnapshots),
    reports: normalizeArray(payload.reports),
    snapshots: normalizeArray(payload.snapshots || payload.existingSnapshots),
    validationContext: payload.validationContext,
    candidate: payload.candidate,
    workflowInput: payload.workflowInput,
  };
}

function hasValidationTarget(payload = {}) {
  return Boolean(
    payload.validationContext
    || payload.candidate
    || payload.workflowInput,
  );
}

function assertNoPublicRouteContext(payload = {}) {
  const adminContext = payload.adminContext || {};
  if (
    payload.public === true
    || payload.publicAccess === true
    || adminContext.public === true
    || adminContext.publicAccess === true
    || adminContext.anonymous === true
    || adminContext.isPublic === true
  ) {
    const error = new Error(
      "Internal CSTP admin report routes reject public or anonymous contexts.",
    );
    error.code = "CSTP_ADMIN_REPORT_PUBLIC_CONTEXT_REJECTED";
    throw error;
  }
}

function validateWorkflowTimestamp(value) {
  const normalized = normalizeTimestamp(value);
  if (!normalized) {
    const error = new Error(
      "Internal CSTP admin report routes require an explicit workflow timestamp.",
    );
    error.code = "CSTP_ADMIN_REPORT_WORKFLOW_TIMESTAMP_REQUIRED";
    throw error;
  }
}

function validateUuid(field, value) {
  if (!value || !UUID_PATTERN.test(String(value))) {
    const error = new Error(`${field} must be a valid UUID.`);
    error.code = "CSTP_ADMIN_REPORT_UUID_INVALID";
    error.details = { field, value };
    throw error;
  }
}

function resolveRouteConfig(options = {}) {
  const config = options.config || getCstpSupabaseRuntimeConfig(options.env);
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    const error = new Error("CSTP admin report routes are not configured.");
    error.code = "CSTP_ADMIN_REPORT_ROUTES_NOT_CONFIGURED";
    error.details = {
      supabaseUrlAvailable: Boolean(config.supabaseUrl),
      supabaseServiceRoleKeyAvailable: Boolean(config.supabaseServiceRoleKey),
    };
    throw error;
  }
  return config;
}

function buildRouteSuccess({
  definition,
  result,
  authorization,
  loadedInput = {},
}) {
  return {
    ...result,
    operation: definition.operation,
    actionName: definition.actionName,
    workflowMode: result.workflowMode || definition.workflowMode,
    operationalLoadingSummary: loadedInput.operationalLoadingSummary || null,
    actor: {
      userId: authorization.actor.userId,
      authorizationSource: authorization.actor.authorizationSource,
    },
    routeSafety: buildRouteSafety(),
    internalOnly: true,
  };
}

function buildRouteFailure({
  status,
  message,
  code,
  details = {},
  definition = {},
}) {
  return {
    ok: false,
    success: false,
    status,
    operation: definition.operation || "cstp_admin_report_route",
    actionName: definition.actionName || null,
    workflowMode: definition.workflowMode || null,
    error: message,
    code,
    details,
    routeSafety: buildRouteSafety(),
    internalOnly: true,
  };
}

function buildRouteSafety() {
  return {
    adminOnly: true,
    publicAccess: false,
    publicApi: false,
    renderingImplemented: false,
    certificationImplemented: false,
    sourceDirectoryIntegration: false,
    communityGrowIntegration: false,
    destructiveSnapshotMutation: false,
    mutatesGrowSessions: false,
    realOperationalLoading: true,
    shadowMode: true,
    immutablePersistenceDeferred: true,
  };
}

function buildAllowHeader(methods = []) {
  return [...methods, "OPTIONS"].join(", ");
}

function normalizeRouteError(error) {
  return {
    name: error?.name || "Error",
    code: error?.code || "CSTP_ADMIN_REPORT_ROUTE_UNKNOWN_ERROR",
    message: error?.message || String(error),
    details: error?.details || {},
  };
}

function isClientRouteError(error) {
  return [
    "CSTP_ADMIN_REPORT_LIST_SCOPE_REQUIRED",
    "CSTP_ADMIN_REPORT_UUID_INVALID",
    "CSTP_ADMIN_REPORT_OPERATIONAL_SCOPE_INVALID",
  ].includes(error?.code);
}

function normalizeTimestamp(value) {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? "" : value.toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  if (typeof value === "string" && value.trim()) {
    const time = Date.parse(value);
    return Number.isNaN(time) ? "" : new Date(time).toISOString();
  }
  return "";
}

function normalizeNullableText(value) {
  const normalized = String(value || "").trim();
  return normalized || "";
}

function normalizeBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.slice();
  }
  if (value && typeof value === "object") {
    return [value];
  }
  return [];
}

function uniqueNonEmpty(values = []) {
  return [...new Set(values.map(normalizeNullableText).filter(Boolean))];
}

function getGrowSessionIdFromTestSession(session = {}) {
  return normalizeNullableText(
    session.grow_session_id
    || session.session_id
    || session.growSessionId
    || session.sessionId,
  );
}

function buildOperationalLoadingSummary(loaded = {}, {
  requestedPersist = false,
  effectivePersist = false,
  loadMode = "",
} = {}) {
  const cstpRequest = loaded.cstpRequest || {};
  const cstpTest = loaded.cstpTest || {};
  const source = loaded.source || {};
  const existingReport = loaded.existingReport || {};
  const cstpTestSessions = normalizeArray(loaded.cstpTestSessions);
  const growSessions = normalizeArray(loaded.growSessions);
  const existingSnapshots = normalizeArray(loaded.existingSnapshots);
  const requestId = normalizeNullableText(cstpRequest.id || existingReport.cstp_request_id);
  const testId = normalizeNullableText(cstpTest.id || existingReport.cstp_test_id);
  const sourceId = normalizeNullableText(source.id || existingReport.source_id);
  const hasRequest = Boolean(requestId);
  const hasTest = Boolean(testId);
  const hasSource = Boolean(sourceId);
  const hasSessionLinkage = cstpTestSessions.length > 0;
  const hasGrowSessions = growSessions.length > 0;

  return {
    mode: "shadow_deferred_persistence",
    loadMode,
    realOperationalRecordsLoaded: true,
    persistenceRequested: Boolean(requestedPersist),
    persistenceEffective: Boolean(effectivePersist),
    persistenceDeferred: true,
    cstpRequestId: requestId,
    cstpTestId: testId,
    sourceId,
    sourceName: normalizeNullableText(
      source.name
      || source.source_name
      || source.display_name
      || source.company_name,
    ),
    sessionLinkCount: cstpTestSessions.length,
    growSessionCount: growSessions.length,
    existingSnapshotCount: existingSnapshots.length,
    operationalCompleteness: {
      hasRequest,
      hasTest,
      hasSource,
      hasSessionLinkage,
      hasGrowSessions,
      validationReady: hasRequest && hasTest && hasSource && hasSessionLinkage && hasGrowSessions,
    },
    safety: {
      adminOnly: true,
      publicAccess: false,
      immutablePersistence: false,
      mutatesGrowSessions: false,
      rendering: false,
      certification: false,
    },
  };
}

function pruneUndefined(record = {}) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  );
}

module.exports = {
  REPORT_ROUTE_DEFINITIONS,
  buildAdminContext,
  createCstpAdminReportRouteHandler,
  createSupabaseInsertDbClient,
  handleCstpReportGenerateRoute,
  handleCstpReportLineageRoute,
  handleCstpReportPrepareRoute,
  handleCstpReportRegenerateRoute,
  handleCstpReportSupersedeRoute,
  handleCstpReportValidationRoute,
  handleCstpReportsListRoute,
  loadCstpOperationalContext,
  loadAdminReportActionInput,
  loadCstpAdminReportData,
  parseRequestBody,
};
