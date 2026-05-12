"use strict";

const {
  CSTP_REPORT_TABLES,
  VALIDATION_SEVERITIES,
  createValidationIssue,
  createValidationResult,
  mergeValidationResults,
  validateImmutableReportSnapshotCandidate,
  validatePublicationReadinessShape,
} = require("./immutable-report-validator");
const {
  prepareImmutableReportSnapshot,
  generateImmutableReportSnapshot,
  regenerateImmutableReportSnapshot,
  supersedeImmutableReportSnapshot,
  validateImmutableReportWorkflowInputs,
} = require("./immutable-report-orchestrator");
const {
  detectDuplicateActiveLineage,
  detectLineageCycle,
  resolveActiveSnapshotLineage,
} = require("./immutable-report-lineage-orchestrator");

/*
 * Internal admin-only CSTP report management infrastructure.
 *
 * This service wraps the immutable report orchestrator in safe admin-callable
 * workflows. It is not public API behavior, does not create Supabase clients,
 * does not render reports, does not certify sources, does not expose public
 * report state, and does not mutate operational grow_sessions. grow_sessions
 * remain canonical operational records; immutable snapshots remain frozen
 * evidence records. Public integrations, rendering, and certification behavior
 * are deferred.
 */

const ADMIN_REPORT_ACTIONS = Object.freeze({
  prepare: "prepare_cstp_report_for_admin",
  generate: "generate_cstp_report_for_admin",
  regenerate: "regenerate_cstp_report_for_admin",
  supersede: "supersede_cstp_report_for_admin",
  inspectLineage: "inspect_cstp_report_lineage_for_admin",
  inspectValidation: "inspect_cstp_report_validation_for_admin",
});

async function prepareCstpReportForAdmin(input = {}, options = {}) {
  return executeAdminWorkflow({
    action: ADMIN_REPORT_ACTIONS.prepare,
    workflowMode: "prepare",
    workflow: prepareImmutableReportSnapshot,
    input,
    options,
  });
}

async function generateCstpReportForAdmin(input = {}, options = {}) {
  return executeAdminWorkflow({
    action: ADMIN_REPORT_ACTIONS.generate,
    workflowMode: "generate",
    workflow: generateImmutableReportSnapshot,
    input,
    options,
  });
}

async function regenerateCstpReportForAdmin(input = {}, options = {}) {
  return executeAdminWorkflow({
    action: ADMIN_REPORT_ACTIONS.regenerate,
    workflowMode: "regenerate",
    workflow: regenerateImmutableReportSnapshot,
    input,
    options,
    requireExistingLineage: true,
  });
}

async function supersedeCstpReportForAdmin(input = {}, options = {}) {
  return executeAdminWorkflow({
    action: ADMIN_REPORT_ACTIONS.supersede,
    workflowMode: "supersede",
    workflow: supersedeImmutableReportSnapshot,
    input,
    options,
    requireExistingLineage: true,
  });
}

function inspectCstpReportLineageForAdmin(input = {}, options = {}) {
  const normalizedInput = normalizeAdminInput(input, options);
  const adminValidation = validateAdminManagementInputs(normalizedInput, {
    action: ADMIN_REPORT_ACTIONS.inspectLineage,
    requireOperationalData: false,
    requireExistingLineage: false,
    requireDbClientForPersistence: false,
  });
  const activeLineage = resolveActiveSnapshotLineage({
    report: normalizedInput.existingReport,
    snapshots: normalizedInput.existingSnapshots,
  });
  const duplicateActiveValidation = detectDuplicateActiveLineage(
    normalizedInput.existingSnapshots,
  );
  const cycleValidation = detectLineageCycle(normalizedInput.existingSnapshots);
  const validation = mergeValidationResults(
    "inspectCstpReportLineageForAdmin",
    [
      adminValidation,
      duplicateActiveValidation,
      cycleValidation,
    ],
    {
      action: ADMIN_REPORT_ACTIONS.inspectLineage,
      workflowTimestamp: normalizedInput.workflowTimestamp,
    },
  );

  return buildAdminResult({
    ok: validation.ok,
    status: validation.ok ? "lineage_inspected" : "lineage_validation_failed",
    action: ADMIN_REPORT_ACTIONS.inspectLineage,
    workflowMode: "inspect_lineage",
    validation,
    lineageSummary: summarizeActiveLineage(activeLineage, {
      duplicateActiveValidation,
      cycleValidation,
      immutableLineageSummary: normalizedInput.immutableLineageSummary,
    }),
    message: validation.ok
      ? "Internal CSTP report lineage inspection completed."
      : "Internal CSTP report lineage inspection found blocking issues.",
  });
}

