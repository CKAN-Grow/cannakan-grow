"use strict";

const {
  ACTIVE_SNAPSHOT_STATUSES,
  CSTP_REPORT_TABLES,
  VALIDATION_SEVERITIES,
  buildImmutableEvidenceExplorerSummary,
  buildImmutableReconciliationDiagnostics,
  createValidationIssue,
  createValidationResult,
  mergeValidationResults,
  validateActiveSnapshotChainShape,
  validateAuditLinkConsistencyShape,
  validateDuplicateActiveLineageShape,
  validateImmutableVersionOrderingShape,
  validateSnapshotLineageConsistencyShape,
  validateSupersessionSelfReference,
  validateTimestampOrdering,
} = require("./immutable-report-validator");

/*
 * Internal-only immutable CSTP lineage infrastructure.
 *
 * These helpers plan supersession, active-lineage, and regeneration governance
 * from caller-supplied report/snapshot records only. They do not query
 * Supabase, mutate records, persist updates, expose public reports, render
 * output, certify sources, or integrate public systems. Historical snapshots
 * must be preserved; persistence is handled separately by the immutable
 * snapshot persistence orchestrator.
 */

const LINEAGE_OPERATION = "orchestrate_cstp_immutable_report_lineage";

const LINEAGE_ACTIONS = Object.freeze({
  supersedeSnapshot: "supersede_snapshot",
  regenerateSnapshot: "regenerate_snapshot",
  resolveActiveLineage: "resolve_active_lineage",
});

const INACTIVE_SNAPSHOT_STATUSES = Object.freeze([
  "superseded",
  "archived",
  "archived_internal",
  "integrity_failed",
]);

function buildSupersessionPlan({
  report = {},
  snapshots = [],
  targetSnapshot,
  targetSnapshotId,
  supersedingSnapshot,
  snapshotCandidate,
  auditLinks = [],
  adminContext = {},
  supersessionTimestamp,
  options = {},
} = {}) {
  const lineageSnapshots = sortLineageSnapshotsStable(snapshots);
  const successorSnapshot = resolveSupersedingSnapshot({
    supersedingSnapshot,
    snapshotCandidate,
  });
  const target = resolveTargetSnapshot({
    report,
    snapshots: lineageSnapshots,
    targetSnapshot,
    targetSnapshotId,
  });
  const normalizedTimestamp = normalizeTimestamp(supersessionTimestamp);
  const targetReportId = getReportId(report) || getSnapshotReportId(target);
  const successorSnapshotId = getSnapshotId(successorSnapshot);
  const targetSnapshotIdValue = getSnapshotId(target);
  const auditContext = buildLineageAuditContext({
    actionType: LINEAGE_ACTIONS.supersedeSnapshot,
    report,
    targetSnapshot: target,
    supersedingSnapshot: successorSnapshot,
    adminContext,
    timestamp: normalizedTimestamp,
    reason: options.reason,
  });
  const plannedSnapshots = buildPlannedSnapshotSet({
    snapshots: lineageSnapshots,
    targetSnapshot: target,
    supersedingSnapshot: successorSnapshot,
  });
  const lineageInspection = inspectImmutableLineageGraph({
    report,
    snapshots: lineageSnapshots,
    auditLinks,
  });
  const validation = validateSupersessionPlan({
    actionType: LINEAGE_ACTIONS.supersedeSnapshot,
    report,
    targetSnapshot: target,
    supersedingSnapshot: successorSnapshot,
    snapshots: lineageSnapshots,
    plannedSnapshots,
    auditLinks,
    adminContext,
    supersessionTimestamp: normalizedTimestamp,
    options,
  });
  const conflictSummary = buildLineageConflictSummary({
    validation,
    lineageInspection,
  });
  const previewSafetyAnalysis = buildDeferredSupersedePreviewSafetyAnalysis({
    target,
    successorSnapshot,
    plannedSnapshots,
    validation,
    conflictSummary,
  });

  return deepFreeze({
    ok: validation.ok,
    success: validation.ok,
    actionType: LINEAGE_ACTIONS.supersedeSnapshot,
    operation: LINEAGE_OPERATION,
    targetReportId: targetReportId || null,
    targetSnapshotId: targetSnapshotIdValue || null,
    supersedingSnapshotId: successorSnapshotId || null,
    supersedingCandidateReference: buildCandidateReference(snapshotCandidate),
    snapshotsToMarkSuperseded: targetSnapshotIdValue
      ? [pruneUndefined({
        id: targetSnapshotIdValue,
        report_id: getSnapshotReportId(target),
        status: "superseded",
        superseded_by_snapshot_id: successorSnapshotId || undefined,
        superseded_at: normalizedTimestamp || undefined,
      })]
      : [],
    reportStateChangesNeeded: buildReportStateChanges({
      report,
      supersedingSnapshot: successorSnapshot,
      timestamp: normalizedTimestamp,
    }),
    auditContext,
    validation,
    conflictSummary,
    lineageInspection,
    previewSafetyAnalysis,
    errors: validation.issues.filter((issue) => issue.blocking),
    warnings: buildLineageWarnings(validation),
    lineage: {
      snapshots: lineageSnapshots,
      plannedSnapshots,
      activeLineage: resolveActiveSnapshotLineage({
        report,
        snapshots: plannedSnapshots,
      }),
    },
    immutableSafety: {
      destructiveReplacement: false,
      deletesHistoricalSnapshots: false,
      mutatesFrozenPayloads: false,
      requiresSeparatePersistence: true,
      persistenceDeferred: true,
      immutableWritesEnabled: false,
      publicVisibility: false,
    },
    labels: buildInternalLineageLabels(),
    internalOnly: true,
  });
}

