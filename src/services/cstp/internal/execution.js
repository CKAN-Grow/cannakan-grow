"use strict";

const { CSTP_ADMIN_EVENT_TYPES } = require("./admin-events");
const { CSTP_TABLES } = require("./constants");
const { CstpExecutionError } = require("./errors");
const {
  createCstpRequest,
  prepareRequestAdminEvent,
  updateCstpRequestStatus,
} = require("./requests");
const {
  archiveCstpSessionLink,
  linkGrowSessionToCstpTest,
  normalizeCstpSessionLinkPayload,
  prepareSessionLinkAdminEvent,
} = require("./session-links");
const {
  archiveCstpTest,
  createCstpTest,
  prepareTestAdminEvent,
  updateCstpTestStatus,
} = require("./tests");

/*
 * Internal CSTP Supabase execution boundary.
 *
 * This module is intentionally not an API route and is not wired into UI/app
 * flows. Database writes for CSTP should stay centralized here so validation,
 * lifecycle rules, audit sequencing, and partial-failure behavior cannot drift
 * across route handlers or future admin screens.
 *
 * Current execution scope:
 * - CSTP request creation.
 * - CSTP request status updates.
 * - CSTP test creation.
 * - CSTP test status updates and archival.
 * - CSTP session-link creation and archival.
 * - Optional cstp_admin_events insert only when the event can be finalized.
 *
 * Explicitly out of scope:
 * - public reads
 * - grow_session mutation
 * - report/certification logic
 * - API/UI/RLS integration
 */

function getEnv(name, fallback = "", env = process.env) {
  return String(env?.[name] || fallback).trim();
}

async function executeCstpTestCreation(input = {}, options = {}) {
  const preparedTest = createCstpTest(input);
  return executePreparedCstpTestMutation({
    preparedTest,
    options,
    operation: "execute_cstp_test_create",
    method: "POST",
    path: `${preparedTest.test.table}?select=*`,
    successStatus: "test_created",
    primaryFailureStatus: "test_insert_failed",
    auditFailureStatus: "test_created_audit_insert_failed",
  });
}

async function executeCstpTestStatusUpdate(input = {}, options = {}) {
  const preparedTest = updateCstpTestStatus(input);
  const testId = preparedTest.testId;

  return executePreparedCstpTestMutation({
    preparedTest,
    options,
    operation: "execute_cstp_test_status_update",
    method: "PATCH",
    path: `${preparedTest.test.table}?id=eq.${encodeURIComponent(testId)}&select=*`,
    successStatus: "test_status_updated",
    primaryFailureStatus: "test_status_update_failed",
    auditFailureStatus: "test_status_updated_audit_insert_failed",
  });
}

async function executeCstpTestArchive(input = {}, options = {}) {
  const preparedTest = archiveCstpTest(input);
  const testId = preparedTest.testId;

  return executePreparedCstpTestMutation({
    preparedTest,
    options,
    operation: "execute_cstp_test_archive",
    method: "PATCH",
    path: `${preparedTest.test.table}?id=eq.${encodeURIComponent(testId)}&select=*`,
    successStatus: "test_archived",
    primaryFailureStatus: "test_archive_failed",
    auditFailureStatus: "test_archived_audit_insert_failed",
  });
}

