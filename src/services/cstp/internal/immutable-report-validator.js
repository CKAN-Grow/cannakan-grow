"use strict";

/*
 * Internal-only CSTP immutable report validation infrastructure.
 *
 * These helpers are deterministic and side-effect free: they validate supplied
 * objects only, never query Supabase, never write data, never mutate inputs, and
 * never perform rendering. Persistence/orchestration happens in later internal
 * service work. Public report behavior and certification logic remain deferred.
 */

const REPORT_GOVERNANCE_STATES = Object.freeze([
  "draft",
  "preparing",
  "prepared",
  "integrity_failed",
  "published_internal",
  "superseded",
  "archived_internal",
]);

const REPORT_STORAGE_STATUSES = Object.freeze([
  "draft",
  "preparing",
  "prepared",
  "published",
  "superseded",
  "archived",
]);

const SNAPSHOT_STORAGE_STATUSES = Object.freeze([
  "draft",
  "generated",
  "prepared",
  "published",
  "superseded",
  "archived",
]);

const SNAPSHOT_GOVERNANCE_STATES = Object.freeze([
  ...REPORT_GOVERNANCE_STATES,
  "generated",
]);

const VALIDATION_SEVERITIES = Object.freeze({
  blocking: "blocking_integrity_failure",
  publicationBlocking: "publication_blocking_validation",
  warning: "warning_non_blocking_validation",
  info: "audit_only_informational_validation",
});

const VALIDATION_STATUSES = Object.freeze({
  passed: "passed",
  failed: "failed",
  warning: "warning",
  info: "info",
});

const CSTP_REPORT_TABLES = Object.freeze({
  reports: "cstp_reports",
  snapshots: "cstp_report_snapshots",
  metrics: "cstp_report_metrics",
  sessions: "cstp_report_sessions",
  auditLinks: "cstp_report_audit_links",
  requests: "cstp_requests",
  tests: "cstp_tests",
  testSessions: "cstp_test_sessions",
  growSessions: "grow_sessions",
  sources: "sources",
  adminEvents: "cstp_admin_events",
});

const ACTIVE_SNAPSHOT_STATUSES = Object.freeze([
  "prepared",
  "published",
  "published_internal",
]);

function createValidationIssue({
  code,
  message,
  severity = VALIDATION_SEVERITIES.blocking,
  entity = "",
  table = "",
  field = "",
  key = "",
  blocking,
  metadata = {},
} = {}) {
  const normalizedSeverity = normalizeSeverity(severity);
  const isBlocking = blocking === undefined
    ? isBlockingSeverity(normalizedSeverity)
    : Boolean(blocking);

  return deepFreeze({
    status: getIssueStatus(normalizedSeverity, isBlocking),
    severity: normalizedSeverity,
    code: normalizeText(code) || "CSTP_IMMUTABLE_VALIDATION_ISSUE",
    message: normalizeText(message) || "CSTP immutable report validation issue.",
    entity: normalizeText(entity),
    table: normalizeText(table),
    field: normalizeText(field),
    key: normalizeText(key),
    blocking: isBlocking,
    metadata: clonePlainMetadata(metadata),
  });
}

function createValidationResult({
  validator = "",
  issues = [],
  metadata = {},
} = {}) {
  const normalizedIssues = Array.isArray(issues) ? issues : [];
  const blockingIssues = normalizedIssues.filter((issue) => issue.blocking);
  const warningIssues = normalizedIssues.filter((issue) => (
    issue.severity === VALIDATION_SEVERITIES.warning
  ));
  const informationalIssues = normalizedIssues.filter((issue) => (
    issue.severity === VALIDATION_SEVERITIES.info
  ));

  return deepFreeze({
    status: getResultStatus({
      blockingCount: blockingIssues.length,
      warningCount: warningIssues.length,
      informationalCount: informationalIssues.length,
    }),
    ok: blockingIssues.length === 0,
    blocking: blockingIssues.length > 0,
    validator: normalizeText(validator) || "cstp_immutable_report_validator",
    issues: normalizedIssues.map((issue) => ({ ...issue })),
    summary: {
      total: normalizedIssues.length,
      blocking: blockingIssues.length,
      warnings: warningIssues.length,
      informational: informationalIssues.length,
    },
    metadata: clonePlainMetadata(metadata),
    internalOnly: true,
  });
}

function mergeValidationResults(validator, results = [], metadata = {}) {
  const issues = results.flatMap((result) => (
    Array.isArray(result?.issues) ? result.issues : []
  ));

  return createValidationResult({
    validator,
    issues,
    metadata,
  });
}

function validateReportLifecycleState(report = {}, options = {}) {
  const status = getFirstValue(report, [
    "lifecycleState",
    "governanceState",
    "status",
    "report_status",
  ]);
  const issues = [];
  const allowedStates = options.allowStorageStatuses === false
    ? REPORT_GOVERNANCE_STATES
    : [...REPORT_GOVERNANCE_STATES, ...REPORT_STORAGE_STATUSES];

  if (!hasValue(status)) {
    issues.push(createValidationIssue({
      code: "CSTP_REPORT_STATUS_REQUIRED",
      message: "Report lifecycle status is required.",
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "status",
      metadata: { allowedStates },
    }));
  } else if (!allowedStates.includes(status)) {
    issues.push(createValidationIssue({
      code: "CSTP_REPORT_STATUS_INVALID",
      message: `Report lifecycle status "${status}" is not valid for immutable CSTP report governance.`,
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "status",
      metadata: { status, allowedStates },
    }));
  }

  return createValidationResult({
    validator: "validateReportLifecycleState",
    issues,
    metadata: { status },
  });
}

function validateSnapshotStatus(snapshot = {}, options = {}) {
  const status = getFirstValue(snapshot, [
    "lifecycleState",
    "governanceState",
    "snapshotStatus",
    "status",
    "snapshot_status",
  ]);
  const issues = [];
  const allowedStatuses = options.allowGovernanceStates === false
    ? SNAPSHOT_STORAGE_STATUSES
    : [...SNAPSHOT_STORAGE_STATUSES, ...SNAPSHOT_GOVERNANCE_STATES];

  if (!hasValue(status)) {
    issues.push(createValidationIssue({
      code: "CSTP_SNAPSHOT_STATUS_REQUIRED",
      message: "Snapshot status is required.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "status",
      metadata: { allowedStatuses },
    }));
  } else if (!allowedStatuses.includes(status)) {
    issues.push(createValidationIssue({
      code: "CSTP_SNAPSHOT_STATUS_INVALID",
      message: `Snapshot status "${status}" is not valid for immutable CSTP snapshot governance.`,
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "status",
      metadata: { status, allowedStatuses },
    }));
  }

  return createValidationResult({
    validator: "validateSnapshotStatus",
    issues,
    metadata: { status },
  });
}

