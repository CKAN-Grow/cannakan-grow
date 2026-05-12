"use strict";

const { createCstpNotImplementedError } = require("./errors");

/*
 * Internal CSTP test orchestration helper placeholders.
 *
 * CSTP tests are parent orchestration records only. Future helpers should not
 * mutate grow session behavior, create reports, or publish certification state.
 */

function createCstpTest() {
  throw createCstpNotImplementedError("createCstpTest");
}

function updateCstpTestStatus() {
  throw createCstpNotImplementedError("updateCstpTestStatus");
}

function archiveCstpTest() {
  throw createCstpNotImplementedError("archiveCstpTest");
}

module.exports = {
  createCstpTest,
  updateCstpTestStatus,
  archiveCstpTest,
};