function inspectCstpReportValidationForAdmin(input = {}, options = {}) {
  const normalizedInput = normalizeAdminInput(input, options);
  const adminValidation = validateAdminManagementInputs(normalizedInput, {
    action: ADMIN_REPORT_ACTIONS.inspectValidation,
    requireOperationalData: false,
    requireExistingLineage: false,
    requireDbClientForPersistence: false,
  });
  const validationTargetResults = buildValidationInspectionResults(
    input,
    normalizedInput,
  );
  const validation = mergeValidationResults(
    "inspectCstpReportValidationForAdmin",
    [
      adminValidation,
      ...validationTargetResults,
    ],
    {
      action: ADMIN_REPORT_ACTIONS.inspectValidation,
      inspectedTargetCount: validationTargetResults.length,
    },
  );

  return buildAdminResult({
    ok: validation.ok,
    status: validation.ok ? "validation_inspected" : "validation_issues_found",
    action: ADMIN_REPORT_ACTIONS.inspectValidation,
    workflowMode: "inspect_validation",
    validation,
    validationEvidenceSummary: normalizedInput.validationEvidenceSummary,
    message: validation.ok
      ? "Internal CSTP report validation inspection completed."
      : "Internal CSTP report validation inspection found blocking issues.",
  });
}

async function executeAdminWorkflow({
  action,
  workflowMode,
  workflow,
  input = {},
  options = {},
  requireExistingLineage = false,
}) {
  const normalizedInput = normalizeAdminInput(
    {
      ...input,
      workflowMode,
    },
    {
      ...options,
      workflowMode,
    },
  );
  const adminValidation = validateAdminManagementInputs(normalizedInput, {
    action,
    requireExistingLineage,
    requireOperationalData: true,
    requireDbClientForPersistence: normalizedInput.persist,
  });
  const workflowInputValidation = validateImmutableReportWorkflowInputs(
    normalizedInput,
    {
      mode: workflowMode,
    },
  );
  const preflightValidation = mergeValidationResults(
    "adminCstpReportWorkflowPreflight",
    [
      adminValidation,
      workflowInputValidation,
    ],
    {
      action,
      workflowMode,
      persist: normalizedInput.persist,
    },
  );

  if (!preflightValidation.ok) {
    return buildAdminResult({
      ok: false,
      status: "admin_preflight_failed",
      action,
      workflowMode,
      validation: preflightValidation,
      message: "Internal CSTP admin report action was rejected before workflow execution.",
    });
  }

  const workflowResult = await workflow(normalizedInput, options);
  const validation = mergeValidationResults(
    "adminCstpReportWorkflowResult",
    [
      preflightValidation,
      workflowResult.validation,
    ].filter(Boolean),
    {
      action,
      workflowMode,
      workflowStatus: workflowResult.status,
    },
  );

  return buildAdminResult({
    ok: workflowResult.ok,
    status: workflowResult.status,
    action,
    workflowMode,
    validation,
    workflowResult,
    lineageSummary: workflowResult.lineagePlanSummary,
    persistenceSummary: workflowResult.persistenceResultSummary,
    message: buildAdminMessage({
      action,
      ok: workflowResult.ok,
      status: workflowResult.status,
      persist: normalizedInput.persist,
    }),
  });
}

