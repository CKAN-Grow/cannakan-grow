"use strict";

const {
  ADMIN_REPORT_ACTIONS,
  generateCstpReportForAdmin,
  inspectCstpReportLineageForAdmin,
  inspectCstpReportValidationForAdmin,
  prepareCstpReportForAdmin,
  regenerateCstpReportForAdmin,
  supersedeCstpReportForAdmin,
} = require("./admin-report-management-service");
const {
  CSTP_REPORT_TABLES,
  createValidationIssue,
  createValidationResult,
  mergeValidationResults,
} = require("./immutable-report-validator");

/*
 * Internal admin-only CSTP report action infrastructure.
 *
 * These callable handlers are not HTTP endpoints, public APIs, UI wiring, or
 * public report behavior. They enforce admin-only action boundaries and
 * delegate immutable workflow execution to the admin report management service.
 * Rendering, certification, Source Directory, Community Grow, and public
 * integrations are deferred. Operational grow_sessions remain canonical and
 * are never mutated here.
 */

const ADMIN_REPORT_ACTION_LAYER_ACTIONS = Object.freeze({
  ...ADMIN_REPORT_ACTIONS,
  list: "list_cstp_reports_for_admin",
});

function prepareCstpReportAction(input = {}, options = {}) {
  return executeDelegatedAdminAction({
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.prepare,
    workflowMode: "prepare",
    serviceCall: prepareCstpReportForAdmin,
    input,
    options,
  });
}

function generateCstpReportAction(input = {}, options = {}) {
  return executeDelegatedAdminAction({
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.generate,
    workflowMode: "generate",
    serviceCall: generateCstpReportForAdmin,
    input,
    options,
  });
}

function regenerateCstpReportAction(input = {}, options = {}) {
  return executeDelegatedAdminAction({
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.regenerate,
    workflowMode: "regenerate",
    serviceCall: regenerateCstpReportForAdmin,
    input,
    options,
  });
}

function supersedeCstpReportAction(input = {}, options = {}) {
  return executeDelegatedAdminAction({
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.supersede,
    workflowMode: "supersede",
    serviceCall: supersedeCstpReportForAdmin,
    input,
    options,
  });
}

function inspectCstpReportLineageAction(input = {}, options = {}) {
  return executeDelegatedAdminAction({
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.inspectLineage,
    workflowMode: "inspect_lineage",
    serviceCall: inspectCstpReportLineageForAdmin,
    input,
    options,
  });
}

function inspectCstpReportValidationAction(input = {}, options = {}) {
  return executeDelegatedAdminAction({
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.inspectValidation,
    workflowMode: "inspect_validation",
    serviceCall: inspectCstpReportValidationForAdmin,
    input,
    options,
  });
}

function listCstpReportsAction(input = {}, options = {}) {
  const normalizedInput = normalizeActionInput(input, options);
  const validation = validateAdminActionContext(normalizedInput, {
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.list,
    workflowMode: "list_internal_reports",
    requireTimestamp: true,
  });

  if (!validation.ok) {
    return buildActionResult({
      ok: false,
      status: "admin_action_preflight_failed",
      actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.list,
      workflowMode: "list_internal_reports",
      validation,
      message: "Internal CSTP admin report list action was rejected before execution.",
    });
  }

  const listValidation = validateListScope(normalizedInput);
  const combinedValidation = mergeValidationResults(
    "listCstpReportsAction",
    [
      validation,
      listValidation,
    ],
    {
      actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.list,
      workflowMode: "list_internal_reports",
    },
  );

  if (!combinedValidation.ok) {
    return buildActionResult({
      ok: false,
      status: "admin_action_list_rejected",
      actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.list,
      workflowMode: "list_internal_reports",
      validation: combinedValidation,
      message: "Internal CSTP admin report list action was rejected by validation.",
    });
  }

  const listResult = buildInternalReportList(normalizedInput);

  return buildActionResult({
    ok: true,
    status: "admin_action_listed",
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.list,
    workflowMode: "list_internal_reports",
    validation: combinedValidation,
    lineageSummary: listResult.lineageSummary,
    serviceResult: listResult,
    message: "Internal CSTP admin report list action completed.",
  });
}

