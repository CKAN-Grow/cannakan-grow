"use strict";

const {
  CSTP_REPORT_TABLES,
  createValidationIssue,
  createValidationResult,
  mergeValidationResults,
  validateImmutableReportSnapshotCandidate,
} = require("./immutable-report-validator");

/*
 * Internal-only immutable CSTP snapshot persistence infrastructure.
 *
 * This module persists already-assembled and validated snapshot candidates into
 * CSTP immutable snapshot tables using a caller-supplied database client. It
 * does not create global Supabase clients, expose public reports, render
 * reports, certify sources, mutate grow_sessions, delete old snapshots, or add
 * public integration behavior. Rendering, certifications, public APIs/UI, and
 * Source Directory/Community Grow integration remain deferred.
 *
 * There is no shared transaction helper in this project yet. Each persistence
 * step is isolated and the result explicitly marks caller-level transaction /
 * rollback ownership so future wiring can wrap these steps atomically.
 */

const PERSISTENCE_OPERATION = "persist_cstp_immutable_snapshot_candidate";

const PLAN_STEPS = Object.freeze({
  report: "report",
  snapshot: "snapshot",
  metrics: "metrics",
  sessions: "sessions",
  auditLinks: "auditLinks",
});

const TABLE_INSERT_COLUMNS = Object.freeze({
  [CSTP_REPORT_TABLES.reports]: Object.freeze(new Set([
    "id",
    "cstp_test_id",
    "cstp_request_id",
    "source_id",
    "current_snapshot_id",
    "status",
    "archived",
    "prepared_at",
    "published_at",
    "created_by",
    "prepared_by",
    "published_by",
    "created_at",
    "updated_at",
  ])),
  [CSTP_REPORT_TABLES.snapshots]: Object.freeze(new Set([
    "id",
    "report_id",
    "cstp_test_id",
    "cstp_request_id",
    "source_id",
    "snapshot_version",
    "status",
    "locked",
    "frozen_report_payload",
    "report_schema_version",
    "methodology_version",
    "generated_at",
    "prepared_at",
    "published_at",
    "supersedes_snapshot_id",
    "superseded_by_snapshot_id",
    "created_by",
    "prepared_by",
    "published_by",
    "created_at",
  ])),
  [CSTP_REPORT_TABLES.metrics]: Object.freeze(new Set([
    "id",
    "report_id",
    "snapshot_id",
    "cstp_test_id",
    "metric_key",
    "metric_type",
    "metric_unit",
    "metric_value",
    "frozen_metric_payload",
    "numerator",
    "denominator",
    "calculated_at",
    "observation_window_start",
    "observation_window_end",
    "calculation_version",
    "created_at",
  ])),
  [CSTP_REPORT_TABLES.sessions]: Object.freeze(new Set([
    "id",
    "report_id",
    "snapshot_id",
    "cstp_test_id",
    "cstp_test_session_id",
    "grow_session_id",
    "kan_label",
    "included_in_report",
    "relationship_archived_at_snapshot",
    "frozen_session_summary",
    "created_at",
  ])),
  [CSTP_REPORT_TABLES.auditLinks]: Object.freeze(new Set([
    "id",
    "report_id",
    "snapshot_id",
    "cstp_admin_event_id",
    "event_role",
    "created_by",
    "created_at",
  ])),
});