function validateAdminManagementInputs(input = {}, options = {}) {
  const issues = [];
  const action = normalizeNullableText(options.action) || "cstp_admin_report_action";
  const requireOperationalData = options.requireOperationalData !== false;
  const requireExistingLineage = options.requireExistingLineage === true;
  const requireDbClientForPersistence = options.requireDbClientForPersistence === true;
  const adminUserId = getAdminUserId(input.adminContext);

  if (!adminUserId) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_REPORT_ADMIN_CONTEXT_REQUIRED",
      message: "Admin report management requires an authenticated admin user context.",
      entity: "audit",
      table: CSTP_REPORT_TABLES.auditLinks,
      field: "adminContext.adminUserId",
    }));
  }

  if (isPublicOrAnonymousContext(input.adminContext)) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_REPORT_PUBLIC_CONTEXT_REJECTED",
      message: "Admin report management does not allow anonymous or public contexts.",
      entity: "admin_context",
      field: "adminContext",
    }));
  }

  if (!input.workflowTimestamp) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_REPORT_TIMESTAMP_REQUIRED",
      message: "Admin report management requires an explicit valid workflow timestamp.",
      entity: "workflow",
      field: "workflowTimestamp",
    }));
  }

  if (requireDbClientForPersistence && !input.dbClient) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_REPORT_DB_CLIENT_REQUIRED",
      message: "Persistence-enabled admin report management requires a caller-supplied database client.",
      entity: "workflow",
      field: "dbClient",
    }));
  }

  if (requireOperationalData) {
    validateOperationalInputs({ issues, input });
  }

  if (requireExistingLineage) {
    if (!hasIdentifier(input.existingReport)) {
      issues.push(createValidationIssue({
        code: "CSTP_ADMIN_REPORT_EXISTING_REPORT_REQUIRED",
        message: "This admin report action requires an existing report record.",
        entity: "report",
        table: CSTP_REPORT_TABLES.reports,
        field: "existingReport",
      }));
    }

    if (!Array.isArray(input.existingSnapshots) || input.existingSnapshots.length === 0) {
      issues.push(createValidationIssue({
        code: "CSTP_ADMIN_REPORT_EXISTING_SNAPSHOTS_REQUIRED",
        message: "This admin report action requires existing immutable snapshot records.",
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
        field: "existingSnapshots",
      }));
    }
  }

  return createValidationResult({
    validator: "validateAdminManagementInputs",
    issues,
    metadata: {
      action,
      requireOperationalData,
      requireExistingLineage,
      requireDbClientForPersistence,
    },
  });
}

function validateOperationalInputs({ issues, input }) {
  if (!hasIdentifier(input.cstpRequest)) {
    issues.push(createMissingInputIssue({
      code: "CSTP_ADMIN_REPORT_REQUEST_REQUIRED",
      entity: "cstp_request",
      table: CSTP_REPORT_TABLES.requests,
      field: "cstpRequest",
    }));
  }

  if (!hasIdentifier(input.cstpTest)) {
    issues.push(createMissingInputIssue({
      code: "CSTP_ADMIN_REPORT_TEST_REQUIRED",
      entity: "cstp_test",
      table: CSTP_REPORT_TABLES.tests,
      field: "cstpTest",
    }));
  }

  if (!hasIdentifier(input.source)) {
    issues.push(createMissingInputIssue({
      code: "CSTP_ADMIN_REPORT_SOURCE_REQUIRED",
      entity: "source",
      table: CSTP_REPORT_TABLES.sources,
      field: "source",
    }));
  }

  if (!Array.isArray(input.cstpTestSessions) || input.cstpTestSessions.length === 0) {
    issues.push(createMissingInputIssue({
      code: "CSTP_ADMIN_REPORT_TEST_SESSIONS_REQUIRED",
      entity: "cstp_test_session",
      table: CSTP_REPORT_TABLES.testSessions,
      field: "cstpTestSessions",
    }));
  }

  if (!Array.isArray(input.growSessions) || input.growSessions.length === 0) {
    issues.push(createMissingInputIssue({
      code: "CSTP_ADMIN_REPORT_GROW_SESSIONS_REQUIRED",
      entity: "grow_session",
      table: CSTP_REPORT_TABLES.growSessions,
      field: "growSessions",
    }));
  }
}

