"use strict";

const { createCstpNotImplementedError } = require("./errors");

/*
 * Internal CSTP request helper placeholders.
 *
 * Future helpers should centralize request intake and status transitions without
 * creating public reads, APIs, UI integration, or certification/report behavior.
 */

function createCstpRequest() {
  throw createCstpNotImplementedError("createCstpRequest");
}

function updateCstpRequestStatus() {
  throw createCstpNotImplementedError("updateCstpRequestStatus");
}

function archiveCstpRequest() {
  throw createCstpNotImplementedError("archiveCstpRequest");
}

module.exports = {
  createCstpRequest,
  updateCstpRequestStatus,
  archiveCstpRequest,
};