function validatePersistenceCandidateShape(candidate = {}, options = {}) {
  const issues = [];
  const safeCandidate = isPlainObject(candidate) ? candidate : {};
  const requireAdminContext = options.requireAdminContext !== false;
  const persistenceTimestamp = normalizeTimestamp(options.persistenceTimestamp);
  const adminUserId = getAdminUserId(options.adminContext || {});

  if (!isPlainObject(candidate)) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTENCE_CANDIDATE_REQUIRED",
      message: "Immutable snapshot persistence requires a candidate object.",
      entity: "snapshot_candidate",
      field: "candidate",
    }));
  }

  if (!isPlainObject(safeCandidate.snapshotRecord)) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTENCE_SNAPSHOT_RECORD_REQUIRED",
      message: "Immutable snapshot persistence requires candidate.snapshotRecord.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "snapshotRecord",
    }));
  }

  if (!isPlainObject(safeCandidate.operationalReferenceMap)) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTENCE_OPERATIONAL_REFERENCES_REQUIRED",
      message: "Immutable snapshot persistence requires operationalReferenceMap.",
      entity: "snapshot_candidate",
      field: "operationalReferenceMap",
    }));
  }

  if (!isPlainObject(safeCandidate.snapshotRecord?.frozen_report_payload)) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTENCE_FROZEN_PAYLOAD_REQUIRED",
      message: "Immutable snapshot persistence requires a frozen report payload.",
      entity: "snapshot",
      table: CSTP_REPORT_TABLES.snapshots,
      field: "frozen_report_payload",
    }));
  }

  if (!persistenceTimestamp) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTENCE_TIMESTAMP_REQUIRED",
      message: "An explicit valid persistenceTimestamp is required. The persistence orchestrator never reads the clock implicitly.",
      entity: "persistence",
      field: "persistenceTimestamp",
    }));
  }

  if (requireAdminContext && !adminUserId) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTENCE_ADMIN_CONTEXT_REQUIRED",
      message: "Admin context is required for immutable snapshot persistence.",
      entity: "audit",
      table: CSTP_REPORT_TABLES.auditLinks,
      field: "created_by",
    }));
  }

  if (safeCandidate.validation && safeCandidate.validation.ok === false) {
    issues.push(createValidationIssue({
      code: "CSTP_PERSISTENCE_VALIDATION_STATUS_INVALID",
      message: "Candidate validation must pass before immutable snapshot persistence.",
      entity: "snapshot_candidate",
      field: "validation",
      metadata: {
        validationStatus: safeCandidate.validation.status,
        validationSummary: safeCandidate.validation.summary,
      },
    }));
  }

  const validatorContext = buildValidatorContextFromCandidate(safeCandidate, {
    adminContext: options.adminContext,
  });
  const validatorResult = validateImmutableReportSnapshotCandidate(
    validatorContext,
    {
      requireReport: false,
      requireSnapshot: false,
      requireSessions: options.requireSessions !== false,
      requireAdminContext,
      requireNonEmptyPayload: true,
      mode: "persistence_candidate",
    },
  );

  return mergeValidationResults(
    "validatePersistenceCandidateShape",
    [
      createValidationResult({
        validator: "validatePersistenceCandidateShape.local",
        issues,
        metadata: {
          requireAdminContext,
          hasPersistenceTimestamp: Boolean(persistenceTimestamp),
        },
      }),
      validatorResult,
    ],
    {
      requireAdminContext,
      persistenceTimestamp,
    },
  );
}

function buildImmutablePersistencePlan(candidate = {}, options = {}) {
  const safeCandidate = isPlainObject(candidate) ? candidate : {};
  const persistenceTimestamp = normalizeTimestamp(options.persistenceTimestamp);
  const adminContext = options.adminContext || {};
  const adminUserId = getAdminUserId(adminContext);
  const reportRecord = safeCandidate.reportAlreadyExists
    ? null
    : mapReportRecord(safeCandidate, {
      adminUserId,
      persistenceTimestamp,
    });
  const snapshotRecord = mapSnapshotRecord(safeCandidate, {
    adminUserId,
    persistenceTimestamp,
  });
  const metricRecords = mapMetricRecords(safeCandidate);
  const sessionRecords = mapSessionRecords(safeCandidate);
  const auditLinkRecords = mapAuditLinkRecords(safeCandidate, {
    adminUserId,
    persistenceTimestamp,
  });

  return deepFreeze({
    operation: "build_cstp_immutable_snapshot_persistence_plan",
    steps: [
      {
        key: PLAN_STEPS.report,
        table: CSTP_REPORT_TABLES.reports,
        records: reportRecord ? [reportRecord] : [],
        required: !safeCandidate.reportAlreadyExists,
      },
      {
        key: PLAN_STEPS.snapshot,
        table: CSTP_REPORT_TABLES.snapshots,
        records: snapshotRecord ? [snapshotRecord] : [],
        required: true,
      },
      {
        key: PLAN_STEPS.metrics,
        table: CSTP_REPORT_TABLES.metrics,
        records: metricRecords,
        required: false,
      },
      {
        key: PLAN_STEPS.sessions,
        table: CSTP_REPORT_TABLES.sessions,
        records: sessionRecords,
        required: false,
      },
      {
        key: PLAN_STEPS.auditLinks,
        table: CSTP_REPORT_TABLES.auditLinks,
        records: auditLinkRecords,
        required: false,
      },
    ],
    summary: {
      reportRecords: reportRecord ? 1 : 0,
      snapshotRecords: snapshotRecord ? 1 : 0,
      metricRecords: metricRecords.length,
      sessionRecords: sessionRecords.length,
      auditLinkRecords: auditLinkRecords.length,
      recordCounts: {
        reports: reportRecord ? 1 : 0,
        snapshots: snapshotRecord ? 1 : 0,
        metrics: metricRecords.length,
        sessions: sessionRecords.length,
        auditLinks: auditLinkRecords.length,
      },
      requiresCallerTransaction: true,
      destructiveUpdates: false,
      deletesSnapshots: false,
      mutatesGrowSessions: false,
      publicVisibility: false,
    },
    persistenceTimestamp,
    internalOnly: true,
  });
}