function validateTimestampOrdering(record = {}, options = {}) {
  const issues = [];
  const entity = normalizeText(options.entity) || "snapshot";
  const table = normalizeText(options.table) || CSTP_REPORT_TABLES.snapshots;
  const timestampPairs = [
    ["generated_at", "prepared_at", "generatedAt", "preparedAt"],
    ["prepared_at", "published_at", "preparedAt", "publishedAt"],
    [
      "observation_window_start",
      "observation_window_end",
      "observationWindowStart",
      "observationWindowEnd",
    ],
    ["started_at", "completed_at", "startedAt", "completedAt"],
  ];

  timestampPairs.forEach(([startSnake, endSnake, startCamel, endCamel]) => {
    const startValue = getFirstValue(record, [startSnake, startCamel]);
    const endValue = getFirstValue(record, [endSnake, endCamel]);

    if (!hasValue(startValue) || !hasValue(endValue)) {
      return;
    }

    const startTimestamp = parseTimestamp(startValue);
    const endTimestamp = parseTimestamp(endValue);

    if (Number.isNaN(startTimestamp)) {
      issues.push(createInvalidTimestampIssue({
        entity,
        table,
        field: startSnake,
        value: startValue,
      }));
      return;
    }

    if (Number.isNaN(endTimestamp)) {
      issues.push(createInvalidTimestampIssue({
        entity,
        table,
        field: endSnake,
        value: endValue,
      }));
      return;
    }

    if (endTimestamp < startTimestamp) {
      issues.push(createValidationIssue({
        code: "CSTP_TIMESTAMP_ORDER_INVALID",
        message: `${endSnake} must not precede ${startSnake}.`,
        entity,
        table,
        field: endSnake,
        metadata: {
          startField: startSnake,
          endField: endSnake,
          startValue,
          endValue,
        },
      }));
    }
  });

  return createValidationResult({
    validator: "validateTimestampOrdering",
    issues,
    metadata: { entity, table },
  });
}

function validateRequiredOperationalReferences(context = {}, options = {}) {
  const issues = [];
  const report = context.report || {};
  const snapshot = context.snapshot || {};
  const cstpTest = context.cstpTest || context.test || {};
  const cstpRequest = context.cstpRequest || context.request || {};
  const source = context.source || {};
  const sessionLinks = Array.isArray(context.sessionLinks)
    ? context.sessionLinks
    : [];
  const growSessions = Array.isArray(context.growSessions)
    ? context.growSessions
    : [];
  const requireReport = options.requireReport !== false;
  const requireSnapshot = options.requireSnapshot === true;
  const requireSessions = options.requireSessions !== false;
  const requireAdminContext = options.requireAdminContext === true;

  if (requireReport && !hasIdentifier(report)) {
    issues.push(createMissingReferenceIssue({
      code: "CSTP_REPORT_REFERENCE_REQUIRED",
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "id",
      message: "Report root reference is required.",
    }));
  }

  if (requireSnapshot && !hasIdentifier(snapshot)) {
    issues.push(createMissingReferenceIssue({
      code: "CSTP_SNAPSHOT_REFERENCE_REQUIRED",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "id",
      message: "Snapshot reference is required.",
    }));
  }

  if (!hasIdentifier(cstpTest)) {
    issues.push(createMissingReferenceIssue({
      code: "CSTP_TEST_REFERENCE_REQUIRED",
      entity: "cstp_test",
      table: CSTP_REPORT_TABLES.tests,
      field: "id",
      message: "CSTP test reference is required.",
    }));
  }

  const reportTestId = getIdValue(report, ["cstp_test_id", "cstpTestId"]);
  const snapshotTestId = getIdValue(snapshot, ["cstp_test_id", "cstpTestId"]);
  const testId = getIdValue(cstpTest, ["id", "cstpTestId", "testId"]);

  if (hasValue(reportTestId) && hasValue(testId) && reportTestId !== testId) {
    issues.push(createReferenceMismatchIssue({
      code: "CSTP_REPORT_TEST_REFERENCE_MISMATCH",
      message: "Report cstp_test_id must match the supplied CSTP test id.",
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "cstp_test_id",
      expected: testId,
      actual: reportTestId,
    }));
  }

  if (hasValue(snapshotTestId) && hasValue(testId) && snapshotTestId !== testId) {
    issues.push(createReferenceMismatchIssue({
      code: "CSTP_SNAPSHOT_TEST_REFERENCE_MISMATCH",
      message: "Snapshot cstp_test_id must match the supplied CSTP test id.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "cstp_test_id",
      expected: testId,
      actual: snapshotTestId,
    }));
  }

  validateOptionalReferencedEntity({
    issues,
    owner: report,
    ownerEntity: "report",
    ownerTable: CSTP_REPORT_TABLES.reports,
    referenceField: "cstp_request_id",
    referenceCamelField: "cstpRequestId",
    referencedRecord: cstpRequest,
    referencedTable: CSTP_REPORT_TABLES.requests,
  });

  validateOptionalReferencedEntity({
    issues,
    owner: report,
    ownerEntity: "report",
    ownerTable: CSTP_REPORT_TABLES.reports,
    referenceField: "source_id",
    referenceCamelField: "sourceId",
    referencedRecord: source,
    referencedTable: CSTP_REPORT_TABLES.sources,
  });

  if (requireSessions && sessionLinks.length === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_SESSION_LINKS_REQUIRED",
      message: "At least one CSTP test session link is required for reportable snapshot validation.",
      severity: VALIDATION_SEVERITIES.publicationBlocking,
      entity: "cstp_test_session",
      table: CSTP_REPORT_TABLES.testSessions,
      field: "session_id",
    }));
  }

  const growSessionIds = new Set(growSessions.map((session) => (
    getIdValue(session, ["id", "sessionId", "growSessionId"])
  )).filter(hasValue));

  sessionLinks.forEach((link, index) => {
    const included = getBooleanValue(link, [
      "included_in_report",
      "includedInReport",
    ], true);
    const sessionId = getIdValue(link, [
      "session_id",
      "sessionId",
      "grow_session_id",
      "growSessionId",
    ]);

    if (included && !hasValue(sessionId)) {
      issues.push(createMissingReferenceIssue({
        code: "CSTP_INCLUDED_SESSION_ID_REQUIRED",
        entity: "cstp_test_session",
        table: CSTP_REPORT_TABLES.testSessions,
        field: "session_id",
        message: "Included CSTP test session link must reference a Grow session.",
        metadata: { index },
      }));
      return;
    }

    if (included && !growSessionIds.has(sessionId)) {
      issues.push(createMissingReferenceIssue({
        code: "CSTP_INCLUDED_GROW_SESSION_REQUIRED",
        entity: "grow_session",
        table: CSTP_REPORT_TABLES.growSessions,
        field: "id",
        message: "Included CSTP test session link must have a supplied Grow session record.",
        metadata: { index, sessionId },
      }));
    }
  });

  if (requireAdminContext && !hasIdentifier(context.adminEvent) && !hasIdentifier(context.actor)) {
    issues.push(createValidationIssue({
      code: "CSTP_ADMIN_CONTEXT_REQUIRED",
      message: "Admin event or actor context is required for this immutable report validation mode.",
      severity: VALIDATION_SEVERITIES.publicationBlocking,
      entity: "audit",
      table: CSTP_REPORT_TABLES.auditLinks,
      field: "created_by",
    }));
  }

  return createValidationResult({
    validator: "validateRequiredOperationalReferences",
    issues,
    metadata: {
      requireReport,
      requireSnapshot,
      requireSessions,
      requireAdminContext,
      sessionLinkCount: sessionLinks.length,
      growSessionCount: growSessions.length,
    },
  });
}

