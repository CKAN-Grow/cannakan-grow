const {
  authorizeCstpAdminRequest,
  executeCstpSessionLinkArchive,
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

async function runAuthorizedCstpSessionLinkArchive(
  payload,
  actor = {},
  executionOptions = {},
) {
  /*
   * Admin-only CSTP API handoff. Archival is relationship-only: it updates the
   * CSTP link row and leaves Grow sessions untouched. Validation, audit
   * preparation, and Supabase writes remain centralized in the execution layer.
   */
  return executeCstpSessionLinkArchive(
    {
      ...payload,
      adminUserId: actor.userId,
    },
    executionOptions,
  );
}

async function handleCstpSessionLinkArchive(request, response, options = {}) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, PATCH, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST" && request.method !== "PATCH") {
    response.setHeader("Allow", "POST, PATCH, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed." });
  }

  /*
   * Authorization is the first CSTP boundary. Non-admin callers must not reach
   * CSTP relationship helpers, receive link data, or cause audit effects.
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
    const result = await runAuthorizedCstpSessionLinkArchive(
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
        ? "cstp_session_link_archive_validation_error"
        : "cstp_session_link_archive_unhandled_error",
      error: isValidationError
        ? error.message
        : "Could not archive CSTP session link.",
      code: error?.code || "CSTP_SESSION_LINK_ARCHIVE_ERROR",
    });
  }
}

module.exports = handleCstpSessionLinkArchive;

module.exports._private = {
  handleCstpSessionLinkArchive,
  parseRequestBody,
  runAuthorizedCstpSessionLinkArchive,
};
