"use strict";

const { CSTP_TEST_STATUSES } = require("./constants");
const {
  CSTP_ADMIN_EVENT_TYPES,
  buildCstpAdminEventPayload,
} = require("./admin-events");
const {
  assertInternalCstpOperation,
  validateTestStatusTransition,
} = require("./lifecycle");
const { CstpTestValidationError } = require("./errors");

/*
 * Internal CSTP test orchestration helper layer.
 *
 * CSTP tests remain internal-only parent orchestration records. They may
 * reference request/source context, and they will reference Grow sessions later
 * through the session-link table, but they never own or mutate Grow sessions.
 *
 * Lifecycle validation is mandatory before any status update payload is
 * prepared. Audit event preparation is mandatory because future reports and
 * certifications need consistent internal history before publication exists.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateCstpTestCreationPayload(input = {}) {
  const normalizedInput = normalizeCstpTestCreationPayload(input);

  assertInternalCstpOperation(normalizedInput);
  validateOptionalUuid("testId", normalizedInput.testId);
  validateOptionalUuid("sourceId", normalizedInput.sourceId);
  validateOptionalUuid("requestId", normalizedInput.requestId);
  validateOptionalUuid("createdBy", normalizedInput.createdBy);
  validateOptionalStatusForCreation(normalizedInput.status);
  validateOptionalBoolean("archived", normalizedInput.archived);
  validateOptionalTimestamp("startedAt", normalizedInput.startedAt);
  validateOptionalTimestamp("completedAt", normalizedInput.completedAt);
  validateInternalState(normalizedInput.internalState);
  validatePlainMetadata(normalizedInput.metadata);

  return true;
}

function normalizeCstpTestCreationPayload(input = {}) {
  assertPlainObject(input, "CSTP test creation payload must be an object.");

  return {
    testId: normalizeNullableText(input.testId || input.id),
    sourceId: normalizeNullableText(input.sourceId),
    requestId: normalizeNullableText(input.requestId),
    status: normalizeNullableText(input.status) || "pending",
    internalState: normalizeNullableText(input.internalState),
    createdBy: normalizeNullableText(input.createdBy || input.adminUserId),
    archived: input.archived === undefined ? false : input.archived,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    createdAt: input.createdAt,
    public: input.public,
    publicRead: input.publicRead,
  };
}

function prepareCstpTestInsertPayload(input = {}) {
  const normalizedInput = normalizeCstpTestCreationPayload(input);
  validateCstpTestCreationPayload(normalizedInput);

  return deepFreeze({
    table: "cstp_tests",
    record: pruneNullish({
      id: normalizedInput.testId,
      source_id: normalizedInput.sourceId,
      request_id: normalizedInput.requestId,
      status: normalizedInput.status,
      internal_state: normalizedInput.internalState,
      created_by: normalizedInput.createdBy,
      archived: normalizedInput.archived,
      started_at: normalizeOptionalTimestamp(normalizedInput.startedAt),
      completed_at: normalizeOptionalTimestamp(normalizedInput.completedAt),
    }),
    internalOnly: true,
  });
}

function createCstpTest(input = {}) {
  const normalizedInput = normalizeCstpTestCreationPayload(input);
  const insertPayload = prepareCstpTestInsertPayload(normalizedInput);
  const adminEvent = prepareTestAdminEvent({
    eventType: CSTP_ADMIN_EVENT_TYPES.testCreated,
    cstpTestId: normalizedInput.testId,
    adminUserId: normalizedInput.createdBy,
    requestId: normalizedInput.requestId,
    eventNotes: normalizedInput.eventNotes,
    metadata: {
      ...normalizedInput.metadata,
      sourceId: normalizedInput.sourceId,
      requestId: normalizedInput.requestId,
      status: normalizedInput.status,
      internalState: normalizedInput.internalState,
    },
    createdAt: normalizedInput.createdAt,
  });

  return deepFreeze({
    operation: "prepare_cstp_test_create",
    test: insertPayload,
    adminEvent,
    dbExecution: "deferred",
    internalOnly: true,
  });
}

function validateCstpTestStatusUpdatePayload(input = {}) {
  const normalizedInput = normalizeCstpTestStatusUpdatePayload(input);

  assertInternalCstpOperation(normalizedInput);
  validateRequiredUuid("testId", normalizedInput.testId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validateTestStatusTransition(
    normalizedInput.currentStatus,
    normalizedInput.nextStatus,
  );
  validateInternalState(normalizedInput.internalState);
  validateOptionalTimestamp("startedAt", normalizedInput.startedAt);
  validateOptionalTimestamp("completedAt", normalizedInput.completedAt);
  validateOptionalTimestamp("updatedAt", normalizedInput.updatedAt);
  validatePlainMetadata(normalizedInput.metadata);

  return true;
}

function normalizeCstpTestStatusUpdatePayload(input = {}) {
  assertPlainObject(
    input,
    "CSTP test status update payload must be an object.",
  );

  return {
    testId: normalizeNullableText(input.testId || input.id || input.cstpTestId),
    adminUserId: normalizeNullableText(input.adminUserId),
    currentStatus: normalizeNullableText(input.currentStatus),
    nextStatus: normalizeNullableText(input.nextStatus || input.status),
    internalState: normalizeNullableText(input.internalState),
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    updatedAt: input.updatedAt || new Date(),
    public: input.public,
    publicRead: input.publicRead,
  };
}

function prepareCstpTestStatusUpdatePayload(input = {}) {
  const normalizedInput = normalizeCstpTestStatusUpdatePayload(input);
  validateCstpTestStatusUpdatePayload(normalizedInput);

  const transition = validateTestStatusTransition(
    normalizedInput.currentStatus,
    normalizedInput.nextStatus,
  );
  const eventType = getTestStatusEventType(
    normalizedInput.currentStatus,
    normalizedInput.nextStatus,
  );
  const derivedTimestamps = getDerivedLifecycleTimestamps(normalizedInput);
  const adminEvent = prepareTestAdminEvent({
    eventType,
    cstpTestId: normalizedInput.testId,
    adminUserId: normalizedInput.adminUserId,
    eventNotes: normalizedInput.eventNotes,
    metadata: {
      ...normalizedInput.metadata,
      currentStatus: normalizedInput.currentStatus,
      nextStatus: normalizedInput.nextStatus,
      internalState: normalizedInput.internalState,
    },
    createdAt: normalizedInput.updatedAt,
  });

  return deepFreeze({
    operation: "prepare_cstp_test_status_update",
    testId: normalizedInput.testId,
    test: {
      table: "cstp_tests",
      match: {
        id: normalizedInput.testId,
      },
      record: pruneNullish({
        status: normalizedInput.nextStatus,
        internal_state: normalizedInput.internalState,
        archived: normalizedInput.nextStatus === "archived" ? true : undefined,
        started_at: derivedTimestamps.startedAt,
        completed_at: derivedTimestamps.completedAt,
        updated_at: normalizeTimestamp(normalizedInput.updatedAt),
      }),
      internalOnly: true,
    },
    transition,
    adminEvent,
    dbExecution: "deferred",
    internalOnly: true,
  });
}

function updateCstpTestStatus(input = {}) {
  return prepareCstpTestStatusUpdatePayload(input);
}

function archiveCstpTest(input = {}) {
  return prepareCstpTestStatusUpdatePayload({
    ...input,
    nextStatus: "archived",
  });
}

function prepareTestAdminEvent(input = {}) {
  const normalizedInput = {
    eventType: normalizeNullableText(input.eventType),
    cstpTestId: normalizeNullableText(input.cstpTestId || input.testId),
    adminUserId: normalizeNullableText(input.adminUserId),
    requestId: normalizeNullableText(input.requestId),
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    createdAt: input.createdAt,
  };

  validateRequiredUuid("cstpTestId", normalizedInput.cstpTestId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validateOptionalUuid("requestId", normalizedInput.requestId);
  validatePlainMetadata(normalizedInput.metadata);
  validateOptionalTimestamp("createdAt", normalizedInput.createdAt);

  return buildCstpAdminEventPayload({
    eventType: normalizedInput.eventType,
    cstpTestId: normalizedInput.cstpTestId,
    adminUserId: normalizedInput.adminUserId,
    requestId: normalizedInput.requestId,
    eventNotes: normalizedInput.eventNotes,
    metadata: normalizedInput.metadata,
    createdAt: normalizedInput.createdAt,
  });
}

function getTestStatusEventType(currentStatus, nextStatus) {
  if (nextStatus === "archived") {
    return CSTP_ADMIN_EVENT_TYPES.testArchived;
  }

  return CSTP_ADMIN_EVENT_TYPES.testStatusChanged;
}

function getDerivedLifecycleTimestamps(input) {
  return {
    startedAt:
      input.nextStatus === "active"
        ? normalizeTimestamp(input.startedAt || input.updatedAt)
        : normalizeOptionalTimestamp(input.startedAt),
    completedAt:
      input.nextStatus === "completed"
        ? normalizeTimestamp(input.completedAt || input.updatedAt)
        : normalizeOptionalTimestamp(input.completedAt),
  };
}

function validateOptionalStatusForCreation(status) {
  if (!CSTP_TEST_STATUSES.includes(status)) {
    throw new CstpTestValidationError(`Unknown CSTP test status "${status}".`, {
      code: "CSTP_TEST_STATUS_UNKNOWN",
      status,
      allowedStatuses: CSTP_TEST_STATUSES.slice(),
    });
  }

  if (status !== "pending") {
    throw new CstpTestValidationError(
      "CSTP test creation must start in the pending state.",
      {
        code: "CSTP_TEST_CREATION_STATUS_INVALID",
        status,
      },
    );
  }
}

function validateRequiredUuid(fieldName, value) {
  if (!value || !UUID_PATTERN.test(value)) {
    throw new CstpTestValidationError(
      `CSTP test field "${fieldName}" must be a valid UUID.`,
      {
        code: "CSTP_TEST_UUID_REQUIRED",
        fieldName,
      },
    );
  }
}

function validateOptionalUuid(fieldName, value) {
  if (value !== null && value !== undefined && !UUID_PATTERN.test(value)) {
    throw new CstpTestValidationError(
      `CSTP test field "${fieldName}" must be a valid UUID when provided.`,
      {
        code: "CSTP_TEST_UUID_INVALID",
        fieldName,
      },
    );
  }
}

function validateOptionalBoolean(fieldName, value) {
  if (typeof value !== "boolean") {
    throw new CstpTestValidationError(
      `CSTP test field "${fieldName}" must be a boolean.`,
      {
        code: "CSTP_TEST_BOOLEAN_INVALID",
        fieldName,
      },
    );
  }
}

function validateInternalState(value) {
  if (value !== null && typeof value !== "string") {
    throw new CstpTestValidationError(
      "CSTP test internal_state must be text when provided.",
      {
        code: "CSTP_TEST_INTERNAL_STATE_INVALID",
      },
    );
  }
}

function validateOptionalTimestamp(fieldName, value) {
  if (value === null || value === undefined) {
    return;
  }

  if (Number.isNaN(new Date(value).getTime())) {
    throw new CstpTestValidationError(
      `CSTP test field "${fieldName}" must be a valid timestamp when provided.`,
      {
        code: "CSTP_TEST_TIMESTAMP_INVALID",
        fieldName,
      },
    );
  }
}

function validatePlainMetadata(metadata) {
  if (!isPlainObject(metadata)) {
    throw new CstpTestValidationError(
      "CSTP test metadata must be a plain object.",
      {
        code: "CSTP_TEST_METADATA_INVALID",
      },
    );
  }
}

function assertPlainObject(value, message) {
  if (!isPlainObject(value)) {
    throw new CstpTestValidationError(message, {
      code: "CSTP_TEST_INPUT_INVALID",
    });
  }
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value);
  return normalizedValue === "" || normalizedValue === undefined
    ? null
    : normalizedValue;
}

function normalizeTimestamp(value) {
  return new Date(value).toISOString();
}

function normalizeOptionalTimestamp(value) {
  return value === null || value === undefined ? null : normalizeTimestamp(value);
}

function pruneNullish(value) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entryValue]) => entryValue !== null && entryValue !== undefined,
    ),
  );
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
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
  archiveCstpTest,
  createCstpTest,
  getTestStatusEventType,
  normalizeCstpTestCreationPayload,
  normalizeCstpTestStatusUpdatePayload,
  prepareCstpTestInsertPayload,
  prepareCstpTestStatusUpdatePayload,
  prepareTestAdminEvent,
  updateCstpTestStatus,
  validateCstpTestCreationPayload,
  validateCstpTestStatusUpdatePayload,
};
