"use strict";

const {
  CSTP_REPORT_TABLES,
  createValidationIssue,
  createValidationResult,
  mergeValidationResults,
  validateImmutableReportSnapshotCandidate,
} = require("./immutable-report-validator");
const {
  assembleImmutableReportSnapshotCandidate,
} = require("./immutable-snapshot-assembler");
const {
  persistImmutableSnapshotCandidate,
  validatePersistenceCandidateShape,
} = require("./immutable-snapshot-persistence-orchestrator");
const {
  buildRegenerationPlan,
  buildSupersessionPlan,
  resolveActiveSnapshotLineage,
} = require("./immutable-report-lineage-orchestrator");

/*
 * Internal CSTP immutable report workflow coordinator.
 *
 * This module coordinates existing internal validation, snapshot assembly,
 * lineage planning, and persistence orchestration. It does not create global
 * Supabase clients, expose APIs/UI, render reports, certify sources, add public
 * visibility, or mutate operational grow_sessions. grow_sessions remain
 * canonical operational records; immutable snapshots are frozen evidence
 * records. Rendering, certification, public verification, and integration
 * systems remain deferred.
 */

const WORKFLOW_OPERATION = "orchestrate_cstp_immutable_report_workflow";

const WORKFLOW_MODES = Object.freeze({
  prepare: "prepare",
  generate: "generate",
  regenerate: "regenerate",
  supersede: "supersede",
});

function prepareImmutableReportSnapshot(input = {}, options = {}) {
  return executeImmutableReportWorkflow({
    ...input,
    workflowMode: WORKFLOW_MODES.prepare,
  }, options);
}

function generateImmutableReportSnapshot(input = {}, options = {}) {
  return executeImmutableReportWorkflow({
    ...input,
    workflowMode: WORKFLOW_MODES.generate,
  }, options);
}

function regenerateImmutableReportSnapshot(input = {}, options = {}) {
  return executeImmutableReportWorkflow({
    ...input,
    workflowMode: WORKFLOW_MODES.regenerate,
  }, options);
}

function supersedeImmutableReportSnapshot(input = {}, options = {}) {
  return executeImmutableReportWorkflow({
    ...input,
    workflowMode: WORKFLOW_MODES.supersede,
  }, options);
}

function buildImmutableReportWorkflowPlan(input = {}, options = {}) {
  const normalizedInput = normalizeWorkflowInput(input, options);
  const workflowValidation = validateImmutableReportWorkflowInputs(
    normalizedInput,
    options,
  );
  const activeLineage = resolveActiveSnapshotLineage({
    report: normalizedInput.existingReport,
    snapshots: normalizedInput.existingSnapshots,
  });
  const regenerationPlan = normalizedInput.workflowMode === WORKFLOW_MODES.regenerate
    || normalizedInput.workflowMode === WORKFLOW_MODES.supersede
    ? buildRegenerationPlan({
      report: normalizedInput.existingReport,
      snapshots: normalizedInput.existingSnapshots,
      adminContext: normalizedInput.adminContext,
      regenerationTimestamp: normalizedInput.workflowTimestamp,
      reason: normalizedInput.reason,
      options: normalizedInput.lineageOptions,
    })
    : null;

  return deepFreeze({
    ok: workflowValidation.ok && (!regenerationPlan || regenerationPlan.ok),
    success: workflowValidation.ok && (!regenerationPlan || regenerationPlan.ok),
    operation: "build_cstp_immutable_report_workflow_plan",
    workflowMode: normalizedInput.workflowMode,
    persist: normalizedInput.persist,
    workflowTimestamp: normalizedInput.workflowTimestamp,
    validation: mergeValidationResults(
      "buildImmutableReportWorkflowPlan",
      [
        workflowValidation,
        regenerationPlan?.validation,
      ].filter(Boolean),
      {
        workflowMode: normalizedInput.workflowMode,
        persist: normalizedInput.persist,
      },
    ),
    activeLineage,
    lineagePlanSummary: summarizeLineagePlan(regenerationPlan),
    assemblyPlanSummary: {
      snapshotVersion: regenerationPlan?.nextSnapshotVersion
        || normalizedInput.snapshotVersion
        || getNextSnapshotVersion(normalizedInput.existingSnapshots),
      status: getAssemblyStatus(normalizedInput),
      reportStatus: getAssemblyReportStatus(normalizedInput),
      persistenceDeferred: !normalizedInput.persist,
    },
    safety: buildWorkflowSafetySummary(),
    internalOnly: true,
  });
}

