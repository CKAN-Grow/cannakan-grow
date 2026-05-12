"use strict";

const { createCstpNotImplementedError } = require("./errors");

/*
 * Internal admin event helper placeholders.
 *
 * Future implementation should treat admin events as append-only workflow history.
 * This module must stay internal-only and must not expose public CSTP reads.
 */

function buildCstpAdminEventPayload() {
  throw createCstpNotImplementedError("buildCstpAdminEventPayload");
}

function logCstpAdminEvent() {
  throw createCstpNotImplementedError("logCstpAdminEvent");
}

module.exports = {
  buildCstpAdminEventPayload,
  logCstpAdminEvent,
};