function validateSupersessionPlan(plan = {}, options = {}) {
  const issues = [];
  const targetSnapshot = plan.targetSnapshot || {};
  const supersedingSnapshot = plan.supersedingSnapshot || {};
  const snapshots = Array.isArray(plan.snapshots) ? plan.snapshots : [];
  const auditLinks = Array.isArray(plan.auditLinks) ? plan.auditLinks : [];
  const plannedSnapshots = Array.isArray(plan.plannedSnapshots)
    ? plan.plannedSnapshots
    : snapshots;
  const allowSupersedingSuperseded = Boolean(
    plan.options?.allowSupersedingSuperseded
    || options.allowSupersedingSuperseded,
  );
  const timestamp = normalizeTimestamp(
    plan.supersessionTimestamp || options.supersessionTimestamp,
  );
  const targetSnapshotId = getSnapshotId(targetSnapshot);
  const supersedingSnapshotId = getSnapshotId(supersedingSnapshot);
  const plannedReport = {
    ...(plan.report || {}),
    current_snapshot_id: undefined,
  };
  const adminUserId = getAdminUserId(plan.adminContext || options.adminContext || {});

  if (!hasValue(targetSnapshotId)) {
    issues.push(createValidationIssue({
      code: "CSTP_SUPERSESSION_TARGET_REQUIRED",
      message: "Supersession planning requires a target snapshot.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "id",
    }));
  }

  if (!hasValue(supersedingSnapshotId)) {
    issues.push(createValidationIssue({
      code: "CSTP_SUPERSESSION_SUCCESSOR_REQUIRED",
      message: "Supersession planning requires a superseding snapshot or candidate snapshot record.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "id",
    }));
  }

  if (!timestamp) {
    issues.push(createValidationIssue({
      code: "CSTP_SUPERSESSION_TIMESTAMP_REQUIRED",
      message: "Supersession planning requires an explicit valid timestamp supplied by the caller.",
      entity: "lineage",
      field: "supersessionTimestamp",
    }));
  }

  if (!adminUserId) {
    issues.push(createValidationIssue({
      code: "CSTP_SUPERSESSION_ADMIN_CONTEXT_REQUIRED",
      message: "Admin context is required for immutable CSTP supersession planning.",
      severity: VALIDATION_SEVERITIES.publicationBlocking,
      entity: "audit",
      table: CSTP_REPORT_TABLES.auditLinks,
      field: "created_by",
    }));
  }

  if (
    hasValue(targetSnapshotId)
    && hasValue(supersedingSnapshotId)
    && targetSnapshotId === supersedingSnapshotId
  ) {
    issues.push(createValidationIssue({
      code: "CSTP_SUPERSESSION_SELF_TARGET",
      message: "A snapshot must not supersede itself.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "supersedes_snapshot_id",
      metadata: { targetSnapshotId, supersedingSnapshotId },
    }));
  }

  const targetStatus = getStatus(targetSnapshot);
  if (
    targetStatus === "superseded"
    && !allowSupersedingSuperseded
  ) {
    issues.push(createValidationIssue({
      code: "CSTP_SUPERSESSION_TARGET_ALREADY_SUPERSEDED",
      message: "Superseding an already superseded snapshot is rejected unless explicitly allowed.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "status",
      metadata: { targetSnapshotId, targetStatus },
    }));
  }

  if (INACTIVE_SNAPSHOT_STATUSES.includes(getStatus(supersedingSnapshot))) {
    issues.push(createValidationIssue({
      code: "CSTP_SUPERSESSION_SUCCESSOR_INACTIVE",
      message: "Superseding snapshot must not already be inactive, superseded, archived, or failed.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "status",
      metadata: {
        supersedingSnapshotId,
        status: getStatus(supersedingSnapshot),
      },
    }));
  }

  const cycleResult = detectLineageCycle(plannedSnapshots);

  return mergeValidationResults(
    "validateSupersessionPlan",
    [
      createValidationResult({
        validator: "validateSupersessionPlan.local",
        issues,
        metadata: {
          allowSupersedingSuperseded,
          hasSupersessionTimestamp: Boolean(timestamp),
        },
      }),
      validateSupersessionSelfReference({
        ...supersedingSnapshot,
        supersedes_snapshot_id: getFirstValue(supersedingSnapshot, [
          "supersedes_snapshot_id",
          "supersedesSnapshotId",
        ]) || targetSnapshotId,
      }),
      validateSnapshotLineageConsistencyShape({
        report: plan.report,
        snapshot: supersedingSnapshot,
        predecessor: targetSnapshot,
        successor: supersedingSnapshot,
      }),
      validateDuplicateActiveLineageShape({
        snapshots: plannedSnapshots,
      }),
      validateActiveSnapshotChainShape({
        report: plannedReport,
        snapshots: plannedSnapshots,
      }),
      detectOrphanLineageReferences({
        report: plannedReport,
        snapshots: plannedSnapshots,
      }),
      validateAuditLinkConsistencyShape({
        report: plannedReport,
        snapshots: plannedSnapshots,
        auditLinks,
      }),
      validateTimestampOrdering(supersedingSnapshot, {
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
      }),
      cycleResult,
    ],
    {
      actionType: LINEAGE_ACTIONS.supersedeSnapshot,
      targetSnapshotId,
      supersedingSnapshotId,
    },
  );
}

function resolveActiveSnapshotLineage(input = {}, options = {}) {
  const report = Array.isArray(input) ? {} : input.report || {};
  const snapshots = sortLineageSnapshotsStable(Array.isArray(input)
    ? input
    : input.snapshots || []);
  const reportId = getReportId(report) || options.reportId || "";
  const filteredSnapshots = reportId
    ? snapshots.filter((snapshot) => getSnapshotReportId(snapshot) === reportId)
    : snapshots;
  const activeSnapshots = filteredSnapshots.filter(isActiveSnapshot);
  const latestSnapshot = filteredSnapshots[filteredSnapshots.length - 1] || null;
  const currentSnapshotId = getFirstValue(report, [
    "current_snapshot_id",
    "currentSnapshotId",
  ]);
  const currentSnapshot = currentSnapshotId
    ? filteredSnapshots.find((snapshot) => getSnapshotId(snapshot) === currentSnapshotId) || null
    : activeSnapshots[activeSnapshots.length - 1] || latestSnapshot;

  return deepFreeze({
    actionType: LINEAGE_ACTIONS.resolveActiveLineage,
    targetReportId: reportId || getSnapshotReportId(currentSnapshot || {}) || null,
    snapshots: filteredSnapshots,
    activeSnapshots,
    activeSnapshotIds: activeSnapshots.map(getSnapshotId).filter(hasValue),
    currentSnapshot,
    currentSnapshotId: currentSnapshot ? getSnapshotId(currentSnapshot) : null,
    latestSnapshot,
    latestSnapshotId: latestSnapshot ? getSnapshotId(latestSnapshot) : null,
    duplicateActiveLineage: activeSnapshots.length > 1,
    emptyState: filteredSnapshots.length === 0,
    internalOnly: true,
  });
}

function detectDuplicateActiveLineage(input = {}) {
  const snapshots = Array.isArray(input) ? input : input.snapshots || [];
  return validateDuplicateActiveLineageShape({
    snapshots: sortLineageSnapshotsStable(snapshots),
  });
}

