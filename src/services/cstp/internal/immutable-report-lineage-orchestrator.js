"use strict";

const {
  ACTIVE_SNAPSHOT_STATUSES,
  CSTP_REPORT_TABLES,
  VALIDATION_SEVERITIES,
  createValidationIssue,
  createValidationResult,
  mergeValidationResults,
  validateDuplicateActiveLineageShape,
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
  const validation = validateSupersessionPlan({
    actionType: LINEAGE_ACTIONS.supersedeSnapshot,
    report,
    targetSnapshot: target,
    supersedingSnapshot: successorSnapshot,
    snapshots: lineageSnapshots,
    plannedSnapshots,
    adminContext,
    supersessionTimestamp: normalizedTimestamp,
    options,
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
      publicVisibility: false,
    },
    internalOnly: true,
  });
}

function validateSupersessionPlan(plan = {}, options = {}) {
  const issues = [];
  const targetSnapshot = plan.targetSnapshot || {};
  const supersedingSnapshot = plan.supersedingSnapshot || {};
  const snapshots = Array.isArray(plan.snapshots) ? plan.snapshots : [];
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

function sortLineageSnapshotsStable(snapshots = []) {
  return cloneArray(snapshots).sort(compareLineageSnapshotsStable);
}

function buildRegenerationPlan({
  report = {},
  snapshots = [],
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
  const validation = validateRegenerationEligibility({
    report,
    snapshots: sortedSnapshots,
    targetSnapshot,
    adminContext,
    regenerationTimestamp,
    options,
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
    errors: validation.issues.filter((issue) => issue.blocking),
    warnings: buildLineageWarnings(validation),
    lineage,
    immutableSafety: {
      destructiveReplacement: false,
      deletesHistoricalSnapshots: false,
      mutatesFrozenPayloads: false,
      requiresNewSnapshotVersion: true,
      requiresSeparatePersistence: true,
      publicVisibility: false,
    },
    internalOnly: true,
  });
}

function validateRegenerationEligibility({
  report = {},
  snapshots = [],
  targetSnapshot = null,
  adminContext = {},
  regenerationTimestamp,
  options = {},
} = {}) {
  const issues = [];
  const timestamp = normalizeTimestamp(regenerationTimestamp);
  const adminUserId = getAdminUserId(adminContext);
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
  sortLineageSnapshotsStable,
  buildRegenerationPlan,
  validateRegenerationEligibility,
  buildLineageAuditContext,
};