function validateFrozenPayloadPresence(snapshot = {}, options = {}) {
  const issues = [];
  const requireNonEmpty = options.requireNonEmpty !== false;
  const payload = getFirstValue(snapshot, [
    "frozen_report_payload",
    "frozenReportPayload",
    "payload",
  ]);

  if (!hasValue(payload)) {
    issues.push(createValidationIssue({
      code: "CSTP_FROZEN_PAYLOAD_REQUIRED",
      message: "Frozen report payload is required for immutable snapshot validation.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "frozen_report_payload",
    }));
  } else if (!isPlainObject(payload)) {
    issues.push(createValidationIssue({
      code: "CSTP_FROZEN_PAYLOAD_MALFORMED",
      message: "Frozen report payload must be a structured object.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "frozen_report_payload",
      metadata: { payloadType: getValueType(payload) },
    }));
  } else if (requireNonEmpty && Object.keys(payload).length === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_FROZEN_PAYLOAD_EMPTY",
      message: "Frozen report payload must not be empty for publication readiness validation.",
      severity: VALIDATION_SEVERITIES.publicationBlocking,
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "frozen_report_payload",
    }));
  }

  return createValidationResult({
    validator: "validateFrozenPayloadPresence",
    issues,
    metadata: { requireNonEmpty },
  });
}

function validateSupersessionSelfReference(snapshot = {}) {
  const issues = [];
  const snapshotId = getIdValue(snapshot, ["id", "snapshotId"]);
  const supersedesSnapshotId = getIdValue(snapshot, [
    "supersedes_snapshot_id",
    "supersedesSnapshotId",
  ]);
  const supersededBySnapshotId = getIdValue(snapshot, [
    "superseded_by_snapshot_id",
    "supersededBySnapshotId",
  ]);

  if (hasValue(snapshotId) && snapshotId === supersedesSnapshotId) {
    issues.push(createValidationIssue({
      code: "CSTP_SNAPSHOT_SUPERSEDES_SELF",
      message: "Snapshot must not supersede itself.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "supersedes_snapshot_id",
      metadata: { snapshotId, supersedesSnapshotId },
    }));
  }

  if (hasValue(snapshotId) && snapshotId === supersededBySnapshotId) {
    issues.push(createValidationIssue({
      code: "CSTP_SNAPSHOT_SUPERSEDED_BY_SELF",
      message: "Snapshot must not be superseded by itself.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "superseded_by_snapshot_id",
      metadata: { snapshotId, supersededBySnapshotId },
    }));
  }

  return createValidationResult({
    validator: "validateSupersessionSelfReference",
    issues,
    metadata: {
      snapshotId,
      supersedesSnapshotId,
      supersededBySnapshotId,
    },
  });
}

function validateSnapshotLineageConsistencyShape(context = {}) {
  const issues = [];
  const report = context.report || {};
  const snapshot = context.snapshot || {};
  const predecessor = context.predecessor || context.previousSnapshot || {};
  const successor = context.successor || context.nextSnapshot || snapshot;

  validateReportSnapshotShape({ issues, report, snapshot });

  if (hasIdentifier(predecessor) && hasIdentifier(successor)) {
    validateSameReport({
      issues,
      left: predecessor,
      right: successor,
      leftEntity: "predecessor_snapshot",
      rightEntity: "successor_snapshot",
    });

    const predecessorVersion = getNumberValue(predecessor, [
      "snapshot_version",
      "snapshotVersion",
    ]);
    const successorVersion = getNumberValue(successor, [
      "snapshot_version",
      "snapshotVersion",
    ]);

    if (
      Number.isFinite(predecessorVersion)
      && Number.isFinite(successorVersion)
      && successorVersion <= predecessorVersion
    ) {
      issues.push(createValidationIssue({
        code: "CSTP_SUPERSESSION_VERSION_NOT_INCREMENTED",
        message: "Successor snapshot version must be greater than predecessor snapshot version.",
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
        field: "snapshot_version",
        metadata: { predecessorVersion, successorVersion },
      }));
    }
  }

  const selfReferenceResult = validateSupersessionSelfReference(snapshot);
  issues.push(...selfReferenceResult.issues);

  return createValidationResult({
    validator: "validateSnapshotLineageConsistencyShape",
    issues,
    metadata: {
      hasReport: hasIdentifier(report),
      hasSnapshot: hasIdentifier(snapshot),
      hasPredecessor: hasIdentifier(predecessor),
      hasSuccessor: hasIdentifier(successor),
    },
  });
}

function validateDuplicateActiveLineageShape(context = {}) {
  const snapshots = Array.isArray(context.snapshots) ? context.snapshots : [];
  const issues = [];
  const activeByReport = new Map();

  snapshots.forEach((snapshot, index) => {
    const reportId = getIdValue(snapshot, ["report_id", "reportId"]);
    const status = getFirstValue(snapshot, [
      "lifecycleState",
      "governanceState",
      "status",
      "snapshot_status",
      "snapshotStatus",
    ]);
    const archived = getBooleanValue(snapshot, ["archived"], false);
    const isActive = ACTIVE_SNAPSHOT_STATUSES.includes(status) && archived !== true;

    if (!isActive || !hasValue(reportId)) {
      return;
    }

    const entries = activeByReport.get(reportId) || [];
    entries.push({
      index,
      snapshotId: getIdValue(snapshot, ["id", "snapshotId"]),
      status,
    });
    activeByReport.set(reportId, entries);
  });

  activeByReport.forEach((entries, reportId) => {
    if (entries.length > 1) {
      issues.push(createValidationIssue({
        code: "CSTP_DUPLICATE_ACTIVE_SNAPSHOT_LINEAGE",
        message: "A report must not have multiple active prepared or internally published snapshots.",
        severity: VALIDATION_SEVERITIES.publicationBlocking,
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
        field: "status",
        metadata: { reportId, activeSnapshots: entries },
      }));
    }
  });

  return createValidationResult({
    validator: "validateDuplicateActiveLineageShape",
    issues,
    metadata: { snapshotCount: snapshots.length },
  });
}

