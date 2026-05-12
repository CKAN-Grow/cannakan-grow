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
const auth = require("./auth");
const adminEvents = require("./admin-events");
const requests = require("./requests");
const tests = require("./tests");
const sessionLinks = require("./session-links");
const execution = require("./execution");
const immutableReportValidator = require("./immutable-report-validator");
const immutableSnapshotAssembler = require("./immutable-snapshot-assembler");
const immutableSnapshotPersistenceOrchestrator = require("./immutable-snapshot-persistence-orchestrator");
const immutableReportLineageOrchestrator = require("./immutable-report-lineage-orchestrator");

module.exports = {
  constants,
  errors,
  lifecycle,
  auth,
  adminEvents,
  requests,
  tests,
  sessionLinks,
  execution,
  immutableReportValidator,
  immutableSnapshotAssembler,
  immutableSnapshotPersistenceOrchestrator,
  immutableReportLineageOrchestrator,
  ...constants,
  ...errors,
  ...lifecycle,
  ...auth,
  ...adminEvents,
  ...requests,
  ...tests,
  ...sessionLinks,
  ...execution,
  ...immutableReportValidator,
  ...immutableSnapshotAssembler,
  ...immutableSnapshotPersistenceOrchestrator,
  ...immutableReportLineageOrchestrator,
};