function validateImmutableReportWorkflowInputs(input = {}, options = {}) {
  const normalizedInput = normalizeWorkflowInput(input, options);
  const issues = [];

  if (!Object.values(WORKFLOW_MODES).includes(normalizedInput.workflowMode)) {
    issues.push(createValidationIssue({
      code: "CSTP_WORKFLOW_MODE_INVALID",
      message: "Immutable CSTP workflow mode must be prepare, generate, regenerate, or supersede.",
      entity: "workflow",
      field: "workflowMode",
      metadata: {
        workflowMode: normalizedInput.workflowMode,
        allowedModes: Object.values(WORKFLOW_MODES),
      },
    }));
  }

  if (!normalizedInput.workflowTimestamp) {
    issues.push(createValidationIssue({
      code: "CSTP_WORKFLOW_TIMESTAMP_REQUIRED",
      message: "Immutable CSTP workflow orchestration requires an explicit valid workflow timestamp.",
      entity: "workflow",
      field: "workflowTimestamp",
    }));
  }

  if (!getAdminUserId(normalizedInput.adminContext)) {
    issues.push(createValidationIssue({
      code: "CSTP_WORKFLOW_ADMIN_CONTEXT_REQUIRED",
      message: "Admin context is required for immutable CSTP report workflow orchestration.",
      entity: "audit",
      table: CSTP_REPORT_TABLES.auditLinks,
      field: "created_by",
    }));
  }

  if (!hasIdentifier(normalizedInput.cstpRequest)) {
    issues.push(createRequiredObjectIssue({
      code: "CSTP_WORKFLOW_REQUEST_REQUIRED",
      entity: "cstp_request",
      table: CSTP_REPORT_TABLES.requests,
      field: "cstpRequest",
    }));
  }

  if (!hasIdentifier(normalizedInput.cstpTest)) {
    issues.push(createRequiredObjectIssue({
      code: "CSTP_WORKFLOW_TEST_REQUIRED",
      entity: "cstp_test",
      table: CSTP_REPORT_TABLES.tests,
      field: "cstpTest",
    }));
  }

  if (!hasIdentifier(normalizedInput.source)) {
    issues.push(createRequiredObjectIssue({
      code: "CSTP_WORKFLOW_SOURCE_REQUIRED",
      entity: "source",
      table: CSTP_REPORT_TABLES.sources,
      field: "source",
    }));
  }

  if (normalizedInput.cstpTestSessions.length === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_WORKFLOW_TEST_SESSIONS_REQUIRED",
      message: "At least one CSTP test-session link is required for immutable report workflow orchestration.",
      entity: "cstp_test_session",
      table: CSTP_REPORT_TABLES.testSessions,
      field: "cstpTestSessions",
    }));
  }

  if (normalizedInput.growSessions.length === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_WORKFLOW_GROW_SESSIONS_REQUIRED",
      message: "At least one Grow session record is required for immutable report workflow orchestration.",
      entity: "grow_session",
      table: CSTP_REPORT_TABLES.growSessions,
      field: "growSessions",
    }));
  }

  if (normalizedInput.persist && !normalizedInput.dbClient) {
    issues.push(createValidationIssue({
      code: "CSTP_WORKFLOW_DB_CLIENT_REQUIRED",
      message: "Persistence-enabled immutable CSTP workflow requires a caller-supplied database client.",
      entity: "workflow",
      field: "dbClient",
    }));
  }

  if (
    [WORKFLOW_MODES.regenerate, WORKFLOW_MODES.supersede].includes(normalizedInput.workflowMode)
    && !hasIdentifier(normalizedInput.existingReport)
  ) {
    issues.push(createValidationIssue({
      code: "CSTP_WORKFLOW_EXISTING_REPORT_REQUIRED",
      message: "Regeneration and supersession workflows require an existing report record.",
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "existingReport",
    }));
  }

  if (
    [WORKFLOW_MODES.regenerate, WORKFLOW_MODES.supersede].includes(normalizedInput.workflowMode)
    && normalizedInput.existingSnapshots.length === 0
  ) {
    issues.push(createValidationIssue({
      code: "CSTP_WORKFLOW_EXISTING_SNAPSHOTS_REQUIRED",
      message: "Regeneration and supersession workflows require existing snapshot lineage records.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "existingSnapshots",
    }));
  }

  return createValidationResult({
    validator: "validateImmutableReportWorkflowInputs",
    issues,
    metadata: {
      workflowMode: normalizedInput.workflowMode,
      persist: normalizedInput.persist,
      hasWorkflowTimestamp: Boolean(normalizedInput.workflowTimestamp),
    },
  });
}

