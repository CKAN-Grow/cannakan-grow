"use strict";

// Internal CSTP v1 table names. These mirror the initial migration foundation only.
const CSTP_TABLES = Object.freeze({
  requests: "cstp_requests",
  tests: "cstp_tests",
  adminEvents: "cstp_admin_events",
  testSessions: "cstp_test_sessions",
});

// Status vocabulary only. Validation rules are intentionally deferred to lifecycle helpers.
const CSTP_REQUEST_STATUSES = Object.freeze([
  "received",
  "accepted",
  "awaiting_seeds",
  "declined",
  "archived",
]);

const CSTP_TEST_STATUSES = Object.freeze([
  "pending",
  "active",
  "completed",
  "archived",
]);

module.exports = {
  CSTP_TABLES,
  CSTP_REQUEST_STATUSES,
  CSTP_TEST_STATUSES,
};