function detectLineageCycle(input = {}) {
  const snapshots = sortLineageSnapshotsStable(Array.isArray(input)
    ? input
    : input.snapshots || []);
  const byId = new Map();
  const issues = [];

  snapshots.forEach((snapshot) => {
    const snapshotId = getSnapshotId(snapshot);
    if (snapshotId) {
      byId.set(snapshotId, snapshot);
    }
  });

  byId.forEach((snapshot, snapshotId) => {
    const visited = new Set();
    let currentId = snapshotId;

    while (hasValue(currentId)) {
      if (visited.has(currentId)) {
        issues.push(createValidationIssue({
          code: "CSTP_LINEAGE_CYCLE_DETECTED",
          message: "Snapshot supersession lineage must not contain cycles.",
          entity: "snapshot",
          table: CSTP_REPORT_TABLES.snapshots,
          field: "supersedes_snapshot_id",
          metadata: {
            startingSnapshotId: snapshotId,
            repeatedSnapshotId: currentId,
            lineagePath: Array.from(visited),
          },
        }));
        break;
      }

      visited.add(currentId);
      const currentSnapshot = byId.get(currentId);
      currentId = getFirstValue(currentSnapshot || {}, [
        "supersedes_snapshot_id",
        "supersedesSnapshotId",
      ]);

      if (!byId.has(currentId)) {
        break;
      }
    }
  });

  return createValidationResult({
    validator: "detectLineageCycle",
    issues,
    metadata: { snapshotCount: snapshots.length },
  });
}

function detectOrphanLineageReferences(input = {}) {
  const report = Array.isArray(input) ? {} : input.report || {};
  const snapshots = sortLineageSnapshotsStable(Array.isArray(input)
    ? input
    : input.snapshots || []);
  const issues = [];
  const reportId = getReportId(report);
  const byId = new Map(
    snapshots
      .map((snapshot) => [getSnapshotId(snapshot), snapshot])
      .filter(([snapshotId]) => hasValue(snapshotId)),
  );

  snapshots.forEach((snapshot, index) => {
    const snapshotId = getSnapshotId(snapshot);
    const snapshotReportId = getSnapshotReportId(snapshot);
    const supersedesSnapshotId = getFirstValue(snapshot, [
      "supersedes_snapshot_id",
      "supersedesSnapshotId",
    ]);
    const supersededBySnapshotId = getFirstValue(snapshot, [
      "superseded_by_snapshot_id",
      "supersededBySnapshotId",
    ]);

    if (!hasValue(snapshotReportId)) {
      issues.push(createValidationIssue({
        code: "CSTP_LINEAGE_ORPHAN_SNAPSHOT_REPORT_REQUIRED",
        message: "Immutable snapshot lineage rows must retain a report_id.",
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
        field: "report_id",
        metadata: { index, snapshotId },
      }));
    }

    if (hasValue(reportId) && hasValue(snapshotReportId) && snapshotReportId !== reportId) {
      issues.push(createValidationIssue({
        code: "CSTP_LINEAGE_ORPHAN_SNAPSHOT_REPORT_MISMATCH",
        message: "Snapshot report_id does not match the inspected report lineage.",
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
        field: "report_id",
        metadata: { index, snapshotId, expected: reportId, actual: snapshotReportId },
      }));
    }

    if (hasValue(supersedesSnapshotId) && !byId.has(supersedesSnapshotId)) {
      issues.push(createValidationIssue({
        code: "CSTP_LINEAGE_ORPHAN_SUPERSEDES_REFERENCE",
        message: "Snapshot supersedes_snapshot_id references a missing immutable snapshot.",
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
        field: "supersedes_snapshot_id",
        metadata: { index, snapshotId, supersedesSnapshotId },
      }));
    }

    if (hasValue(supersededBySnapshotId) && !byId.has(supersededBySnapshotId)) {
      issues.push(createValidationIssue({
        code: "CSTP_LINEAGE_ORPHAN_SUPERSEDED_BY_REFERENCE",
        message: "Snapshot superseded_by_snapshot_id references a missing immutable snapshot.",
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
        field: "superseded_by_snapshot_id",
        metadata: { index, snapshotId, supersededBySnapshotId },
      }));
    }
  });

  return createValidationResult({
    validator: "detectOrphanLineageReferences",
    issues,
    metadata: {
      reportId,
      snapshotCount: snapshots.length,
    },
  });
}

function inspectImmutableLineageGraph({
  report = {},
  snapshots = [],
  auditLinks = [],
  metrics = [],
  sessionLinks = [],
} = {}) {
  const sortedSnapshots = sortLineageSnapshotsStable(snapshots);
  const activeLineage = resolveActiveSnapshotLineage({ report, snapshots: sortedSnapshots });
  const byId = new Map(
    sortedSnapshots
      .map((snapshot) => [getSnapshotId(snapshot), snapshot])
      .filter(([snapshotId]) => hasValue(snapshotId)),
  );
  const ancestryBySnapshotId = {};
  const descendantsBySnapshotId = {};

  sortedSnapshots.forEach((snapshot) => {
    const snapshotId = getSnapshotId(snapshot);
    if (!snapshotId) {
      return;
    }
    ancestryBySnapshotId[snapshotId] = resolveSnapshotAncestry(snapshot, byId);
    descendantsBySnapshotId[snapshotId] = resolveSnapshotDescendants(snapshotId, sortedSnapshots);
  });

  const auditLinkValidation = validateAuditLinkConsistencyShape({
    report,
    snapshots: sortedSnapshots,
    auditLinks,
  });
  const versionOrderingValidation = validateImmutableVersionOrderingShape({
    snapshots: sortedSnapshots,
  });
  const activeSnapshot = activeLineage.currentSnapshot || activeLineage.latestSnapshot || {};
  const reconciliationDiagnostics = buildImmutableReconciliationDiagnostics({
    report,
    snapshot: activeSnapshot,
    snapshots: sortedSnapshots,
    auditLinks,
    metrics,
    sessionLinks,
  });
  const validation = mergeValidationResults(
    "inspectImmutableLineageGraph",
    [
      detectDuplicateActiveLineage(sortedSnapshots),
      detectLineageCycle(sortedSnapshots),
      detectOrphanLineageReferences({ report, snapshots: sortedSnapshots }),
      validateActiveSnapshotChainShape({ report, snapshots: sortedSnapshots }),
      auditLinkValidation,
      versionOrderingValidation,
      reconciliationDiagnostics.validation,
    ],
    {
      reportId: getReportId(report),
      snapshotCount: sortedSnapshots.length,
      auditLinkCount: Array.isArray(auditLinks) ? auditLinks.length : 0,
    },
  );
  const orphanSnapshotIds = validation.issues
    .filter((issue) => issue.code && issue.code.includes("ORPHAN"))
    .map((issue) => issue.metadata?.snapshotId)
    .filter(hasValue);
  const evidenceExplorerSummary = buildImmutableEvidenceExplorerSummary({
    report,
    snapshot: activeSnapshot,
    snapshots: sortedSnapshots,
    auditLinks,
    metrics,
    sessionLinks,
    validation,
    reconciliationSummary: reconciliationDiagnostics,
    orphanSnapshotIds,
  });

  return deepFreeze({
    mode: "internal_immutable_lineage_inspection",
    reportId: getReportId(report) || null,
    currentSnapshotId: activeLineage.currentSnapshotId,
    latestSnapshotId: activeLineage.latestSnapshotId,
    activeSnapshotIds: activeLineage.activeSnapshotIds,
    snapshotCount: sortedSnapshots.length,
    activeSnapshotCount: activeLineage.activeSnapshotIds.length,
    duplicateActiveLineage: activeLineage.duplicateActiveLineage,
    emptyState: sortedSnapshots.length === 0,
    ancestryBySnapshotId,
    descendantsBySnapshotId,
    orphanSnapshotIds,
    validation,
    conflictSummary: buildLineageConflictSummary({ validation }),
    reconciliationSummary: reconciliationDiagnostics,
    evidenceExplorerSummary,
    auditTraceSummary: {
      auditLinkCount: Array.isArray(auditLinks) ? auditLinks.length : 0,
      linkedSnapshotIds: [...new Set((Array.isArray(auditLinks) ? auditLinks : [])
        .map((auditLink) => getFirstValue(auditLink, ["snapshot_id", "snapshotId"]))
        .filter(hasValue))],
      consistencyStatus: auditLinkValidation.status,
      publicVisibility: false,
    },
    timelineSummary: buildImmutableReportTimelineSummary({
      report,
      snapshots: sortedSnapshots,
      auditLinks,
      activeLineage,
      ancestryBySnapshotId,
      descendantsBySnapshotId,
      validation,
    }),
    labels: buildInternalLineageLabels(),
    publicVisibility: false,
    internalOnly: true,
  });
}