async function executeCstpSessionLinkCreation(input = {}, options = {}) {
  const normalizedInput = normalizeCstpSessionLinkPayload(input);
  linkGrowSessionToCstpTest({
    ...normalizedInput,
    existingLinks: Array.isArray(input.existingLinks) ? input.existingLinks : [],
  });

  const config = resolveExecutionConfig(options);
  const fetchImpl = resolveFetchImplementation(options);

  if (!config.ok) {
    return buildSessionLinkExecutionFailure({
      status: "configuration_failed",
      operation: "execute_cstp_session_link_create",
      error: config.error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  let existingLinks;

  try {
    existingLinks = await resolveExistingCstpSessionLinks({
      input,
      normalizedInput,
      config: config.value,
      fetchImpl,
    });
  } catch (error) {
    return buildSessionLinkExecutionFailure({
      status: "session_link_duplicate_lookup_failed",
      operation: "execute_cstp_session_link_create",
      error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  let preparedLink;

  try {
    preparedLink = linkGrowSessionToCstpTest({
      ...normalizedInput,
      existingLinks,
    });
  } catch (error) {
    /*
     * Duplicate-link protection remains backend-owned. Treat an attempted
     * duplicate CSTP test/session relationship as an operational conflict, not
     * as an unexpected execution failure, so admin tooling can present it
     * clearly without weakening the centralized safeguard.
     */
    return buildSessionLinkExecutionFailure({
      status: "session_link_duplicate_rejected",
      operation: "execute_cstp_session_link_create",
      error,
      httpStatus: 409,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  let linkRecord;

  try {
    const linkRows = await supabaseRest(
      `${preparedLink.link.table}?select=*`,
      config.value,
      {
        method: "POST",
        body: preparedLink.link.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    linkRecord = normalizeSingleRow(linkRows, CSTP_TABLES.testSessions);
  } catch (error) {
    return buildSessionLinkExecutionFailure({
      status: "session_link_insert_failed",
      operation: "execute_cstp_session_link_create",
      preparedLink,
      error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  const finalizedAdminEvent = finalizeSessionLinkAdminEvent({
    preparedAdminEvent: preparedLink.adminEvent,
    linkRecord,
  });

  try {
    const adminEventRows = await supabaseRest(
      `${CSTP_TABLES.adminEvents}?select=*`,
      config.value,
      {
        method: "POST",
        body: finalizedAdminEvent.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    return deepFreeze({
      ok: true,
      status: "session_link_created",
      operation: "execute_cstp_session_link_create",
      link: {
        record: linkRecord,
        prepared: preparedLink.link,
        duplicateCheck: {
          source: Array.isArray(input.existingLinks) ? "supplied" : "queried",
          activeMatchesFound: existingLinks.length,
        },
      },
      adminEvent: {
        status: "inserted",
        record: normalizeSingleRow(adminEventRows, CSTP_TABLES.adminEvents),
        payload: finalizedAdminEvent,
      },
      transaction: {
        atomic: false,
        primaryMutationCommitted: true,
        auditMutationCommitted: true,
      },
      internalOnly: true,
      mutatesGrowSession: false,
    });
  } catch (error) {
    return buildSessionLinkExecutionFailure({
      status: "session_link_created_audit_insert_failed",
      operation: "execute_cstp_session_link_create",
      preparedLink,
      linkRecord,
      adminEvent: finalizedAdminEvent,
      error,
      primaryMutationCommitted: true,
      auditMutationCommitted: false,
    });
  }
}

async function executeCstpSessionLinkArchive(input = {}, options = {}) {
  const preparedLink = archiveCstpSessionLink(input);
  const config = resolveExecutionConfig(options);
  const fetchImpl = resolveFetchImplementation(options);

  if (!config.ok) {
    return buildSessionLinkExecutionFailure({
      status: "configuration_failed",
      operation: "execute_cstp_session_link_archive",
      preparedLink,
      error: config.error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  let linkRecord;

  try {
    const linkRows = await supabaseRest(
      `${preparedLink.link.table}?${buildEqQuery(preparedLink.link.match)}&select=*`,
      config.value,
      {
        method: "PATCH",
        body: preparedLink.link.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    linkRecord = normalizeSingleRow(linkRows, CSTP_TABLES.testSessions);
  } catch (error) {
    return buildSessionLinkExecutionFailure({
      status: "session_link_archive_failed",
      operation: "execute_cstp_session_link_archive",
      preparedLink,
      error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  const finalizedAdminEvent = finalizeSessionLinkAdminEvent({
    preparedAdminEvent: preparedLink.adminEvent,
    linkRecord,
  });

  try {
    const adminEventRows = await supabaseRest(
      `${CSTP_TABLES.adminEvents}?select=*`,
      config.value,
      {
        method: "POST",
        body: finalizedAdminEvent.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    return deepFreeze({
      ok: true,
      status: "session_link_archived",
      operation: "execute_cstp_session_link_archive",
      link: {
        record: linkRecord,
        prepared: preparedLink.link,
      },
      adminEvent: {
        status: "inserted",
        record: normalizeSingleRow(adminEventRows, CSTP_TABLES.adminEvents),
        payload: finalizedAdminEvent,
      },
      transaction: {
        atomic: false,
        primaryMutationCommitted: true,
        auditMutationCommitted: true,
      },
      internalOnly: true,
      mutatesGrowSession: false,
    });
  } catch (error) {
    return buildSessionLinkExecutionFailure({
      status: "session_link_archived_audit_insert_failed",
      operation: "execute_cstp_session_link_archive",
      preparedLink,
      linkRecord,
      adminEvent: finalizedAdminEvent,
      error,
      primaryMutationCommitted: true,
      auditMutationCommitted: false,
    });
  }
}

async function executePreparedCstpTestMutation({
  preparedTest,
  options,
  operation,
  method,
  path,
  successStatus,
  primaryFailureStatus,
  auditFailureStatus,
}) {
  const config = resolveExecutionConfig(options);
  const fetchImpl = resolveFetchImplementation(options);

  if (!config.ok) {
    return buildTestExecutionFailure({
      status: "configuration_failed",
      operation,
      preparedTest,
      error: config.error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  let testRecord;

  try {
    const testRows = await supabaseRest(path, config.value, {
      method,
      body: preparedTest.test.record,
      prefer: "return=representation",
      fetchImpl,
    });

    testRecord = normalizeSingleRow(testRows, CSTP_TABLES.tests);
  } catch (error) {
    return buildTestExecutionFailure({
      status: primaryFailureStatus,
      operation,
      preparedTest,
      error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  const finalizedAdminEvent = finalizeTestAdminEvent({
    preparedAdminEvent: preparedTest.adminEvent,
    testRecord,
  });

  if (finalizedAdminEvent.deferred) {
    return deepFreeze({
      ok: true,
      status: `${successStatus}_audit_deferred`,
      operation,
      test: {
        record: testRecord,
        prepared: preparedTest.test,
      },
      adminEvent: {
        status: "deferred",
        payload: finalizedAdminEvent,
        reason: finalizedAdminEvent.reason,
      },
      transaction: {
        atomic: false,
        primaryMutationCommitted: true,
        auditMutationCommitted: false,
        auditDeferred: true,
      },
      internalOnly: true,
    });
  }

  try {
    const adminEventRows = await supabaseRest(
      `${CSTP_TABLES.adminEvents}?select=*`,
      config.value,
      {
        method: "POST",
        body: finalizedAdminEvent.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    return deepFreeze({
      ok: true,
      status: successStatus,
      operation,
      test: {
        record: testRecord,
        prepared: preparedTest.test,
      },
      adminEvent: {
        status: "inserted",
        record: normalizeSingleRow(adminEventRows, CSTP_TABLES.adminEvents),
        payload: finalizedAdminEvent,
      },
      transaction: {
        atomic: false,
        primaryMutationCommitted: true,
        auditMutationCommitted: true,
      },
      internalOnly: true,
    });
  } catch (error) {
    return buildTestExecutionFailure({
      status: auditFailureStatus,
      operation,
      preparedTest,
      testRecord,
      adminEvent: finalizedAdminEvent,
      error,
      primaryMutationCommitted: true,
      auditMutationCommitted: false,
    });
  }
}

function getCstpSupabaseRuntimeConfig(env = process.env) {
  return {
    supabaseUrl: getEnv(
      "CANNAKAN_SUPABASE_URL",
      getEnv("SUPABASE_URL", getEnv("NEXT_PUBLIC_SUPABASE_URL", "", env), env),
      env,
    ),
    supabaseServiceRoleKey: getEnv(
      "CANNAKAN_SUPABASE_SERVICE_ROLE_KEY",
      getEnv(
        "SUPABASE_SERVICE_ROLE_KEY",
        getEnv("SUPABASE_SERVICE_KEY", getEnv("SUPABASE_SECRET_KEY", "", env), env),
        env,
      ),
      env,
    ),
  };
}

async function executeCstpRequestCreation(input = {}, options = {}) {
  const preparedRequest = createCstpRequest(input);
  const config = resolveExecutionConfig(options);
  const fetchImpl = resolveFetchImplementation(options);

  if (!config.ok) {
    return buildExecutionFailure({
      status: "configuration_failed",
      operation: "execute_cstp_request_create",
      preparedRequest,
      error: config.error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  let createdRequest;

  try {
    const requestRows = await supabaseRest(
      `${preparedRequest.request.table}?select=*`,
      config.value,
      {
        method: "POST",
        body: preparedRequest.request.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    createdRequest = normalizeSingleRow(requestRows, CSTP_TABLES.requests);
  } catch (error) {
    return buildExecutionFailure({
      status: "request_insert_failed",
      operation: "execute_cstp_request_create",
      preparedRequest,
      error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  const finalizedAdminEvent = finalizeRequestCreationAdminEvent({
    preparedAdminEvent: preparedRequest.adminEvent,
    createdRequest,
  });

  if (finalizedAdminEvent.deferred) {
    return deepFreeze({
      ok: true,
      status: "request_created_audit_deferred",
      operation: "execute_cstp_request_create",
      request: {
        record: createdRequest,
        prepared: preparedRequest.request,
      },
      adminEvent: {
        status: "deferred",
        payload: finalizedAdminEvent,
        reason: finalizedAdminEvent.reason,
      },
      transaction: {
        atomic: false,
        primaryMutationCommitted: true,
        auditMutationCommitted: false,
        auditDeferred: true,
      },
      internalOnly: true,
    });
  }

  try {
    const adminEventRows = await supabaseRest(
      `${CSTP_TABLES.adminEvents}?select=*`,
      config.value,
      {
        method: "POST",
        body: finalizedAdminEvent.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    return deepFreeze({
      ok: true,
      status: "request_created",
      operation: "execute_cstp_request_create",
      request: {
        record: createdRequest,
        prepared: preparedRequest.request,
      },
      adminEvent: {
        status: "inserted",
        record: normalizeSingleRow(adminEventRows, CSTP_TABLES.adminEvents),
        payload: finalizedAdminEvent,
      },
      transaction: {
        atomic: false,
        primaryMutationCommitted: true,
        auditMutationCommitted: true,
      },
      internalOnly: true,
    });
  } catch (error) {
    return buildExecutionFailure({
      status: "request_created_audit_insert_failed",
      operation: "execute_cstp_request_create",
      preparedRequest,
      createdRequest,
      adminEvent: finalizedAdminEvent,
      error,
      primaryMutationCommitted: true,
      auditMutationCommitted: false,
    });
  }
}

async function executeCstpRequestStatusUpdate(input = {}, options = {}) {
  const preparedRequest = updateCstpRequestStatus(input);
  const requestId = preparedRequest.requestId;
  const config = resolveExecutionConfig(options);
  const fetchImpl = resolveFetchImplementation(options);

  if (!config.ok) {
    return buildExecutionFailure({
      status: "configuration_failed",
      operation: "execute_cstp_request_status_update",
      preparedRequest,
      error: config.error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  let updatedRequest;

  try {
    const requestRows = await supabaseRest(
      `${preparedRequest.request.table}?id=eq.${encodeURIComponent(requestId)}&select=*`,
      config.value,
      {
        method: "PATCH",
        body: preparedRequest.request.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    updatedRequest = normalizeSingleRow(requestRows, CSTP_TABLES.requests);
  } catch (error) {
    return buildExecutionFailure({
      status: "request_status_update_failed",
      operation: "execute_cstp_request_status_update",
      preparedRequest,
      error,
      primaryMutationCommitted: false,
      auditMutationCommitted: false,
    });
  }

  const finalizedAdminEvent = finalizeRequestAdminEvent({
    preparedAdminEvent: preparedRequest.adminEvent,
    requestRecord: updatedRequest,
  });

  if (finalizedAdminEvent.deferred) {
    return deepFreeze({
      ok: true,
      status: "request_status_updated_audit_deferred",
      operation: "execute_cstp_request_status_update",
      request: {
        record: updatedRequest,
        prepared: preparedRequest.request,
      },
      transition: preparedRequest.transition,
      adminEvent: {
        status: "deferred",
        payload: finalizedAdminEvent,
        reason: finalizedAdminEvent.reason,
      },
      transaction: {
        atomic: false,
        primaryMutationCommitted: true,
        auditMutationCommitted: false,
        auditDeferred: true,
      },
      internalOnly: true,
    });
  }

  try {
    const adminEventRows = await supabaseRest(
      `${CSTP_TABLES.adminEvents}?select=*`,
      config.value,
      {
        method: "POST",
        body: finalizedAdminEvent.record,
        prefer: "return=representation",
        fetchImpl,
      },
    );

    return deepFreeze({
      ok: true,
      status: "request_status_updated",
      operation: "execute_cstp_request_status_update",
      request: {
        record: updatedRequest,
        prepared: preparedRequest.request,
      },
      transition: preparedRequest.transition,
      adminEvent: {
        status: "inserted",
        record: normalizeSingleRow(adminEventRows, CSTP_TABLES.adminEvents),
        payload: finalizedAdminEvent,
      },
      transaction: {
        atomic: false,
        primaryMutationCommitted: true,
        auditMutationCommitted: true,
      },
      internalOnly: true,
    });
  } catch (error) {
    return buildExecutionFailure({
      status: "request_status_updated_audit_insert_failed",
      operation: "execute_cstp_request_status_update",
      preparedRequest,
      createdRequest: updatedRequest,
      adminEvent: finalizedAdminEvent,
      error,
      primaryMutationCommitted: true,
      auditMutationCommitted: false,
    });
  }
}

function finalizeRequestCreationAdminEvent({
  preparedAdminEvent,
  createdRequest,
}) {
  return finalizeRequestAdminEvent({
    preparedAdminEvent,
    requestRecord: createdRequest,
    fallbackEventType: CSTP_ADMIN_EVENT_TYPES.requestCreated,
  });
}

function finalizeRequestAdminEvent({
  preparedAdminEvent,
  requestRecord,
  fallbackEventType = CSTP_ADMIN_EVENT_TYPES.requestStatusChanged,
}) {
  const requestId = requestRecord?.id || preparedAdminEvent?.requestId;
  const cstpTestId =
    preparedAdminEvent?.record?.cstp_test_id || preparedAdminEvent?.cstpTestId;
  const adminUserId =
    preparedAdminEvent?.record?.admin_user_id || preparedAdminEvent?.adminUserId;
  const eventNotes =
    preparedAdminEvent?.record?.event_notes || preparedAdminEvent?.eventNotes;
  const metadata = {
    ...extractPreparedAdminEventMetadata(preparedAdminEvent),
    requestId,
  };

  return prepareRequestAdminEvent({
    eventType:
      preparedAdminEvent?.record?.event_type ||
      preparedAdminEvent?.eventType ||
      fallbackEventType,
    requestId,
    cstpTestId,
    adminUserId,
    eventNotes,
    metadata,
    createdAt: preparedAdminEvent?.record?.created_at,
  });
}

function finalizeTestAdminEvent({ preparedAdminEvent, testRecord }) {
  const cstpTestId =
    testRecord?.id ||
    preparedAdminEvent?.record?.cstp_test_id ||
    preparedAdminEvent?.cstpTestId;
  const adminUserId =
    preparedAdminEvent?.record?.admin_user_id || preparedAdminEvent?.adminUserId;
  const requestId =
    testRecord?.request_id ||
    preparedAdminEvent?.requestId ||
    extractPreparedAdminEventMetadata(preparedAdminEvent).requestId;
  const eventNotes =
    preparedAdminEvent?.record?.event_notes || preparedAdminEvent?.eventNotes;
  const metadata = {
    ...extractPreparedAdminEventMetadata(preparedAdminEvent),
    cstpTestId,
    requestId,
    sourceId: testRecord?.source_id,
    status: testRecord?.status,
  };

  return prepareTestAdminEvent({
    eventType:
      preparedAdminEvent?.record?.event_type ||
      preparedAdminEvent?.eventType ||
      CSTP_ADMIN_EVENT_TYPES.testStatusChanged,
    cstpTestId,
    adminUserId,
    requestId,
    eventNotes,
    metadata,
    createdAt: preparedAdminEvent?.record?.created_at,
  });
}

function finalizeSessionLinkAdminEvent({ preparedAdminEvent, linkRecord }) {
  const cstpTestId =
    linkRecord?.cstp_test_id ||
    preparedAdminEvent?.record?.cstp_test_id ||
    preparedAdminEvent?.cstpTestId;
  const sessionId =
    linkRecord?.session_id ||
    preparedAdminEvent?.metadata?.sessionId ||
    preparedAdminEvent?.sessionId;
  const cstpTestSessionId =
    linkRecord?.id ||
    preparedAdminEvent?.metadata?.cstpTestSessionId ||
    preparedAdminEvent?.cstpTestSessionId;
  const adminUserId =
    preparedAdminEvent?.record?.admin_user_id || preparedAdminEvent?.adminUserId;
  const eventNotes =
    preparedAdminEvent?.record?.event_notes || preparedAdminEvent?.eventNotes;
  const metadata = {
    ...extractPreparedAdminEventMetadata(preparedAdminEvent),
    cstpTestId,
    sessionId,
    cstpTestSessionId,
    kanLabel: linkRecord?.kan_label,
    includedInReport: linkRecord?.included_in_report,
    archived: linkRecord?.archived,
    mutatesGrowSession: false,
  };

  return prepareSessionLinkAdminEvent({
    eventType:
      preparedAdminEvent?.record?.event_type ||
      preparedAdminEvent?.eventType ||
      CSTP_ADMIN_EVENT_TYPES.sessionLinked,
    cstpTestId,
    sessionId,
    cstpTestSessionId,
    adminUserId,
    eventNotes,
    metadata,
    createdAt: preparedAdminEvent?.record?.created_at,
  });
}

async function supabaseRest(path, config, options = {}) {
  const {
    method = "GET",
    body = undefined,
    prefer = "",
    fetchImpl = globalThis.fetch,
  } = options;

  if (typeof fetchImpl !== "function") {
    throw new CstpExecutionError("A fetch implementation is required.", {
      code: "CSTP_EXECUTION_FETCH_UNAVAILABLE",
    });
  }

  const response = await fetchImpl(`${config.supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new CstpExecutionError(
      `Supabase REST ${method} ${path} failed with ${response.status}.`,
      {
        code: "CSTP_SUPABASE_REST_FAILED",
        method,
        path,
        status: response.status,
        responseText: text,
      },
    );
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function resolveExecutionConfig(options = {}) {
  const config = options.config || getCstpSupabaseRuntimeConfig(options.env);

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    return {
      ok: false,
      error: new CstpExecutionError(
        "CSTP Supabase execution is not configured.",
        {
          code: "CSTP_EXECUTION_NOT_CONFIGURED",
          supabaseUrlAvailable: Boolean(config.supabaseUrl),
          supabaseServiceRoleKeyAvailable: Boolean(
            config.supabaseServiceRoleKey,
          ),
        },
      ),
    };
  }

  return {
    ok: true,
    value: config,
  };
}

function resolveFetchImplementation(options = {}) {
  return options.fetchImpl || globalThis.fetch;
}

function normalizeSingleRow(rows, tableName) {
  if (Array.isArray(rows) && rows.length === 1) {
    return rows[0];
  }

  if (Array.isArray(rows) && rows.length > 1) {
    throw new CstpExecutionError(
      `Expected one row from ${tableName}, received ${rows.length}.`,
      {
        code: "CSTP_EXECUTION_UNEXPECTED_ROW_COUNT",
        tableName,
        rowCount: rows.length,
      },
    );
  }

  if (rows && !Array.isArray(rows)) {
    return rows;
  }

  throw new CstpExecutionError(`No row returned from ${tableName}.`, {
    code: "CSTP_EXECUTION_NO_ROW_RETURNED",
    tableName,
  });
}

async function resolveExistingCstpSessionLinks({
  input,
  normalizedInput,
  config,
  fetchImpl,
}) {
  if (Array.isArray(input.existingLinks)) {
    return input.existingLinks;
  }

  return loadActiveCstpSessionLinksForDuplicateCheck({
    cstpTestId: normalizedInput.cstpTestId,
    sessionId: normalizedInput.sessionId,
    config,
    fetchImpl,
  });
}

async function loadActiveCstpSessionLinksForDuplicateCheck({
  cstpTestId,
  sessionId,
  config,
  fetchImpl,
}) {
  return supabaseRest(
    `${CSTP_TABLES.testSessions}?cstp_test_id=eq.${encodeURIComponent(cstpTestId)}&session_id=eq.${encodeURIComponent(sessionId)}&archived=is.false&select=id,cstp_test_id,session_id,archived`,
    config,
    {
      method: "GET",
      fetchImpl,
    },
  );
}

function buildEqQuery(match = {}) {
  return Object.entries(match)
    .map(
      ([fieldName, value]) =>
        `${encodeURIComponent(fieldName)}=eq.${encodeURIComponent(value)}`,
    )
    .join("&");
}

function buildExecutionFailure({
  status,
  operation,
  preparedRequest,
  createdRequest = null,
  adminEvent = null,
  error,
  primaryMutationCommitted,
  auditMutationCommitted,
}) {
  return deepFreeze({
    ok: false,
    status,
    operation,
    request: {
      record: createdRequest,
      prepared: preparedRequest?.request || null,
    },
    adminEvent: {
      status: auditMutationCommitted ? "inserted" : "failed",
      payload: adminEvent,
    },
    error: normalizeExecutionError(error),
    transaction: {
      atomic: false,
      primaryMutationCommitted,
      auditMutationCommitted,
    },
    internalOnly: true,
  });
}

function buildTestExecutionFailure({
  status,
  operation,
  preparedTest,
  testRecord = null,
  adminEvent = null,
  error,
  primaryMutationCommitted,
  auditMutationCommitted,
}) {
  return deepFreeze({
    ok: false,
    status,
    operation,
    test: {
      record: testRecord,
      prepared: preparedTest?.test || null,
    },
    adminEvent: {
      status: auditMutationCommitted ? "inserted" : "failed",
      payload: adminEvent,
    },
    error: normalizeExecutionError(error),
    transaction: {
      atomic: false,
      primaryMutationCommitted,
      auditMutationCommitted,
    },
    internalOnly: true,
  });
}

function buildSessionLinkExecutionFailure({
  status,
  operation,
  preparedLink = null,
  linkRecord = null,
  adminEvent = null,
  error,
  httpStatus = null,
  primaryMutationCommitted,
  auditMutationCommitted,
}) {
  return deepFreeze({
    ok: false,
    status,
    operation,
    link: {
      record: linkRecord,
      prepared: preparedLink?.link || null,
    },
    adminEvent: {
      status: auditMutationCommitted ? "inserted" : "failed",
      payload: adminEvent,
    },
    error: normalizeExecutionError(error),
    httpStatus,
    transaction: {
      atomic: false,
      primaryMutationCommitted,
      auditMutationCommitted,
    },
    internalOnly: true,
    mutatesGrowSession: false,
  });
}

function normalizeExecutionError(error) {
  return {
    name: error?.name || "Error",
    code: error?.code || "CSTP_EXECUTION_UNKNOWN_ERROR",
    message: error?.message || String(error),
    details: error?.details || {},
  };
}

function extractPreparedAdminEventMetadata(preparedAdminEvent) {
  if (preparedAdminEvent?.metadata?.details) {
    return preparedAdminEvent.metadata.details;
  }

  return preparedAdminEvent?.metadata || {};
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
  executeCstpRequestCreation,
  executeCstpRequestStatusUpdate,
  executeCstpSessionLinkArchive,
  executeCstpSessionLinkCreation,
  executeCstpTestArchive,
  executeCstpTestCreation,
  executeCstpTestStatusUpdate,
  finalizeSessionLinkAdminEvent,
  finalizeRequestAdminEvent,
  finalizeRequestCreationAdminEvent,
  finalizeTestAdminEvent,
  getCstpSupabaseRuntimeConfig,
  loadActiveCstpSessionLinksForDuplicateCheck,
  supabaseRest,
};
