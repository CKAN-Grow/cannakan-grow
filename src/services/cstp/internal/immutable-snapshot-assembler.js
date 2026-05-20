"use strict";

const {
  validateImmutableReportSnapshotCandidate,
} = require("./immutable-report-validator");

/*
 * Internal-only CSTP immutable snapshot assembly infrastructure.
 *
 * These helpers are pure and deterministic. They accept already-loaded
 * operational objects, assemble immutable snapshot candidate payloads, and run
 * pure validation only. They do not query Supabase, write data, generate IDs,
 * read the clock, mutate inputs, render reports, or perform certification
 * work. Immutable persistence and supersession orchestration happen later.
 */

const DEFAULT_REPORT_SCHEMA_VERSION = "cstp_report_schema_v1";
const DEFAULT_CALCULATION_VERSION = "cstp_metric_calculation_v1";

const AUDIT_EVENT_ROLE_MAP = Object.freeze({
  report_created: "report_created",
  snapshot_generated: "snapshot_generated",
  snapshot_prepared: "snapshot_prepared",
  report_prepared: "report_prepared",
  snapshot_published: "snapshot_published",
  report_published: "report_published",
  snapshot_superseded: "snapshot_superseded",
  report_superseded: "report_superseded",
  report_archived: "report_archived",
  validation_failed: "validation_failed",
});

function assembleImmutableReportSnapshotCandidate(input = {}, options = {}) {
  assertPlainObject(input, "Immutable snapshot assembly input must be an object.");
  assertPlainObject(options, "Immutable snapshot assembly options must be an object.");

  const normalizedInput = normalizeAssemblyInput(input, options);
  const operationalReferenceMap = assembleOperationalReferenceMap(normalizedInput);
  const sessions = assembleFrozenSessionSummaries(normalizedInput);
  const metrics = assembleFrozenMetricPayload({
    ...normalizedInput,
    sessionSummaries: sessions,
  });
  const lineage = assembleLineageMetadata(normalizedInput);
  const reportSummary = assembleFrozenReportSummary({
    ...normalizedInput,
    operationalReferenceMap,
    sessions,
    metrics,
    lineage,
  });
  const snapshotMetadata = assembleSnapshotMetadata({
    ...normalizedInput,
    operationalReferenceMap,
    lineage,
  });
  const auditLinkCandidates = assembleAuditLinkCandidates({
    ...normalizedInput,
    snapshotMetadata,
  });
  const snapshotRecord = buildSnapshotRecord({
    ...normalizedInput,
    snapshotMetadata,
    reportSummary,
    metrics,
    sessions,
    operationalReferenceMap,
    auditLinkCandidates,
    lineage,
  });
  const validationContext = buildValidationContext({
    ...normalizedInput,
    operationalReferenceMap,
    lineage,
    snapshotRecord,
    auditLinkCandidates,
  });
  const validation = validateImmutableReportSnapshotCandidate(
    validationContext,
    {
      requireReport: hasValue(snapshotMetadata.reportId),
      requireSnapshot: hasValue(snapshotMetadata.snapshotId),
      requireSessions: options.requireSessions !== false,
      requireNonEmptyPayload: true,
      requireAdminContext: options.requireAdminContext === true,
      mode: "assembly_candidate",
    },
  );

  return deepFreeze({
    operation: "assemble_cstp_immutable_report_snapshot_candidate",
    reportSummary,
    snapshotMetadata,
    frozenMetricPayload: metrics,
    frozenSessionSummaries: sessions,
    auditLinkCandidates,
    operationalReferenceMap,
    lineage,
    snapshotRecord,
    validation,
    dbExecution: "deferred",
    persisted: false,
    internalOnly: true,
    mutatesOperationalData: false,
    mutatesGrowSessions: false,
  });
}