function sortLineageSnapshotsStable(snapshots = []) {
  return cloneArray(snapshots).sort(compareLineageSnapshotsStable);
}

function buildRegenerationPlan({
  report = {},
  snapshots = [],
  auditLinks = [],
  adminContext = {},
  regenerationTimestamp,
  reason = "",
  options = {},
} = {}) {
  const lineage = resolveActiveSnapshotLineage({ report, snapshots });
  const sortedSnapshots = lineage.snapshots;
  const latestVersion = sortedSnapshots.reduce((maxVersion, snapshot) => {
    const version = getSnapshotVersion(snapshot);
    return Number.isFinite(version) ? Math.max(maxVersion, version) : maxVersion;
  }, 0);
  const targetSnapshot = lineage.currentSnapshot || lineage.latestSnapshot;
  const lineageInspection = inspectImmutableLineageGraph({
    report,
    snapshots: sortedSnapshots,
    auditLinks,
  });
  const validation = validateRegenerationEligibility({
    report,
    snapshots: sortedSnapshots,
    targetSnapshot,
    auditLinks,
    adminContext,
    regenerationTimestamp,
    options,
  });
  const conflictSummary = buildLineageConflictSummary({
    validation,
    lineageInspection,
  });
  const comparisonSummary = buildRegenerationComparisonSummary({
    report,
    targetSnapshot,
    snapshots: sortedSnapshots,
    nextSnapshotVersion: latestVersion + 1,
    validation,
  });

  return deepFreeze({
    ok: validation.ok,
    success: validation.ok,
    actionType: LINEAGE_ACTIONS.regenerateSnapshot,
    operation: LINEAGE_OPERATION,
    targetReportId: getReportId(report) || getSnapshotReportId(targetSnapshot || {}) || null,
    targetSnapshotId: targetSnapshot ? getSnapshotId(targetSnapshot) : null,
    supersedingSnapshotId: null,
    nextSnapshotVersion: latestVersion + 1,
    supersessionRequired: Boolean(
      targetSnapshot
      && isActiveSnapshot(targetSnapshot)
      && !options.regenerateWithoutSupersession,
    ),
    snapshotsToMarkSuperseded: [],
    reportStateChangesNeeded: pruneUndefined({
      id: getReportId(report) || undefined,
      status: "preparing",
      updated_at: normalizeTimestamp(regenerationTimestamp) || undefined,
    }),
    auditContext: buildLineageAuditContext({
      actionType: LINEAGE_ACTIONS.regenerateSnapshot,
      report,
      targetSnapshot,
      adminContext,
      timestamp: regenerationTimestamp,
      reason,
    }),
    validation,
    conflictSummary,
    lineageInspection,
    comparisonSummary,
    errors: validation.issues.filter((issue) => issue.blocking),
    warnings: buildLineageWarnings(validation),
    lineage,
    immutableSafety: {
      destructiveReplacement: false,
      deletesHistoricalSnapshots: false,
      mutatesFrozenPayloads: false,
      requiresNewSnapshotVersion: true,
      requiresSeparatePersistence: true,
      persistenceDeferred: true,
      immutableWritesEnabled: false,
      publicVisibility: false,
    },
    labels: buildInternalLineageLabels(),
    internalOnly: true,
  });
}

function validateRegenerationEligibility({
  report = {},
  snapshots = [],
  targetSnapshot = null,
  auditLinks = [],
  adminContext = {},
  regenerationTimestamp,
  options = {},
} = {}) {
  const issues = [];
  const timestamp = normalizeTimestamp(regenerationTimestamp);
  const adminUserId = getAdminUserId(adminContext);
  const lineageAuditLinks = Array.isArray(options.auditLinks)
    ? options.auditLinks
    : auditLinks;
  const reportStatus = getStatus(report);
  const hasPublishedSnapshot = snapshots.some((snapshot) => (
    ["published", "published_internal"].includes(getStatus(snapshot))
  ));
  const allowArchivedRegeneration = Boolean(options.allowArchivedRegeneration);

  if (!timestamp) {
    issues.push(createValidationIssue({
      code: "CSTP_REGENERATION_TIMESTAMP_REQUIRED",
      message: "Regeneration planning requires an explicit valid timestamp supplied by the caller.",
      entity: "lineage",
      field: "regenerationTimestamp",
    }));
  }

  if (!adminUserId) {
    issues.push(createValidationIssue({
      code: "CSTP_REGENERATION_ADMIN_CONTEXT_REQUIRED",
      message: "Admin context is required for immutable CSTP regeneration planning.",
      severity: VALIDATION_SEVERITIES.publicationBlocking,
      entity: "audit",
      table: CSTP_REPORT_TABLES.auditLinks,
      field: "created_by",
    }));
  }

  if (
    ["archived", "archived_internal"].includes(reportStatus)
    && (hasPublishedSnapshot || !allowArchivedRegeneration)
  ) {
    issues.push(createValidationIssue({
      code: "CSTP_REGENERATION_ARCHIVED_REPORT_REJECTED",
      message: "Archived report regeneration is rejected unless explicitly allowed and no published evidence would be rewritten.",
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "status",
      metadata: {
        reportStatus,
        hasPublishedSnapshot,
        allowArchivedRegeneration,
      },
    }));
  }

  if (targetSnapshot && INACTIVE_SNAPSHOT_STATUSES.includes(getStatus(targetSnapshot))) {
    issues.push(createValidationIssue({
      code: "CSTP_REGENERATION_TARGET_INACTIVE",
      message: "Regeneration target is inactive; a new lineage review is required before using it as current evidence.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "status",
      metadata: {
        targetSnapshotId: getSnapshotId(targetSnapshot),
        status: getStatus(targetSnapshot),
      },
    }));
  }

  return mergeValidationResults(
    "validateRegenerationEligibility",
    [
      createValidationResult({
        validator: "validateRegenerationEligibility.local",
        issues,
        metadata: {
          reportStatus,
          hasPublishedSnapshot,
          hasRegenerationTimestamp: Boolean(timestamp),
        },
      }),
      detectDuplicateActiveLineage(snapshots),
      detectLineageCycle(snapshots),
      detectOrphanLineageReferences({ report, snapshots }),
      validateActiveSnapshotChainShape({ report, snapshots }),
      validateAuditLinkConsistencyShape({ report, snapshots, auditLinks: lineageAuditLinks }),
    ],
    {
      targetSnapshotId: targetSnapshot ? getSnapshotId(targetSnapshot) : null,
    },
  );
}

