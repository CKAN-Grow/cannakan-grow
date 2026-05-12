"use strict";

const { CSTP_REQUEST_STATUSES } = require("./constants");
const {
  CSTP_ADMIN_EVENT_TYPES,
  buildCstpAdminEventPayload,
  getCstpAdminEventTypes,
  isKnownCstpAdminEventType,
} = require("./admin-events");
const {
  assertInternalCstpOperation,
  validateRequestStatusTransition,
} = require("./lifecycle");
const { CstpRequestValidationError } = require("./errors");

/*
 * Internal CSTP request helper layer.
 *
 * These helpers prepare and validate request payloads only. They do not call
 * Supabase, create APIs, expose public reads, or wire into app flows.
 *
 * Lifecycle validation must happen before status update payloads are prepared.
 * Meaningful request actions must also prepare an admin-event payload or an
 * explicit deferred event intent, so audit history is never silently skipped.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateCstpRequestCreationPayload(input = {}) {
  const normalizedInput = normalizeCstpRequestCreationPayload(input);

  assertInternalCstpOperation(normalizedInput);
  validateOptionalUuid("requestId", normalizedInput.requestId);
  validateOptionalUuid("sourceId", normalizedInput.sourceId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validateOptionalUuid("cstpTestId", normalizedInput.cstpTestId);
  validateOptionalEmail(normalizedInput.contactEmail);
  validateOptionalPositiveInteger(
    "requestedSeedCount",
    normalizedInput.requestedSeedCount,
  );
  validateOptionalStatusForCreation(normalizedInput.status);
  validateOptionalBoolean("archived", normalizedInput.archived);
  validatePlainMetadata(normalizedInput.metadata);

  return true;
}

function normalizeCstpRequestCreationPayload(input = {}) {
  assertPlainObject(input, "CSTP request creation payload must be an object.");

  return {
    requestId: normalizeNullableText(input.requestId || input.id),
    sourceId: normalizeNullableText(input.sourceId),
    contactName: normalizeNullableText(input.contactName),
    contactEmail: normalizeNullableText(input.contactEmail),
    website: normalizeNullableText(input.website),
    varietyName: normalizeNullableText(input.varietyName),
    seedType: normalizeNullableText(input.seedType),
    breederName: normalizeNullableText(input.breederName),
    batchLot: normalizeNullableText(input.batchLot),
    requestedSeedCount: normalizeOptionalInteger(input.requestedSeedCount),
    requestMessage: normalizeNullableText(input.requestMessage),
    internalNotes: normalizeNullableText(input.internalNotes),
    status: normalizeNullableText(input.status) || "received",
    archived: input.archived === undefined ? false : input.archived,
    adminUserId: normalizeNullableText(input.adminUserId),
    cstpTestId: normalizeNullableText(input.cstpTestId),
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    createdAt: input.createdAt,
    public: input.public,
    publicRead: input.publicRead,
  };
}

function prepareCstpRequestInsertPayload(input = {}) {
  const normalizedInput = normalizeCstpRequestCreationPayload(input);
  validateCstpRequestCreationPayload(normalizedInput);

  return deepFreeze({
    table: "cstp_requests",
    record: pruneNullish({
      id: normalizedInput.requestId,
      source_id: normalizedInput.sourceId,
      contact_name: normalizedInput.contactName,
      contact_email: normalizedInput.contactEmail,
      website: normalizedInput.website,
      variety_name: normalizedInput.varietyName,
      seed_type: normalizedInput.seedType,
      breeder_name: normalizedInput.breederName,
      batch_lot: normalizedInput.batchLot,
      requested_seed_count: normalizedInput.requestedSeedCount,
      request_message: normalizedInput.requestMessage,
      status: normalizedInput.status,
      internal_notes: normalizedInput.internalNotes,
      archived: normalizedInput.archived,
    }),
    internalOnly: true,
  });
}

function createCstpRequest(input = {}) {
  const normalizedInput = normalizeCstpRequestCreationPayload(input);
  const insertPayload = prepareCstpRequestInsertPayload(normalizedInput);
  const adminEvent = prepareRequestAdminEvent({
    eventType: CSTP_ADMIN_EVENT_TYPES.requestCreated,
    requestId: normalizedInput.requestId,
    cstpTestId: normalizedInput.cstpTestId,
    adminUserId: normalizedInput.adminUserId,
    eventNotes: normalizedInput.eventNotes,
    metadata: {
      ...normalizedInput.metadata,
      sourceId: normalizedInput.sourceId,
      varietyName: normalizedInput.varietyName,
      seedType: normalizedInput.seedType,
      batchLot: normalizedInput.batchLot,
    },
    createdAt: normalizedInput.createdAt,
  });

  return deepFreeze({
    operation: "prepare_cstp_request_create",
    request: insertPayload,
    adminEvent,
    dbExecution: "deferred",
    internalOnly: true,
  });
}

function validateCstpRequestStatusUpdatePayload(input = {}) {
  const normalizedInput = normalizeCstpRequestStatusUpdatePayload(input);

  assertInternalCstpOperation(normalizedInput);
  validateRequiredUuid("requestId", normalizedInput.requestId);
  validateOptionalUuid("cstpTestId", normalizedInput.cstpTestId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validateRequestStatusTransition(
    normalizedInput.currentStatus,
    normalizedInput.nextStatus,
  );
  validatePlainMetadata(normalizedInput.metadata);

  return true;
}

function normalizeCstpRequestStatusUpdatePayload(input = {}) {
  assertPlainObject(
    input,
    "CSTP request status update payload must be an object.",
  );

  return {
    requestId: normalizeNullableText(input.requestId || input.id),
    cstpTestId: normalizeNullableText(input.cstpTestId),
    adminUserId: normalizeNullableText(input.adminUserId),
    currentStatus: normalizeNullableText(input.currentStatus),
    nextStatus: normalizeNullableText(input.nextStatus || input.status),
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    updatedAt: input.updatedAt || new Date(),
    public: input.public,
    publicRead: input.publicRead,
  };
}

function prepareCstpRequestStatusUpdatePayload(input = {}) {
  const normalizedInput = normalizeCstpRequestStatusUpdatePayload(input);
  validateCstpRequestStatusUpdatePayload(normalizedInput);

  const transition = validateRequestStatusTransition(
    normalizedInput.currentStatus,
    normalizedInput.nextStatus,
  );
  const eventType = getRequestStatusEventType(
    normalizedInput.currentStatus,
    normalizedInput.nextStatus,
  );
  const adminEvent = prepareRequestAdminEvent({
    eventType,
    requestId: normalizedInput.requestId,
    cstpTestId: normalizedInput.cstpTestId,
    adminUserId: normalizedInput.adminUserId,
    eventNotes: normalizedInput.eventNotes,
    metadata: {
      ...normalizedInput.metadata,
      currentStatus: normalizedInput.currentStatus,
      nextStatus: normalizedInput.nextStatus,
    },
    createdAt: normalizedInput.updatedAt,
  });

  return deepFreeze({
    operation: "prepare_cstp_request_status_update",
    requestId: normalizedInput.requestId,
    request: {
      table: "cstp_requests",
      match: {
        id: normalizedInput.requestId,
      },
      record: pruneNullish({
        status: normalizedInput.nextStatus,
        archived: normalizedInput.nextStatus === "archived" ? true : undefined,
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

function updateCstpRequestStatus(input = {}) {
  return prepareCstpRequestStatusUpdatePayload(input);
}

function archiveCstpRequest(input = {}) {
  return prepareCstpRequestStatusUpdatePayload({
    ...input,
    nextStatus: "archived",
  });
}

function prepareRequestAdminEvent(input = {}) {
  const normalizedInput = {
    eventType: normalizeNullableText(input.eventType),
    requestId: normalizeNullableText(input.requestId),
    cstpTestId: normalizeNullableText(input.cstpTestId),
    adminUserId: normalizeNullableText(input.adminUserId),
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    createdAt: input.createdAt,
  };

  validateKnownAdminEventType(normalizedInput.eventType);
  validatePlainMetadata(normalizedInput.metadata);
  validateOptionalUuid("requestId", normalizedInput.requestId);
  validateOptionalUuid("cstpTestId", normalizedInput.cstpTestId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validateOptionalTimestamp(normalizedInput.createdAt);

  if (normalizedInput.requestId && normalizedInput.cstpTestId) {
    return buildCstpAdminEventPayload(normalizedInput);
  }

  return deepFreeze({
    eventType: normalizedInput.eventType,
    requestId: normalizedInput.requestId,
    cstpTestId: normalizedInput.cstpTestId,
    adminUserId: normalizedInput.adminUserId,
    eventNotes: normalizedInput.eventNotes,
    metadata: {
      ...normalizedInput.metadata,
      requestId: normalizedInput.requestId,
    },
    appendOnly: true,
    internalOnly: true,
    readyForPersistence: false,
    deferred: true,
    reason:
      "cstp_admin_events requires both requestId metadata and cstpTestId before persistence.",
  });
}

function validateKnownAdminEventType(eventType) {
  if (!eventType || !isKnownCstpAdminEventType(eventType)) {
    throw new CstpRequestValidationError(
      `Unknown CSTP request admin event type "${eventType}".`,
      {
        code: "CSTP_REQUEST_ADMIN_EVENT_TYPE_UNKNOWN",
        eventType,
        allowedEventTypes: getCstpAdminEventTypes(),
      },
    );
  }
}

function getRequestStatusEventType(currentStatus, nextStatus) {
  if (nextStatus === "archived") {
    return CSTP_ADMIN_EVENT_TYPES.requestArchived;
  }

  if (currentStatus === "awaiting_seeds" && nextStatus === "accepted") {
    return CSTP_ADMIN_EVENT_TYPES.seedsReceived;
  }

  return CSTP_ADMIN_EVENT_TYPES.requestStatusChanged;
}

function validateOptionalStatusForCreation(status) {
  if (!CSTP_REQUEST_STATUSES.includes(status)) {
    throw new CstpRequestValidationError(
      `Unknown CSTP request status "${status}".`,
      {
        code: "CSTP_REQUEST_STATUS_UNKNOWN",
        status,
        allowedStatuses: CSTP_REQUEST_STATUSES.slice(),
      },
    );
  }

  if (status !== "received") {
    throw new CstpRequestValidationError(
      "CSTP request creation must start in the received state.",
      {
        code: "CSTP_REQUEST_CREATION_STATUS_INVALID",
        status,
      },
    );
  }
}

function validateRequiredUuid(fieldName, value) {
  if (!value || !UUID_PATTERN.test(value)) {
    throw new CstpRequestValidationError(
      `CSTP request field "${fieldName}" must be a valid UUID.`,
      {
        code: "CSTP_REQUEST_UUID_REQUIRED",
        fieldName,
      },
    );
  }
}

function validateOptionalUuid(fieldName, value) {
  if (value !== null && value !== undefined && !UUID_PATTERN.test(value)) {
    throw new CstpRequestValidationError(
      `CSTP request field "${fieldName}" must be a valid UUID when provided.`,
      {
        code: "CSTP_REQUEST_UUID_INVALID",
        fieldName,
      },
    );
  }
}

function validateOptionalEmail(value) {
  if (value === null || value === undefined) {
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new CstpRequestValidationError(
      "CSTP request contact email must be a valid email address when provided.",
      {
        code: "CSTP_REQUEST_EMAIL_INVALID",
      },
    );
  }
}

function validateOptionalPositiveInteger(fieldName, value) {
  if (value === null || value === undefined) {
    return;
  }

  if (!Number.isInteger(value) || value <= 0) {
    throw new CstpRequestValidationError(
      `CSTP request field "${fieldName}" must be a positive integer when provided.`,
      {
        code: "CSTP_REQUEST_POSITIVE_INTEGER_INVALID",
        fieldName,
      },
    );
  }
}

function validateOptionalBoolean(fieldName, value) {
  if (typeof value !== "boolean") {
    throw new CstpRequestValidationError(
      `CSTP request field "${fieldName}" must be a boolean.`,
      {
        code: "CSTP_REQUEST_BOOLEAN_INVALID",
        fieldName,
      },
    );
  }
}

function validatePlainMetadata(metadata) {
  if (!isPlainObject(metadata)) {
    throw new CstpRequestValidationError(
      "CSTP request metadata must be a plain object.",
      {
        code: "CSTP_REQUEST_METADATA_INVALID",
      },
    );
  }
}

function validateOptionalTimestamp(value) {
  if (value === null || value === undefined) {
    return;
  }

  if (Number.isNaN(new Date(value).getTime())) {
    throw new CstpRequestValidationError(
      "CSTP request admin event timestamp must be valid when provided.",
      {
        code: "CSTP_REQUEST_EVENT_TIMESTAMP_INVALID",
      },
    );
  }
}

function assertPlainObject(value, message) {
  if (!isPlainObject(value)) {
    throw new CstpRequestValidationError(message, {
      code: "CSTP_REQUEST_INPUT_INVALID",
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

function normalizeOptionalInteger(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return typeof value === "number" ? value : Number(value);
}

function normalizeTimestamp(value) {
  return new Date(value).toISOString();
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
  archiveCstpRequest,
  createCstpRequest,
  getRequestStatusEventType,
  normalizeCstpRequestCreationPayload,
  normalizeCstpRequestStatusUpdatePayload,
  prepareCstpRequestInsertPayload,
  prepareCstpRequestStatusUpdatePayload,
  prepareRequestAdminEvent,
  updateCstpRequestStatus,
  validateCstpRequestCreationPayload,
  validateCstpRequestStatusUpdatePayload,
};