function assembleFrozenReportSummary(input = {}) {
  const request = input.cstpRequest || {};
  const test = input.cstpTest || {};
  const source = input.source || {};
  const sessions = Array.isArray(input.sessions) ? input.sessions : [];
  const metrics = Array.isArray(input.metrics) ? input.metrics : [];
  const generatedAt = normalizeSnapshotTimestamp(input.generatedAt);

  return deepFreeze(pruneUndefined({
    reportId: input.reportId,
    snapshotId: input.snapshotId,
    cstpTestId: getIdValue(test, ["id", "cstpTestId", "testId"]),
    cstpRequestId: getIdValue(request, ["id", "cstpRequestId", "requestId"]),
    sourceId: getIdValue(source, ["id", "sourceId"]),
    snapshotVersion: input.snapshotVersion,
    reportSchemaVersion: input.reportSchemaVersion,
    methodologyVersion: input.methodologyVersion,
    generatedAt,
    request: assembleRequestSummary(request),
    test: assembleTestSummary(test),
    source: assembleSourceSummary(source),
    counts: {
      sessionLinks: sessions.length,
      includedSessions: sessions.filter((session) => session.includedInReport).length,
      archivedRelationships: sessions.filter((session) => (
        session.relationshipArchivedAtSnapshot
      )).length,
      metrics: metrics.length,
    },
    operationalReferences: input.operationalReferenceMap || {},
    lineage: input.lineage || {},
    internalOnly: true,
  }));
}

function assembleFrozenMetricPayload(input = {}) {
  const providedMetrics = normalizeProvidedMetrics(input.metrics || input.metricInputs);
  const sessionSummaries = Array.isArray(input.sessionSummaries)
    ? input.sessionSummaries
    : assembleFrozenSessionSummaries(input);
  const calculatedAt = normalizeSnapshotTimestamp(
    input.calculatedAt || input.generatedAt,
  );
  const derivedMetrics = buildDerivedSessionMetrics({
    sessionSummaries,
    calculatedAt,
    calculationVersion: input.calculationVersion,
  });

  return deepFreeze(sortMetricsStable([
    ...providedMetrics.map((metric) => normalizeMetric(metric, input)),
    ...derivedMetrics,
  ]));
}

function assembleFrozenSessionSummaries(input = {}) {
  const sessionLinks = Array.isArray(input.cstpTestSessions)
    ? input.cstpTestSessions
    : [];
  const growSessions = Array.isArray(input.growSessions) ? input.growSessions : [];
  const growSessionById = new Map(growSessions.map((session) => [
    getIdValue(session, ["id", "sessionId", "growSessionId"]),
    session,
  ]));

  return deepFreeze(sortSnapshotSessionsStable(sessionLinks).map((link, index) => {
    const growSessionId = getIdValue(link, [
      "session_id",
      "sessionId",
      "grow_session_id",
      "growSessionId",
    ]);
    const growSession = growSessionById.get(growSessionId) || {};
    const relationshipArchivedAtSnapshot = getBooleanValue(link, [
      "archived",
      "relationship_archived_at_snapshot",
      "relationshipArchivedAtSnapshot",
    ], false);
    const requestedInclusion = getBooleanValue(link, [
      "included_in_report",
      "includedInReport",
    ], true);
    const analyticsEligibility = getGrowSessionAnalyticsEligibility(growSession);

    return pruneUndefined({
      index,
      cstpTestSessionId: getIdValue(link, ["id", "cstpTestSessionId", "linkId"]),
      cstpTestId: getIdValue(link, ["cstp_test_id", "cstpTestId", "testId"]),
      growSessionId,
      kanLabel: normalizeNullableText(getFirstValue(link, ["kan_label", "kanLabel"])),
      includedInReport: requestedInclusion && analyticsEligibility.eligible,
      includedInReportRequested: requestedInclusion,
      relationshipArchivedAtSnapshot,
      analyticsEligible: analyticsEligibility.eligible,
      analyticsExcludedReason: analyticsEligibility.reason,
      relationshipCreatedAt: normalizeSnapshotTimestamp(
        getFirstValue(link, ["created_at", "createdAt"]),
      ),
      growSessionSummary: assembleGrowSessionSummary(growSession, analyticsEligibility),
      missingGrowSession: !hasIdentifier(growSession),
      internalOnly: true,
      mutatesGrowSession: false,
    });
  }));
}