async function persistImmutableSnapshotCandidate({
  dbClient,
  candidate,
  adminContext = {},
  persistenceTimestamp,
  options = {},
} = {}) {
  const validation = validatePersistenceCandidateShape(candidate, {
    ...options,
    adminContext,
    persistenceTimestamp,
  });
  const plan = buildImmutablePersistencePlan(candidate || {}, {
    ...options,
    adminContext,
    persistenceTimestamp,
  });

  if (!dbClient) {
    return buildPersistenceResult({
      ok: false,
      status: "db_client_missing",
      validation,
      plan,
      error: new Error("A caller-supplied database client is required."),
      executedSteps: [],
    });
  }

  if (!validation.ok) {
    return buildPersistenceResult({
      ok: false,
      status: "validation_failed",
      validation,
      plan,
      error: null,
      executedSteps: [],
    });
  }

  const executedSteps = [];
  let reportRecord = null;
  let snapshotRecord = null;

  try {
    reportRecord = await persistReportRecord(dbClient, plan, options);
    if (reportRecord) {
      executedSteps.push(buildExecutedStep(PLAN_STEPS.report, reportRecord));
    }

    snapshotRecord = await persistReportSnapshotRecord(
      dbClient,
      plan,
      {
        reportId: reportRecord?.id || candidate.snapshotRecord?.report_id,
      },
      options,
    );
    executedSteps.push(buildExecutedStep(PLAN_STEPS.snapshot, snapshotRecord));

    const linkContext = {
      reportId: reportRecord?.id || snapshotRecord.report_id,
      snapshotId: snapshotRecord.id,
    };
    const metricRows = await persistReportMetricRecords(
      dbClient,
      plan,
      linkContext,
      options,
    );
    executedSteps.push(buildExecutedStep(PLAN_STEPS.metrics, metricRows));

    const sessionRows = await persistReportSessionRecords(
      dbClient,
      plan,
      linkContext,
      options,
    );
    executedSteps.push(buildExecutedStep(PLAN_STEPS.sessions, sessionRows));

    const auditLinkRows = await persistReportAuditLinkRecords(
      dbClient,
      plan,
      linkContext,
      options,
    );
    executedSteps.push(buildExecutedStep(PLAN_STEPS.auditLinks, auditLinkRows));

    return buildPersistenceResult({
      ok: true,
      status: "persisted",
      validation,
      plan,
      reportId: reportRecord?.id || snapshotRecord.report_id || null,
      snapshotId: snapshotRecord.id || null,
      executedSteps,
      error: null,
    });
  } catch (error) {
    return buildPersistenceResult({
      ok: false,
      status: "persistence_failed",
      validation,
      plan,
      reportId: reportRecord?.id || null,
      snapshotId: snapshotRecord?.id || null,
      executedSteps,
      error,
    });
  }
}

async function persistReportRecord(dbClient, plan, options = {}) {
  const step = getPlanStep(plan, PLAN_STEPS.report);
  if (!step || step.records.length === 0) {
    return null;
  }
  return insertSingleRecord(dbClient, step.table, step.records[0], options);
}

async function persistReportSnapshotRecord(
  dbClient,
  plan,
  linkContext = {},
  options = {},
) {
  const step = getPlanStep(plan, PLAN_STEPS.snapshot);
  const record = {
    ...step.records[0],
    report_id: step.records[0].report_id || linkContext.reportId,
  };

  return insertSingleRecord(dbClient, step.table, record, options);
}

async function persistReportMetricRecords(
  dbClient,
  plan,
  linkContext = {},
  options = {},
) {
  const step = getPlanStep(plan, PLAN_STEPS.metrics);
  const records = step.records.map((record) => ({
    ...record,
    report_id: record.report_id || linkContext.reportId,
    snapshot_id: record.snapshot_id || linkContext.snapshotId,
  }));

  return insertManyRecords(dbClient, step.table, records, options);
}