async function executeImmutableReportWorkflow(input = {}, options = {}) {
  const normalizedInput = normalizeWorkflowInput(input, options);
  const workflowPlan = buildImmutableReportWorkflowPlan(normalizedInput, options);

  if (!workflowPlan.validation.ok) {
    return buildWorkflowResult({
      ok: false,
      status: "workflow_validation_failed",
      normalizedInput,
      workflowPlan,
      validation: workflowPlan.validation,
    });
  }

  if (
    [WORKFLOW_MODES.regenerate, WORKFLOW_MODES.supersede].includes(normalizedInput.workflowMode)
    && workflowPlan.lineagePlanSummary?.ok === false
  ) {
    return buildWorkflowResult({
      ok: false,
      status: "lineage_validation_failed",
      normalizedInput,
      workflowPlan,
      validation: workflowPlan.validation,
    });
  }

  const assemblyInput = buildAssemblyInput(normalizedInput, workflowPlan);
  const candidate = assembleImmutableReportSnapshotCandidate(
    assemblyInput,
    buildAssemblyOptions(normalizedInput, workflowPlan),
  );
  const candidateValidation = validateImmutableReportSnapshotCandidate(
    buildCandidateValidationContext(candidate, normalizedInput),
    {
      requireReport: Boolean(candidate.snapshotRecord?.report_id),
      requireSnapshot: Boolean(candidate.snapshotRecord?.id),
      requireSessions: true,
      requireNonEmptyPayload: true,
      requireAdminContext: true,
      mode: `${normalizedInput.workflowMode}_workflow_candidate`,
    },
  );
  const assemblyValidation = mergeValidationResults(
    "immutableReportWorkflowAssemblyValidation",
    [
      candidate.validation,
      candidateValidation,
    ],
    {
      workflowMode: normalizedInput.workflowMode,
    },
  );

  if (!assemblyValidation.ok) {
    return buildWorkflowResult({
      ok: false,
      status: "assembly_validation_failed",
      normalizedInput,
      workflowPlan,
      validation: mergeValidationResults(
        "immutableReportWorkflowValidation",
        [workflowPlan.validation, assemblyValidation],
        { workflowMode: normalizedInput.workflowMode },
      ),
      candidate,
    });
  }

  const lineagePlan = buildPostAssemblyLineagePlan({
    normalizedInput,
    candidate,
    workflowPlan,
  });

  if (lineagePlan && !lineagePlan.ok) {
    return buildWorkflowResult({
      ok: false,
      status: "lineage_validation_failed",
      normalizedInput,
      workflowPlan,
      validation: mergeValidationResults(
        "immutableReportWorkflowValidation",
        [workflowPlan.validation, assemblyValidation, lineagePlan.validation],
        { workflowMode: normalizedInput.workflowMode },
      ),
      candidate,
      lineagePlan,
    });
  }

  if (!normalizedInput.persist) {
    return buildWorkflowResult({
      ok: true,
      status: "candidate_generated",
      normalizedInput,
      workflowPlan,
      validation: mergeValidationResults(
        "immutableReportWorkflowValidation",
        [
          workflowPlan.validation,
          assemblyValidation,
          lineagePlan?.validation,
        ].filter(Boolean),
        { workflowMode: normalizedInput.workflowMode },
      ),
      candidate,
      lineagePlan,
    });
  }

  const persistenceCandidate = {
    ...candidate,
    reportAlreadyExists: hasIdentifier(normalizedInput.existingReport),
  };
  const persistenceShapeValidation = validatePersistenceCandidateShape(
    persistenceCandidate,
    {
      adminContext: normalizedInput.adminContext,
      persistenceTimestamp: normalizedInput.workflowTimestamp,
      requireAdminContext: true,
    },
  );

  if (!persistenceShapeValidation.ok) {
    return buildWorkflowResult({
      ok: false,
      status: "persistence_validation_failed",
      normalizedInput,
      workflowPlan,
      validation: mergeValidationResults(
        "immutableReportWorkflowValidation",
        [
          workflowPlan.validation,
          assemblyValidation,
          lineagePlan?.validation,
          persistenceShapeValidation,
        ].filter(Boolean),
        { workflowMode: normalizedInput.workflowMode },
      ),
      candidate,
      lineagePlan,
    });
  }

  const persistenceResult = await persistImmutableSnapshotCandidate({
    dbClient: normalizedInput.dbClient,
    candidate: persistenceCandidate,
    adminContext: normalizedInput.adminContext,
    persistenceTimestamp: normalizedInput.workflowTimestamp,
    options: normalizedInput.persistenceOptions,
  });

  return buildWorkflowResult({
    ok: persistenceResult.ok,
    status: persistenceResult.ok ? "persisted" : "persistence_failed",
    normalizedInput,
    workflowPlan,
    validation: mergeValidationResults(
      "immutableReportWorkflowValidation",
      [
        workflowPlan.validation,
        assemblyValidation,
        lineagePlan?.validation,
        persistenceShapeValidation,
        persistenceResult.validation,
      ].filter(Boolean),
      { workflowMode: normalizedInput.workflowMode },
    ),
    candidate,
    lineagePlan,
    persistenceResult,
  });
}