function buildLineageAuditContext({
  actionType,
  report = {},
  targetSnapshot = {},
  supersedingSnapshot = {},
  adminContext = {},
  timestamp,
  reason = "",
} = {}) {
  const normalizedTimestamp = normalizeTimestamp(timestamp);
  const adminUserId = getAdminUserId(adminContext);

  return deepFreeze(pruneUndefined({
    actionType,
    eventRole: actionType === LINEAGE_ACTIONS.supersedeSnapshot
      ? "snapshot_superseded"
      : "snapshot_generated",
    reportId: getReportId(report) || getSnapshotReportId(targetSnapshot),
    targetSnapshotId: getSnapshotId(targetSnapshot),
    supersedingSnapshotId: getSnapshotId(supersedingSnapshot),
    createdBy: adminUserId || undefined,
    cstpAdminEventId: getFirstValue(adminContext, [
      "cstpAdminEventId",
      "adminEventId",
      "eventId",
    ]) || undefined,
    createdAt: normalizedTimestamp || undefined,
    reason: normalizeNullableText(reason) || undefined,
    internalOnly: true,
    publicVisibility: false,
  }));
}

function buildPlannedSnapshotSet({
  snapshots = [],
  targetSnapshot = {},
  supersedingSnapshot = {},
}) {
  const targetSnapshotId = getSnapshotId(targetSnapshot);
  const supersedingSnapshotId = getSnapshotId(supersedingSnapshot);
  const existingWithoutSuccessor = snapshots.filter((snapshot) => (
    getSnapshotId(snapshot) !== supersedingSnapshotId
  ));
  const planned = existingWithoutSuccessor.map((snapshot) => {
    if (targetSnapshotId && getSnapshotId(snapshot) === targetSnapshotId) {
      return {
        ...snapshot,
        status: "superseded",
        superseded_by_snapshot_id: supersedingSnapshotId || getFirstValue(snapshot, [
          "superseded_by_snapshot_id",
          "supersededBySnapshotId",
        ]),
      };
    }

    return { ...snapshot };
  });

  if (supersedingSnapshotId) {
    planned.push({
      ...supersedingSnapshot,
      supersedes_snapshot_id: getFirstValue(supersedingSnapshot, [
        "supersedes_snapshot_id",
        "supersedesSnapshotId",
      ]) || targetSnapshotId || undefined,
    });
  }

  return sortLineageSnapshotsStable(planned);
}

function buildReportStateChanges({ report = {}, supersedingSnapshot = {}, timestamp }) {
  const snapshotStatus = getStatus(supersedingSnapshot);
  const reportStatus = snapshotStatus === "published"
    || snapshotStatus === "published_internal"
    ? "published"
    : "prepared";

  return pruneUndefined({
    id: getReportId(report) || getSnapshotReportId(supersedingSnapshot) || undefined,
    current_snapshot_id: getSnapshotId(supersedingSnapshot) || undefined,
    status: reportStatus,
    updated_at: normalizeTimestamp(timestamp) || undefined,
  });
}

function resolveSupersedingSnapshot({ supersedingSnapshot, snapshotCandidate }) {
  if (isPlainObject(supersedingSnapshot)) {
    return supersedingSnapshot;
  }

  if (isPlainObject(snapshotCandidate?.snapshotRecord)) {
    return snapshotCandidate.snapshotRecord;
  }

  if (isPlainObject(snapshotCandidate)) {
    return snapshotCandidate;
  }

  return {};
}

function resolveTargetSnapshot({
  report = {},
  snapshots = [],
  targetSnapshot,
  targetSnapshotId,
}) {
  if (isPlainObject(targetSnapshot)) {
    return targetSnapshot;
  }

  const requestedId = normalizeNullableText(targetSnapshotId);
  if (requestedId) {
    return snapshots.find((snapshot) => getSnapshotId(snapshot) === requestedId) || {};
  }

  const currentSnapshotId = normalizeNullableText(getFirstValue(report, [
    "current_snapshot_id",
    "currentSnapshotId",
  ]));

  if (currentSnapshotId) {
    return snapshots.find((snapshot) => getSnapshotId(snapshot) === currentSnapshotId) || {};
  }

  const activeLineage = resolveActiveSnapshotLineage({ report, snapshots });
  return activeLineage.currentSnapshot || {};
}

function buildCandidateReference(snapshotCandidate) {
  if (!isPlainObject(snapshotCandidate)) {
    return null;
  }

  const snapshot = snapshotCandidate.snapshotRecord || snapshotCandidate;
  return pruneUndefined({
    operation: snapshotCandidate.operation,
    snapshotId: getSnapshotId(snapshot) || undefined,
    reportId: getSnapshotReportId(snapshot) || undefined,
    snapshotVersion: getSnapshotVersion(snapshot) || undefined,
    validationStatus: snapshotCandidate.validation?.status,
    validationOk: snapshotCandidate.validation?.ok,
  });
}