async function persistReportSessionRecords(
  dbClient,
  plan,
  linkContext = {},
  options = {},
) {
  const step = getPlanStep(plan, PLAN_STEPS.sessions);
  const records = step.records.map((record) => ({
    ...record,
    report_id: record.report_id || linkContext.reportId,
    snapshot_id: record.snapshot_id || linkContext.snapshotId,
  }));

  return insertManyRecords(dbClient, step.table, records, options);
}

async function persistReportAuditLinkRecords(
  dbClient,
  plan,
  linkContext = {},
  options = {},
) {
  const step = getPlanStep(plan, PLAN_STEPS.auditLinks);
  const records = step.records.map((record) => ({
    ...record,
    report_id: record.report_id || linkContext.reportId,
    snapshot_id: record.snapshot_id || linkContext.snapshotId,
  }));

  return insertManyRecords(dbClient, step.table, records, options);
}

function mapReportRecord(candidate, { adminUserId, persistenceTimestamp }) {
  const snapshot = candidate.snapshotRecord || {};
  const references = candidate.operationalReferenceMap || {};
  const reportId = candidate.reportId
    || candidate.reportSummary?.reportId
    || references.reportId
    || snapshot.report_id;
  const status = candidate.reportStatus || "preparing";

  return pruneUndefined({
    id: reportId || undefined,
    cstp_test_id: references.cstpTestId || snapshot.cstp_test_id,
    cstp_request_id: references.cstpRequestId || snapshot.cstp_request_id,
    source_id: references.sourceId || snapshot.source_id,
    /*
     * Do not set current_snapshot_id during the initial report insert. The
     * migration FK points to cstp_report_snapshots, and the snapshot row is
     * inserted after the report row. Future transaction-aware orchestration may
     * coordinate this mutable report-root pointer after snapshot persistence.
     */
    current_snapshot_id: undefined,
    status,
    archived: status === "archived",
    prepared_at: snapshot.prepared_at || undefined,
    published_at: snapshot.published_at || undefined,
    created_by: adminUserId || undefined,
    prepared_by: snapshot.prepared_at && adminUserId ? adminUserId : undefined,
    published_by: snapshot.published_at && adminUserId ? adminUserId : undefined,
    created_at: persistenceTimestamp,
    updated_at: persistenceTimestamp,
  });
}

function mapSnapshotRecord(candidate, { adminUserId, persistenceTimestamp }) {
  const snapshot = candidate.snapshotRecord || {};

  return pruneUndefined({
    id: snapshot.id,
    report_id: snapshot.report_id,
    cstp_test_id: snapshot.cstp_test_id,
    cstp_request_id: snapshot.cstp_request_id,
    source_id: snapshot.source_id,
    snapshot_version: snapshot.snapshot_version,
    status: snapshot.status,
    locked: snapshot.locked,
    frozen_report_payload: snapshot.frozen_report_payload,
    report_schema_version: snapshot.report_schema_version,
    methodology_version: snapshot.methodology_version,
    generated_at: snapshot.generated_at,
    prepared_at: snapshot.prepared_at,
    published_at: snapshot.published_at,
    supersedes_snapshot_id: snapshot.supersedes_snapshot_id,
    superseded_by_snapshot_id: snapshot.superseded_by_snapshot_id,
    created_by: adminUserId || undefined,
    prepared_by: snapshot.prepared_at && adminUserId ? adminUserId : undefined,
    published_by: snapshot.published_at && adminUserId ? adminUserId : undefined,
    created_at: persistenceTimestamp,
  });
}

function mapMetricRecords(candidate) {
  const metrics = Array.isArray(candidate.frozenMetricPayload)
    ? candidate.frozenMetricPayload
    : [];
  const snapshot = candidate.snapshotRecord || {};

  return metrics.map((metric) => pruneUndefined({
    report_id: snapshot.report_id,
    snapshot_id: snapshot.id,
    cstp_test_id: snapshot.cstp_test_id,
    metric_key: metric.metricKey,
    metric_type: metric.metricType,
    metric_unit: metric.metricUnit,
    metric_value: metric.metricValue,
    frozen_metric_payload: metric.frozenMetricPayload,
    numerator: metric.numerator,
    denominator: metric.denominator,
    calculated_at: metric.calculatedAt,
    observation_window_start: metric.observationWindowStart,
    observation_window_end: metric.observationWindowEnd,
    calculation_version: metric.calculationVersion,
  }));
}