function assembleAuditLinkCandidates(input = {}) {
  const auditEvents = Array.isArray(input.auditEvents) ? input.auditEvents : [];
  const adminContext = input.adminContext || {};
  const snapshotMetadata = input.snapshotMetadata || {};
  const reportId = input.reportId || snapshotMetadata.reportId;
  const snapshotId = input.snapshotId || snapshotMetadata.snapshotId;
  const actorId = getIdValue(adminContext, [
    "adminUserId",
    "createdBy",
    "userId",
    "id",
  ]);

  const eventLinks = auditEvents.map((event, index) => {
    const eventType = normalizeNullableText(
      getFirstValue(event, ["event_type", "eventType", "type"]),
    );
    const eventRole = AUDIT_EVENT_ROLE_MAP[eventType] || normalizeNullableText(
      getFirstValue(event, ["event_role", "eventRole"]),
    ) || "snapshot_generated";

    return pruneUndefined({
      index,
      reportId,
      snapshotId,
      cstpAdminEventId: getIdValue(event, ["id", "cstpAdminEventId"]),
      eventRole,
      createdBy: actorId || getIdValue(event, ["admin_user_id", "adminUserId"]),
      createdAt: normalizeSnapshotTimestamp(
        getFirstValue(event, ["created_at", "createdAt"]),
      ),
      internalOnly: true,
    });
  });

  if (eventLinks.length === 0 && actorId) {
    eventLinks.push(pruneUndefined({
      reportId,
      snapshotId,
      eventRole: "snapshot_generated",
      createdBy: actorId,
      createdAt: normalizeSnapshotTimestamp(adminContext.createdAt),
      internalOnly: true,
    }));
  }

  return deepFreeze(eventLinks.sort(compareAuditLinksStable));
}

function assembleOperationalReferenceMap(input = {}) {
  const request = input.cstpRequest || {};
  const test = input.cstpTest || {};
  const source = input.source || {};
  const sessions = sortSnapshotSessionsStable(
    Array.isArray(input.cstpTestSessions) ? input.cstpTestSessions : [],
  );
  const growSessions = Array.isArray(input.growSessions) ? input.growSessions : [];
  const auditEvents = Array.isArray(input.auditEvents) ? input.auditEvents : [];

  return deepFreeze({
    reportId: input.reportId || null,
    snapshotId: input.snapshotId || null,
    cstpRequestId: getIdValue(request, ["id", "cstpRequestId", "requestId"]) || null,
    cstpTestId: getIdValue(test, ["id", "cstpTestId", "testId"]) || null,
    sourceId: getIdValue(source, ["id", "sourceId"]) || null,
    cstpTestSessionIds: sessions.map((session) => (
      getIdValue(session, ["id", "cstpTestSessionId", "linkId"]) || null
    )),
    growSessionIds: growSessions.map((session) => (
      getIdValue(session, ["id", "sessionId", "growSessionId"]) || null
    )).sort(compareNullableText),
    cstpAdminEventIds: auditEvents.map((event) => (
      getIdValue(event, ["id", "cstpAdminEventId"]) || null
    )).sort(compareNullableText),
  });
}

function normalizeSnapshotTimestamp(value) {
  if (!hasValue(value)) {
    return null;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? null : value.toISOString();
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? new Date(value).toISOString() : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const timestamp = Date.parse(trimmed);
    return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
  }

  return null;
}

function sortSnapshotSessionsStable(sessions = []) {
  const list = Array.isArray(sessions) ? sessions : [];

  return list.slice().sort((left, right) => {
    const leftCreatedAt = normalizeSnapshotTimestamp(
      getFirstValue(left, ["created_at", "createdAt"]),
    ) || "";
    const rightCreatedAt = normalizeSnapshotTimestamp(
      getFirstValue(right, ["created_at", "createdAt"]),
    ) || "";
    const createdAtComparison = leftCreatedAt.localeCompare(rightCreatedAt);

    if (createdAtComparison !== 0) {
      return createdAtComparison;
    }

    return compareNullableText(
      getIdValue(left, ["id", "cstpTestSessionId", "linkId"]),
      getIdValue(right, ["id", "cstpTestSessionId", "linkId"]),
    );
  });
}