function validateActiveSnapshotChainShape(context = {}) {
  const report = context.report || {};
  const snapshots = Array.isArray(context.snapshots) ? context.snapshots : [];
  const issues = [];
  const reportId = getIdValue(report, ["id", "reportId"]);
  const currentSnapshotId = getIdValue(report, [
    "current_snapshot_id",
    "currentSnapshotId",
  ]);
  const reportSnapshots = reportId
    ? snapshots.filter((snapshot) => getIdValue(snapshot, ["report_id", "reportId"]) === reportId)
    : snapshots;
  const byId = new Map(
    reportSnapshots
      .map((snapshot) => [getIdValue(snapshot, ["id", "snapshotId"]), snapshot])
      .filter(([snapshotId]) => hasValue(snapshotId)),
  );
  const activeSnapshots = reportSnapshots.filter((snapshot) => {
    const status = getFirstValue(snapshot, [
      "lifecycleState",
      "governanceState",
      "status",
      "snapshot_status",
      "snapshotStatus",
    ]);
    const archived = getBooleanValue(snapshot, ["archived"], false);
    return ACTIVE_SNAPSHOT_STATUSES.includes(status) && archived !== true;
  });

  if (hasValue(reportId) && reportSnapshots.length === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_ACTIVE_CHAIN_SNAPSHOTS_REQUIRED",
      message: "Persisted report lineage should include at least one snapshot for active-chain inspection.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "report_id",
      metadata: { reportId },
    }));
  }

  if (hasValue(currentSnapshotId) && !byId.has(currentSnapshotId)) {
    issues.push(createValidationIssue({
      code: "CSTP_ACTIVE_CHAIN_CURRENT_SNAPSHOT_MISSING",
      message: "Report current_snapshot_id must reference a supplied immutable snapshot.",
      entity: "report",
      table: CSTP_REPORT_TABLES.reports,
      field: "current_snapshot_id",
      metadata: { reportId, currentSnapshotId },
    }));
  }

  if (activeSnapshots.length > 1) {
    issues.push(createValidationIssue({
      code: "CSTP_ACTIVE_CHAIN_MULTIPLE_ACTIVE_SNAPSHOTS",
      message: "Immutable lineage must not contain multiple active snapshots for one report.",
      severity: VALIDATION_SEVERITIES.publicationBlocking,
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "status",
      metadata: {
        reportId,
        activeSnapshotIds: activeSnapshots.map((snapshot) => (
          getIdValue(snapshot, ["id", "snapshotId"])
        )).filter(hasValue),
      },
    }));
  }

  if (hasValue(currentSnapshotId)) {
    const currentSnapshot = byId.get(currentSnapshotId);
    const currentStatus = getFirstValue(currentSnapshot || {}, [
      "status",
      "snapshot_status",
      "snapshotStatus",
    ]);
    if (currentSnapshot && !ACTIVE_SNAPSHOT_STATUSES.includes(currentStatus)) {
      issues.push(createValidationIssue({
        code: "CSTP_ACTIVE_CHAIN_CURRENT_SNAPSHOT_INACTIVE",
        message: "Report current_snapshot_id points to an inactive immutable snapshot.",
        entity: "report",
        table: CSTP_REPORT_TABLES.reports,
        field: "current_snapshot_id",
        metadata: { reportId, currentSnapshotId, currentStatus },
      }));
    }
  }

  return createValidationResult({
    validator: "validateActiveSnapshotChainShape",
    issues,
    metadata: {
      reportId,
      currentSnapshotId,
      snapshotCount: reportSnapshots.length,
      activeSnapshotCount: activeSnapshots.length,
    },
  });
}

function validateAuditLinkConsistencyShape(context = {}) {
  const report = context.report || {};
  const snapshots = Array.isArray(context.snapshots) ? context.snapshots : [];
  const auditLinks = Array.isArray(context.auditLinks) ? context.auditLinks : [];
  const issues = [];
  const reportId = getIdValue(report, ["id", "reportId"]);
  const snapshotIds = new Set(
    snapshots
      .map((snapshot) => getIdValue(snapshot, ["id", "snapshotId"]))
      .filter(hasValue),
  );

  auditLinks.forEach((auditLink, index) => {
    const auditReportId = getIdValue(auditLink, ["report_id", "reportId"]);
    const auditSnapshotId = getIdValue(auditLink, ["snapshot_id", "snapshotId"]);
    const adminEventId = getIdValue(auditLink, [
      "cstp_admin_event_id",
      "cstpAdminEventId",
      "adminEventId",
    ]);
    const createdBy = getIdValue(auditLink, ["created_by", "createdBy", "adminUserId"]);

    if (hasValue(reportId) && hasValue(auditReportId) && auditReportId !== reportId) {
      issues.push(createValidationIssue({
        code: "CSTP_AUDIT_LINK_REPORT_MISMATCH",
        message: "Audit link report_id must match the inspected immutable report.",
        entity: "audit_link",
        table: CSTP_REPORT_TABLES.auditLinks,
        field: "report_id",
        metadata: { index, expected: reportId, actual: auditReportId },
      }));
    }

    if (hasValue(auditSnapshotId) && snapshotIds.size > 0 && !snapshotIds.has(auditSnapshotId)) {
      issues.push(createValidationIssue({
        code: "CSTP_AUDIT_LINK_SNAPSHOT_MISSING",
        message: "Audit link snapshot_id must reference a supplied immutable snapshot.",
        entity: "audit_link",
        table: CSTP_REPORT_TABLES.auditLinks,
        field: "snapshot_id",
        metadata: { index, snapshotId: auditSnapshotId },
      }));
    }

    if (!hasValue(adminEventId) && !hasValue(createdBy)) {
      issues.push(createValidationIssue({
        code: "CSTP_AUDIT_LINK_ACTOR_REQUIRED",
        message: "Audit link requires either a CSTP admin event or actor id.",
        entity: "audit_link",
        table: CSTP_REPORT_TABLES.auditLinks,
        field: "cstp_admin_event_id",
        metadata: { index },
      }));
    }
  });

  return createValidationResult({
    validator: "validateAuditLinkConsistencyShape",
    issues,
    metadata: {
      reportId,
      snapshotCount: snapshotIds.size,
      auditLinkCount: auditLinks.length,
    },
  });
}

