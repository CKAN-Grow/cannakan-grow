const {
  authorizeCstpAdminRequest,
  executeCstpRequestCreation,
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

async function runAuthorizedCstpRequestCreation(
  payload,
  actor = {},
  executionOptions = {},
) {
  /*
   * Thin execution handoff only. Business rules, lifecycle validation, audit
   * event preparation, and Supabase writes live in the internal CSTP execution
   * boundary. CSTP public exposure remains deferred.
   */
  return executeCstpRequestCreation(
    {
      ...payload,
      adminUserId: actor.userId,
    },
    executionOptions,
  );
}

async function handleCstpRequestCreation(request, response, options = {}) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed." });
  }

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
    const result = await runAuthorizedCstpRequestCreation(
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
        ? "cstp_request_create_validation_error"
        : "cstp_request_create_unhandled_error",
      error: isValidationError
        ? error.message
        : "Could not create CSTP request.",
      code: error?.code || "CSTP_REQUEST_CREATE_ERROR",
    });
  }
}

module.exports = handleCstpRequestCreation;

module.exports._private = {
  handleCstpRequestCreation,
  parseRequestBody,
  runAuthorizedCstpRequestCreation,
};