function buildValidationInspectionResults(rawInput = {}, normalizedInput = {}) {
  const results = [];
  const persistedEvidenceSummary = normalizedInput.validationEvidenceSummary || {};

  if (rawInput.workflowInput) {
    results.push(validateImmutableReportWorkflowInputs(rawInput.workflowInput, {
      mode: rawInput.workflowInput.workflowMode || rawInput.workflowInput.mode,
    }));
  }

  if (rawInput.validationContext) {
    results.push(validatePersistedImmutableEvidenceShape({
      evidenceSummary: persistedEvidenceSummary,
      validationContext: rawInput.validationContext,
    }));

    if (!persistedEvidenceSummary.emptyState) {
      results.push(validateImmutableReportSnapshotCandidate(
        rawInput.validationContext,
        rawInput.validationOptions || {},
      ));

      if (shouldValidatePublicationReadiness(rawInput)) {
        results.push(validatePublicationReadinessShape(
          rawInput.validationContext,
          rawInput.validationOptions || {},
        ));
      }
    }
  }

  if (rawInput.candidate) {
    results.push(validateImmutableReportSnapshotCandidate(
      buildCandidateValidationContext(rawInput.candidate, normalizedInput),
      {
        requireReport: Boolean(rawInput.candidate.snapshotRecord?.report_id),
        requireSnapshot: Boolean(rawInput.candidate.snapshotRecord?.id),
        requireSessions: rawInput.requireSessions !== false,
        requireNonEmptyPayload: true,
        requireAdminContext: true,
        mode: "admin_validation_inspection_candidate",
      },
    ));
  }

  if (results.length === 0) {
    results.push(createValidationResult({
      validator: "inspectCstpReportValidationForAdmin.target",
      issues: [
        createValidationIssue({
          code: "CSTP_ADMIN_REPORT_VALIDATION_TARGET_REQUIRED",
          message: "Validation inspection requires workflowInput, validationContext, or candidate.",
          entity: "validation",
          field: "validationTarget",
        }),
      ],
      metadata: {},
    }));
  }

  return results;
}

function validatePersistedImmutableEvidenceShape({
  evidenceSummary = {},
  validationContext = {},
} = {}) {
  const issues = [];
  const persistedReportCount = Number(evidenceSummary.persistedReportCount || 0);
  const persistedSnapshotCount = Number(evidenceSummary.persistedSnapshotCount || 0);
  const metricCount = Number(evidenceSummary.metricCount || 0);
  const sessionEvidenceCount = Number(evidenceSummary.sessionEvidenceCount || 0);
  const auditLinkCount = Number(evidenceSummary.auditLinkCount || 0);

  if (evidenceSummary.mode !== "real_persisted_immutable_validation") {
    return createValidationResult({
      validator: "validatePersistedImmutableEvidenceShape",
      issues,
      metadata: {
        mode: evidenceSummary.mode || "caller_supplied_validation_context",
      },
    });
  }

  if (persistedReportCount === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTED_REPORT_NOT_FOUND",
      message: "No persisted immutable CSTP report was found for the requested internal validation scope.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "id",
      metadata: {
        cstpRequestId: evidenceSummary.cstpRequestId || null,
        cstpTestId: evidenceSummary.cstpTestId || null,
      },
    }));
  }

  if (persistedReportCount > 0 && persistedSnapshotCount === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTED_SNAPSHOT_NOT_FOUND",
      message: "Persisted immutable CSTP report exists but no snapshot records were found.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "report_id",
      metadata: {
        reportId: evidenceSummary.reportId || null,
      },
    }));
  }

  if (persistedReportCount > 0 && metricCount === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTED_METRIC_EVIDENCE_MISSING",
      message: "No persisted immutable metric evidence was found for the inspected snapshot context.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "metric",
      table: CSTP_REPORT_TABLES.metrics,
      field: "snapshot_id",
      metadata: {
        snapshotId: evidenceSummary.snapshotId || null,
      },
    }));
  }

  if (persistedReportCount > 0 && sessionEvidenceCount === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTED_SESSION_EVIDENCE_MISSING",
      message: "No persisted immutable session evidence was found for the inspected snapshot context.",
      entity: "session",
      table: CSTP_REPORT_TABLES.sessions,
      field: "snapshot_id",
      metadata: {
        snapshotId: evidenceSummary.snapshotId || null,
      },
    }));
  }

  if (persistedReportCount > 0 && auditLinkCount === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTED_AUDIT_LINK_EVIDENCE_MISSING",
      message: "No persisted immutable audit-link evidence was found for the inspected report context.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "audit_link",
      table: CSTP_REPORT_TABLES.auditLinks,
      field: "report_id",
      metadata: {
        reportId: evidenceSummary.reportId || null,
      },
    }));
  }

  return createValidationResult({
    validator: "validatePersistedImmutableEvidenceShape",
    issues,
    metadata: {
      mode: evidenceSummary.mode,
      reportId: evidenceSummary.reportId || null,
      snapshotId: evidenceSummary.snapshotId || null,
      persistedReportCount,
      persistedSnapshotCount,
      metricCount,
      sessionEvidenceCount,
      auditLinkCount,
      validationContextLoaded: Boolean(validationContext),
      internalOnly: true,
      publicVisibility: false,
    },
  });
}