async function executeDelegatedAdminAction({
  actionName,
  workflowMode,
  serviceCall,
  input = {},
  options = {},
}) {
  const normalizedInput = normalizeActionInput(input, options);
  const validation = validateAdminActionContext(normalizedInput, {
    actionName,
    workflowMode,
    requireTimestamp: true,
  });

  if (!validation.ok) {
    return buildActionResult({
      ok: false,
      status: "admin_action_preflight_failed",
      actionName,
      workflowMode,
      validation,
      message: "Internal CSTP admin report action was rejected before service delegation.",
    });
  }

  const serviceResult = await serviceCall(
    {
      ...input,
      ...pickActionDependencyFields(normalizedInput),
    },
    {
      ...options,
      workflowTimestamp: normalizedInput.workflowTimestamp,
      dbClient: normalizedInput.dbClient,
      persist: normalizedInput.persist,
    },
  );

  return buildActionResult({
    ok: Boolean(serviceResult.ok),
    status: serviceResult.status || (serviceResult.ok ? "admin_action_completed" : "admin_action_failed"),
    actionName,
    workflowMode: serviceResult.workflowMode || workflowMode,
    validation: serviceResult.validation,
    lineageSummary: serviceResult.lineageSummary,
    persistenceSummary: serviceResult.persistenceSummary,
    serviceResult,
    message: serviceResult.message || buildDefaultActionMessage(actionName, serviceResult.ok),
  });
}

function validateAdminActionContext(input = {}, {
  actionName,
  workflowMode,
  requireTimestamp = true,
} = {}) {
  const issues = [];
  const adminUserId = getAdminUserId(input.adminContext);

  if (!adminUserId) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_ACTION_ADMIN_CONTEXT_REQUIRED",
      message: "Internal CSTP admin report actions require an authenticated admin user context.",
      entity: "admin_context",
      field: "adminContext.adminUserId",
      metadata: {
        actionName,
        workflowMode,
      },
    }));
  }

  if (isPublicOrAnonymousContext(input.adminContext)) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_ACTION_PUBLIC_CONTEXT_REJECTED",
      message: "Internal CSTP admin report actions reject anonymous or public contexts.",
      entity: "admin_context",
      field: "adminContext",
      metadata: {
        actionName,
        workflowMode,
      },
    }));
  }

  if (requireTimestamp && !input.workflowTimestamp) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_ACTION_TIMESTAMP_REQUIRED",
      message: "Internal CSTP admin report actions require an explicit workflow timestamp.",
      entity: "workflow",
      field: "workflowTimestamp",
      metadata: {
        actionName,
        workflowMode,
      },
    }));
  }

  return createValidationResult({
    validator: "validateAdminActionContext",
    issues,
    metadata: {
      actionName,
      workflowMode,
      adminUserId: adminUserId || null,
      internalOnly: true,
    },
  });
}

function validateListScope(input = {}) {
  const issues = [];

  if (!input.cstpRequestId && !input.cstpTestId) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_ACTION_LIST_SCOPE_REQUIRED",
      message: "Internal CSTP report listing requires a CSTP request id, CSTP test id, or both.",
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "cstpRequestId",
    }));
  }

  if (!Array.isArray(input.reports)) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_ACTION_LIST_REPORTS_REQUIRED",
      message: "Internal CSTP report listing requires caller-supplied report records.",
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "reports",
    }));
  }

  return createValidationResult({
    validator: "validateListScope",
    issues,
    metadata: {
      cstpRequestId: input.cstpRequestId || null,
      cstpTestId: input.cstpTestId || null,
      reportCount: Array.isArray(input.reports) ? input.reports.length : 0,
    },
  });
}

function buildInternalReportList(input = {}) {
  const snapshots = Array.isArray(input.snapshots) ? input.snapshots.slice() : [];
  const reports = input.reports
    .filter((report) => matchesListScope(report, input))
    .filter((report) => matchesStatusFilter(report, input.statuses))
    .map((report) => buildReportListItem(report, snapshots));

  return deepFreeze({
    ok: true,
    success: true,
    actionName: ADMIN_REPORT_ACTION_LAYER_ACTIONS.list,
    workflowMode: "list_internal_reports",
    cstpRequestId: input.cstpRequestId || null,
    cstpTestId: input.cstpTestId || null,
    resultCount: reports.length,
    reports,
    lineageSummary: {
      reportCount: reports.length,
      snapshotCount: reports.reduce((count, report) => count + report.snapshotCount, 0),
      activeSnapshotCount: reports.filter((report) => report.activeSnapshotId).length,
      publicVisibility: false,
      internalOnly: true,
    },
    safety: buildActionSafetySummary(),
    internalOnly: true,
  });
}

