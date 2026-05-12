"use strict";

function createCstpNotImplementedError(helperName) {
  return new Error(
    `CSTP internal helper "${helperName}" is scaffolded only and has not been implemented.`
  );
}

module.exports = {
  createCstpNotImplementedError,
};
