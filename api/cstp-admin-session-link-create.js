const {
  authorizeCstpAdminRequest,
  executeCstpSessionLinkCreation,
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

async function runAuthorizedCstpSessionLinkCreation(
  payload,
  actor = {},
  executionOptions = {},
) {
  /*
   * Admin-only CSTP API handoff. Duplicate-link protection, session
   * compatibility checks, append-only audit preparation, and Supabase writes
   * remain centralized in the internal execution boundary. CSTP links are
   * external references and must never mutate Grow session records.
   */
  return executeCstpSessionLinkCreation(
    {
      ...payload,
      adminUserId: actor.userId,
    },
    executionOptions,
  );
}

async function handleCstpSessionLinkCreation(request, response, options = {}) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed." });
  }

  /*
   * Authorization is the first CSTP boundary. Non-admin callers must not reach
   * CSTP linkage helpers, receive relationship data, or cause audit effects.
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
    const result = await runAuthorizedCstpSessionLinkCreation(
      payload,
      authorization.actor,
      options.executionOptions || {},
    );
    return json(response, result.ok ? 200 : result.httpStatus || 500, result);
  } catch (error) {
    const isValidationError = String(error?.name || "").includes("Validation");
    return json(response, isValidationError ? 400 : 500, {
      ok: false,
      status: isValidationError
        ? "cstp_session_link_create_validation_error"
        : "cstp_session_link_create_unhandled_error",
      error: isValidationError
        ? error.message
        : "Could not link Grow session to CSTP test.",
      code: error?.code || "CSTP_SESSION_LINK_CREATE_ERROR",
    });
  }
}

module.exports = handleCstpSessionLinkCreation;

module.exports._private = {
  handleCstpSessionLinkCreation,
  parseRequestBody,
  runAuthorizedCstpSessionLinkCreation,
};