function normalizeAssemblyInput(input, options) {
  const existingSnapshots = Array.isArray(input.existingSnapshots)
    ? input.existingSnapshots.slice()
    : [];
  const snapshotVersion = normalizePositiveInteger(
    input.snapshotVersion || options.snapshotVersion,
  ) || getNextSnapshotVersion(existingSnapshots);

  return {
    reportId: normalizeNullableText(input.reportId || options.reportId),
    snapshotId: normalizeNullableText(input.snapshotId || options.snapshotId),
    cstpRequest: input.cstpRequest || {},
    cstpTest: input.cstpTest || {},
    cstpTestSessions: Array.isArray(input.cstpTestSessions)
      ? input.cstpTestSessions.slice()
      : [],
    growSessions: Array.isArray(input.growSessions) ? input.growSessions.slice() : [],
    source: input.source || {},
    adminContext: input.adminContext || {},
    auditEvents: Array.isArray(input.auditEvents) ? input.auditEvents.slice() : [],
    existingSnapshots,
    metrics: input.metrics || input.metricInputs || [],
    generatedAt: input.generatedAt || options.generatedAt,
    calculatedAt: input.calculatedAt || options.calculatedAt,
    preparedAt: input.preparedAt || options.preparedAt,
    publishedAt: input.publishedAt || options.publishedAt,
    snapshotVersion,
    status: normalizeNullableText(input.status || options.status) || "generated",
    reportStatus: normalizeNullableText(input.reportStatus || options.reportStatus) || "preparing",
    locked: Boolean(input.locked || options.locked),
    reportSchemaVersion: normalizeNullableText(
      input.reportSchemaVersion || options.reportSchemaVersion,
    ) || DEFAULT_REPORT_SCHEMA_VERSION,
    methodologyVersion: normalizeNullableText(
      input.methodologyVersion || options.methodologyVersion,
    ),
    calculationVersion: normalizeNullableText(
      input.calculationVersion || options.calculationVersion,
    ) || DEFAULT_CALCULATION_VERSION,
    supersedesSnapshotId: normalizeNullableText(
      input.supersedesSnapshotId
      || input.supersedes_snapshot_id
      || options.supersedesSnapshotId,
    ),
  };
}

function assembleSnapshotMetadata(input) {
  const generatedAt = normalizeSnapshotTimestamp(input.generatedAt);

  return deepFreeze(pruneUndefined({
    reportId: input.reportId || null,
    snapshotId: input.snapshotId || null,
    cstpTestId: input.operationalReferenceMap.cstpTestId,
    cstpRequestId: input.operationalReferenceMap.cstpRequestId,
    sourceId: input.operationalReferenceMap.sourceId,
    snapshotVersion: input.snapshotVersion,
    status: input.status,
    locked: input.locked,
    reportSchemaVersion: input.reportSchemaVersion,
    methodologyVersion: input.methodologyVersion || null,
    generatedAt,
    preparedAt: normalizeSnapshotTimestamp(input.preparedAt),
    publishedAt: normalizeSnapshotTimestamp(input.publishedAt),
    supersedesSnapshotId: input.lineage.supersedesSnapshotId || null,
    supersededBySnapshotId: null,
    internalOnly: true,
  }));
}

function buildSnapshotRecord(input) {
  return deepFreeze(pruneUndefined({
    id: input.snapshotId || undefined,
    report_id: input.reportId || undefined,
    cstp_test_id: input.operationalReferenceMap.cstpTestId || undefined,
    cstp_request_id: input.operationalReferenceMap.cstpRequestId || undefined,
    source_id: input.operationalReferenceMap.sourceId || undefined,
    snapshot_version: input.snapshotVersion,
    status: input.status,
    locked: input.locked,
    frozen_report_payload: {
      reportSummary: input.reportSummary,
      snapshotMetadata: input.snapshotMetadata,
      metrics: input.metrics,
      sessions: input.sessions,
      operationalReferences: input.operationalReferenceMap,
      lineage: input.lineage,
      auditLinks: input.auditLinkCandidates,
    },
    report_schema_version: input.reportSchemaVersion,
    methodology_version: input.methodologyVersion || undefined,
    generated_at: input.snapshotMetadata.generatedAt || undefined,
    prepared_at: input.snapshotMetadata.preparedAt || undefined,
    published_at: input.snapshotMetadata.publishedAt || undefined,
    supersedes_snapshot_id: input.lineage.supersedesSnapshotId || undefined,
    superseded_by_snapshot_id: input.lineage.supersededBySnapshotId || undefined,
  }));
}

