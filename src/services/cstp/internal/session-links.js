"use strict";

const {
  CSTP_ADMIN_EVENT_TYPES,
  buildCstpAdminEventPayload,
} = require("./admin-events");
const { CSTP_TABLES } = require("./constants");
const { assertInternalCstpOperation } = require("./lifecycle");
const { CstpSessionLinkValidationError } = require("./errors");

/*
 * Internal CSTP session linkage helper layer.
 *
 * CSTP session links are external relationship records from cstp_tests to
 * grow_sessions. They do not transfer ownership and must never mutate session
 * stage, timeline, metrics, notes, reminders, media, partitions, visibility, or
 * any other Grow session behavior.
 *
 * Duplicate link protection matters because one session should not represent
 * the same CSTP test run twice. The database unique constraint is the final
 * guard, while these helpers fail early when existing relationship context is
 * supplied. Audit consistency is also required so future reports can trace why
 * sessions were included or archived without modifying session history.
 */

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertGrowSessionLinkCompatibility(input = {}) {
  const normalizedInput = normalizeCstpSessionLinkPayload(input);

  assertInternalCstpOperation(normalizedInput);
  validateRequiredUuid("cstpTestId", normalizedInput.cstpTestId);
  validateRequiredUuid("sessionId", normalizedInput.sessionId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validateOptionalUuid("linkId", normalizedInput.linkId);
  validateOptionalText("kanLabel", normalizedInput.kanLabel);
  validateOptionalBoolean("includedInReport", normalizedInput.includedInReport);
  validateOptionalBoolean("archived", normalizedInput.archived);
  validatePlainMetadata(normalizedInput.metadata);
  assertNoDuplicateCstpSessionLink({
    cstpTestId: normalizedInput.cstpTestId,
    sessionId: normalizedInput.sessionId,
    existingLinks: normalizedInput.existingLinks,
  });

  return true;
}

function validateCstpSessionLinkPayload(input = {}) {
  assertGrowSessionLinkCompatibility(input);
  return true;
}

function normalizeCstpSessionLinkPayload(input = {}) {
  assertPlainObject(input, "CSTP session link payload must be an object.");

  return {
    linkId: normalizeNullableText(input.linkId || input.id),
    cstpTestId: normalizeNullableText(input.cstpTestId || input.testId),
    sessionId: normalizeNullableText(input.sessionId),
    adminUserId: normalizeNullableText(input.adminUserId),
    kanLabel: normalizeNullableText(input.kanLabel),
    includedInReport:
      input.includedInReport === undefined ? true : input.includedInReport,
    archived: input.archived === undefined ? false : input.archived,
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    existingLinks: Array.isArray(input.existingLinks) ? input.existingLinks : [],
    createdAt: input.createdAt,
    public: input.public,
    publicRead: input.publicRead,
  };
}

function prepareCstpSessionLinkInsertPayload(input = {}) {
  const normalizedInput = normalizeCstpSessionLinkPayload(input);
  validateCstpSessionLinkPayload(normalizedInput);

  return deepFreeze({
    table: CSTP_TABLES.testSessions,
    record: pruneNullish({
      id: normalizedInput.linkId,
      cstp_test_id: normalizedInput.cstpTestId,
      session_id: normalizedInput.sessionId,
      kan_label: normalizedInput.kanLabel,
      included_in_report: normalizedInput.includedInReport,
      archived: normalizedInput.archived,
    }),
    uniqueConstraint: {
      fields: ["cstp_test_id", "session_id"],
      name: "cstp_test_sessions_test_session_key",
    },
    internalOnly: true,
    mutatesGrowSession: false,
  });
}

function linkGrowSessionToCstpTest(input = {}) {
  const normalizedInput = normalizeCstpSessionLinkPayload(input);
  const insertPayload = prepareCstpSessionLinkInsertPayload(normalizedInput);
  const adminEvent = prepareSessionLinkAdminEvent({
    eventType: CSTP_ADMIN_EVENT_TYPES.sessionLinked,
    cstpTestId: normalizedInput.cstpTestId,
    sessionId: normalizedInput.sessionId,
    cstpTestSessionId: normalizedInput.linkId,
    adminUserId: normalizedInput.adminUserId,
    eventNotes: normalizedInput.eventNotes,
    metadata: {
      ...normalizedInput.metadata,
      kanLabel: normalizedInput.kanLabel,
      includedInReport: normalizedInput.includedInReport,
    },
    createdAt: normalizedInput.createdAt,
  });

  return deepFreeze({
    operation: "prepare_cstp_session_link_create",
    link: insertPayload,
    adminEvent,
    dbExecution: "deferred",
    internalOnly: true,
    mutatesGrowSession: false,
  });
}

function validateCstpSessionLinkArchivePayload(input = {}) {
  const normalizedInput = normalizeCstpSessionLinkArchivePayload(input);

  assertInternalCstpOperation(normalizedInput);
  validateOptionalUuid("linkId", normalizedInput.linkId);
  validateRequiredUuid("cstpTestId", normalizedInput.cstpTestId);
  validateRequiredUuid("sessionId", normalizedInput.sessionId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validatePlainMetadata(normalizedInput.metadata);

  return true;
}

function normalizeCstpSessionLinkArchivePayload(input = {}) {
  assertPlainObject(
    input,
    "CSTP session link archive payload must be an object.",
  );

  return {
    linkId: normalizeNullableText(input.linkId || input.id),
    cstpTestId: normalizeNullableText(input.cstpTestId || input.testId),
    sessionId: normalizeNullableText(input.sessionId),
    adminUserId: normalizeNullableText(input.adminUserId),
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    updatedAt: input.updatedAt || new Date(),
    public: input.public,
    publicRead: input.publicRead,
  };
}

function prepareCstpSessionLinkArchivePayload(input = {}) {
  const normalizedInput = normalizeCstpSessionLinkArchivePayload(input);
  validateCstpSessionLinkArchivePayload(normalizedInput);

  const adminEvent = prepareSessionLinkAdminEvent({
    eventType: CSTP_ADMIN_EVENT_TYPES.sessionLinkArchived,
    cstpTestId: normalizedInput.cstpTestId,
    sessionId: normalizedInput.sessionId,
    cstpTestSessionId: normalizedInput.linkId,
    adminUserId: normalizedInput.adminUserId,
    eventNotes: normalizedInput.eventNotes,
    metadata: normalizedInput.metadata,
    createdAt: normalizedInput.updatedAt,
  });

  return deepFreeze({
    operation: "prepare_cstp_session_link_archive",
    link: {
      table: CSTP_TABLES.testSessions,
      match: pruneNullish({
        id: normalizedInput.linkId,
        cstp_test_id: normalizedInput.cstpTestId,
        session_id: normalizedInput.sessionId,
      }),
      record: {
        archived: true,
      },
      internalOnly: true,
      mutatesGrowSession: false,
    },
    adminEvent,
    dbExecution: "deferred",
    internalOnly: true,
    mutatesGrowSession: false,
  });
}

function archiveCstpSessionLink(input = {}) {
  return prepareCstpSessionLinkArchivePayload(input);
}

function prepareSessionLinkAdminEvent(input = {}) {
  const normalizedInput = {
    eventType: normalizeNullableText(input.eventType),
    cstpTestId: normalizeNullableText(input.cstpTestId || input.testId),
    sessionId: normalizeNullableText(input.sessionId),
    cstpTestSessionId: normalizeNullableText(
      input.cstpTestSessionId || input.linkId,
    ),
    adminUserId: normalizeNullableText(input.adminUserId),
    eventNotes: normalizeNullableText(input.eventNotes),
    metadata: input.metadata === undefined ? {} : input.metadata,
    createdAt: input.createdAt,
  };

  validateRequiredUuid("cstpTestId", normalizedInput.cstpTestId);
  validateRequiredUuid("sessionId", normalizedInput.sessionId);
  validateOptionalUuid("cstpTestSessionId", normalizedInput.cstpTestSessionId);
  validateOptionalUuid("adminUserId", normalizedInput.adminUserId);
  validatePlainMetadata(normalizedInput.metadata);
  validateOptionalTimestamp("createdAt", normalizedInput.createdAt);

  return buildCstpAdminEventPayload({
    eventType: normalizedInput.eventType,
    cstpTestId: normalizedInput.cstpTestId,
    sessionId: normalizedInput.sessionId,
    cstpTestSessionId: normalizedInput.cstpTestSessionId,
    adminUserId: normalizedInput.adminUserId,
    eventNotes: normalizedInput.eventNotes,
    metadata: {
      ...normalizedInput.metadata,
      mutatesGrowSession: false,
    },
    createdAt: normalizedInput.createdAt,
  });
}

function assertNoDuplicateCstpSessionLink({
  cstpTestId,
  sessionId,
  existingLinks = [],
}) {
  if (hasDuplicateCstpSessionLink(existingLinks, cstpTestId, sessionId)) {
    throw new CstpSessionLinkValidationError(
      "This Grow session is already linked to the specified CSTP test.",
      {
        code: "CSTP_SESSION_LINK_DUPLICATE",
        cstpTestId,
        sessionId,
      },
    );
  }

  return true;
}

function hasDuplicateCstpSessionLink(existingLinks, cstpTestId, sessionId) {
  if (!Array.isArray(existingLinks)) {
    throw new CstpSessionLinkValidationError(
      "Existing CSTP session links must be provided as an array when supplied.",
      {
        code: "CSTP_SESSION_LINK_EXISTING_LINKS_INVALID",
      },
    );
  }

  return existingLinks.some((link) => {
    if (!link || typeof link !== "object") {
      return false;
    }

    const existingTestId = normalizeNullableText(
      link.cstpTestId || link.cstp_test_id || link.testId,
    );
    const existingSessionId = normalizeNullableText(
      link.sessionId || link.session_id,
    );
    const archived = Boolean(link.archived);

    return (
      !archived &&
      existingTestId === cstpTestId &&
      existingSessionId === sessionId
    );
  });
}

function validateRequiredUuid(fieldName, value) {
  if (!value || !UUID_PATTERN.test(value)) {
    throw new CstpSessionLinkValidationError(
      `CSTP session link field "${fieldName}" must be a valid UUID.`,
      {
        code: "CSTP_SESSION_LINK_UUID_REQUIRED",
        fieldName,
      },
    );
  }
}

function validateOptionalUuid(fieldName, value) {
  if (value !== null && value !== undefined && !UUID_PATTERN.test(value)) {
    throw new CstpSessionLinkValidationError(
      `CSTP session link field "${fieldName}" must be a valid UUID when provided.`,
      {
        code: "CSTP_SESSION_LINK_UUID_INVALID",
        fieldName,
      },
    );
  }
}

function validateOptionalText(fieldName, value) {
  if (value !== null && typeof value !== "string") {
    throw new CstpSessionLinkValidationError(
      `CSTP session link field "${fieldName}" must be text when provided.`,
      {
        code: "CSTP_SESSION_LINK_TEXT_INVALID",
        fieldName,
      },
    );
  }
}

function validateOptionalBoolean(fieldName, value) {
  if (typeof value !== "boolean") {
    throw new CstpSessionLinkValidationError(
      `CSTP session link field "${fieldName}" must be a boolean.`,
      {
        code: "CSTP_SESSION_LINK_BOOLEAN_INVALID",
        fieldName,
      },
    );
  }
}

function validatePlainMetadata(metadata) {
  if (!isPlainObject(metadata)) {
    throw new CstpSessionLinkValidationError(
      "CSTP session link metadata must be a plain object.",
      {
        code: "CSTP_SESSION_LINK_METADATA_INVALID",
      },
    );
  }
}

function validateOptionalTimestamp(fieldName, value) {
  if (value === null || value === undefined) {
    return;
  }

  if (Number.isNaN(new Date(value).getTime())) {
    throw new CstpSessionLinkValidationError(
      `CSTP session link field "${fieldName}" must be a valid timestamp when provided.`,
      {
        code: "CSTP_SESSION_LINK_TIMESTAMP_INVALID",
        fieldName,
      },
    );
  }
}

function assertPlainObject(value, message) {
  if (!isPlainObject(value)) {
    throw new CstpSessionLinkValidationError(message, {
      code: "CSTP_SESSION_LINK_INPUT_INVALID",
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
  archiveCstpSessionLink,
  assertGrowSessionLinkCompatibility,
  assertNoDuplicateCstpSessionLink,
  hasDuplicateCstpSessionLink,
  linkGrowSessionToCstpTest,
  normalizeCstpSessionLinkArchivePayload,
  normalizeCstpSessionLinkPayload,
  prepareCstpSessionLinkArchivePayload,
  prepareCstpSessionLinkInsertPayload,
  prepareSessionLinkAdminEvent,
  validateCstpSessionLinkArchivePayload,
  validateCstpSessionLinkPayload,
};
