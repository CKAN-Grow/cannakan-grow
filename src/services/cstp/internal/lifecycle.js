"use strict";

const { createCstpNotImplementedError } = require("./errors");

/*
 * Internal lifecycle validation placeholders.
 *
 * Request transition planning:
 * - received -> accepted
 * - received -> declined
 * - accepted -> awaiting_seeds
 * - awaiting_seeds -> accepted
 * - any active state -> archived
 *
 * Test transition planning:
 * - pending -> active
 * - active -> completed
 * - pending/active/completed -> archived
 */

function validateRequestStatusTransition() {
  throw createCstpNotImplementedError("validateRequestStatusTransition");
}

function validateTestStatusTransition() {
  throw createCstpNotImplementedError("validateTestStatusTransition");
}

function assertInternalCstpOperation() {
  throw createCstpNotImplementedError("assertInternalCstpOperation");
}

module.exports = {
  validateRequestStatusTransition,
  validateTestStatusTransition,
  assertInternalCstpOperation,
};