function buildPostAssemblyLineagePlan({ normalizedInput, candidate }) {
  if (normalizedInput.workflowMode !== WORKFLOW_MODES.supersede) {
    return normalizedInput.workflowMode === WORKFLOW_MODES.regenerate
      ? buildRegenerationPlan({
        report: normalizedInput.existingReport,
        snapshots: normalizedInput.existingSnapshots,
        adminContext: normalizedInput.adminContext,
        regenerationTimestamp: normalizedInput.workflowTimestamp,
        reason: normalizedInput.reason,
        options: normalizedInput.lineageOptions,
      })
      : null;
  }

  return buildSupersessionPlan({
    report: normalizedInput.existingReport,
    snapshots: normalizedInput.existingSnapshots,
    targetSnapshotId: normalizedInput.targetSnapshotId,
    snapshotCandidate: candidate,
    adminContext: normalizedInput.adminContext,
    supersessionTimestamp: normalizedInput.workflowTimestamp,
    options: {
      ...normalizedInput.lineageOptions,
      reason: normalizedInput.reason,
    },
  });
}

function buildAssemblyInput(normalizedInput, workflowPlan) {
  const existingReportId = getIdValue(normalizedInput.existingReport, ["id", "reportId"]);
  const activeSnapshotId = workflowPlan.activeLineage.currentSnapshotId;
  const snapshotVersion = workflowPlan.lineagePlanSummary?.nextSnapshotVersion
    || normalizedInput.snapshotVersion
    || getNextSnapshotVersion(normalizedInput.existingSnapshots);
  const supersedesSnapshotId = normalizedInput.supersedesSnapshotId
    || normalizedInput.targetSnapshotId
    || (
      [WORKFLOW_MODES.regenerate, WORKFLOW_MODES.supersede].includes(normalizedInput.workflowMode)
        ? activeSnapshotId
        : ""
    );

  return {
    reportId: normalizedInput.reportId || existingReportId,
    snapshotId: normalizedInput.snapshotId,
    cstpRequest: normalizedInput.cstpRequest,
    cstpTest: normalizedInput.cstpTest,
    cstpTestSessions: normalizedInput.cstpTestSessions,
    growSessions: normalizedInput.growSessions,
    source: normalizedInput.source,
    adminContext: normalizedInput.adminContext,
    auditEvents: normalizedInput.auditEvents,
    existingSnapshots: normalizedInput.existingSnapshots,
    metrics: normalizedInput.metrics,
    generatedAt: normalizedInput.generatedAt || normalizedInput.workflowTimestamp,
    calculatedAt: normalizedInput.calculatedAt || normalizedInput.workflowTimestamp,
    preparedAt: normalizedInput.preparedAt || (
      normalizedInput.workflowMode === WORKFLOW_MODES.prepare
        ? normalizedInput.workflowTimestamp
        : undefined
    ),
    snapshotVersion,
    status: getAssemblyStatus(normalizedInput),
    reportStatus: getAssemblyReportStatus(normalizedInput),
    locked: normalizedInput.locked,
    reportSchemaVersion: normalizedInput.reportSchemaVersion,
    methodologyVersion: normalizedInput.methodologyVersion,
    calculationVersion: normalizedInput.calculationVersion,
    supersedesSnapshotId,
  };
}

