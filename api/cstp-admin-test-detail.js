const {
  CSTP_TABLES,
  authorizeCstpAdminRequest,
  getCstpSupabaseRuntimeConfig,
  supabaseRest,
} = require("../src/services/cstp/internal");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(response, status, payload) {
  return response.status(status).json(payload);
}

async function handleCstpTestDetail(request, response, options = {}) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "GET, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed." });
  }

  /*
   * Admin-only operational read boundary. CSTP test detail is internal
   * orchestration data only; public reports, certifications, and session-link
   * expansion remain deferred.
   */
  const authorization = await authorizeCstpAdminRequest(
    request,
    options.authorizationOptions || {},
  );
  if (!authorization.ok) {
    return json(response, authorization.httpStatus || 403, authorization);
  }

  let testId = "";
  try {
    testId = getCstpTestIdFromRequest(request);
    validateCstpTestId(testId);
  } catch (error) {
    return json(response, 400, {
      ok: false,
      status: "cstp_test_detail_query_invalid",
      error: error.message,
      code: error.code || "CSTP_TEST_DETAIL_QUERY_INVALID",
      internalOnly: true,
    });
  }

  try {
    const testRecord = await executeCstpTestDetailLookup(
      testId,
      options.readOptions || {},
    );

    if (!testRecord) {
      return json(response, 404, {
        ok: false,
        status: "cstp_test_not_found",
        error: "CSTP test was not found.",
        testId,
        internalOnly: true,
      });
    }

    return json(response, 200, {
      ok: true,
      status: "cstp_test_loaded",
      operation: "get_cstp_test_detail",
      test: testRecord,
      actor: {
        userId: authorization.actor.userId,
        authorizationSource: authorization.actor.authorizationSource,
      },
      internalOnly: true,
    });
  } catch (error) {
    return json(response, 500, {
      ok: false,
      status: "cstp_test_detail_failed",
      error: "Could not load CSTP test detail.",
      details: normalizeReadError(error),
      internalOnly: true,
    });
  }
}

async function executeCstpTestDetailLookup(testId, options = {}) {
  const config = options.config || getCstpSupabaseRuntimeConfig(options.env);
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    const error = new Error("CSTP test detail reads are not configured.");
    error.code = "CSTP_TEST_DETAIL_NOT_CONFIGURED";
    error.details = {
      supabaseUrlAvailable: Boolean(config.supabaseUrl),
      supabaseServiceRoleKeyAvailable: Boolean(config.supabaseServiceRoleKey),
    };
    throw error;
  }

  const rows = await supabaseRest(
    `${CSTP_TABLES.tests}?id=eq.${encodeURIComponent(testId)}&select=*&limit=1`,
    config,
    {
      method: "GET",
      fetchImpl: options.fetchImpl || globalThis.fetch,
    },
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return rows[0];
}

function getCstpTestIdFromRequest(request = {}) {
  const params = getRequestQueryParams(request);
  return normalizeNullableText(params.testId || params.id || params.cstpTestId);
}

function getRequestQueryParams(request = {}) {
  if (request.query && typeof request.query === "object") {
    return normalizeQueryObject(request.query);
  }

  const requestUrl = String(request.url || "").trim();
  if (!requestUrl) {
    return {};
  }

  const parsedUrl = new URL(requestUrl, "http://localhost");
  return Object.fromEntries(parsedUrl.searchParams.entries());
}

function normalizeQueryObject(query = {}) {
  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

function validateCstpTestId(testId) {
  if (!testId || !UUID_PATTERN.test(testId)) {
    const error = new Error("A valid CSTP test id is required.");
    error.code = "CSTP_TEST_DETAIL_ID_INVALID";
    throw error;
  }
}

function normalizeNullableText(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function normalizeReadError(error) {
  return {
    name: error?.name || "Error",
    code: error?.code || "CSTP_TEST_DETAIL_UNKNOWN_ERROR",
    message: error?.message || String(error),
    details: error?.details || {},
  };
}

module.exports = handleCstpTestDetail;

module.exports._private = {
  executeCstpTestDetailLookup,
  getCstpTestIdFromRequest,
  handleCstpTestDetail,
};
