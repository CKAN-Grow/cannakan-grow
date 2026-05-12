"use strict";

const { assertInternalCstpOperation } = require("./lifecycle");
const { CstpAdminEventValidationError } = require("./errors");

/*
 * Internal admin event helper layer.
 *
 * Append-only audit history matters because future reports and certifications
 * will depend on a trustworthy internal chain of request, test, and session
 * linkage decisions. Centralized normalization keeps event vocabulary, actor
 * references, timestamps, and linkage metadata consistent before any helper can
 * write to the database.
 *
 * This module prepares event objects only. It does not call Supabase, mutate
 * CSTP records, expose public reads, or create report/certification state.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CSTP_ADMIN_EVENT_CATEGORIES = Object.freeze({
  request: "request",
  test: "test",
  sessionLink: "session_link",
  archive: "archive",
  note: "note",
});

const CSTP_ADMIN_EVENT_TYPES = Object.freeze({
  requestCreated: "request_created",
  requestStatusChanged: "request_status_changed",
  requestArchived: "request_archived",
  seedsReceived: "seeds_received",
  testCreated: "test_created",
  testStatusChanged: "test_status_changed",
  sessionLinked: "session_linked",
  sessionLinkArchived: "session_link_archived",
  noteAdded: "note_added",
  testArchived: "test_archived",
});

const CSTP_ADMIN_EVENT_DEFINITIONS = deepFreeze({
  request_created: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.request,
    requiredMetadataIds: ["requestId"],
  },
  request_status_changed: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.request,
    requiredMetadataIds: ["requestId"],
  },
  request_archived: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.archive,
    requiredMetadataIds: ["requestId"],
  },
  seeds_received: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.request,
    requiredMetadataIds: ["requestId"],
  },
  test_created: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.test,
    requiredMetadataIds: [],
  },
  test_status_changed: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.test,
    requiredMetadataIds: [],
  },
  session_linked: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.sessionLink,
    requiredMetadataIds: ["sessionId"],
  },
  session_link_archived: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.sessionLink,
    requiredMetadataIds: ["sessionId"],
  },
  note_added: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.note,
    requiredMetadataIds: [],
  },
  test_archived: {
    category: CSTP_ADMIN_EVENT_CATEGORIES.archive,
    requiredMetadataIds: [],
  },
});

function getCstpAdminEventTypes() {
  return Object.values(CSTP_ADMIN_EVENT_TYPES);
}

function isKnownCstpAdminEventType(eventType) {
  return Object.prototype.hasOwnProperty.call(
    CSTP_ADMIN_EVENT_DEFINITIONS,
    eventType
  );
}

function getCstpAdminEventDefinition(eventType) {
  validateKnownEventType(eventType);
  return CSTP_ADMIN_EVENT_DEFINITIONS[eventType];
}

function validateAdminEventPayload(input) {
  const normalizedInput = normalizeAdminEventInput(input);
  const definition = getCstpAdminEventDefinition(normalizedInput.eventType);

  validateRequiredUuid("cstpTestId", normalizedInput.cstpTestId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validateOptionalUuid("requestId", normalizedInput.requestId);
  validateOptionalUuid("sessionId", normalizedInput.sessionId);
  validateOptionalUuid(
    "cstpTestSessionId",
    normalizedInput.cstpTestSessionId
  );
  validateEventNotes(normalizedInput.eventNotes);
  validateTimestamp(normalizedInput.createdAt);
  validateMetadata(normalizedInput.metadata);
  validateAdminEventEntityLinkage(normalizedInput, definition);

  return true;
}

function buildCstpAdminEventMetadata(input = {}) {
  const normalizedInput = normalizeAdminEventInput(input);
  const definition = getCstpAdminEventDefinition(normalizedInput.eventType);
  const metadata = {
    internalOnly: true,
    appendOnly: true,
    category: definition.category,
    requestId: normalizedInput.requestId,
    sessionId: normalizedInput.sessionId,
    cstpTestSessionId: normalizedInput.cstpTestSessionId,
    actor: {
      adminUserId: normalizedInput.adminUserId,
    },
    details: normalizedInput.metadata,
  };

  return deepFreeze(pruneUndefined(metadata));
}

function buildCstpAdminEventPayload(input = {}) {
  assertInternalCstpOperation(input);
  validateAdminEventPayload(input);

  const normalizedInput = normalizeAdminEventInput(input);
  const metadata = buildCstpAdminEventMetadata(normalizedInput);

  return deepFreeze({
    record: {
      cstp_test_id: normalizedInput.cstpTestId,
      admin_user_id: normalizedInput.adminUserId,
      event_type: normalizedInput.eventType,
      event_notes: normalizedInput.eventNotes,
      created_at: normalizeTimestamp(normalizedInput.createdAt),
    },
    metadata,
    appendOnly: true,
    internalOnly: true,
  });
}

function prepareAppendOnlyCstpAdminEvent(input = {}) {
  return buildCstpAdminEventPayload(input);
}

function logCstpAdminEvent(input = {}) {
  /*
   * Naming bridge for future services. For v1 helper implementation this only
   * prepares a validated event payload; it intentionally does not persist.
   */
  return prepareAppendOnlyCstpAdminEvent(input);
}