function mapSessionRecords(candidate) {
  const sessions = Array.isArray(candidate.frozenSessionSummaries)
    ? candidate.frozenSessionSummaries
    : [];
  const snapshot = candidate.snapshotRecord || {};

  return sessions.map((session) => pruneUndefined({
    report_id: snapshot.report_id,
    snapshot_id: snapshot.id,
    cstp_test_id: snapshot.cstp_test_id || session.cstpTestId,
    cstp_test_session_id: session.cstpTestSessionId,
    grow_session_id: session.growSessionId,
    kan_label: session.kanLabel || undefined,
    included_in_report: session.includedInReport,
    relationship_archived_at_snapshot: session.relationshipArchivedAtSnapshot,
    frozen_session_summary: session,
  }));
}

function mapAuditLinkRecords(candidate, { adminUserId, persistenceTimestamp }) {
  const auditLinks = Array.isArray(candidate.auditLinkCandidates)
    ? candidate.auditLinkCandidates
    : [];
  const snapshot = candidate.snapshotRecord || {};

  return auditLinks.map((auditLink) => pruneUndefined({
    report_id: snapshot.report_id || auditLink.reportId,
    snapshot_id: snapshot.id || auditLink.snapshotId,
    cstp_admin_event_id: auditLink.cstpAdminEventId,
    event_role: auditLink.eventRole,
    created_by: auditLink.createdBy || adminUserId || undefined,
    created_at: auditLink.createdAt || persistenceTimestamp,
  }));
}

async function insertSingleRecord(dbClient, table, record, options = {}) {
  const rows = await insertManyRecords(dbClient, table, [record], options);
  if (rows.length !== 1) {
    throw new Error(`Expected one inserted row from ${table}, received ${rows.length}.`);
  }
  return rows[0];
}

async function insertManyRecords(dbClient, table, records, options = {}) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  assertTableColumnMapping(table, records);

  if (typeof dbClient.insert === "function") {
    const inserted = await dbClient.insert(table, records, options);
    return normalizeInsertedRows(inserted);
  }

  if (typeof dbClient.from === "function") {
    const query = dbClient.from(table).insert(records);
    const selectedQuery = typeof query.select === "function" ? query.select("*") : query;
    const result = typeof selectedQuery.then === "function"
      ? await selectedQuery
      : selectedQuery;
    if (result?.error) {
      throw result.error;
    }
    return normalizeInsertedRows(result?.data || result);
  }

  throw new Error("Database client must provide insert(table, records) or from(table).insert(records).");
}

function assertTableColumnMapping(table, records = []) {
  const allowedColumns = TABLE_INSERT_COLUMNS[table];
  if (!allowedColumns) {
    const error = new Error(`Immutable persistence table mapping is not registered for ${table}.`);
    error.code = "CSTP_PERSISTENCE_TABLE_MAPPING_INVALID";
    error.details = { table };
    throw error;
  }

  const invalidColumns = [];
  records.forEach((record) => {
    Object.keys(record || {}).forEach((column) => {
      if (!allowedColumns.has(column)) {
        invalidColumns.push(column);
      }
    });
  });

  if (invalidColumns.length) {
    const error = new Error(`Immutable persistence column mapping does not match migration for ${table}.`);
    error.code = "CSTP_PERSISTENCE_COLUMN_MAPPING_INVALID";
    error.details = {
      table,
      invalidColumns: [...new Set(invalidColumns)].sort(),
    };
    throw error;
  }
}

function normalizeInsertedRows(result) {
  if (Array.isArray(result)) {
    return result;
  }
  if (Array.isArray(result?.data)) {
    return result.data;
  }
  if (result?.data) {
    return [result.data];
  }
  if (result && typeof result === "object") {
    return [result];
  }
  return [];
}