function validateImmutableVersionOrderingShape(context = {}) {
  const snapshots = Array.isArray(context.snapshots) ? context.snapshots : [];
  const issues = [];
  const versionsByReport = new Map();
  const byId = new Map(
    snapshots
      .map((snapshot) => [getIdValue(snapshot, ["id", "snapshotId"]), snapshot])
      .filter(([snapshotId]) => hasValue(snapshotId)),
  );

  snapshots.forEach((snapshot, index) => {
    const snapshotId = getIdValue(snapshot, ["id", "snapshotId"]);
    const reportId = getIdValue(snapshot, ["report_id", "reportId"]);
    const version = getNumberValue(snapshot, ["snapshot_version", "snapshotVersion"]);
    const supersedesSnapshotId = getIdValue(snapshot, [
      "supersedes_snapshot_id",
      "supersedesSnapshotId",
    ]);

    if (!Number.isInteger(version) || version < 1) {
      issues.push(createValidationIssue({
        code: "CSTP_SNAPSHOT_VERSION_INVALID",
        message: "Immutable snapshot version must be a positive integer.",
        entity: "snapshot",
        table: CSTP_REPORT_TABLES.snapshots,
        field: "snapshot_version",
        metadata: { index, snapshotId, version },
      }));
    }

    if (hasValue(reportId) && Number.isInteger(version)) {
      const reportVersions = versionsByReport.get(reportId) || new Map();
      const existing = reportVersions.get(version);
      if (existing) {
        issues.push(createValidationIssue({
          code: "CSTP_SNAPSHOT_VERSION_DUPLICATE",
          message: "Immutable snapshot versions must be unique within a report lineage.",
          entity: "snapshot",
          table: CSTP_REPORT_TABLES.snapshots,
          field: "snapshot_version",
          metadata: {
            reportId,
            version,
            snapshotIds: [existing.snapshotId, snapshotId].filter(hasValue),
          },
        }));
      } else {
        reportVersions.set(version, { snapshotId, index });
        versionsByReport.set(reportId, reportVersions);
      }
    }

    if (hasValue(supersedesSnapshotId) && byId.has(supersedesSnapshotId)) {
      const predecessor = byId.get(supersedesSnapshotId);
      const predecessorVersion = getNumberValue(predecessor, [
        "snapshot_version",
        "snapshotVersion",
      ]);
      if (
        Number.isFinite(version)
        && Number.isFinite(predecessorVersion)
        && version <= predecessorVersion
      ) {
        issues.push(createValidationIssue({
          code: "CSTP_SNAPSHOT_VERSION_NOT_INCREMENTED",
          message: "Snapshot version must be greater than the superseded predecessor version.",
          entity: "snapshot",
          table: CSTP_REPORT_TABLES.snapshots,
          field: "snapshot_version",
          metadata: {
            snapshotId,
            supersedesSnapshotId,
            version,
            predecessorVersion,
          },
        }));
      }
    }
  });

  return createValidationResult({
    validator: "validateImmutableVersionOrderingShape",
    issues,
    metadata: {
      snapshotCount: snapshots.length,
      reportCount: versionsByReport.size,
    },
  });
}

function validateSnapshotPayloadConsistencyShape(context = {}) {
  const report = context.report || {};
  const snapshot = context.snapshot || {};
  const payload = getFirstValue(snapshot, [
    "frozen_report_payload",
    "frozenReportPayload",
    "payload",
  ]);
  const issues = [];

  if (!isPlainObject(payload)) {
    issues.push(createValidationIssue({
      code: "CSTP_RECONCILIATION_FROZEN_PAYLOAD_UNAVAILABLE",
      message: "Frozen payload must be a structured object for payload consistency diagnostics.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "frozen_report_payload",
      metadata: { payloadType: getValueType(payload) },
    }));
    return createValidationResult({
      validator: "validateSnapshotPayloadConsistencyShape",
      issues,
      metadata: { checkedPayloadKeys: [] },
    });
  }

  const payloadSummary = isPlainObject(payload.summary) ? payload.summary : {};
  const checks = [
    {
      code: "CSTP_RECONCILIATION_PAYLOAD_REPORT_MISMATCH",
      field: "reportId",
      expected: getIdValue(report, ["id", "reportId"]) || getIdValue(snapshot, ["report_id", "reportId"]),
      actual: getFirstValue(payload, ["reportId", "report_id"]),
      table: CSTP_REPORT_TABLES.reports,
    },
    {
      code: "CSTP_RECONCILIATION_PAYLOAD_TEST_MISMATCH",
      field: "cstpTestId",
      expected: getIdValue(snapshot, ["cstp_test_id", "cstpTestId"]) || getIdValue(report, ["cstp_test_id", "cstpTestId"]),
      actual: getFirstValue(payload, ["cstpTestId", "cstp_test_id"]) || getFirstValue(payloadSummary, ["cstpTestId", "cstp_test_id"]),
      table: CSTP_REPORT_TABLES.tests,
    },
    {
      code: "CSTP_RECONCILIATION_PAYLOAD_REQUEST_MISMATCH",
      field: "cstpRequestId",
      expected: getIdValue(snapshot, ["cstp_request_id", "cstpRequestId"]) || getIdValue(report, ["cstp_request_id", "cstpRequestId"]),
      actual: getFirstValue(payload, ["cstpRequestId", "cstp_request_id"]) || getFirstValue(payloadSummary, ["cstpRequestId", "cstp_request_id"]),
      table: CSTP_REPORT_TABLES.requests,
    },
    {
      code: "CSTP_RECONCILIATION_PAYLOAD_SOURCE_MISMATCH",
      field: "sourceId",
      expected: getIdValue(snapshot, ["source_id", "sourceId"]) || getIdValue(report, ["source_id", "sourceId"]),
      actual: getFirstValue(payload, ["sourceId", "source_id"]) || getFirstValue(payloadSummary, ["sourceId", "source_id"]),
      table: CSTP_REPORT_TABLES.sources,
    },
  ];

  checks.forEach((check) => {
    if (!hasValue(check.expected) || !hasValue(check.actual)) {
      return;
    }
    if (String(check.expected) !== String(check.actual)) {
      issues.push(createValidationIssue({
        code: check.code,
        message: `Frozen payload ${check.field} does not match immutable report evidence.`,
        entity: "snapshot_payload",
        table: check.table,
        field: `frozen_report_payload.${check.field}`,
        metadata: {
          expected: check.expected,
          actual: check.actual,
        },
      }));
    }
  });

  return createValidationResult({
    validator: "validateSnapshotPayloadConsistencyShape",
    issues,
    metadata: {
      checkedPayloadKeys: checks.map((check) => check.field),
      payloadKeyCount: Object.keys(payload).length,
    },
  });
}

function validateFrozenPayloadCompletenessDiagnostics(context = {}) {
  const snapshot = context.snapshot || {};
  const sessionLinks = Array.isArray(context.sessionLinks) ? context.sessionLinks : [];
  const metrics = Array.isArray(context.metrics) ? context.metrics : [];
  const payload = getFirstValue(snapshot, [
    "frozen_report_payload",
    "frozenReportPayload",
    "payload",
  ]);
  const issues = [];

  if (!isPlainObject(payload) || Object.keys(payload).length === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_RECONCILIATION_FROZEN_PAYLOAD_INCOMPLETE",
      message: "Frozen payload is absent or empty for reconciliation diagnostics.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "frozen_report_payload",
      metadata: { payloadType: getValueType(payload) },
    }));
  }

  if (isPlainObject(payload) && !hasValue(getFirstValue(payload, ["reportSchemaVersion", "report_schema_version"]))) {
    issues.push(createValidationIssue({
      code: "CSTP_RECONCILIATION_PAYLOAD_SCHEMA_VERSION_MISSING",
      message: "Frozen payload is missing report schema version context.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "snapshot_payload",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "frozen_report_payload.reportSchemaVersion",
    }));
  }

  if (sessionLinks.length === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_RECONCILIATION_SESSION_EVIDENCE_EMPTY",
      message: "No frozen session relationship evidence was supplied for reconciliation.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "session",
      table: CSTP_REPORT_TABLES.sessions,
      field: "snapshot_id",
    }));
  }

  if (metrics.length === 0) {
    issues.push(createValidationIssue({
      code: "CSTP_RECONCILIATION_METRIC_EVIDENCE_EMPTY",
      message: "No frozen metric evidence was supplied for reconciliation.",
      severity: VALIDATION_SEVERITIES.warning,
      blocking: false,
      entity: "metric",
      table: CSTP_REPORT_TABLES.metrics,
      field: "snapshot_id",
    }));
  }

  return createValidationResult({
    validator: "validateFrozenPayloadCompletenessDiagnostics",
    issues,
    metadata: {
      payloadPresent: isPlainObject(payload) && Object.keys(payload).length > 0,
      metricCount: metrics.length,
      sessionEvidenceCount: sessionLinks.length,
    },
  });
}