function buildAssemblyOptions(normalizedInput, workflowPlan) {
  return {
    reportId: normalizedInput.reportId || getIdValue(normalizedInput.existingReport, ["id", "reportId"]),
    snapshotId: normalizedInput.snapshotId,
    snapshotVersion: workflowPlan.lineagePlanSummary?.nextSnapshotVersion
      || normalizedInput.snapshotVersion
      || undefined,
    generatedAt: normalizedInput.generatedAt || normalizedInput.workflowTimestamp,
    calculatedAt: normalizedInput.calculatedAt || normalizedInput.workflowTimestamp,
    preparedAt: normalizedInput.preparedAt || (
      normalizedInput.workflowMode === WORKFLOW_MODES.prepare
        ? normalizedInput.workflowTimestamp
        : undefined
    ),
    status: getAssemblyStatus(normalizedInput),
    reportStatus: getAssemblyReportStatus(normalizedInput),
    requireAdminContext: true,
  };
}

function buildCandidateValidationContext(candidate = {}, normalizedInput = {}) {
  return {
    report: {
      id: candidate.snapshotRecord?.report_id,
      cstp_test_id: candidate.snapshotRecord?.cstp_test_id,
      cstp_request_id: candidate.snapshotRecord?.cstp_request_id,
      source_id: candidate.snapshotRecord?.source_id,
      status: getAssemblyReportStatus(normalizedInput),
    },
    snapshot: candidate.snapshotRecord,
    cstpTest: normalizedInput.cstpTest,
    cstpRequest: normalizedInput.cstpRequest,
    source: normalizedInput.source,
    sessionLinks: normalizedInput.cstpTestSessions,
    growSessions: normalizedInput.growSessions,
    adminEvent: normalizedInput.auditEvents[0] || normalizedInput.adminContext,
    actor: normalizedInput.adminContext,
    auditLinks: candidate.auditLinkCandidates,
    snapshots: [
      ...normalizedInput.existingSnapshots,
      candidate.snapshotRecord,
    ],
    predecessor: candidate.snapshotRecord?.supersedes_snapshot_id
      ? normalizedInput.existingSnapshots.find((snapshot) => (
        getIdValue(snapshot, ["id", "snapshotId"]) === candidate.snapshotRecord.supersedes_snapshot_id
      ))
      : undefined,
    successor: candidate.snapshotRecord,
  };
}

function buildWorkflowResult({
  ok,
  status,
  normalizedInput,
  workflowPlan,
  validation,
  candidate = null,
  lineagePlan = null,
  persistenceResult = null,
}) {
  const blockingErrors = validation?.issues?.filter((issue) => issue.blocking) || [];
  const warnings = buildWorkflowWarnings({
    validation,
    lineagePlan,
    persistenceResult,
    persist: normalizedInput.persist,
  });

  return deepFreeze({
    ok,
    success: ok,
    status,
    operation: WORKFLOW_OPERATION,
    workflowMode: normalizedInput.workflowMode,
    validation,
    workflowPlanSummary: summarizeWorkflowPlan(workflowPlan),
    assemblyResultSummary: summarizeCandidate(candidate),
    lineagePlanSummary: summarizeLineagePlan(lineagePlan) || workflowPlan.lineagePlanSummary,
    persistenceResultSummary: summarizePersistenceResult(persistenceResult),
    blockingErrors,
    warnings,
    generatedCandidate: normalizedInput.persist ? null : candidate,
    insertedRowCounts: persistenceResult?.insertedRowCounts || null,
    candidatePersisted: Boolean(persistenceResult?.ok),
    safety: buildWorkflowSafetySummary(),
    internalOnly: true,
  });
}

