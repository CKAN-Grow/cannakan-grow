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

class CstpRequestValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CstpRequestValidationError";
    this.code = "CSTP_REQUEST_VALIDATION_ERROR";
    this.details = details;
  }
}

class CstpTestValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CstpTestValidationError";
    this.code = "CSTP_TEST_VALIDATION_ERROR";
    this.details = details;
  }
}

class CstpSessionLinkValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CstpSessionLinkValidationError";
    this.code = "CSTP_SESSION_LINK_VALIDATION_ERROR";
    this.details = details;
  }
}

class CstpExecutionError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "CstpExecutionError";
    this.code = "CSTP_EXECUTION_ERROR";
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
  CstpExecutionError,
  CstpLifecycleValidationError,
  CstpRequestValidationError,
  CstpSessionLinkValidationError,
  CstpTestValidationError,
  createCstpNotImplementedError,
};