function buildLineageConflictSummary({
  validation = null,
  lineageInspection = null,
} = {}) {
  const issues = [
    ...(Array.isArray(validation?.issues) ? validation.issues : []),
    ...(Array.isArray(lineageInspection?.validation?.issues)
      ? lineageInspection.validation.issues
      : []),
  ];
  const uniqueIssues = dedupeIssues(issues);
  const blockingIssues = uniqueIssues.filter((issue) => issue.blocking);
  const warningIssues = uniqueIssues.filter((issue) => !issue.blocking);

  return {
    status: blockingIssues.length
      ? "blocking_conflicts"
      : (warningIssues.length ? "warnings" : "clear"),
    conflictCount: uniqueIssues.length,
    blockingConflictCount: blockingIssues.length,
    warningConflictCount: warningIssues.length,
    codes: uniqueIssues.map((issue) => issue.code).filter(hasValue),
    affectedTables: [...new Set(uniqueIssues.map((issue) => issue.table).filter(hasValue))],
    orphanSnapshotCount: uniqueIssues.filter((issue) => (
      String(issue.code || "").includes("ORPHAN")
    )).length,
    duplicateActiveLineage: uniqueIssues.some((issue) => (
      issue.code === "CSTP_DUPLICATE_ACTIVE_SNAPSHOT_LINEAGE"
      || issue.code === "CSTP_ACTIVE_CHAIN_MULTIPLE_ACTIVE_SNAPSHOTS"
    )),
    auditLinkConflictCount: uniqueIssues.filter((issue) => (
      String(issue.code || "").includes("AUDIT_LINK")
    )).length,
    internalOnly: true,
    publicVisibility: false,
  };
}

function buildDeferredSupersedePreviewSafetyAnalysis({
  target = {},
  successorSnapshot = {},
  plannedSnapshots = [],
  validation = null,
  conflictSummary = {},
} = {}) {
  return {
    mode: "deferred_supersede_preview",
    ok: validation?.ok === true,
    targetSnapshotId: getSnapshotId(target) || null,
    supersedingSnapshotId: getSnapshotId(successorSnapshot) || null,
    targetStatus: getStatus(target) || null,
    supersedingStatus: getStatus(successorSnapshot) || null,
    plannedSnapshotCount: Array.isArray(plannedSnapshots) ? plannedSnapshots.length : 0,
    plannedActiveSnapshotIds: (Array.isArray(plannedSnapshots) ? plannedSnapshots : [])
      .filter(isActiveSnapshot)
      .map(getSnapshotId)
      .filter(hasValue),
    persistenceDeferred: true,
    immutableWritesEnabled: false,
    destructiveReplacement: false,
    deletesHistoricalSnapshots: false,
    mutatesFrozenPayloads: false,
    publicVisibility: false,
    conflictSummary,
    labels: buildInternalLineageLabels(),
  };
}

function buildRegenerationComparisonSummary({
  report = {},
  targetSnapshot = null,
  snapshots = [],
  nextSnapshotVersion = null,
  validation = null,
} = {}) {
  const latestSnapshot = sortLineageSnapshotsStable(snapshots).slice(-1)[0] || null;
  const targetPayload = getFirstValue(targetSnapshot || {}, [
    "frozen_report_payload",
    "frozenReportPayload",
    "payload",
  ]);

  return {
    mode: "deferred_regeneration_comparison",
    ok: validation?.ok === true,
    reportId: getReportId(report) || getSnapshotReportId(targetSnapshot || {}) || null,
    targetSnapshotId: targetSnapshot ? getSnapshotId(targetSnapshot) : null,
    targetSnapshotVersion: targetSnapshot ? getSnapshotVersion(targetSnapshot) : null,
    targetSnapshotStatus: targetSnapshot ? getStatus(targetSnapshot) : null,
    latestSnapshotId: latestSnapshot ? getSnapshotId(latestSnapshot) : null,
    latestSnapshotVersion: latestSnapshot ? getSnapshotVersion(latestSnapshot) : null,
    nextSnapshotVersion,
    requiresNewSnapshotVersion: true,
    payloadKeyCount: isPlainObject(targetPayload) ? Object.keys(targetPayload).length : 0,
    snapshotCount: Array.isArray(snapshots) ? snapshots.length : 0,
    comparisonBasis: "persisted_snapshot_metadata_and_frozen_payload_shape",
    persistenceDeferred: true,
    immutableWritesEnabled: false,
    publicVisibility: false,
    labels: buildInternalLineageLabels(),
  };
}

function buildImmutableReportTimelineSummary({
  report = {},
  snapshots = [],
  auditLinks = [],
  activeLineage = null,
  ancestryBySnapshotId = {},
  descendantsBySnapshotId = {},
  validation = null,
} = {}) {
  const sortedSnapshots = sortLineageSnapshotsStable(snapshots);
  const linksBySnapshotId = groupAuditLinksBySnapshotId(auditLinks);
  const activeSnapshotIds = new Set(activeLineage?.activeSnapshotIds || []);
  const currentSnapshotId = activeLineage?.currentSnapshotId || "";
  const latestSnapshotId = activeLineage?.latestSnapshotId || "";
  const entries = sortedSnapshots.map((snapshot, index) => {
    const snapshotId = getSnapshotId(snapshot);
    const snapshotAuditLinks = linksBySnapshotId[snapshotId] || [];
    const supersedesSnapshotId = getFirstValue(snapshot, [
      "supersedes_snapshot_id",
      "supersedesSnapshotId",
    ]);
    const supersededBySnapshotId = getFirstValue(snapshot, [
      "superseded_by_snapshot_id",
      "supersededBySnapshotId",
    ]);

    return {
      index,
      snapshotId,
      reportId: getSnapshotReportId(snapshot) || getReportId(report) || null,
      snapshotVersion: getSnapshotVersion(snapshot),
      status: getStatus(snapshot) || null,
      generatedAt: getFirstValue(snapshot, ["generated_at", "generatedAt"]) || "",
      preparedAt: getFirstValue(snapshot, ["prepared_at", "preparedAt"]) || "",
      publishedAt: getFirstValue(snapshot, ["published_at", "publishedAt"]) || "",
      lifecycleTimestamp: resolveSnapshotLifecycleTimestamp(snapshot),
      lifecycleLabel: buildSnapshotLifecycleLabel(snapshot),
      supersedesSnapshotId: supersedesSnapshotId || null,
      supersededBySnapshotId: supersededBySnapshotId || null,
      isActive: activeSnapshotIds.has(snapshotId),
      isCurrent: snapshotId === currentSnapshotId,
      isLatest: snapshotId === latestSnapshotId,
      ancestryDepth: Array.isArray(ancestryBySnapshotId[snapshotId])
        ? ancestryBySnapshotId[snapshotId].length
        : 0,
      descendantCount: Array.isArray(descendantsBySnapshotId[snapshotId])
        ? descendantsBySnapshotId[snapshotId].length
        : 0,
      auditLinkCount: snapshotAuditLinks.length,
      auditRoles: [...new Set(snapshotAuditLinks
        .map((link) => getFirstValue(link, ["event_role", "eventRole"]))
        .filter(hasValue))],
      orphanIndicator: Boolean(
        hasValue(supersedesSnapshotId)
        && !sortedSnapshots.some((entry) => getSnapshotId(entry) === supersedesSnapshotId)
      ),
      publicVisibility: false,
      internalOnly: true,
    };
  });

  return {
    mode: "internal_immutable_report_history_timeline",
    reportId: getReportId(report) || entries[0]?.reportId || null,
    entryCount: entries.length,
    activeSnapshotId: currentSnapshotId || null,
    latestSnapshotId: latestSnapshotId || null,
    entries,
    supersedeChains: buildSupersedeChainOrdering(entries),
    regenerateGroups: buildRegenerateLineageGroups(entries),
    auditTimeline: buildAuditLinkTimelineCorrelation(auditLinks, entries),
    evolutionSummary: buildReportEvolutionSummary(entries, validation),
    labels: [
      "Internal-only immutable report history",
      "Lineage timeline is inspection-only",
      "Public report history, certification, and rendering are deferred",
    ],
    persistenceDeferred: true,
    immutableWritesEnabled: false,
    publicVisibility: false,
    internalOnly: true,
  };
}