function summarizeWorkflowPlan(plan = {}) {
  return pruneUndefined({
    ok: plan.ok,
    workflowMode: plan.workflowMode,
    persist: plan.persist,
    workflowTimestamp: plan.workflowTimestamp,
    activeSnapshotId: plan.activeLineage?.currentSnapshotId,
    activeSnapshotCount: plan.activeLineage?.activeSnapshotIds?.length,
    assemblyPlanSummary: plan.assemblyPlanSummary,
    publicVisibility: false,
  });
}

function summarizeCandidate(candidate) {
  if (!candidate) {
    return null;
  }

  return {
    ok: candidate.validation?.ok === true,
    operation: candidate.operation,
    reportId: candidate.snapshotRecord?.report_id || null,
    snapshotId: candidate.snapshotRecord?.id || null,
    snapshotVersion: candidate.snapshotRecord?.snapshot_version || null,
    snapshotStatus: candidate.snapshotRecord?.status || null,
    metricCount: Array.isArray(candidate.frozenMetricPayload)
      ? candidate.frozenMetricPayload.length
      : 0,
    sessionCount: Array.isArray(candidate.frozenSessionSummaries)
      ? candidate.frozenSessionSummaries.length
      : 0,
    auditLinkCount: Array.isArray(candidate.auditLinkCandidates)
      ? candidate.auditLinkCandidates.length
      : 0,
    persisted: candidate.persisted === true,
    internalOnly: true,
  };
}

function summarizeLineagePlan(lineagePlan) {
  if (!lineagePlan) {
    return null;
  }

  return pruneUndefined({
    ok: lineagePlan.ok,
    actionType: lineagePlan.actionType,
    targetReportId: lineagePlan.targetReportId,
    targetSnapshotId: lineagePlan.targetSnapshotId,
    supersedingSnapshotId: lineagePlan.supersedingSnapshotId,
    nextSnapshotVersion: lineagePlan.nextSnapshotVersion,
    supersessionRequired: lineagePlan.supersessionRequired,
    snapshotsToMarkSuperseded: lineagePlan.snapshotsToMarkSuperseded?.length,
    reportStateChangesNeeded: lineagePlan.reportStateChangesNeeded,
    validationStatus: lineagePlan.validation?.status,
    publicVisibility: false,
  });
}

function summarizePersistenceResult(persistenceResult) {
  if (!persistenceResult) {
    return null;
  }

  return {
    ok: persistenceResult.ok,
    status: persistenceResult.status,
    reportId: persistenceResult.reportId,
    snapshotId: persistenceResult.snapshotId,
    insertedRowCounts: persistenceResult.insertedRowCounts,
    requiresCallerTransaction: persistenceResult.persistencePlan?.requiresCallerTransaction,
    publicVisibility: false,
  };
}

function buildWorkflowWarnings({
  validation,
  lineagePlan,
  persistenceResult,
  persist,
}) {
  const validationWarnings = (validation?.issues || [])
    .filter((issue) => !issue.blocking)
    .map((issue) => issue.message);
  const baseWarnings = [
    "This is internal CSTP immutable report orchestration only.",
    "Rendering, certification, public visibility, RLS policies, and public integrations are deferred.",
    "Operational grow_sessions remain canonical and are not mutated by this workflow.",
  ];
  const deferredWarnings = persist
    ? []
    : ["Persistence is deferred; generated candidate must be persisted by an explicit internal workflow."];

  return baseWarnings
    .concat(deferredWarnings)
    .concat(lineagePlan?.warnings || [])
    .concat(persistenceResult?.warnings || [])
    .concat(validationWarnings);
}

function buildWorkflowSafetySummary() {
  return {
    internalOnly: true,
    destructiveUpdates: false,
    mutatesGrowSessions: false,
    publicVisibility: false,
    renderingImplemented: false,
    certificationImplemented: false,
    requiresExplicitTimestamp: true,
    requiresCallerSuppliedDbClientForPersistence: true,
  };
}

