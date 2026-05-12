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
const LIVE_GENERATE_PERSISTENCE_MODE = "live_guarded";
const GENERATE_WORKFLOW_MODE = "generate";

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
    persistenceMode: normalizePersistenceMode(payload),
    persist: false,
  };

  const loader = options.dataLoader || loadCstpAdminReportData;
  const loaded = await loader({
    definition,
    payload: baseInput,
    options: options.loadOptions || options.readOptions || {},
  });

  const persistenceGate = validateRoutePersistenceGate({
    definition,
    input: baseInput,
    loaded,
  });
  const effectiveInput = {
    ...baseInput,
    ...loaded,
    persist: persistenceGate.persist,
    routePersistenceGate: persistenceGate,
  };

  return {
    ...effectiveInput,
    operationalLoadingSummary: buildOperationalLoadingSummary(loaded, {
      requestedPersist: baseInput.requestedPersist,
      effectivePersist: persistenceGate.persist,
      loadMode: definition.loadMode,
      persistenceMode: baseInput.persistenceMode,
    }),
    dbClient: resolveRouteDbClient({
      payload: effectiveInput,
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
    return loadValidationData({
      context,
      payload,
      config,
      fetchImpl,
    });
  }

  return loadWorkflowData({
    context,
    config,
    fetchImpl,
    includeLineage: shouldLoadLineageForRoute(definition, payload),
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
    ? await loadImmutableSnapshotChain(reportForLineage.id, { config, fetchImpl })
    : [];
  const immutableLineageSummary = includeLineage
    ? await summarizeImmutableLineage({
      report: reportForLineage,
      snapshots: existingSnapshots,
      config,
      fetchImpl,
    })
    : null;
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
    immutableLineageSummary,
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
  return loadImmutableReportLineage({ context, config, fetchImpl });
}

async function loadValidationData({
  context,
  payload,
  config,
  fetchImpl,
}) {
  assertValidationScope(context);
  const operationalContext = await loadCstpOperationalContext({
    context,
    config,
    fetchImpl,
    includeLineage: true,
  });
  const persistedValidation = await loadImmutableValidationContext({
    context,
    operationalContext,
    adminContext: payload.adminContext,
    config,
    fetchImpl,
  });

  return {
    ...operationalContext,
    validationContext: persistedValidation.validationContext,
    validationOptions: persistedValidation.validationOptions,
    persistedImmutableValidation: persistedValidation,
    persistedImmutableValidationEvidence: persistedValidation.evidence,
    validationEvidenceSummary: persistedValidation.evidenceSummary,
  };
}

async function loadImmutableReportLineage({ context, config, fetchImpl }) {
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
    ? await loadImmutableSnapshotChain(existingReport.id, { config, fetchImpl })
    : [];
  const immutableEvidence = existingReport?.id
    ? await loadImmutableReportEvidence({
      report: existingReport,
      snapshots: existingSnapshots,
      config,
      fetchImpl,
    })
    : { auditLinks: [] };
  const immutableLineageSummary = await summarizeImmutableLineage({
    report: existingReport,
    snapshots: existingSnapshots,
    config,
    fetchImpl,
  });

  return {
    existingReport,
    existingSnapshots,
    auditLinks: immutableEvidence.auditLinks || [],
    immutableAuditLinks: immutableEvidence.auditLinks || [],
    immutableMetrics: immutableEvidence.metrics || [],
    immutableReportSessions: immutableEvidence.sessions || [],
    immutableLineageSummary,
  };
}

async function loadImmutableValidationContext({
  context,
  operationalContext = {},
  adminContext = {},
  config,
  fetchImpl,
} = {}) {
  const report = operationalContext.existingReport || null;
  const snapshots = normalizeArray(operationalContext.existingSnapshots);
  const snapshot = resolveImmutableValidationSnapshot({
    report,
    snapshots,
    snapshotId: context.snapshotId || context.targetSnapshotId,
  });
  const evidence = await loadImmutableReportEvidence({
    report,
    snapshot,
    snapshots,
    config,
    fetchImpl,
  });
  const evidenceSummary = summarizeImmutableValidationEvidence({
    report,
    snapshot,
    snapshots,
    evidence,
    scope: context,
  });
  const validationContext = buildPersistedImmutableValidationCandidate({
    report,
    snapshot,
    snapshots,
    operationalContext,
    evidence,
    adminContext,
  });

  return {
    mode: "real_persisted_immutable_validation",
    internalOnly: true,
    publicVisibility: false,
    immutableSnapshotsPubliclyVisible: false,
    certificationRendering: false,
    persistence: false,
    destructiveMutation: false,
    validationContext,
    validationOptions: buildPersistedValidationOptions({ report, snapshot }),
    evidence,
    evidenceSummary,
  };
}

async function loadImmutableReportEvidence({
  report = null,
  snapshot = null,
  snapshots = [],
  config,
  fetchImpl,
} = {}) {
  const reportId = normalizeNullableText(report?.id);
  const snapshotIds = uniqueNonEmpty(
    (snapshot?.id ? [snapshot.id] : snapshots.map((entry) => entry.id)),
  );
  const [metrics, sessions, auditLinks] = await Promise.all([
    snapshotIds.length
      ? loadManyByFieldIn(CSTP_REPORT_TABLES.metrics, "snapshot_id", snapshotIds, {
        config,
        fetchImpl,
        order: "created_at.asc",
      })
      : [],
    snapshotIds.length
      ? loadManyByFieldIn(CSTP_REPORT_TABLES.sessions, "snapshot_id", snapshotIds, {
        config,
        fetchImpl,
        order: "created_at.asc",
      })
      : [],
    reportId
      ? loadMany(CSTP_REPORT_TABLES.auditLinks, {
        filter: `report_id=eq.${encodeURIComponent(reportId)}`,
        order: "created_at.asc",
        config,
        fetchImpl,
      })
      : [],
  ]);

  return {
    report,
    snapshot,
    snapshots,
    metrics,
    sessions,
    auditLinks,
  };
}

function summarizeImmutableValidationEvidence({
  report = null,
  snapshot = null,
  snapshots = [],
  evidence = {},
  scope = {},
} = {}) {
  const metrics = normalizeArray(evidence.metrics);
  const sessions = normalizeArray(evidence.sessions);
  const auditLinks = normalizeArray(evidence.auditLinks);

  return {
    mode: "real_persisted_immutable_validation",
    internalOnly: true,
    publicVisibility: false,
    immutableSnapshotsPubliclyVisible: false,
    certificationRendering: false,
    persistence: false,
    reportId: report?.id || "",
    snapshotId: snapshot?.id || "",
    snapshotVersion: snapshot?.snapshot_version || "",
    snapshotStatus: snapshot?.status || "",
    cstpRequestId:
      report?.cstp_request_id
      || snapshot?.cstp_request_id
      || scope.cstpRequestId
      || "",
    cstpTestId:
      report?.cstp_test_id
      || snapshot?.cstp_test_id
      || scope.cstpTestId
      || "",
    persistedReportCount: report?.id ? 1 : 0,
    persistedSnapshotCount: snapshots.length,
    metricCount: metrics.length,
    sessionEvidenceCount: sessions.length,
    auditLinkCount: auditLinks.length,
    metricCountsBySnapshotId: countRowsBySnapshotId(metrics),
    sessionCountsBySnapshotId: countRowsBySnapshotId(sessions),
    auditLinkCountsBySnapshotId: countRowsBySnapshotId(auditLinks),
    emptyState: !report?.id,
    missingSnapshot: Boolean(report?.id && !snapshot?.id),
    missingMetrics: metrics.length === 0,
    missingSessionEvidence: sessions.length === 0,
    missingAuditLinks: auditLinks.length === 0,
    labels: [
      "Internal-only validation inspection",
      "Immutable snapshots are not publicly visible",
      "Certification and public rendering are deferred",
    ],
  };
}

function buildPersistedImmutableValidationCandidate({
  report = null,
  snapshot = null,
  snapshots = [],
  operationalContext = {},
  evidence = {},
  adminContext = {},
} = {}) {
  const reportSessions = normalizeArray(evidence.sessions);
  const sessionLinks = reportSessions.map((session) => ({
    id: session.cstp_test_session_id,
    cstp_test_id: session.cstp_test_id,
    session_id: session.grow_session_id,
    grow_session_id: session.grow_session_id,
    kan_label: session.kan_label,
    included_in_report: session.included_in_report !== false,
    relationship_archived_at_snapshot: session.relationship_archived_at_snapshot === true,
    frozen_session_summary: session.frozen_session_summary,
  }));
  const growSessions = normalizeArray(operationalContext.growSessions).length
    ? normalizeArray(operationalContext.growSessions)
    : reportSessions.map((session) => ({
      id: session.grow_session_id,
      status: "persisted_reference_only",
    }));

  return {
    report: report || {},
    snapshot: snapshot || {},
    snapshots: snapshots.length ? snapshots : (snapshot ? [snapshot] : []),
    cstpRequest: operationalContext.cstpRequest || {},
    cstpTest: operationalContext.cstpTest || {},
    source: operationalContext.source || {},
    sessionLinks,
    growSessions,
    metrics: normalizeArray(evidence.metrics),
    auditLinks: normalizeArray(evidence.auditLinks),
    adminEvent: normalizeArray(evidence.auditLinks)[0] || adminContext,
    actor: adminContext,
    persistedEvidence: {
      metrics: normalizeArray(evidence.metrics),
      sessions: reportSessions,
      auditLinks: normalizeArray(evidence.auditLinks),
    },
  };
}

function buildPersistedValidationOptions({ report = null, snapshot = null } = {}) {
  const snapshotStatus = normalizeNullableText(snapshot?.status).toLowerCase();

  return {
    mode: "persisted_immutable_validation_inspection",
    requireReport: true,
    requireSnapshot: Boolean(report?.id),
    requireSessions: true,
    requireAdminContext: true,
    requireNonEmptyPayload: true,
    requirePublicationReadiness: [
      "prepared",
      "published",
      "published_internal",
    ].includes(snapshotStatus),
    requireAuditLink: ["published", "published_internal"].includes(snapshotStatus),
  };
}

function resolveImmutableValidationSnapshot({
  report = null,
  snapshots = [],
  snapshotId = "",
} = {}) {
  const requestedSnapshotId = normalizeNullableText(snapshotId);
  const ordered = sortSnapshotsForSummary(snapshots);
  if (requestedSnapshotId) {
    return ordered.find((entry) => entry.id === requestedSnapshotId) || null;
  }
  return loadActiveImmutableSnapshot(ordered, report || {});
}

async function loadImmutableSnapshotChain(reportId, { config, fetchImpl }) {
  return loadSnapshotsForReport(reportId, { config, fetchImpl });
}

function loadActiveImmutableSnapshot(snapshots = [], report = {}) {
  const currentSnapshotId = normalizeNullableText(report.current_snapshot_id);
  const ordered = sortSnapshotsForSummary(snapshots);
  if (currentSnapshotId) {
    return ordered.find((snapshot) => snapshot.id === currentSnapshotId) || null;
  }
  return ordered.find((snapshot) => isActiveLineageStatus(snapshot.status))
    || ordered[ordered.length - 1]
    || null;
}

function loadSupersededSnapshots(snapshots = []) {
  return sortSnapshotsForSummary(snapshots)
    .filter((snapshot) => String(snapshot.status || "").trim().toLowerCase() === "superseded");
}

async function summarizeImmutableLineage({
  report = null,
  snapshots = [],
  config,
  fetchImpl,
} = {}) {
  const orderedSnapshots = sortSnapshotsForSummary(snapshots);
  const activeSnapshot = loadActiveImmutableSnapshot(orderedSnapshots, report || {});
  const supersededSnapshots = loadSupersededSnapshots(orderedSnapshots);
  const evidenceCounts = await loadImmutableLineageEvidenceCounts(
    orderedSnapshots,
    { config, fetchImpl },
  );

  return {
    mode: "real_persisted_immutable_lineage",
    internalOnly: true,
    publicVisibility: false,
    certificationRendering: false,
    reportId: report?.id || "",
    cstpRequestId: report?.cstp_request_id || "",
    cstpTestId: report?.cstp_test_id || "",
    activeSnapshotId: activeSnapshot?.id || "",
    activeSnapshotVersion: activeSnapshot?.snapshot_version || "",
    activeSnapshotStatus: activeSnapshot?.status || "",
    latestSnapshotId: orderedSnapshots[orderedSnapshots.length - 1]?.id || "",
    latestSnapshotVersion: orderedSnapshots[orderedSnapshots.length - 1]?.snapshot_version || "",
    snapshotCount: orderedSnapshots.length,
    supersededSnapshotCount: supersededSnapshots.length,
    metricCount: evidenceCounts.metricCount,
    sessionCount: evidenceCounts.sessionCount,
    auditLinkCount: evidenceCounts.auditLinkCount,
    metricCountsBySnapshotId: evidenceCounts.metricCountsBySnapshotId,
    sessionCountsBySnapshotId: evidenceCounts.sessionCountsBySnapshotId,
    auditLinkCountsBySnapshotId: evidenceCounts.auditLinkCountsBySnapshotId,
    chain: orderedSnapshots.map((snapshot) => ({
      id: snapshot.id || "",
      snapshotVersion: snapshot.snapshot_version || "",
      status: snapshot.status || "",
      generatedAt: snapshot.generated_at || "",
      preparedAt: snapshot.prepared_at || "",
      publishedAt: snapshot.published_at || "",
      supersedesSnapshotId: snapshot.supersedes_snapshot_id || "",
      supersededBySnapshotId: snapshot.superseded_by_snapshot_id || "",
      metricCount: evidenceCounts.metricCountsBySnapshotId[snapshot.id] || 0,
      sessionCount: evidenceCounts.sessionCountsBySnapshotId[snapshot.id] || 0,
      auditLinkCount: evidenceCounts.auditLinkCountsBySnapshotId[snapshot.id] || 0,
    })),
  };
}

async function loadImmutableLineageEvidenceCounts(snapshots = [], { config, fetchImpl } = {}) {
  const snapshotIds = uniqueNonEmpty(snapshots.map((snapshot) => snapshot.id));
  if (!snapshotIds.length) {
    return {
      metricCount: 0,
      sessionCount: 0,
      auditLinkCount: 0,
      metricCountsBySnapshotId: {},
      sessionCountsBySnapshotId: {},
      auditLinkCountsBySnapshotId: {},
    };
  }

  const [metricRows, sessionRows, auditLinkRows] = await Promise.all([
    loadManyByFieldIn(CSTP_REPORT_TABLES.metrics, "snapshot_id", snapshotIds, {
      config,
      fetchImpl,
      selectPrefix: "select=id,snapshot_id",
      order: "",
    }),
    loadManyByFieldIn(CSTP_REPORT_TABLES.sessions, "snapshot_id", snapshotIds, {
      config,
      fetchImpl,
      selectPrefix: "select=id,snapshot_id",
      order: "",
    }),
    loadManyByFieldIn(CSTP_REPORT_TABLES.auditLinks, "snapshot_id", snapshotIds, {
      config,
      fetchImpl,
      selectPrefix: "select=id,snapshot_id",
      order: "",
    }),
  ]);

  return {
    metricCount: metricRows.length,
    sessionCount: sessionRows.length,
    auditLinkCount: auditLinkRows.length,
    metricCountsBySnapshotId: countRowsBySnapshotId(metricRows),
    sessionCountsBySnapshotId: countRowsBySnapshotId(sessionRows),
    auditLinkCountsBySnapshotId: countRowsBySnapshotId(auditLinkRows),
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
    selectPrefix = "select=*",
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
    selectPrefix,
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
      /*
       * This REST client keeps insert steps isolated. Supabase REST does not
       * provide an explicit transaction wrapper here, so Generate Report live
       * persistence still reports caller-level rollback limitations through the
       * persistence orchestrator result.
       */
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
    persist: loadedInput.persist,
    dbClient: loadedInput.dbClient,
    routeActionName: payload.actionName,
  };
}

function resolveRouteDbClient({ payload, options, loaded }) {
  if (!payload.persist) {
    return null;
  }

  if (payload.dbClient || options.dbClient || loaded?.dbClient) {
    return payload.dbClient || options.dbClient || loaded.dbClient;
  }

  const config = resolveRouteConfig(
    options.executionOptions
    || options.loadOptions
    || options.readOptions
    || {},
  );
  return createSupabaseInsertDbClient({
    config,
    fetchImpl:
      options.executionOptions?.fetchImpl
      || options.loadOptions?.fetchImpl
      || options.readOptions?.fetchImpl
      || options.fetchImpl
      || globalThis.fetch,
  });
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

function assertValidationScope(context = {}) {
  if (!context.reportId && !context.cstpRequestId && !context.cstpTestId) {
    const error = new Error(
      "Internal CSTP validation inspection requires a report id, CSTP request id, or CSTP test id.",
    );
    error.code = "CSTP_ADMIN_REPORT_VALIDATION_SCOPE_REQUIRED";
    error.details = {
      field: "reportId/cstpRequestId/cstpTestId",
    };
    throw error;
  }
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
    auditLinks: normalizeArray(payload.auditLinks || payload.immutableAuditLinks),
    immutableMetrics: normalizeArray(payload.immutableMetrics),
    immutableReportSessions: normalizeArray(payload.immutableReportSessions),
    existingReport: payload.existingReport || payload.report,
    existingSnapshots: normalizeArray(payload.existingSnapshots),
    reports: normalizeArray(payload.reports),
    snapshots: normalizeArray(payload.snapshots || payload.existingSnapshots),
    validationContext: payload.validationContext,
    validationOptions: payload.validationOptions,
    validationEvidenceSummary: payload.validationEvidenceSummary,
    evidenceExplorerSummary: payload.evidenceExplorerSummary,
    persistedImmutableValidation: payload.persistedImmutableValidation,
    persistedImmutableValidationEvidence: payload.persistedImmutableValidationEvidence,
    candidate: payload.candidate,
    workflowInput: payload.workflowInput,
  };
}

function shouldLoadLineageForRoute(definition = {}, payload = {}) {
  if (["workflow_with_lineage", "validation"].includes(definition.loadMode)) {
    return true;
  }

  return Boolean(
    definition.workflowMode === GENERATE_WORKFLOW_MODE
    && normalizeBoolean(payload.requestedPersist || payload.persist, false)
    && normalizePersistenceMode(payload) === LIVE_GENERATE_PERSISTENCE_MODE
  );
}

function validateRoutePersistenceGate({
  definition = {},
  input = {},
  loaded = {},
} = {}) {
  const requestedPersist = Boolean(input.requestedPersist);
  const workflowMode = normalizeNullableText(definition.workflowMode);
  const persistenceMode = normalizePersistenceMode(input);

  if (!requestedPersist) {
    return buildRoutePersistenceGateSummary({
      persist: false,
      status: "deferred",
      workflowMode,
      persistenceMode,
    });
  }

  if (workflowMode !== GENERATE_WORKFLOW_MODE) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_PERSISTENCE_WORKFLOW_REJECTED",
      message: "Immutable persistence is only enabled for the internal Generate Report workflow.",
      field: "workflowMode",
      metadata: { workflowMode },
    });
  }

  if (persistenceMode !== LIVE_GENERATE_PERSISTENCE_MODE) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_GENERATE_PERSISTENCE_NOT_ALLOWED",
      message: "Generate Report persistence requires persistenceMode live_guarded.",
      field: "persistenceMode",
      metadata: { persistenceMode },
    });
  }

  if (!normalizeTimestamp(input.workflowTimestamp)) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_PERSISTENCE_TIMESTAMP_REQUIRED",
      message: "Generate Report persistence requires an explicit workflow timestamp.",
      field: "workflowTimestamp",
    });
  }

  if (!getAdminUserId(input.adminContext)) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_PERSISTENCE_ADMIN_REQUIRED",
      message: "Generate Report persistence requires an authenticated admin actor.",
      field: "adminContext.adminUserId",
    });
  }

  const summary = buildOperationalLoadingSummary(loaded, {
    requestedPersist: true,
    effectivePersist: true,
    loadMode: definition.loadMode,
    persistenceMode,
  });
  const completeness = summary.operationalCompleteness || {};
  if (!completeness.hasRequest || !completeness.hasTest) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_PERSISTENCE_OPERATIONAL_IDS_REQUIRED",
      message: "Generate Report persistence requires loaded CSTP request and test records.",
      field: "cstpRequestId/cstpTestId",
      metadata: { operationalLoadingSummary: summary },
    });
  }

  if (!completeness.hasSessionLinkage || !completeness.hasGrowSessions) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_PERSISTENCE_SESSIONS_REQUIRED",
      message: "Generate Report persistence requires linked CSTP test sessions and real Grow session records.",
      field: "cstpTestSessions/growSessions",
      metadata: { operationalLoadingSummary: summary },
    });
  }

  if (!completeness.hasSource) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_PERSISTENCE_SOURCE_REQUIRED",
      message: "Generate Report persistence requires loaded source context.",
      field: "source",
      metadata: { operationalLoadingSummary: summary },
    });
  }

  if (!linkedGrowSessionsAreComplete(loaded)) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_PERSISTENCE_LINKED_GROW_SESSION_MISSING",
      message: "Every CSTP test-session link must resolve to a loaded Grow session before persistence.",
      field: "growSessions",
    });
  }

  if (loaded.existingReport?.id || normalizeArray(loaded.existingSnapshots).length > 0) {
    throwRoutePersistenceError({
      code: "CSTP_ADMIN_REPORT_GENERATE_CONFLICT",
      message: "Generate Report live persistence is blocked because an immutable report lineage already exists for this CSTP scope.",
      field: "existingReport",
      metadata: {
        existingReportId: loaded.existingReport?.id || "",
        existingSnapshotCount: normalizeArray(loaded.existingSnapshots).length,
      },
    });
  }

  return buildRoutePersistenceGateSummary({
    persist: true,
    status: "live_guarded_generate_persistence_enabled",
    workflowMode,
    persistenceMode,
  });
}

