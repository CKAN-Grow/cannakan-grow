const {
  CSTP_TABLES,
  CSTP_TEST_STATUSES,
  authorizeCstpAdminRequest,
  getCstpSupabaseRuntimeConfig,
  supabaseRest,
} = require("../src/services/cstp/internal");

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const ALLOWED_SORT_FIELDS = Object.freeze(["created_at", "updated_at"]);
const ALLOWED_SORT_DIRECTIONS = Object.freeze(["asc", "desc"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(response, status, payload) {
  return response.status(status).json(payload);
}

async function handleCstpTestsList(request, response, options = {}) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "GET, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed." });
  }

  /*
   * Admin-only operational read boundary. CSTP test rows are internal
   * orchestration records; this route does not expose reports, certifications,
   * public trust signals, or Grow session data.
   */
  const authorization = await authorizeCstpAdminRequest(
    request,
    options.authorizationOptions || {},
  );
  if (!authorization.ok) {
    return json(response, authorization.httpStatus || 403, authorization);
  }

  let query;
  try {
    query = buildCstpTestsListQuery(getRequestQueryParams(request));
  } catch (error) {
    return json(response, 400, {
      ok: false,
      status: "cstp_tests_list_query_invalid",
      error: error.message,
      code: error.code || "CSTP_TESTS_LIST_QUERY_INVALID",
      internalOnly: true,
    });
  }

  try {
    const result = await executeCstpTestsListQuery(
      query,
      options.readOptions || {},
    );
    return json(response, 200, {
      ok: true,
      status: "cstp_tests_listed",
      operation: "list_cstp_tests",
      ...result,
      actor: {
        userId: authorization.actor.userId,
        authorizationSource: authorization.actor.authorizationSource,
      },
      internalOnly: true,
    });
  } catch (error) {
    return json(response, 500, {
      ok: false,
      status: "cstp_tests_list_failed",
      error: "Could not list CSTP tests.",
      details: normalizeReadError(error),
      internalOnly: true,
    });
  }
}

async function executeCstpTestsListQuery(query, options = {}) {
  const config = options.config || getCstpSupabaseRuntimeConfig(options.env);
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    const error = new Error("CSTP test reads are not configured.");
    error.code = "CSTP_TESTS_LIST_NOT_CONFIGURED";
    error.details = {
      supabaseUrlAvailable: Boolean(config.supabaseUrl),
      supabaseServiceRoleKeyAvailable: Boolean(config.supabaseServiceRoleKey),
    };
    throw error;
  }

  const rows = await supabaseRest(
    `${CSTP_TABLES.tests}?${query.postgrestQuery}`,
    config,
    {
      method: "GET",
      fetchImpl: options.fetchImpl || globalThis.fetch,
    },
  );

  return {
    tests: Array.isArray(rows) ? rows : [],
    pagination: query.pagination,
    filters: query.filters,
    sort: query.sort,
  };
}

function buildCstpTestsListQuery(params = {}) {
  const page = normalizePositiveInteger(params.page, 1);
  const pageSize = Math.min(
    normalizePositiveInteger(params.pageSize || params.limit, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );
  const offset = (page - 1) * pageSize;
  const sortBy = normalizeSortField(params.sortBy || params.orderBy);
  const sortDirection = normalizeSortDirection(
    params.sortDirection || params.orderDirection || params.direction,
  );
  const status = normalizeNullableText(params.status);
  const requestId = normalizeNullableText(
    params.requestId || params.cstpRequestId,
  );
  const includeArchived = normalizeBoolean(params.includeArchived, false);
  const archived = normalizeOptionalBoolean(params.archived);
  const filters = [];

  if (status) {
    validateTestStatus(status);
    filters.push(["status", "eq", status]);
  }

  if (requestId) {
    validateUuid("requestId", requestId);
    filters.push(["request_id", "eq", requestId]);
  }

  if (archived !== null) {
    filters.push(["archived", "is", String(archived)]);
  } else if (!includeArchived) {
    filters.push(["archived", "is", "false"]);
  }

  const queryParts = [
    "select=*",
    ...filters.map(([field, operator, value]) =>
      `${encodeURIComponent(field)}=${operator}.${encodeURIComponent(value)}`,
    ),
    `order=${encodeURIComponent(`${sortBy}.${sortDirection}`)}`,
    `limit=${pageSize}`,
    `offset=${offset}`,
  ];

  return deepFreeze({
    postgrestQuery: queryParts.join("&"),
    pagination: {
      page,
      pageSize,
      offset,
      hasMore: null,
    },
    filters: {
      status: status || null,
      requestId: requestId || null,
      includeArchived,
      archived,
    },
    sort: {
      field: sortBy,
      direction: sortDirection,
    },
  });
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

function normalizePositiveInteger(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = Number(value);
  if (!Number.isInteger(normalized) || normalized < 1) {
    const error = new Error("Pagination parameters must be positive integers.");
    error.code = "CSTP_TESTS_LIST_PAGINATION_INVALID";
    throw error;
  }

  return normalized;
}

function normalizeSortField(value) {
  const normalized = normalizeNullableText(value) || "created_at";
  if (!ALLOWED_SORT_FIELDS.includes(normalized)) {
    const error = new Error(
      `Unsupported CSTP test sort field "${normalized}".`,
    );
    error.code = "CSTP_TESTS_LIST_SORT_FIELD_INVALID";
    throw error;
  }

  return normalized;
}

function normalizeSortDirection(value) {
  const normalized = (normalizeNullableText(value) || "desc").toLowerCase();
  if (!ALLOWED_SORT_DIRECTIONS.includes(normalized)) {
    const error = new Error(
      `Unsupported CSTP test sort direction "${normalized}".`,
    );
    error.code = "CSTP_TESTS_LIST_SORT_DIRECTION_INVALID";
    throw error;
  }

  return normalized;
}

function normalizeOptionalBoolean(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return normalizeBoolean(value, null);
}

function normalizeBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }

  const error = new Error("Boolean query parameters must be true or false.");
  error.code = "CSTP_TESTS_LIST_BOOLEAN_INVALID";
  throw error;
}

function validateTestStatus(status) {
  if (!CSTP_TEST_STATUSES.includes(status)) {
    const error = new Error(`Unsupported CSTP test status "${status}".`);
    error.code = "CSTP_TESTS_LIST_STATUS_INVALID";
    throw error;
  }
}

function validateUuid(fieldName, value) {
  if (!UUID_PATTERN.test(value)) {
    const error = new Error(`CSTP test filter "${fieldName}" must be a UUID.`);
    error.code = "CSTP_TESTS_LIST_UUID_INVALID";
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
    code: error?.code || "CSTP_TESTS_LIST_UNKNOWN_ERROR",
    message: error?.message || String(error),
    details: error?.details || {},
  };
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

module.exports = handleCstpTestsList;

module.exports._private = {
  buildCstpTestsListQuery,
  executeCstpTestsListQuery,
  getRequestQueryParams,
  handleCstpTestsList,
};