function validateOperationalReferenceReconciliationShape(context = {}) {
  const report = context.report || {};
  const snapshot = context.snapshot || {};
  const metrics = Array.isArray(context.metrics) ? context.metrics : [];
  const sessionLinks = Array.isArray(context.sessionLinks) ? context.sessionLinks : [];
  const issues = [];
  const expectedReportId = getIdValue(report, ["id", "reportId"]) || getIdValue(snapshot, ["report_id", "reportId"]);
  const expectedSnapshotId = getIdValue(snapshot, ["id", "snapshotId"]);
  const expectedTestId = getIdValue(snapshot, ["cstp_test_id", "cstpTestId"]) || getIdValue(report, ["cstp_test_id", "cstpTestId"]);

  metrics.forEach((metric, index) => {
    pushReferenceDriftIssue({
      issues,
      code: "CSTP_RECONCILIATION_METRIC_REPORT_DRIFT",
      record: metric,
      index,
      expected: expectedReportId,
      fieldKeys: ["report_id", "reportId"],
      entity: "metric",
      table: CSTP_REPORT_TABLES.metrics,
      field: "report_id",
    });
    pushReferenceDriftIssue({
      issues,
      code: "CSTP_RECONCILIATION_METRIC_SNAPSHOT_DRIFT",
      record: metric,
      index,
      expected: expectedSnapshotId,
      fieldKeys: ["snapshot_id", "snapshotId"],
      entity: "metric",
      table: CSTP_REPORT_TABLES.metrics,
      field: "snapshot_id",
    });
    pushReferenceDriftIssue({
      issues,
      code: "CSTP_RECONCILIATION_METRIC_TEST_DRIFT",
      record: metric,
      index,
      expected: expectedTestId,
      fieldKeys: ["cstp_test_id", "cstpTestId"],
      entity: "metric",
      table: CSTP_REPORT_TABLES.metrics,
      field: "cstp_test_id",
    });
  });

  sessionLinks.forEach((session, index) => {
    pushReferenceDriftIssue({
      issues,
      code: "CSTP_RECONCILIATION_SESSION_REPORT_DRIFT",
      record: session,
      index,
      expected: expectedReportId,
      fieldKeys: ["report_id", "reportId"],
      entity: "session",
      table: CSTP_REPORT_TABLES.sessions,
      field: "report_id",
    });
    pushReferenceDriftIssue({
      issues,
      code: "CSTP_RECONCILIATION_SESSION_SNAPSHOT_DRIFT",
      record: session,
      index,
      expected: expectedSnapshotId,
      fieldKeys: ["snapshot_id", "snapshotId"],
      entity: "session",
      table: CSTP_REPORT_TABLES.sessions,
      field: "snapshot_id",
    });
    pushReferenceDriftIssue({
      issues,
      code: "CSTP_RECONCILIATION_SESSION_TEST_DRIFT",
      record: session,
      index,
      expected: expectedTestId,
      fieldKeys: ["cstp_test_id", "cstpTestId"],
      entity: "session",
      table: CSTP_REPORT_TABLES.sessions,
      field: "cstp_test_id",
    });
  });

  return createValidationResult({
    validator: "validateOperationalReferenceReconciliationShape",
    issues,
    metadata: {
      metricCount: metrics.length,
      sessionEvidenceCount: sessionLinks.length,
      expectedReportId,
      expectedSnapshotId,
      expectedTestId,
    },
  });
}

function buildImmutableReconciliationDiagnostics(context = {}) {
  const results = [
    validateSnapshotPayloadConsistencyShape(context),
    validateFrozenPayloadCompletenessDiagnostics(context),
    validateOperationalReferenceReconciliationShape(context),
    validateAuditLinkConsistencyShape(context),
    validateImmutableVersionOrderingShape(context),
    validateActiveSnapshotChainShape(context),
  ];
  const validation = mergeValidationResults(
    "buildImmutableReconciliationDiagnostics",
    results,
    {
      mode: "internal_immutable_reconciliation_diagnostics",
    },
  );
  const blockingCount = validation.summary.blocking;
  const warningCount = validation.summary.warnings;
  const totalPenalty = (blockingCount * 20) + (warningCount * 7);
  const score = Math.max(0, Math.min(100, 100 - totalPenalty));

  return deepFreeze({
    mode: "internal_immutable_reconciliation_diagnostics",
    validation,
    integrityScoreSummary: {
      score,
      rating: score >= 90 ? "strong" : (score >= 70 ? "review" : "attention_required"),
      blockingIssueCount: blockingCount,
      warningIssueCount: warningCount,
      totalIssueCount: validation.summary.total,
    },
    operationalReferenceDiagnostics: summarizeIssuesByPrefix(validation.issues, "CSTP_RECONCILIATION_"),
    auditDriftIndicators: validation.issues.filter((issue) => (
      String(issue.code || "").includes("AUDIT")
      || String(issue.table || "") === CSTP_REPORT_TABLES.auditLinks
    )).map(summarizeIssue),
    frozenPayloadCompleteness: results[1].metadata,
    snapshotConsistency: results[0].metadata,
    lineageAnomalySummary: {
      duplicateActive: validation.issues.some((issue) => (
        issue.code === "CSTP_DUPLICATE_ACTIVE_SNAPSHOT_LINEAGE"
        || issue.code === "CSTP_ACTIVE_CHAIN_MULTIPLE_ACTIVE_SNAPSHOTS"
      )),
      versionIssueCount: validation.issues.filter((issue) => (
        String(issue.code || "").includes("VERSION")
      )).length,
      activeChainIssueCount: validation.issues.filter((issue) => (
        String(issue.code || "").includes("ACTIVE_CHAIN")
      )).length,
    },
    emptyState: !hasIdentifier(context.report) && !hasIdentifier(context.snapshot),
    labels: [
      "Internal-only immutable reconciliation diagnostics",
      "Diagnostics are read-only and do not enable immutable writes",
      "Public CSTP, certification, rendering, and integrations are deferred",
    ],
    persistence: false,
    publicVisibility: false,
    internalOnly: true,
  });
}