function buildRoutePersistenceGateSummary({
  persist,
  status,
  workflowMode,
  persistenceMode,
} = {}) {
  return {
    persist: Boolean(persist),
    status,
    workflowMode,
    persistenceMode,
    generateOnly: true,
    guarded: Boolean(persist),
    publicAccess: false,
    rendering: false,
    certification: false,
    destructiveMutation: false,
  };
}

function throwRoutePersistenceError({
  code,
  message,
  field,
  metadata = {},
}) {
  const error = new Error(message);
  error.code = code;
  error.details = {
    field,
    metadata,
  };
  throw error;
}

function linkedGrowSessionsAreComplete(loaded = {}) {
  const sessionIds = uniqueNonEmpty(
    normalizeArray(loaded.cstpTestSessions).map(getGrowSessionIdFromTestSession),
  );
  const loadedGrowSessionIds = new Set(
    normalizeArray(loaded.growSessions).map((session) => normalizeNullableText(session.id)),
  );

  return sessionIds.length > 0 && sessionIds.every((id) => loadedGrowSessionIds.has(id));
}

function sortSnapshotsForSummary(snapshots = []) {
  return normalizeArray(snapshots).sort((left, right) => {
    const leftVersion = Number(left.snapshot_version || left.snapshotVersion || 0);
    const rightVersion = Number(right.snapshot_version || right.snapshotVersion || 0);
    if (leftVersion !== rightVersion) {
      return leftVersion - rightVersion;
    }
    return normalizeNullableText(left.created_at || left.generated_at)
      .localeCompare(normalizeNullableText(right.created_at || right.generated_at));
  });
}