function shouldValidatePublicationReadiness(rawInput = {}) {
  if (rawInput.validationOptions?.requirePublicationReadiness === true) {
    return true;
  }

  const status = normalizeNullableText(rawInput.validationContext?.snapshot?.status).toLowerCase();
  return ["prepared", "published", "published_internal"].includes(status);
}

function buildCandidateValidationContext(candidate = {}, input = {}) {
  const snapshot = candidate.snapshotRecord || {};

  return {
    report: {
      id: snapshot.report_id,
      cstp_test_id: snapshot.cstp_test_id,
      cstp_request_id: snapshot.cstp_request_id,
      source_id: snapshot.source_id,
      status: input.reportStatus || "preparing",
    },
    snapshot,
    cstpTest: input.cstpTest,
    cstpRequest: input.cstpRequest,
    source: input.source,
    sessionLinks: input.cstpTestSessions,
    growSessions: input.growSessions,
    adminEvent: input.auditEvents?.[0] || input.adminContext,
    actor: input.adminContext,
    auditLinks: candidate.auditLinkCandidates || [],
    snapshots: [
      ...(input.existingSnapshots || []),
      snapshot,
    ],
  };
}

function buildAdminResult({
  ok,
  status,
  action,
  workflowMode,
  validation,
  workflowResult = null,
  lineageSummary = null,
  persistenceSummary = null,
  validationEvidenceSummary = null,
  message,
}) {
  const blockingErrors = validation?.issues?.filter((issue) => issue.blocking) || [];
  const warnings = buildAdminWarnings({
    validation,
    workflowResult,
  });

  return deepFreeze({
    ok,
    success: ok,
    status,
    adminAction: action,
    workflowMode,
    validation,
    validationSummary: validation?.summary || null,
    lineageSummary,
    persistenceSummary,
    validationEvidenceSummary,
    blockingErrors,
    warnings,
    message,
    workflowResult,
    safety: buildAdminSafetySummary(),
    internalOnly: true,
  });
}

function buildAdminMessage({ action, ok, status, persist }) {
  const actionLabel = action
    .replace(/^(.+)_for_admin$/, "$1")
    .replace(/_/g, " ");

  if (!ok) {
    return `Internal CSTP admin ${actionLabel} failed with status ${status}.`;
  }

  if (persist) {
    return `Internal CSTP admin ${actionLabel} completed and persistence orchestration ran.`;
  }

  return `Internal CSTP admin ${actionLabel} completed with persistence deferred.`;
}

function buildAdminWarnings({ validation, workflowResult }) {
  const validationWarnings = (validation?.issues || [])
    .filter((issue) => !issue.blocking)
    .map((issue) => issue.message);

  return [
    "Internal admin-only CSTP report management service.",
    "This is not public API behavior and does not expose CSTP publicly.",
    "Rendering, certification, public integrations, and RLS/public policies are deferred.",
    "Operational grow_sessions remain canonical and are not mutated.",
  ]
    .concat(workflowResult?.warnings || [])
    .concat(validationWarnings);
}

function buildAdminSafetySummary() {
  return {
    adminOnly: true,
    publicAccess: false,
    destructiveUpdates: false,
    mutatesGrowSessions: false,
    renderingImplemented: false,
    certificationImplemented: false,
    sourceDirectoryIntegration: false,
    communityGrowIntegration: false,
    requiresExplicitTimestamp: true,
    requiresCallerSuppliedDependencies: true,
  };
}

