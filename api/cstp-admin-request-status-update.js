const {
  authorizeCstpAdminRequest,
  executeCstpRequestStatusUpdate,
} = require("../src/services/cstp/internal");

function json(response, status, payload) {
  return response.status(status).json(payload);
}

function parseRequestBody(body) {
  if (body === undefined || body === null || body === "") {
    return {};
  }
  if (typeof body === "string") {
    return JSON.parse(body || "{}");
  }
  if (typeof Buffer !== "undefined" && Buffer.isBuffer?.(body)) {
    return JSON.parse(body.toString("utf8") || "{}");
  }
  if (body instanceof Uint8Array) {
    return JSON.parse(Buffer.from(body).toString("utf8") || "{}");
  }
  if (typeof body === "object") {
    return body;
  }
  throw new Error("Unsupported request body.");
}

async function runAuthorizedCstpRequestStatusUpdate(
  payload,
  actor = {},
  executionOptions = {},
) {
  /*
   * Admin-only CSTP API handoff. Lifecycle validation and audit-event
   * preparation remain centralized in the internal CSTP helper/execution
   * layers, so this route cannot drift into a second workflow engine.
   */
  return executeCstpRequestStatusUpdate(
    {
      ...payload,
      adminUserId: actor.userId,
    },
    executionOptions,
  );
}

async function handleCstpRequestStatusUpdate(request, response, options = {}) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, PATCH, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST" && request.method !== "PATCH") {
    response.setHeader("Allow", "POST, PATCH, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed." });
  }

  /*
   * CSTP remains internal-only. Authorization must succeed before body
   * parsing or execution so missing/invalid/non-admin callers cannot reach
   * mutation helpers or receive CSTP data.
   */
  const authorization = await authorizeCstpAdminRequest(
    request,
    options.authorizationOptions || {},
  );
  if (!authorization.ok) {
    return json(response, authorization.httpStatus || 403, authorization);
  }

  let payload = {};
  try {
    payload = parseRequestBody(request.body);
  } catch (error) {
    return json(response, 400, {
      ok: false,
      error: "Request body must be valid JSON.",
    });
  }

  try {
    const result = await runAuthorizedCstpRequestStatusUpdate(
      payload,
      authorization.actor,
      options.executionOptions || {},
    );
    return json(response, result.ok ? 200 : 500, result);
  } catch (error) {
    const isValidationError = String(error?.name || "").includes("Validation");
    return json(response, isValidationError ? 400 : 500, {
      ok: false,
      status: isValidationError
        ? "cstp_request_status_update_validation_error"
        : "cstp_request_status_update_unhandled_error",
      error: isValidationError
        ? error.message
        : "Could not update CSTP request status.",
      code: error?.code || "CSTP_REQUEST_STATUS_UPDATE_ERROR",
    });
  }
}

module.exports = handleCstpRequestStatusUpdate;

module.exports._private = {
  handleCstpRequestStatusUpdate,
  parseRequestBody,
  runAuthorizedCstpRequestStatusUpdate,
};
