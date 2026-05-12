"use strict";

const {
  CSTP_REQUEST_STATUSES,
  CSTP_TEST_STATUSES,
} = require("./constants");
const { CstpLifecycleValidationError } = require("./errors");

/*
 * Internal lifecycle validation engine.
 *
 * CSTP workflow rules are centralized here so future request/test helpers,
 * admin APIs, UI actions, and automation cannot drift into conflicting state
 * behavior. Invalid transitions fail early before any database mutation can
 * occur, which protects later report and certification integrity.
 *
 * Request transitions:
 * - received -> accepted
 * - received -> declined
 * - received -> archived
 * - accepted -> awaiting_seeds
 * - accepted -> archived
 * - awaiting_seeds -> accepted
 * - awaiting_seeds -> archived
 * - declined -> archived
 * - archived -> no v1 transitions
 *
 * Test transitions:
 * - pending -> active
 * - pending -> archived
 * - active -> completed
 * - active -> archived
 * - completed -> archived
 * - archived -> no v1 transitions
 */

function freezeTransitionMap(map) {
  Object.keys(map).forEach((status) => Object.freeze(map[status]));
  return Object.freeze(map);
}

const REQUEST_STATUS_TRANSITIONS = freezeTransitionMap({
  received: ["accepted", "declined", "archived"],
  accepted: ["awaiting_seeds", "archived"],
  awaiting_seeds: ["accepted", "archived"],
  declined: ["archived"],
  archived: [],
});

const TEST_STATUS_TRANSITIONS = freezeTransitionMap({
  pending: ["active", "archived"],
  active: ["completed", "archived"],
  completed: ["archived"],
  archived: [],
});

function getAllowedRequestStatusTransitions(currentStatus) {
  assertKnownStatus("request", currentStatus, CSTP_REQUEST_STATUSES);
  return REQUEST_STATUS_TRANSITIONS[currentStatus].slice();
}

function getAllowedTestStatusTransitions(currentStatus) {
  assertKnownStatus("test", currentStatus, CSTP_TEST_STATUSES);
  return TEST_STATUS_TRANSITIONS[currentStatus].slice();
}

function isRequestStatusTransitionAllowed(currentStatus, nextStatus) {
  assertKnownStatus("request", currentStatus, CSTP_REQUEST_STATUSES);
  assertKnownStatus("request", nextStatus, CSTP_REQUEST_STATUSES);
  return REQUEST_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

function isTestStatusTransitionAllowed(currentStatus, nextStatus) {
  assertKnownStatus("test", currentStatus, CSTP_TEST_STATUSES);
  assertKnownStatus("test", nextStatus, CSTP_TEST_STATUSES);
  return TEST_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

function validateRequestStatusTransition(currentStatus, nextStatus) {
  return validateStatusTransition({
    entityType: "request",
    currentStatus,
    nextStatus,
    allowedStatuses: CSTP_REQUEST_STATUSES,
    transitionMap: REQUEST_STATUS_TRANSITIONS,
  });
}

function validateTestStatusTransition(currentStatus, nextStatus) {
  return validateStatusTransition({
    entityType: "test",
    currentStatus,
    nextStatus,
    allowedStatuses: CSTP_TEST_STATUSES,
    transitionMap: TEST_STATUS_TRANSITIONS,
  });
}

function assertInternalCstpOperation(context = {}) {
  if (context.public === true || context.publicRead === true) {
    throw new CstpLifecycleValidationError(
      "CSTP v1 lifecycle helpers are internal-only and cannot validate public operations.",
      {
        code: "CSTP_PUBLIC_OPERATION_NOT_ALLOWED",
        context,
      }
    );
  }

  return true;
}

function validateStatusTransition({
  entityType,
  currentStatus,
  nextStatus,
  allowedStatuses,
  transitionMap,
}) {
  assertKnownStatus(entityType, currentStatus, allowedStatuses);
  assertKnownStatus(entityType, nextStatus, allowedStatuses);

  const allowedNextStatuses = transitionMap[currentStatus];

  if (!allowedNextStatuses.includes(nextStatus)) {
    throw new CstpLifecycleValidationError(
      `Invalid CSTP ${entityType} status transition from "${currentStatus}" to "${nextStatus}".`,
      {
        code: "CSTP_INVALID_STATUS_TRANSITION",
        entityType,
        currentStatus,
        nextStatus,
        allowedNextStatuses: allowedNextStatuses.slice(),
      }
    );
  }

  return {
    entityType,
    currentStatus,
    nextStatus,
    allowed: true,
  };
}

function assertKnownStatus(entityType, status, allowedStatuses) {
  if (!allowedStatuses.includes(status)) {
    throw new CstpLifecycleValidationError(
      `Unknown CSTP ${entityType} status "${status}".`,
      {
        code: "CSTP_UNKNOWN_STATUS",
        entityType,
        status,
        allowedStatuses: allowedStatuses.slice(),
      }
    );
  }
}

module.exports = {
  REQUEST_STATUS_TRANSITIONS,
  TEST_STATUS_TRANSITIONS,
  getAllowedRequestStatusTransitions,
  getAllowedTestStatusTransitions,
  isRequestStatusTransitionAllowed,
  isTestStatusTransitionAllowed,
  validateRequestStatusTransition,
  validateTestStatusTransition,
  assertInternalCstpOperation,
};