function buildSupersedeChainOrdering(entries = []) {
  const byId = new Map(entries.map((entry) => [entry.snapshotId, entry]));
  const roots = entries.filter((entry) => (
    !entry.supersedesSnapshotId || !byId.has(entry.supersedesSnapshotId)
  ));

  return roots.map((root) => {
    const chain = [];
    const visited = new Set();
    let current = root;

    while (current && !visited.has(current.snapshotId)) {
      visited.add(current.snapshotId);
      chain.push({
        snapshotId: current.snapshotId,
        snapshotVersion: current.snapshotVersion,
        status: current.status,
        isActive: current.isActive,
        isCurrent: current.isCurrent,
      });
      current = entries.find((entry) => entry.supersedesSnapshotId === current.snapshotId) || null;
    }

    return {
      rootSnapshotId: root.snapshotId,
      terminalSnapshotId: chain[chain.length - 1]?.snapshotId || root.snapshotId,
      length: chain.length,
      activeSnapshotIds: chain.filter((entry) => entry.isActive).map((entry) => entry.snapshotId),
      orderedSnapshotIds: chain.map((entry) => entry.snapshotId),
      entries: chain,
    };
  });
}

function buildRegenerateLineageGroups(entries = []) {
  const byId = new Map(entries.map((entry) => [entry.snapshotId, entry]));
  const groups = new Map();

  entries.forEach((entry) => {
    let root = entry;
    const visited = new Set();
    while (
      root?.supersedesSnapshotId
      && byId.has(root.supersedesSnapshotId)
      && !visited.has(root.supersedesSnapshotId)
    ) {
      visited.add(root.snapshotId);
      root = byId.get(root.supersedesSnapshotId);
    }
    const rootId = root?.snapshotId || entry.snapshotId;
    const group = groups.get(rootId) || [];
    group.push(entry);
    groups.set(rootId, group);
  });

  return Array.from(groups.entries()).map(([rootSnapshotId, groupEntries]) => ({
    rootSnapshotId,
    snapshotCount: groupEntries.length,
    versions: groupEntries.map((entry) => entry.snapshotVersion).filter(Number.isFinite),
    activeSnapshotIds: groupEntries.filter((entry) => entry.isActive).map((entry) => entry.snapshotId),
    latestSnapshotId: groupEntries[groupEntries.length - 1]?.snapshotId || null,
    relationship: groupEntries.length > 1
      ? "regenerated_or_superseded_lineage"
      : "single_snapshot_lineage",
    entries: groupEntries.map((entry) => ({
      snapshotId: entry.snapshotId,
      snapshotVersion: entry.snapshotVersion,
      status: entry.status,
      supersedesSnapshotId: entry.supersedesSnapshotId,
    })),
  }));
}

function buildAuditLinkTimelineCorrelation(auditLinks = [], entries = []) {
  const entryIds = new Set(entries.map((entry) => entry.snapshotId).filter(hasValue));
  return (Array.isArray(auditLinks) ? auditLinks : [])
    .map((auditLink, index) => {
      const snapshotId = getFirstValue(auditLink, ["snapshot_id", "snapshotId"]);
      return {
        index,
        auditLinkId: getFirstValue(auditLink, ["id", "auditLinkId"]) || null,
        snapshotId: snapshotId || null,
        reportId: getFirstValue(auditLink, ["report_id", "reportId"]) || null,
        eventRole: getFirstValue(auditLink, ["event_role", "eventRole"]) || null,
        cstpAdminEventId: getFirstValue(auditLink, [
          "cstp_admin_event_id",
          "cstpAdminEventId",
          "adminEventId",
        ]) || null,
        createdBy: getFirstValue(auditLink, ["created_by", "createdBy"]) || null,
        createdAt: normalizeTimestamp(getFirstValue(auditLink, ["created_at", "createdAt"])) || "",
        correlated: hasValue(snapshotId) ? entryIds.has(snapshotId) : true,
        publicVisibility: false,
        internalOnly: true,
      };
    })
    .sort((left, right) => compareNullableTimestamp(left.createdAt, right.createdAt));
}

