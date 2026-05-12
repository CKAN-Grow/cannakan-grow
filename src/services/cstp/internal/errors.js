"use strict";

class CstpLifecycleValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CstpLifecycleValidationError";
    this.code = "CSTP_LIFECYCLE_VALIDATION_ERROR";
    this.details = details;
  }
}

class CstpAdminEventValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CstpAdminEventValidationError";
    this.code = "CSTP_ADMIN_EVENT_VALIDATION_ERROR";
    this.details = details;
  }
}

function createCstpNotImplementedError(helperName) {
  return new Error(
    `CSTP internal helper "${helperName}" is scaffolded only and has not been implemented.`
  );
}

module.exports = {
  CstpAdminEventValidationError,
  CstpLifecycleValidationError,
  createCstpNotImplementedError,
};