function buildValidationContext(input) {
  return {
    report: pruneUndefined({
      id: input.reportId || undefined,
      cstp_test_id: input.operationalReferenceMap.cstpTestId || undefined,
      cstp_request_id: input.operationalReferenceMap.cstpRequestId || undefined,
      source_id: input.operationalReferenceMap.sourceId || undefined,
      status: input.reportStatus,
    }),
    snapshot: input.snapshotRecord,
    cstpTest: input.cstpTest,
    cstpRequest: input.cstpRequest,
    source: input.source,
    sessionLinks: input.cstpTestSessions,
    growSessions: input.growSessions,
    adminEvent: input.auditEvents[0] || input.adminContext,
    actor: input.adminContext,
    auditLinks: input.auditLinkCandidates,
    snapshots: [
      ...input.existingSnapshots,
      input.snapshotRecord,
    ],
    predecessor: input.lineage.supersedesSnapshotId
      ? findSnapshotById(input.existingSnapshots, input.lineage.supersedesSnapshotId)
      : undefined,
    successor: input.snapshotRecord,
  };
}

function assembleLineageMetadata(input) {
  const sortedExistingSnapshots = sortSnapshotsStable(input.existingSnapshots);
  const latestSnapshot = sortedExistingSnapshots[sortedExistingSnapshots.length - 1] || {};
  const latestSnapshotId = getIdValue(latestSnapshot, ["id", "snapshotId"]);
  const supersedesSnapshotId = input.supersedesSnapshotId || latestSnapshotId || null;

  return deepFreeze({
    snapshotVersion: input.snapshotVersion,
    previousSnapshotId: latestSnapshotId || null,
    supersedesSnapshotId,
    supersededBySnapshotId: null,
    existingSnapshotCount: sortedExistingSnapshots.length,
    currentLineageSnapshotIds: sortedExistingSnapshots.map((snapshot) => (
      getIdValue(snapshot, ["id", "snapshotId"]) || null
    )),
    internalOnly: true,
    persistenceDeferred: true,
  });
}

function buildDerivedSessionMetrics({
  sessionSummaries,
  calculatedAt,
  calculationVersion,
}) {
  const totalSessionLinks = sessionSummaries.length;
  const includedSessionLinks = sessionSummaries.filter((session) => (
    session.includedInReport
  )).length;
  const archivedSessionLinks = sessionSummaries.filter((session) => (
    session.relationshipArchivedAtSnapshot
  )).length;
  const missingGrowSessions = sessionSummaries.filter((session) => (
    session.missingGrowSession
  )).length;
  const analyticsExcludedSessions = sessionSummaries.filter((session) => (
    session.includedInReportRequested && !session.analyticsEligible
  )).length;

  return [
    buildCountMetric({
      key: "session_links_total",
      value: totalSessionLinks,
      calculatedAt,
      calculationVersion,
    }),
    buildCountMetric({
      key: "session_links_included",
      value: includedSessionLinks,
      calculatedAt,
      calculationVersion,
    }),
    buildCountMetric({
      key: "session_links_archived",
      value: archivedSessionLinks,
      calculatedAt,
      calculationVersion,
    }),
    buildCountMetric({
      key: "grow_sessions_missing",
      value: missingGrowSessions,
      calculatedAt,
      calculationVersion,
    }),
    buildCountMetric({
      key: "grow_sessions_analytics_excluded",
      value: analyticsExcludedSessions,
      calculatedAt,
      calculationVersion,
    }),
  ];
}

function buildCountMetric({
  key,
  value,
  calculatedAt,
  calculationVersion,
}) {
  return {
    metricKey: key,
    metricType: "count",
    metricUnit: "count",
    metricValue: {
      value,
    },
    frozenMetricPayload: {
      value,
      source: "cstp_snapshot_assembler_v1",
    },
    numerator: value,
    denominator: null,
    calculatedAt,
    observationWindowStart: null,
    observationWindowEnd: null,
    calculationVersion,
  };
}

function normalizeProvidedMetrics(metrics) {
  if (Array.isArray(metrics)) {
    return metrics.filter(isPlainObject);
  }

  if (isPlainObject(metrics)) {
    return Object.keys(metrics).sort().map((key) => ({
      metricKey: key,
      metricValue: metrics[key],
    }));
  }

  return [];
}