function validatePublicationReadinessShape(context = {}, options = {}) {
  const report = context.report || {};
  const snapshot = context.snapshot || {};
  const issues = [];
  const results = [
    validateReportLifecycleState(report),
    validateSnapshotStatus(snapshot),
    validateTimestampOrdering(snapshot),
    validateFrozenPayloadPresence(snapshot, { requireNonEmpty: true }),
    validateRequiredOperationalReferences(context, {
      requireReport: true,
      requireSnapshot: true,
      requireSessions: options.requireSessions !== false,
      requireAdminContext: options.requireAdminContext === true,
    }),
    validateSnapshotLineageConsistencyShape(context),
    validateDuplicateActiveLineageShape({
      snapshots: context.snapshots || [snapshot],
    }),
    validateActiveSnapshotChainShape({
      report,
      snapshots: context.snapshots || [snapshot],
    }),
    validateAuditLinkConsistencyShape({
      report,
      snapshots: context.snapshots || [snapshot],
      auditLinks: context.auditLinks || [],
    }),
    validateImmutableVersionOrderingShape({
      snapshots: context.snapshots || [snapshot],
    }),
  ];

  results.forEach((result) => issues.push(...result.issues));

  const snapshotStatus = getFirstValue(snapshot, [
    "lifecycleState",
    "governanceState",
    "status",
    "snapshot_status",
    "snapshotStatus",
  ]);
  const preparedAt = getFirstValue(snapshot, ["prepared_at", "preparedAt"]);
  const publishedAt = getFirstValue(snapshot, ["published_at", "publishedAt"]);
  const locked = getBooleanValue(snapshot, ["locked"], false);

  if (["draft", "generated", "integrity_failed", "archived", "archived_internal", "superseded"].includes(snapshotStatus)) {
    issues.push(createValidationIssue({
      code: "CSTP_PUBLICATION_SNAPSHOT_STATUS_NOT_READY",
      message: "Snapshot status is not eligible for publication readiness.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "status",
      metadata: { snapshotStatus },
    }));
  }

  if (!hasValue(preparedAt)) {
    issues.push(createValidationIssue({
      code: "CSTP_PUBLICATION_PREPARED_AT_REQUIRED",
      message: "prepared_at is required before publication readiness.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "prepared_at",
    }));
  }

  if (["published", "published_internal"].includes(snapshotStatus) && !hasValue(publishedAt)) {
    issues.push(createValidationIssue({
      code: "CSTP_PUBLICATION_PUBLISHED_AT_REQUIRED",
      message: "published_at is required for internally published snapshots.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "published_at",
    }));
  }

  if (["published", "published_internal"].includes(snapshotStatus) && locked !== true) {
    issues.push(createValidationIssue({
      code: "CSTP_PUBLICATION_LOCK_REQUIRED",
      message: "Published immutable snapshots must be locked.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "locked",
    }));
  }

  if (options.requireAuditLink === true && !hasAuditLinkContext(context)) {
    issues.push(createValidationIssue({
      code: "CSTP_PUBLICATION_AUDIT_LINK_REQUIRED",
      message: "Audit linkage is required for publication readiness.",
      severity: VALIDATION_SEVERITIES.publicationBlocking,
      entity: "audit_link",
      table: CSTP_REPORT_TABLES.auditLinks,
      field: "cstp_admin_event_id",
    }));
  }

  return createValidationResult({
    validator: "validatePublicationReadinessShape",
    issues,
    metadata: {
      requireAuditLink: options.requireAuditLink === true,
      requireSessions: options.requireSessions !== false,
      snapshotStatus,
    },
  });
}

function validateImmutableReportSnapshotCandidate(context = {}, options = {}) {
  return mergeValidationResults(
    "validateImmutableReportSnapshotCandidate",
    [
      validateReportLifecycleState(context.report || {}),
      validateSnapshotStatus(context.snapshot || {}),
      validateTimestampOrdering(context.snapshot || {}),
      validateRequiredOperationalReferences(context, {
        requireReport: options.requireReport !== false,
        requireSnapshot: options.requireSnapshot === true,
        requireSessions: options.requireSessions !== false,
        requireAdminContext: options.requireAdminContext === true,
      }),
      validateFrozenPayloadPresence(context.snapshot || {}, {
        requireNonEmpty: options.requireNonEmptyPayload === true,
      }),
      validateSupersessionSelfReference(context.snapshot || {}),
      validateSnapshotLineageConsistencyShape(context),
      validateDuplicateActiveLineageShape({
        snapshots: context.snapshots || (context.snapshot ? [context.snapshot] : []),
      }),
      validateActiveSnapshotChainShape({
        report: context.report || {},
        snapshots: context.snapshots || (context.snapshot ? [context.snapshot] : []),
      }),
      validateAuditLinkConsistencyShape({
        report: context.report || {},
        snapshots: context.snapshots || (context.snapshot ? [context.snapshot] : []),
        auditLinks: context.auditLinks || [],
      }),
      validateImmutableVersionOrderingShape({
        snapshots: context.snapshots || (context.snapshot ? [context.snapshot] : []),
      }),
    ],
    {
      mode: options.mode || "candidate",
    },
  );
}

function pushReferenceDriftIssue({
  issues,
  code,
  record,
  index,
  expected,
  fieldKeys,
  entity,
  table,
  field,
}) {
  const actual = getIdValue(record, fieldKeys);
  if (!hasValue(expected) || !hasValue(actual) || expected === actual) {
    return;
  }

  issues.push(createValidationIssue({
    code,
    message: `${table}.${field} does not match the inspected immutable snapshot context.`,
    entity,
    table,
    field,
    metadata: {
      index,
      expected,
      actual,
    },
  }));
}

function summarizeIssuesByPrefix(issues = [], prefix = "") {
  const filtered = issues.filter((issue) => String(issue.code || "").startsWith(prefix));
  return {
    count: filtered.length,
    blockingCount: filtered.filter((issue) => issue.blocking).length,
    warningCount: filtered.filter((issue) => !issue.blocking).length,
    codes: [...new Set(filtered.map((issue) => issue.code).filter(hasValue))],
    affectedTables: [...new Set(filtered.map((issue) => issue.table).filter(hasValue))],
    issues: filtered.map(summarizeIssue),
  };
}

function summarizeIssue(issue = {}) {
  return {
    code: issue.code || "",
    severity: issue.severity || "",
    blocking: issue.blocking === true,
    entity: issue.entity || "",
    table: issue.table || "",
    field: issue.field || "",
    message: issue.message || "",
  };
}

function createInvalidTimestampIssue({ entity, table, field, value }) {
  return createValidationIssue({
    code: "CSTP_TIMESTAMP_INVALID",
    message: `${field} must be a valid timestamp.`,
    entity,
    table,
    field,
    metadata: { value },
  });
}

function createMissingReferenceIssue({
  code,
  entity,
  table,
  field,
  message,
  metadata = {},
}) {
  return createValidationIssue({
    code,
    message,
    entity,
    table,
    field,
    metadata,
  });
}