function validateAdminEventEntityLinkage(input, definition) {
  definition.requiredMetadataIds.forEach((fieldName) => {
    if (!input[fieldName]) {
      throw new CstpAdminEventValidationError(
        `CSTP admin event "${input.eventType}" requires "${fieldName}" metadata.`,
        {
          code: "CSTP_ADMIN_EVENT_MISSING_ENTITY_LINK",
          eventType: input.eventType,
          fieldName,
        }
      );
    }
  });

  return true;
}

function normalizeAdminEventInput(input = {}) {
  if (!isPlainObject(input)) {
    throw new CstpAdminEventValidationError(
      "CSTP admin event input must be an object.",
      {
        code: "CSTP_ADMIN_EVENT_INPUT_INVALID",
      }
    );
  }

  return {
    eventType: normalizeText(input.eventType),
    cstpTestId: normalizeNullableText(input.cstpTestId),
    adminUserId: normalizeNullableText(input.adminUserId),
    requestId: normalizeNullableText(input.requestId),
    sessionId: normalizeNullableText(input.sessionId),
    cstpTestSessionId: normalizeNullableText(input.cstpTestSessionId),
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: normalizeMetadata(input.metadata),
    createdAt: input.createdAt || new Date(),
    public: input.public,
    publicRead: input.publicRead,
  };
}

function validateKnownEventType(eventType) {
  if (!eventType || !isKnownCstpAdminEventType(eventType)) {
    throw new CstpAdminEventValidationError(
      `Unknown CSTP admin event type "${eventType}".`,
      {
        code: "CSTP_ADMIN_EVENT_TYPE_UNKNOWN",
        eventType,
        allowedEventTypes: getCstpAdminEventTypes(),
      }
    );
  }
}

function validateRequiredUuid(fieldName, value) {
  if (!value || !UUID_PATTERN.test(value)) {
    throw new CstpAdminEventValidationError(
      `CSTP admin event field "${fieldName}" must be a valid UUID.`,
      {
        code: "CSTP_ADMIN_EVENT_UUID_REQUIRED",
        fieldName,
      }
    );
  }
}

function validateOptionalUuid(fieldName, value) {
  if (value !== null && value !== undefined && !UUID_PATTERN.test(value)) {
    throw new CstpAdminEventValidationError(
      `CSTP admin event field "${fieldName}" must be a valid UUID when provided.`,
      {
        code: "CSTP_ADMIN_EVENT_UUID_INVALID",
        fieldName,
      }
    );
  }
}

function validateEventNotes(eventNotes) {
  if (eventNotes !== null && typeof eventNotes !== "string") {
    throw new CstpAdminEventValidationError(
      "CSTP admin event notes must be text when provided.",
      {
        code: "CSTP_ADMIN_EVENT_NOTES_INVALID",
      }
    );
  }
}

function validateTimestamp(value) {
  if (!Number.isNaN(new Date(value).getTime())) {
    return true;
  }

  throw new CstpAdminEventValidationError(
    "CSTP admin event timestamp must be a valid date or timestamp.",
    {
      code: "CSTP_ADMIN_EVENT_TIMESTAMP_INVALID",
    }
  );
}

function validateMetadata(metadata) {
  if (!isPlainObject(metadata)) {
    throw new CstpAdminEventValidationError(
      "CSTP admin event metadata must be a plain object.",
      {
        code: "CSTP_ADMIN_EVENT_METADATA_INVALID",
      }
    );
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

function normalizeMetadata(metadata) {
  return metadata === undefined ? {} : metadata;
}

function normalizeTimestamp(value) {
  return new Date(value).toISOString();
}

function pruneUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
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
  CSTP_ADMIN_EVENT_CATEGORIES,
  CSTP_ADMIN_EVENT_DEFINITIONS,
  CSTP_ADMIN_EVENT_TYPES,
  buildCstpAdminEventMetadata,
  buildCstpAdminEventPayload,
  getCstpAdminEventDefinition,
  getCstpAdminEventTypes,
  isKnownCstpAdminEventType,
  logCstpAdminEvent,
  prepareAppendOnlyCstpAdminEvent,
  validateAdminEventEntityLinkage,
  validateAdminEventPayload,
};