function normalizeWorkflowInput(input = {}, options = {}) {
  const workflowTimestamp = normalizeTimestamp(
    input.workflowTimestamp
    || input.timestamp
    || options.workflowTimestamp
    || options.timestamp,
  );
  const workflowMode = normalizeNullableText(
    input.workflowMode
    || input.mode
    || options.workflowMode
    || options.mode
    || WORKFLOW_MODES.generate,
  );

  return {
    dbClient: input.dbClient || input.databaseClient || options.dbClient,
    workflowMode,
    persist: Boolean(input.persist || options.persist),
    workflowTimestamp,
    reportId: normalizeNullableText(input.reportId || options.reportId),
    snapshotId: normalizeNullableText(input.snapshotId || options.snapshotId),
    snapshotVersion: normalizePositiveInteger(input.snapshotVersion || options.snapshotVersion),
    targetSnapshotId: normalizeNullableText(input.targetSnapshotId || options.targetSnapshotId),
    supersedesSnapshotId: normalizeNullableText(
      input.supersedesSnapshotId
      || input.supersedes_snapshot_id
      || options.supersedesSnapshotId,
    ),
    cstpRequest: input.cstpRequest || {},
    cstpTest: input.cstpTest || {},
    cstpTestSessions: Array.isArray(input.cstpTestSessions)
      ? input.cstpTestSessions.slice()
      : [],
    growSessions: Array.isArray(input.growSessions) ? input.growSessions.slice() : [],
    source: input.source || {},
    adminContext: input.adminContext || {},
    auditEvents: Array.isArray(input.auditEvents) ? input.auditEvents.slice() : [],
    existingReport: input.existingReport || input.report || {},
    existingSnapshots: Array.isArray(input.existingSnapshots)
      ? input.existingSnapshots.slice()
      : [],
    metrics: input.metrics || input.metricInputs || [],
    status: normalizeNullableText(input.status || options.status),
    reportStatus: normalizeNullableText(input.reportStatus || options.reportStatus),
    generatedAt: normalizeTimestamp(input.generatedAt || options.generatedAt),
    calculatedAt: normalizeTimestamp(input.calculatedAt || options.calculatedAt),
    preparedAt: normalizeTimestamp(input.preparedAt || options.preparedAt),
    locked: Boolean(input.locked || options.locked),
    reportSchemaVersion: normalizeNullableText(
      input.reportSchemaVersion || options.reportSchemaVersion,
    ),
    methodologyVersion: normalizeNullableText(
      input.methodologyVersion || options.methodologyVersion,
    ),
    calculationVersion: normalizeNullableText(
      input.calculationVersion || options.calculationVersion,
    ),
    reason: normalizeNullableText(input.reason || options.reason),
    lineageOptions: options.lineageOptions || input.lineageOptions || {},
    persistenceOptions: options.persistenceOptions || input.persistenceOptions || {},
  };
}

function getAssemblyStatus(input) {
  if (input.status) {
    return input.status;
  }

  if (input.workflowMode === WORKFLOW_MODES.prepare) {
    return "prepared";
  }

  return "generated";
}

function getAssemblyReportStatus(input) {
  if (input.reportStatus) {
    return input.reportStatus;
  }

  if (input.workflowMode === WORKFLOW_MODES.prepare) {
    return "prepared";
  }

  return "preparing";
}

function createRequiredObjectIssue({ code, entity, table, field }) {
  return createValidationIssue({
    code,
    message: `${field} is required for immutable CSTP report workflow orchestration.`,
    entity,
    table,
    field,
  });
}

function getNextSnapshotVersion(existingSnapshots = []) {
  const maxVersion = existingSnapshots.reduce((max, snapshot) => {
    const version = normalizePositiveInteger(
      getFirstValue(snapshot, ["snapshot_version", "snapshotVersion"]),
    );
    return Math.max(max, version);
  }, 0);

  return maxVersion + 1;
}

function getAdminUserId(adminContext = {}) {
  return getIdValue(adminContext, ["adminUserId", "createdBy", "userId", "id"]);
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

function normalizePositiveInteger(value) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : 0;
}

function normalizeNullableText(value) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
}

function pruneUndefined(value) {
  return Object.fromEntries(
    Object.entries(value || {}).filter(([, entryValue]) => entryValue !== undefined),
  );
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
  WORKFLOW_OPERATION,
  WORKFLOW_MODES,
  prepareImmutableReportSnapshot,
  generateImmutableReportSnapshot,
  regenerateImmutableReportSnapshot,
  supersedeImmutableReportSnapshot,
  buildImmutableReportWorkflowPlan,
  validateImmutableReportWorkflowInputs,
};