function normalizeMetric(metric, input) {
  const metricKey = normalizeNullableText(
    getFirstValue(metric, ["metric_key", "metricKey", "key"]),
  );
  const metricType = normalizeNullableText(
    getFirstValue(metric, ["metric_type", "metricType", "type"]),
  ) || inferMetricType(getFirstValue(metric, ["metric_value", "metricValue", "value"]));
  const metricValue = normalizeMetricValue(
    getFirstValue(metric, ["metric_value", "metricValue", "value"]),
  );

  return pruneUndefined({
    metricKey,
    metricType,
    metricUnit: normalizeNullableText(
      getFirstValue(metric, ["metric_unit", "metricUnit", "unit"]),
    ) || null,
    metricValue,
    frozenMetricPayload: normalizeMetricValue(
      getFirstValue(metric, [
        "frozen_metric_payload",
        "frozenMetricPayload",
        "payload",
      ]),
    ),
    numerator: normalizeNullableNumber(getFirstValue(metric, ["numerator"])),
    denominator: normalizeNullableNumber(getFirstValue(metric, ["denominator"])),
    calculatedAt: normalizeSnapshotTimestamp(
      getFirstValue(metric, ["calculated_at", "calculatedAt"])
      || input.calculatedAt
      || input.generatedAt,
    ),
    observationWindowStart: normalizeSnapshotTimestamp(
      getFirstValue(metric, [
        "observation_window_start",
        "observationWindowStart",
      ]),
    ),
    observationWindowEnd: normalizeSnapshotTimestamp(
      getFirstValue(metric, [
        "observation_window_end",
        "observationWindowEnd",
      ]),
    ),
    calculationVersion: normalizeNullableText(
      getFirstValue(metric, ["calculation_version", "calculationVersion"]),
    ) || input.calculationVersion,
  });
}

function sortMetricsStable(metrics) {
  return metrics.slice().sort((left, right) => (
    compareNullableText(left.metricKey, right.metricKey)
  ));
}

function assembleRequestSummary(request) {
  return deepFreeze(pruneUndefined({
    id: getIdValue(request, ["id", "requestId", "cstpRequestId"]),
    sourceId: getIdValue(request, ["source_id", "sourceId"]),
    varietyName: normalizeNullableText(getFirstValue(request, ["variety_name", "varietyName"])),
    seedType: normalizeNullableText(getFirstValue(request, ["seed_type", "seedType"])),
    breederName: normalizeNullableText(getFirstValue(request, ["breeder_name", "breederName"])),
    batchLot: normalizeNullableText(getFirstValue(request, ["batch_lot", "batchLot"])),
    requestedSeedCount: normalizeNullableNumber(
      getFirstValue(request, ["requested_seed_count", "requestedSeedCount"]),
    ),
    status: normalizeNullableText(getFirstValue(request, ["status"])),
    archived: getBooleanValue(request, ["archived"], false),
    createdAt: normalizeSnapshotTimestamp(getFirstValue(request, ["created_at", "createdAt"])),
    updatedAt: normalizeSnapshotTimestamp(getFirstValue(request, ["updated_at", "updatedAt"])),
  }));
}

function assembleTestSummary(test) {
  return deepFreeze(pruneUndefined({
    id: getIdValue(test, ["id", "cstpTestId", "testId"]),
    sourceId: getIdValue(test, ["source_id", "sourceId"]),
    requestId: getIdValue(test, ["request_id", "requestId"]),
    status: normalizeNullableText(getFirstValue(test, ["status"])),
    internalState: normalizeNullableText(getFirstValue(test, ["internal_state", "internalState"])),
    createdBy: getIdValue(test, ["created_by", "createdBy"]),
    archived: getBooleanValue(test, ["archived"], false),
    startedAt: normalizeSnapshotTimestamp(getFirstValue(test, ["started_at", "startedAt"])),
    completedAt: normalizeSnapshotTimestamp(getFirstValue(test, ["completed_at", "completedAt"])),
    createdAt: normalizeSnapshotTimestamp(getFirstValue(test, ["created_at", "createdAt"])),
    updatedAt: normalizeSnapshotTimestamp(getFirstValue(test, ["updated_at", "updatedAt"])),
  }));
}

function assembleSourceSummary(source) {
  return deepFreeze(pruneUndefined({
    id: getIdValue(source, ["id", "sourceId"]),
    name: normalizeNullableText(getFirstValue(source, ["name", "sourceName", "canonicalName"])),
    archived: getBooleanValue(source, ["archived"], false),
    updatedAt: normalizeSnapshotTimestamp(getFirstValue(source, ["updated_at", "updatedAt"])),
  }));
}