function buildReportEvolutionSummary(entries = [], validation = null) {
  const statuses = entries.reduce((counts, entry) => {
    const status = entry.status || "unknown";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  return {
    snapshotCount: entries.length,
    firstSnapshotId: entries[0]?.snapshotId || null,
    latestSnapshotId: entries[entries.length - 1]?.snapshotId || null,
    activeSnapshotIds: entries.filter((entry) => entry.isActive).map((entry) => entry.snapshotId),
    orphanSnapshotIds: entries.filter((entry) => entry.orphanIndicator).map((entry) => entry.snapshotId),
    statusCounts: statuses,
    versionRange: {
      first: entries[0]?.snapshotVersion || null,
      latest: entries[entries.length - 1]?.snapshotVersion || null,
    },
    validationStatus: validation?.status || "not_run",
    blockingIssueCount: validation?.summary?.blocking || 0,
    warningIssueCount: validation?.summary?.warnings || 0,
    publicVisibility: false,
  };
}

function groupAuditLinksBySnapshotId(auditLinks = []) {
  return (Array.isArray(auditLinks) ? auditLinks : []).reduce((groups, auditLink) => {
    const snapshotId = getFirstValue(auditLink, ["snapshot_id", "snapshotId"]);
    if (snapshotId) {
      groups[snapshotId] = groups[snapshotId] || [];
      groups[snapshotId].push(auditLink);
    }
    return groups;
  }, {});
}

function resolveSnapshotLifecycleTimestamp(snapshot = {}) {
  return normalizeTimestamp(
    getFirstValue(snapshot, ["published_at", "publishedAt"])
    || getFirstValue(snapshot, ["prepared_at", "preparedAt"])
    || getFirstValue(snapshot, ["generated_at", "generatedAt"])
    || getFirstValue(snapshot, ["created_at", "createdAt"]),
  );
}

function buildSnapshotLifecycleLabel(snapshot = {}) {
  const status = getStatus(snapshot);
  const timestamp = resolveSnapshotLifecycleTimestamp(snapshot);
  return [status || "snapshot", timestamp].filter(Boolean).join(" at ");
}

function resolveSnapshotAncestry(snapshot = {}, byId = new Map()) {
  const ancestry = [];
  const visited = new Set();
  let currentId = getFirstValue(snapshot, [
    "supersedes_snapshot_id",
    "supersedesSnapshotId",
  ]);

  while (hasValue(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const ancestor = byId.get(currentId);
    ancestry.push({
      snapshotId: currentId,
      found: Boolean(ancestor),
      snapshotVersion: ancestor ? getSnapshotVersion(ancestor) : null,
      status: ancestor ? getStatus(ancestor) : null,
    });

    if (!ancestor) {
      break;
    }
    currentId = getFirstValue(ancestor, [
      "supersedes_snapshot_id",
      "supersedesSnapshotId",
    ]);
  }

  return ancestry;
}

function resolveSnapshotDescendants(snapshotId, snapshots = []) {
  const descendants = [];
  const queue = [snapshotId];
  const visited = new Set();

  while (queue.length) {
    const currentId = queue.shift();
    if (!hasValue(currentId) || visited.has(currentId)) {
      continue;
    }
    visited.add(currentId);
    snapshots.forEach((snapshot) => {
      const parentId = getFirstValue(snapshot, [
        "supersedes_snapshot_id",
        "supersedesSnapshotId",
      ]);
      const childId = getSnapshotId(snapshot);
      if (parentId === currentId && !visited.has(childId)) {
        descendants.push({
          snapshotId: childId,
          snapshotVersion: getSnapshotVersion(snapshot),
          status: getStatus(snapshot),
        });
        queue.push(childId);
      }
    });
  }

  return descendants;
}

function dedupeIssues(issues = []) {
  const seen = new Set();
  return issues.filter((issue) => {
    const key = [
      issue.code,
      issue.table,
      issue.field,
      issue.metadata?.snapshotId,
      issue.metadata?.reportId,
      issue.metadata?.index,
    ].join("|");
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildInternalLineageLabels() {
  return [
    "Internal-only CSTP lineage inspection",
    "Deferred preview; immutable writes are not enabled here",
    "Certification, public publishing, and rendering are deferred",
  ];
}

function buildLineageWarnings(validation) {
  const warningIssues = validation.issues.filter((issue) => !issue.blocking);
  const defaultWarnings = [
    "Lineage plans are not persisted here; caller must use a transaction-aware persistence path.",
    "Historical snapshots must be retained and superseded instead of destructively replaced.",
  ];

  return defaultWarnings.concat(warningIssues.map((issue) => issue.message));
}

function compareLineageSnapshotsStable(left, right) {
  return compareNullableText(getSnapshotReportId(left), getSnapshotReportId(right))
    || compareNullableNumber(getSnapshotVersion(left), getSnapshotVersion(right))
    || compareNullableTimestamp(getFirstValue(left, ["generated_at", "generatedAt"]), getFirstValue(right, ["generated_at", "generatedAt"]))
    || compareNullableTimestamp(getFirstValue(left, ["created_at", "createdAt"]), getFirstValue(right, ["created_at", "createdAt"]))
    || compareNullableText(getSnapshotId(left), getSnapshotId(right));
}

function isActiveSnapshot(snapshot = {}) {
  const status = getStatus(snapshot);
  const archived = getFirstValue(snapshot, ["archived"]) === true;
  return ACTIVE_SNAPSHOT_STATUSES.includes(status) && archived !== true;
}

function getStatus(record = {}) {
  return normalizeNullableText(getFirstValue(record, [
    "lifecycleState",
    "governanceState",
    "snapshotStatus",
    "reportStatus",
    "status",
    "snapshot_status",
    "report_status",
  ]));
}

function getReportId(report = {}) {
  return normalizeNullableText(getFirstValue(report, ["id", "reportId"]));
}

function getSnapshotId(snapshot = {}) {
  return normalizeNullableText(getFirstValue(snapshot, ["id", "snapshotId"]));
}

function getSnapshotReportId(snapshot = {}) {
  return normalizeNullableText(getFirstValue(snapshot, ["report_id", "reportId"]));
}

function getSnapshotVersion(snapshot = {}) {
  const value = getFirstValue(snapshot, ["snapshot_version", "snapshotVersion"]);
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : NaN;
}

function getAdminUserId(adminContext = {}) {
  return normalizeNullableText(getFirstValue(adminContext, [
    "adminUserId",
    "createdBy",
    "userId",
    "id",
  ]));
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

function compareNullableText(left, right) {
  return normalizeNullableText(left).localeCompare(normalizeNullableText(right));
}

function compareNullableNumber(left, right) {
  const leftValue = Number.isFinite(left) ? left : Number.POSITIVE_INFINITY;
  const rightValue = Number.isFinite(right) ? right : Number.POSITIVE_INFINITY;
  return leftValue - rightValue;
}

function compareNullableTimestamp(left, right) {
  const leftTime = normalizeTimestamp(left) ? Date.parse(normalizeTimestamp(left)) : Infinity;
  const rightTime = normalizeTimestamp(right) ? Date.parse(normalizeTimestamp(right)) : Infinity;
  return leftTime - rightTime;
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function cloneArray(value) {
  return Array.isArray(value) ? value.map((entry) => ({ ...entry })) : [];
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
  LINEAGE_OPERATION,
  LINEAGE_ACTIONS,
  buildSupersessionPlan,
  validateSupersessionPlan,
  resolveActiveSnapshotLineage,
  detectDuplicateActiveLineage,
  detectLineageCycle,
  detectOrphanLineageReferences,
  inspectImmutableLineageGraph,
  sortLineageSnapshotsStable,
  buildLineageConflictSummary,
  buildRegenerationPlan,
  validateRegenerationEligibility,
  buildLineageAuditContext,
};