function buildValidatorContextFromCandidate(candidate = {}, { adminContext = {} } = {}) {
  const snapshot = candidate.snapshotRecord || {};
  return {
    report: pruneUndefined({
      id: snapshot.report_id,
      cstp_test_id: snapshot.cstp_test_id,
      cstp_request_id: snapshot.cstp_request_id,
      source_id: snapshot.source_id,
      status: candidate.reportStatus || "preparing",
    }),
    snapshot,
    cstpTest: {
      id: candidate.operationalReferenceMap?.cstpTestId,
    },
    cstpRequest: {
      id: candidate.operationalReferenceMap?.cstpRequestId,
    },
    source: {
      id: candidate.operationalReferenceMap?.sourceId,
    },
    sessionLinks: (candidate.frozenSessionSummaries || []).map((session) => ({
      id: session.cstpTestSessionId,
      cstp_test_id: session.cstpTestId,
      session_id: session.growSessionId,
      included_in_report: session.includedInReport,
      analyticsEligible: session.analyticsEligible,
      analyticsExcludedReason: session.analyticsExcludedReason,
      frozen_session_summary: session,
    })),
    growSessions: (candidate.frozenSessionSummaries || [])
      .filter((session) => session.growSessionId)
      .map((session) => ({
        id: session.growSessionId,
        ...(session.growSessionSummary || {}),
        analyticsEligible: session.analyticsEligible,
        analyticsExcludedReason: session.analyticsExcludedReason,
      })),
    adminEvent: candidate.auditLinkCandidates?.[0]
      ? { id: candidate.auditLinkCandidates[0].cstpAdminEventId }
      : undefined,
    actor: adminContext,
    auditLinks: candidate.auditLinkCandidates || [],
    snapshots: [snapshot],
  };
}

function buildPersistenceResult({
  ok,
  status,
  validation,
  plan,
  reportId = null,
  snapshotId = null,
  executedSteps = [],
  error = null,
}) {
  return deepFreeze({
    ok,
    success: ok,
    status,
    operation: PERSISTENCE_OPERATION,
    reportId,
    snapshotId,
    insertedRowCounts: summarizeInsertedRows(executedSteps),
    validation,
    persistencePlan: {
      summary: plan.summary,
      stepCount: plan.steps.length,
      requiresCallerTransaction: true,
      destructiveUpdates: false,
      deletesSnapshots: false,
      publicVisibility: false,
    },
    executedSteps,
    error: error ? normalizeError(error) : null,
    warnings: buildPersistenceWarnings(plan),
    internalOnly: true,
    mutatesGrowSessions: false,
  });
}

function buildExecutedStep(stepKey, rows) {
  const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return {
    step: stepKey,
    insertedCount: normalizedRows.length,
    ids: normalizedRows.map((row) => row?.id).filter(Boolean),
  };
}

function summarizeInsertedRows(executedSteps = []) {
  const summary = executedSteps.reduce((counts, step) => {
    const summaryKey = {
      [PLAN_STEPS.report]: "reports",
      [PLAN_STEPS.snapshot]: "snapshots",
      [PLAN_STEPS.metrics]: "metrics",
      [PLAN_STEPS.sessions]: "sessions",
      [PLAN_STEPS.auditLinks]: "auditLinks",
    }[step.step] || step.step;

    counts[summaryKey] = step.insertedCount;
    return counts;
  }, {
    reports: 0,
    snapshots: 0,
    metrics: 0,
    sessions: 0,
    auditLinks: 0,
  });

  return summary;
}

function buildPersistenceWarnings(plan) {
  return [
    "Caller-level transaction or rollback wrapper is required for atomic production persistence.",
    "No old snapshots are deleted or destructively replaced by this orchestrator.",
  ].concat(plan.summary.auditLinkRecords === 0
    ? ["No audit link records are present in this persistence plan."]
    : []);
}

function getPlanStep(plan, stepKey) {
  const step = plan.steps.find((candidateStep) => candidateStep.key === stepKey);
  if (!step) {
    throw new Error(`Persistence plan is missing step "${stepKey}".`);
  }
  return step;
}

function getAdminUserId(adminContext = {}) {
  return normalizeNullableText(
    adminContext.adminUserId
    || adminContext.createdBy
    || adminContext.userId
    || adminContext.id,
  );
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

function pruneUndefined(value) {
  return Object.fromEntries(
    Object.entries(value || {}).filter(([, entryValue]) => entryValue !== undefined),
  );
}

function normalizeError(error) {
  return {
    name: error?.name || "Error",
    code: error?.code || "CSTP_IMMUTABLE_PERSISTENCE_ERROR",
    message: error?.message || String(error),
    details: error?.details || {},
  };
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
  PERSISTENCE_OPERATION,
  PLAN_STEPS,
  TABLE_INSERT_COLUMNS,
  persistImmutableSnapshotCandidate,
  persistReportRecord,
  persistReportSnapshotRecord,
  persistReportMetricRecords,
  persistReportSessionRecords,
  persistReportAuditLinkRecords,
  buildImmutablePersistencePlan,
  validatePersistenceCandidateShape,
};