function isActiveLineageStatus(status = "") {
  return [
    "generated",
    "prepared",
    "published",
    "published_internal",
  ].includes(String(status || "").trim().toLowerCase());
}

function countRowsBySnapshotId(rows = []) {
  return normalizeArray(rows).reduce((counts, row) => {
    const snapshotId = normalizeNullableText(row.snapshot_id || row.snapshotId);
    if (snapshotId) {
      counts[snapshotId] = (counts[snapshotId] || 0) + 1;
    }
    return counts;
  }, {});
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
    immutableLineageSummary: loadedInput.immutableLineageSummary || null,
    validationEvidenceSummary:
      result.validationEvidenceSummary
      || loadedInput.validationEvidenceSummary
      || null,
    reconciliationSummary:
      result.reconciliationSummary
      || result.serviceResult?.reconciliationSummary
      || null,
    evidenceExplorerSummary:
      result.evidenceExplorerSummary
      || result.serviceResult?.evidenceExplorerSummary
      || result.lineageSummary?.evidenceExplorerSummary
      || null,
    actor: {
      userId: authorization.actor.userId,
      authorizationSource: authorization.actor.authorizationSource,
    },
    routeSafety: buildRouteSafety({
      realImmutablePersistence: loadedInput.persist === true,
    }),
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

function buildRouteSafety({ realImmutablePersistence = false } = {}) {
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
    shadowMode: !realImmutablePersistence,
    guardedGeneratePersistence: realImmutablePersistence,
    immutablePersistenceDeferred: !realImmutablePersistence,
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
    "CSTP_ADMIN_REPORT_PERSISTENCE_WORKFLOW_REJECTED",
    "CSTP_ADMIN_REPORT_GENERATE_PERSISTENCE_NOT_ALLOWED",
    "CSTP_ADMIN_REPORT_PERSISTENCE_TIMESTAMP_REQUIRED",
    "CSTP_ADMIN_REPORT_PERSISTENCE_ADMIN_REQUIRED",
    "CSTP_ADMIN_REPORT_PERSISTENCE_OPERATIONAL_IDS_REQUIRED",
    "CSTP_ADMIN_REPORT_PERSISTENCE_SESSIONS_REQUIRED",
    "CSTP_ADMIN_REPORT_PERSISTENCE_SOURCE_REQUIRED",
    "CSTP_ADMIN_REPORT_PERSISTENCE_LINKED_GROW_SESSION_MISSING",
    "CSTP_ADMIN_REPORT_GENERATE_CONFLICT",
    "CSTP_ADMIN_REPORT_VALIDATION_SCOPE_REQUIRED",
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

function normalizePersistenceMode(value = {}) {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  return normalizeNullableText(
    value.persistenceMode
    || value.persistence_mode
    || value.immutablePersistenceMode,
  ).toLowerCase();
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

function getAdminUserId(adminContext = {}) {
  return normalizeNullableText(
    adminContext.adminUserId
    || adminContext.userId
    || adminContext.id,
  );
}

function buildOperationalLoadingSummary(loaded = {}, {
  requestedPersist = false,
  effectivePersist = false,
  loadMode = "",
  persistenceMode = "",
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

  const livePersistence = Boolean(effectivePersist);

  return {
    mode: livePersistence
      ? "live_guarded_generate_persistence"
      : "shadow_deferred_persistence",
    loadMode,
    realOperationalRecordsLoaded: true,
    persistenceRequested: Boolean(requestedPersist),
    persistenceEffective: livePersistence,
    persistenceDeferred: !livePersistence,
    persistenceMode,
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
      immutablePersistence: livePersistence,
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
  loadActiveImmutableSnapshot,
  loadCstpOperationalContext,
  loadImmutableReportEvidence,
  loadImmutableReportLineage,
  loadImmutableSnapshotChain,
  loadImmutableValidationContext,
  loadSupersededSnapshots,
  loadAdminReportActionInput,
  loadCstpAdminReportData,
  parseRequestBody,
  summarizeImmutableValidationEvidence,
  summarizeImmutableLineage,
};
