"use strict";

const { createCstpNotImplementedError } = require("./errors");

/*
 * Internal session linkage helper placeholders.
 *
 * Grow sessions remain source-of-truth and must remain normal sessions. Future
 * linkage helpers may create/archive cstp_test_sessions records, but must not
 * mutate session stage, timeline, metrics, notes, media, or partition behavior.
 */

function linkGrowSessionToCstpTest() {
  throw createCstpNotImplementedError("linkGrowSessionToCstpTest");
}

function archiveCstpSessionLink() {
  throw createCstpNotImplementedError("archiveCstpSessionLink");
}

function assertGrowSessionLinkCompatibility() {
  throw createCstpNotImplementedError("assertGrowSessionLinkCompatibility");
}

module.exports = {
  linkGrowSessionToCstpTest,
  archiveCstpSessionLink,
  assertGrowSessionLinkCompatibility,
};
