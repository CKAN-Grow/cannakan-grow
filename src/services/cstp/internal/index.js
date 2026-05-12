"use strict";

/*
 * Internal CSTP helper module surface.
 *
 * This file is not wired into APIs, UI routes, public reads, or app flows.
 * It exists only to centralize future internal CSTP backend helper work.
 */

const constants = require("./constants");
const errors = require("./errors");
const lifecycle = require("./lifecycle");
const adminEvents = require("./admin-events");
const requests = require("./requests");
const tests = require("./tests");
const sessionLinks = require("./session-links");

module.exports = {
  constants,
  errors,
  lifecycle,
  adminEvents,
  requests,
  tests,
  sessionLinks,
  ...constants,
  ...errors,
  ...lifecycle,
  ...adminEvents,
  ...requests,
  ...tests,
  ...sessionLinks,
};