function assembleGrowSessionSummary(growSession, analyticsEligibility = getGrowSessionAnalyticsEligibility(growSession)) {
  return deepFreeze(pruneUndefined({
    id: getIdValue(growSession, ["id", "sessionId", "growSessionId"]),
    sourceId: getIdValue(growSession, ["source_id", "sourceId"]),
    status: normalizeNullableText(getFirstValue(growSession, ["session_status", "sessionStatus", "status"])),
    stage: normalizeNullableText(getFirstValue(growSession, ["stage", "currentStage"])),
    startedAt: normalizeSnapshotTimestamp(
      getFirstValue(growSession, ["session_started_at", "sessionStartedAt", "started_at", "startedAt", "created_at", "createdAt"]),
    ),
    soakStartedAt: normalizeSnapshotTimestamp(
      getFirstValue(growSession, ["soak_started_at", "soakStartedAt", "timer_start_at", "timerStartAt"]),
    ),
    germinationStartedAt: normalizeSnapshotTimestamp(
      getFirstValue(growSession, ["germination_started_at", "germinationStartedAt"]),
    ),
    completedAt: normalizeSnapshotTimestamp(
      getFirstValue(growSession, ["completed_at", "completedAt"]),
    ),
    visibilityStatus: normalizeNullableText(getFirstValue(growSession, ["visibility_status", "visibilityStatus"])),
    isMock: getBooleanValue(growSession, ["is_mock", "isMock"], false),
    isTest: getBooleanValue(growSession, ["is_test", "isTest"], false),
    excludedFromAnalytics: getBooleanValue(growSession, ["excluded_from_analytics", "excludedFromAnalytics"], false),
    isDeleted: getBooleanValue(growSession, ["is_deleted", "isDeleted"], false),
    analyticsEligible: analyticsEligibility.eligible,
    analyticsExcludedReason: analyticsEligibility.reason,
    updatedAt: normalizeSnapshotTimestamp(
      getFirstValue(growSession, ["updated_at", "updatedAt"]),
    ),
  }));
}

function getGrowSessionAnalyticsEligibility(growSession = {}) {
  if (!hasIdentifier(growSession)) {
    return { eligible: false, reason: "missing_session" };
  }
  if (getBooleanValue(growSession, ["is_mock", "isMock"], false)) {
    return { eligible: false, reason: "mock_session" };
  }
  if (getBooleanValue(growSession, ["is_test", "isTest"], false)) {
    return { eligible: false, reason: "test_session" };
  }
  if (getBooleanValue(growSession, ["excluded_from_analytics", "excludedFromAnalytics"], false)) {
    return {
      eligible: false,
      reason: normalizeNullableText(getFirstValue(growSession, [
        "analytics_excluded_reason",
        "analyticsExcludedReason",
      ])) || "analytics_excluded",
    };
  }
  if (
    getBooleanValue(growSession, ["is_deleted", "isDeleted"], false)
    || ["deleted", "archived", "archived_test"].includes(normalizeStatusText(
      getFirstValue(growSession, ["visibility_status", "visibilityStatus"]),
    ))
  ) {
    return { eligible: false, reason: "deleted_session" };
  }

  const status = normalizeStatusText(getFirstValue(growSession, [
    "session_status",
    "sessionStatus",
    "status",
  ]));
  if (["abandoned", "failed", "canceled", "cancelled", "archived_test"].includes(status)) {
    return { eligible: false, reason: "abandoned_session" };
  }
  if (!["completed", "complete"].includes(status)) {
    return { eligible: false, reason: "incomplete_session" };
  }

  const completedAt = getFirstValue(growSession, ["completed_at", "completedAt"]);
  if (!hasValue(completedAt)) {
    return { eligible: false, reason: "missing_completed_at" };
  }

  const sessionStartedAt = getFirstValue(growSession, [
    "session_started_at",
    "sessionStartedAt",
    "started_at",
    "startedAt",
    "created_at",
    "createdAt",
  ]);
  const soakStartedAt = getFirstValue(growSession, [
    "soak_started_at",
    "soakStartedAt",
    "timer_start_at",
    "timerStartAt",
  ]);
  const germinationStartedAt = getFirstValue(growSession, [
    "germination_started_at",
    "germinationStartedAt",
  ]);
  if (!isTimelineOrderValid({
    sessionStartedAt,
    soakStartedAt,
    germinationStartedAt,
    completedAt,
  })) {
    return { eligible: false, reason: "invalid_timeline" };
  }

  return { eligible: true, reason: "" };
}