function buildReportListItem(report = {}, snapshots = []) {
  const reportId = getIdValue(report, ["id", "reportId"]);
  const reportSnapshots = snapshots
    .filter((snapshot) => getIdValue(snapshot, ["report_id", "reportId"]) === reportId)
    .sort(compareSnapshotsStable);
  const activeSnapshot = resolveActiveSnapshot(report, reportSnapshots);

  return {
    id: reportId || null,
    cstpRequestId: getIdValue(report, ["cstp_request_id", "cstpRequestId", "requestId"]) || null,
    cstpTestId: getIdValue(report, ["cstp_test_id", "cstpTestId", "testId"]) || null,
    sourceId: getIdValue(report, ["source_id", "sourceId"]) || null,
    status: normalizeNullableText(report.status) || null,
    currentSnapshotId: getIdValue(report, ["current_snapshot_id", "currentSnapshotId"]) || null,
    activeSnapshotId: getIdValue(activeSnapshot, ["id", "snapshotId"]) || null,
    activeSnapshotStatus: normalizeNullableText(activeSnapshot?.status) || null,
    snapshotCount: reportSnapshots.length,
    createdAt: normalizeTimestamp(report.created_at || report.createdAt) || null,
    updatedAt: normalizeTimestamp(report.updated_at || report.updatedAt) || null,
    preparedAt: normalizeTimestamp(report.prepared_at || report.preparedAt) || null,
    publishedAt: normalizeTimestamp(report.published_at || report.publishedAt) || null,
    internalOnly: true,
  };
}

function buildActionResult({
  ok,
  status,
  actionName,
  workflowMode,
  validation,
  lineageSummary = null,
  persistenceSummary = null,
  serviceResult = null,
  message,
}) {
  const blockingErrors = validation?.issues?.filter((issue) => issue.blocking) || [];
  const validationWarnings = validation?.issues?.filter((issue) => !issue.blocking) || [];

  return deepFreeze({
    ok,
    success: ok,
    action: actionName,
    actionName,
    adminAction: actionName,
    workflowMode,
    status,
    validation: validation || null,
    validationSummary: validation?.summary || null,
    lineageSummary: lineageSummary || null,
    persistenceSummary: persistenceSummary || null,
    message,
    errors: blockingErrors,
    blockingErrors,
    warnings: buildActionWarnings(serviceResult, validationWarnings),
    serviceResult,
    safety: buildActionSafetySummary(),
    internalOnly: true,
  });
}

function buildActionWarnings(serviceResult, validationWarnings = []) {
  return [
    "Internal admin-only CSTP report action layer.",
    "No public API, UI, rendering, certification, or public integration behavior is implemented here.",
    "Operational grow_sessions remain canonical and are not mutated.",
  ]
    .concat(serviceResult?.warnings || [])
    .concat(validationWarnings.map((issue) => issue.message));
}

function buildActionSafetySummary() {
  return {
    adminOnly: true,
    publicAccess: false,
    publicApi: false,
    uiWiring: false,
    renderingImplemented: false,
    certificationImplemented: false,
    sourceDirectoryIntegration: false,
    communityGrowIntegration: false,
    destructiveSnapshotEdits: false,
    mutatesGrowSessions: false,
    requiresCallerSuppliedDependencies: true,
    requiresExplicitTimestamp: true,
  };
}

function buildDefaultActionMessage(actionName, ok) {
  const label = normalizeNullableText(actionName).replace(/_/g, " ");
  return ok
    ? `Internal CSTP admin action ${label} completed.`
    : `Internal CSTP admin action ${label} failed.`;
}