function createReferenceMismatchIssue({
  code,
  message,
  entity,
  table,
  field,
  expected,
  actual,
}) {
  return createValidationIssue({
    code,
    message,
    entity,
    table,
    field,
    metadata: { expected, actual },
  });
}

function validateOptionalReferencedEntity({
  issues,
  owner,
  ownerEntity,
  ownerTable,
  referenceField,
  referenceCamelField,
  referencedRecord,
  referencedTable,
}) {
  const referenceId = getIdValue(owner, [referenceField, referenceCamelField]);

  if (!hasValue(referenceId)) {
    return;
  }

  if (!hasIdentifier(referencedRecord)) {
    issues.push(createMissingReferenceIssue({
      code: "CSTP_REFERENCED_OPERATIONAL_ROW_REQUIRED",
      entity: ownerEntity,
      table: ownerTable,
      field: referenceField,
      message: `${referenceField} references ${referencedTable}, but no referenced record was supplied.`,
      metadata: { referenceId, referencedTable },
    }));
    return;
  }

  const referencedId = getIdValue(referencedRecord, ["id"]);
  if (hasValue(referencedId) && referencedId !== referenceId) {
    issues.push(createReferenceMismatchIssue({
      code: "CSTP_REFERENCED_OPERATIONAL_ROW_MISMATCH",
      message: `${referenceField} must match the supplied ${referencedTable} record id.`,
      entity: ownerEntity,
      table: ownerTable,
      field: referenceField,
      expected: referenceId,
      actual: referencedId,
    }));
  }
}

function validateReportSnapshotShape({ issues, report, snapshot }) {
  const reportId = getIdValue(report, ["id", "reportId"]);
  const snapshotReportId = getIdValue(snapshot, ["report_id", "reportId"]);
  const reportTestId = getIdValue(report, ["cstp_test_id", "cstpTestId"]);
  const snapshotTestId = getIdValue(snapshot, ["cstp_test_id", "cstpTestId"]);

  if (hasValue(reportId) && hasValue(snapshotReportId) && reportId !== snapshotReportId) {
    issues.push(createReferenceMismatchIssue({
      code: "CSTP_SNAPSHOT_REPORT_REFERENCE_MISMATCH",
      message: "Snapshot report_id must match the supplied report id.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "report_id",
      expected: reportId,
      actual: snapshotReportId,
    }));
  }

  if (hasValue(reportTestId) && hasValue(snapshotTestId) && reportTestId !== snapshotTestId) {
    issues.push(createReferenceMismatchIssue({
      code: "CSTP_SNAPSHOT_REPORT_TEST_REFERENCE_MISMATCH",
      message: "Snapshot cstp_test_id must match the supplied report cstp_test_id.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "cstp_test_id",
      expected: reportTestId,
      actual: snapshotTestId,
    }));
  }
}

function validateSameReport({
  issues,
  left,
  right,
  leftEntity,
  rightEntity,
}) {
  const leftReportId = getIdValue(left, ["report_id", "reportId"]);
  const rightReportId = getIdValue(right, ["report_id", "reportId"]);

  if (hasValue(leftReportId) && hasValue(rightReportId) && leftReportId !== rightReportId) {
    issues.push(createValidationIssue({
      code: "CSTP_SUPERSESSION_REPORT_MISMATCH",
      message: "Supersession snapshots must belong to the same report.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "report_id",
      metadata: {
        leftEntity,
        rightEntity,
        leftReportId,
        rightReportId,
      },
    }));
  }
}

function hasAuditLinkContext(context = {}) {
  if (Array.isArray(context.auditLinks) && context.auditLinks.length > 0) {
    return true;
  }

  return hasIdentifier(context.auditLink)
    || hasIdentifier(context.adminEvent)
    || hasIdentifier(context.actor);
}

function getResultStatus({ blockingCount, warningCount, informationalCount }) {
  if (blockingCount > 0) {
    return VALIDATION_STATUSES.failed;
  }

  if (warningCount > 0) {
    return VALIDATION_STATUSES.warning;
  }

  if (informationalCount > 0) {
    return VALIDATION_STATUSES.info;
  }

  return VALIDATION_STATUSES.passed;
}

function getIssueStatus(severity, blocking) {
  if (blocking) {
    return VALIDATION_STATUSES.failed;
  }

  if (severity === VALIDATION_SEVERITIES.warning) {
    return VALIDATION_STATUSES.warning;
  }

  if (severity === VALIDATION_SEVERITIES.info) {
    return VALIDATION_STATUSES.info;
  }

  return VALIDATION_STATUSES.failed;
}

function normalizeSeverity(severity) {
  const value = normalizeText(severity);
  return Object.values(VALIDATION_SEVERITIES).includes(value)
    ? value
    : VALIDATION_SEVERITIES.blocking;
}

function isBlockingSeverity(severity) {
  return severity === VALIDATION_SEVERITIES.blocking
    || severity === VALIDATION_SEVERITIES.publicationBlocking;
}

function hasIdentifier(value) {
  return isPlainObject(value) && hasValue(getIdValue(value, [
    "id",
    "reportId",
    "snapshotId",
    "cstpTestId",
    "testId",
    "adminUserId",
    "userId",
  ]));
}

function getIdValue(record, keys) {
  return normalizeText(getFirstValue(record, keys));
}

function getNumberValue(record, keys) {
  const value = getFirstValue(record, keys);
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return NaN;
}

function getBooleanValue(record, keys, fallback = false) {
  const value = getFirstValue(record, keys);
  return value === undefined ? fallback : value === true;
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

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function parseTimestamp(value) {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : NaN;
  }
  if (typeof value === "string" && value.trim() !== "") {
    return Date.parse(value);
  }
  return NaN;
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function clonePlainMetadata(value) {
  if (!isPlainObject(value)) {
    return {};
  }

  return { ...value };
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function getValueType(value) {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  return typeof value;
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
  REPORT_GOVERNANCE_STATES,
  REPORT_STORAGE_STATUSES,
  SNAPSHOT_GOVERNANCE_STATES,
  SNAPSHOT_STORAGE_STATUSES,
  VALIDATION_SEVERITIES,
  VALIDATION_STATUSES,
  CSTP_REPORT_TABLES,
  ACTIVE_SNAPSHOT_STATUSES,
  createValidationIssue,
  createValidationResult,
  mergeValidationResults,
  validateReportLifecycleState,
  validateSnapshotStatus,
  validateTimestampOrdering,
  validateRequiredOperationalReferences,
  validateFrozenPayloadPresence,
  validateSupersessionSelfReference,
  validateSnapshotLineageConsistencyShape,
  validateDuplicateActiveLineageShape,
  validateActiveSnapshotChainShape,
  validateAuditLinkConsistencyShape,
  validateImmutableVersionOrderingShape,
  validateSnapshotPayloadConsistencyShape,
  validateFrozenPayloadCompletenessDiagnostics,
  validateOperationalReferenceReconciliationShape,
  buildImmutableReconciliationDiagnostics,
  validatePublicationReadinessShape,
  validateImmutableReportSnapshotCandidate,
};