function isTimelineOrderValid({
  sessionStartedAt,
  soakStartedAt,
  germinationStartedAt,
  completedAt,
}) {
  const sessionStartedMs = parseOptionalTimestamp(sessionStartedAt);
  const soakStartedMs = parseOptionalTimestamp(soakStartedAt);
  const germinationStartedMs = parseOptionalTimestamp(germinationStartedAt);
  const completedMs = parseOptionalTimestamp(completedAt);

  return !(
    sessionStartedMs !== null && soakStartedMs !== null && soakStartedMs < sessionStartedMs
    || soakStartedMs !== null && germinationStartedMs !== null && soakStartedMs > germinationStartedMs
    || germinationStartedMs !== null && completedMs !== null && germinationStartedMs > completedMs
    || sessionStartedMs !== null && completedMs !== null && completedMs < sessionStartedMs
  );
}

function parseOptionalTimestamp(value) {
  if (!hasValue(value)) {
    return null;
  }
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(String(value));
  return Number.isNaN(timestamp) ? null : timestamp;
}

function normalizeStatusText(value) {
  return normalizeNullableText(value).toLowerCase();
}

function getNextSnapshotVersion(existingSnapshots = []) {
  const maxVersion = existingSnapshots.reduce((max, snapshot) => {
    const version = normalizePositiveInteger(
      getFirstValue(snapshot, ["snapshot_version", "snapshotVersion"]),
    );
    return version > max ? version : max;
  }, 0);

  return maxVersion + 1;
}

function sortSnapshotsStable(snapshots = []) {
  return snapshots.slice().sort((left, right) => {
    const leftVersion = normalizePositiveInteger(
      getFirstValue(left, ["snapshot_version", "snapshotVersion"]),
    );
    const rightVersion = normalizePositiveInteger(
      getFirstValue(right, ["snapshot_version", "snapshotVersion"]),
    );

    if (leftVersion !== rightVersion) {
      return leftVersion - rightVersion;
    }

    return compareNullableText(
      getIdValue(left, ["id", "snapshotId"]),
      getIdValue(right, ["id", "snapshotId"]),
    );
  });
}

function findSnapshotById(snapshots, snapshotId) {
  return snapshots.find((snapshot) => (
    getIdValue(snapshot, ["id", "snapshotId"]) === snapshotId
  ));
}

function compareAuditLinksStable(left, right) {
  return compareNullableText(left.eventRole, right.eventRole)
    || compareNullableText(left.cstpAdminEventId, right.cstpAdminEventId)
    || compareNullableText(left.createdBy, right.createdBy);
}

function compareNullableText(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}

function inferMetricType(value) {
  if (typeof value === "number") {
    return "count";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (typeof value === "string") {
    return "text";
  }
  return "json";
}

function normalizeMetricValue(value) {
  if (value === undefined) {
    return {};
  }
  if (isPlainObject(value)) {
    return { ...value };
  }
  return { value };
}

function normalizePositiveInteger(value) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : 0;
}

function normalizeNullableNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getBooleanValue(record, keys, fallback = false) {
  const value = getFirstValue(record, keys);
  return value === undefined ? fallback : value === true;
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

function normalizeNullableText(value) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
}

function hasIdentifier(record) {
  return isPlainObject(record) && Boolean(getIdValue(record, [
    "id",
    "sessionId",
    "growSessionId",
    "cstpTestId",
    "requestId",
    "sourceId",
  ]));
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function pruneUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  );
}

function assertPlainObject(value, message) {
  if (!isPlainObject(value)) {
    throw new TypeError(message);
  }
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
  DEFAULT_REPORT_SCHEMA_VERSION,
  DEFAULT_CALCULATION_VERSION,
  AUDIT_EVENT_ROLE_MAP,
  assembleImmutableReportSnapshotCandidate,
  assembleFrozenReportSummary,
  assembleFrozenMetricPayload,
  assembleFrozenSessionSummaries,
  assembleAuditLinkCandidates,
  assembleOperationalReferenceMap,
  getGrowSessionAnalyticsEligibility,
  normalizeSnapshotTimestamp,
  sortSnapshotSessionsStable,
};