function normalizeActionInput(input = {}, options = {}) {
  const cstpRequestId = normalizeNullableText(
    input.cstpRequestId
    || input.requestId
    || input.cstpRequest?.id
    || options.cstpRequestId
    || options.requestId,
  );
  const cstpTestId = normalizeNullableText(
    input.cstpTestId
    || input.testId
    || input.cstpTest?.id
    || options.cstpTestId
    || options.testId,
  );

  return {
    ...input,
    adminContext: input.adminContext || options.adminContext || {},
    workflowTimestamp: normalizeTimestamp(
      input.workflowTimestamp
      || input.timestamp
      || options.workflowTimestamp
      || options.timestamp,
    ),
    dbClient: input.dbClient || input.databaseClient || options.dbClient,
    persist: Boolean(input.persist || options.persist),
    cstpRequestId,
    cstpTestId,
    reports: normalizeRecordArray(
      input.reports
      || input.internalReports
      || input.existingReports
      || input.existingReport
      || input.report,
    ),
    snapshots: normalizeRecordArray(
      input.snapshots
      || input.existingSnapshots
      || input.snapshot,
    ),
    statuses: normalizeStringArray(input.statuses || input.status || options.statuses || options.status),
  };
}

function pickActionDependencyFields(input = {}) {
  return {
    adminContext: input.adminContext,
    workflowTimestamp: input.workflowTimestamp,
    dbClient: input.dbClient,
    persist: input.persist,
  };
}

function normalizeRecordArray(value) {
  if (Array.isArray(value)) {
    return value.slice();
  }
  if (value && typeof value === "object") {
    return [value];
  }
  return [];
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeNullableText).filter(Boolean);
  }
  const normalized = normalizeNullableText(value);
  return normalized ? [normalized] : [];
}

function matchesListScope(report = {}, input = {}) {
  const requestId = getIdValue(report, ["cstp_request_id", "cstpRequestId", "requestId"]);
  const testId = getIdValue(report, ["cstp_test_id", "cstpTestId", "testId"]);

  return (!input.cstpRequestId || requestId === input.cstpRequestId)
    && (!input.cstpTestId || testId === input.cstpTestId);
}

function matchesStatusFilter(report = {}, statuses = []) {
  if (!statuses.length) {
    return true;
  }
  return statuses.includes(normalizeNullableText(report.status));
}

function resolveActiveSnapshot(report = {}, snapshots = []) {
  const currentSnapshotId = getIdValue(report, ["current_snapshot_id", "currentSnapshotId"]);
  if (currentSnapshotId) {
    const current = snapshots.find((snapshot) => (
      getIdValue(snapshot, ["id", "snapshotId"]) === currentSnapshotId
    ));
    if (current) {
      return current;
    }
  }

  return snapshots.find((snapshot) => (
    ["prepared", "published", "published_internal"].includes(
      normalizeNullableText(snapshot.status),
    )
  )) || snapshots[snapshots.length - 1] || null;
}

function compareSnapshotsStable(left = {}, right = {}) {
  const leftVersion = Number(left.snapshot_version || left.snapshotVersion || 0);
  const rightVersion = Number(right.snapshot_version || right.snapshotVersion || 0);
  if (leftVersion !== rightVersion) {
    return leftVersion - rightVersion;
  }
  const leftCreated = normalizeTimestamp(left.created_at || left.createdAt || left.generated_at);
  const rightCreated = normalizeTimestamp(right.created_at || right.createdAt || right.generated_at);
  if (leftCreated !== rightCreated) {
    return leftCreated.localeCompare(rightCreated);
  }
  return normalizeNullableText(left.id).localeCompare(normalizeNullableText(right.id));
}

function getAdminUserId(adminContext = {}) {
  return getIdValue(adminContext, [
    "adminUserId",
    "createdBy",
    "userId",
    "id",
  ]);
}

function isPublicOrAnonymousContext(adminContext = {}) {
  return adminContext.anonymous === true
    || adminContext.public === true
    || adminContext.publicAccess === true
    || adminContext.isPublic === true;
}

function getIdValue(record, keys) {
  const value = getFirstValue(record, keys);
  return normalizeNullableText(value);
}

function getFirstValue(record, keys) {
  if (!record || typeof record !== "object") {
    return undefined;
  }

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }

  return undefined;
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
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

module.exports = {
  ADMIN_REPORT_ACTION_LAYER_ACTIONS,
  prepareCstpReportAction,
  generateCstpReportAction,
  regenerateCstpReportAction,
  supersedeCstpReportAction,
  inspectCstpReportLineageAction,
  inspectCstpReportValidationAction,
  listCstpReportsAction,
  validateAdminActionContext,
};
