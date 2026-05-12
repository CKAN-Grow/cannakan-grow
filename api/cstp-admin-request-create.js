const { executeCstpRequestCreation } = require("../src/services/cstp/internal");

function json(response, status, payload) {
  return response.status(status).json(payload);
}

function getAuthorizationHeader(request) {
  const headers = request?.headers || {};
  return String(headers.authorization || headers.Authorization || "").trim();
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

function getAdminAuthorizationReadiness() {
  /*
   * CSTP admin APIs must stay closed until an approved admin authorization
   * pattern exists. Existing routes show bearer-token auth and cron-secret
   * patterns, but no reusable admin role check. Do not call the execution
   * boundary from an API route until that admin check is defined.
   */
  return {
    configured: false,
    reason:
      "CSTP admin authorization is not configured. Define an approved admin role/allowlist/claims check before enabling this route.",
  };
}

async function runAuthorizedCstpRequestCreation(payload, actor = {}) {
  /*
   * Thin execution handoff only. Business rules, lifecycle validation, audit
   * event preparation, and Supabase writes live in the internal CSTP execution
   * boundary. CSTP public exposure remains deferred.
   */
  return executeCstpRequestCreation({
    ...payload,
    adminUserId: actor.userId,
  });
}

module.exports = async function handler(request, response) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed." });
  }

  const authorizationReadiness = getAdminAuthorizationReadiness();
  if (!authorizationReadiness.configured) {
    return json(response, 501, {
      ok: false,
      status: "cstp_admin_authorization_deferred",
      adminAuthorizationDeferred: true,
      error: authorizationReadiness.reason,
    });
  }

  const authorizationHeader = getAuthorizationHeader(request);
  const accessToken = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length).trim()
    : "";

  if (!accessToken) {
    return json(response, 401, { ok: false, error: "Missing bearer token." });
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
    const result = await runAuthorizedCstpRequestCreation(payload, {
      userId: "",
    });
    return json(response, result.ok ? 200 : 500, result);
  } catch (error) {
    return json(response, 500, {
      ok: false,
      status: "cstp_request_create_unhandled_error",
      error: "Could not create CSTP request.",
    });
  }
};

module.exports._private = {
  getAdminAuthorizationReadiness,
  getAuthorizationHeader,
  parseRequestBody,
  runAuthorizedCstpRequestCreation,
};