function summarizeActiveLineage(activeLineage, {
  duplicateActiveValidation,
  cycleValidation,
  immutableLineageSummary = null,
} = {}) {
  const currentSnapshot = activeLineage.currentSnapshot || {};
  const latestSnapshot = activeLineage.latestSnapshot || {};
  const supersededSnapshotCount = activeLineage.snapshots
    ?.filter((snapshot) => String(snapshot.status || "").trim().toLowerCase() === "superseded")
    .length || 0;

  return {
    targetReportId: activeLineage.targetReportId,
    currentSnapshotId: activeLineage.currentSnapshotId,
    currentSnapshotVersion: currentSnapshot.snapshot_version || currentSnapshot.snapshotVersion || null,
    currentSnapshotStatus: currentSnapshot.status || "",
    currentSnapshotGeneratedAt: currentSnapshot.generated_at || currentSnapshot.generatedAt || "",
    currentSnapshotPreparedAt: currentSnapshot.prepared_at || currentSnapshot.preparedAt || "",
    currentSnapshotPublishedAt: currentSnapshot.published_at || currentSnapshot.publishedAt || "",
    latestSnapshotId: activeLineage.latestSnapshotId,
    latestSnapshotVersion: latestSnapshot.snapshot_version || latestSnapshot.snapshotVersion || null,
    latestSnapshotStatus: latestSnapshot.status || "",
    activeSnapshotIds: activeLineage.activeSnapshotIds,
    duplicateActiveLineage: activeLineage.duplicateActiveLineage,
    duplicateActiveValidationStatus: duplicateActiveValidation?.status,
    cycleValidationStatus: cycleValidation?.status,
    snapshotCount: activeLineage.snapshots?.length || 0,
    supersededSnapshotCount,
    metricCount: immutableLineageSummary?.metricCount || 0,
    sessionCount: immutableLineageSummary?.sessionCount || 0,
    chain: Array.isArray(immutableLineageSummary?.chain)
      ? immutableLineageSummary.chain
      : [],
    continuityStatus: activeLineage.duplicateActiveLineage
      ? "duplicate_active_lineage"
      : (cycleValidation?.ok === false ? "lineage_cycle_detected" : "continuity_checked"),
    source: immutableLineageSummary?.mode || "supplied_lineage_records",
    publicVisibility: false,
    internalOnly: true,
  };
}

function normalizeAdminInput(input = {}, options = {}) {
  return {
    ...input,
    dbClient: input.dbClient || input.databaseClient || options.dbClient,
    workflowTimestamp: normalizeTimestamp(
      input.workflowTimestamp
      || input.timestamp
      || options.workflowTimestamp
      || options.timestamp,
    ),
    adminContext: input.adminContext || {},
    cstpRequest: input.cstpRequest || {},
    cstpTest: input.cstpTest || {},
    cstpTestSessions: Array.isArray(input.cstpTestSessions)
      ? input.cstpTestSessions.slice()
      : [],
    growSessions: Array.isArray(input.growSessions) ? input.growSessions.slice() : [],
    source: input.source || {},
    auditEvents: Array.isArray(input.auditEvents) ? input.auditEvents.slice() : [],
    existingReport: input.existingReport || input.report || {},
    existingSnapshots: Array.isArray(input.existingSnapshots)
      ? input.existingSnapshots.slice()
      : [],
    immutableLineageSummary: input.immutableLineageSummary || null,
    validationEvidenceSummary:
      input.validationEvidenceSummary
      || input.persistedImmutableValidation?.evidenceSummary
      || null,
    persist: Boolean(input.persist || options.persist),
  };
}

function createMissingInputIssue({
  code,
  entity,
  table,
  field,
}) {
  return createValidationIssue({
    code,
    message: `${field} is required for internal CSTP admin report management.`,
    entity,
    table,
    field,
  });
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

function hasIdentifier(record) {
  return isPlainObject(record) && Boolean(getIdValue(record, [
    "id",
    "reportId",
    "snapshotId",
    "cstpTestId",
    "requestId",
    "sourceId",
    "adminUserId",
    "userId",
  ]));
}

function getIdValue(record, keys) {
  return normalizeNullableText(getFirstValue(record, keys));
}

function getFirstValue(record, keys) {
  if (!isPlainObject(record)) {
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

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
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
  ADMIN_REPORT_ACTIONS,
  prepareCstpReportForAdmin,
  generateCstpReportForAdmin,
  regenerateCstpReportForAdmin,
  supersedeCstpReportForAdmin,
  inspectCstpReportLineageForAdmin,
  inspectCstpReportValidationForAdmin,
  validateAdminManagementInputs,
};
