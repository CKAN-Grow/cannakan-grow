const {
  CSTP_REQUEST_STATUSES,
  CSTP_TABLES,
  authorizeCstpAdminRequest,
  getCstpSupabaseRuntimeConfig,
  supabaseRest,
} = require("../src/services/cstp/internal");

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const ALLOWED_SORT_FIELDS = Object.freeze(["created_at", "updated_at"]);
const ALLOWED_SORT_DIRECTIONS = Object.freeze(["asc", "desc"]);

function json(response, status, payload) {
  return response.status(status).json(payload);
}

async function handleCstpRequestsList(request, response, options = {}) {
  if (request.method === "OPTIONS") {
    response.setHeader("Allow", "GET, OPTIONS");
    return response.status(204).end();
  }

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET, OPTIONS");
    return json(response, 405, { ok: false, error: "Method not allowed." });
  }

  /*
   * Admin-only operational read boundary. CSTP request reads remain private
   * admin tooling data and must not become public CSTP/report/certification
   * exposure.
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
    query = buildCstpRequestsListQuery(getRequestQueryParams(request));
  } catch (error) {
    return json(response, 400, {
      ok: false,
      status: "cstp_requests_list_query_invalid",
      error: error.message,
      code: error.code || "CSTP_REQUESTS_LIST_QUERY_INVALID",
    });
  }

  try {
    const result = await executeCstpRequestsListQuery(
      query,
      options.readOptions || {},
    );
    return json(response, 200, {
      ok: true,
      status: "cstp_requests_listed",
      operation: "list_cstp_requests",
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
      status: "cstp_requests_list_failed",
      error: "Could not list CSTP requests.",
      details: normalizeReadError(error),
      internalOnly: true,
    });
  }
}

async function executeCstpRequestsListQuery(query, options = {}) {
  const config = options.config || getCstpSupabaseRuntimeConfig(options.env);
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    const error = new Error("CSTP request reads are not configured.");
    error.code = "CSTP_REQUESTS_LIST_NOT_CONFIGURED";
    error.details = {
      supabaseUrlAvailable: Boolean(config.supabaseUrl),
      supabaseServiceRoleKeyAvailable: Boolean(config.supabaseServiceRoleKey),
    };
    throw error;
  }

  const rows = await supabaseRest(
    `${CSTP_TABLES.requests}?${query.postgrestQuery}`,
    config,
    {
      method: "GET",
      fetchImpl: options.fetchImpl || globalThis.fetch,
    },
  );

  return {
    requests: Array.isArray(rows) ? rows : [],
    pagination: query.pagination,
    filters: query.filters,
    sort: query.sort,
  };
}

function buildCstpRequestsListQuery(params = {}) {
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
  const includeArchived = normalizeBoolean(params.includeArchived, false);
  const archived = normalizeOptionalBoolean(params.archived);
  const filters = [];

  if (status) {
    validateRequestStatus(status);
    filters.push(["status", "eq", status]);
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
    error.code = "CSTP_REQUESTS_LIST_PAGINATION_INVALID";
    throw error;
  }

  return normalized;
}

function normalizeSortField(value) {
  const normalized = normalizeNullableText(value) || "created_at";
  if (!ALLOWED_SORT_FIELDS.includes(normalized)) {
    const error = new Error(
      `Unsupported CSTP request sort field "${normalized}".`,
    );
    error.code = "CSTP_REQUESTS_LIST_SORT_FIELD_INVALID";
    throw error;
  }

  return normalized;
}

function normalizeSortDirection(value) {
  const normalized = (normalizeNullableText(value) || "desc").toLowerCase();
  if (!ALLOWED_SORT_DIRECTIONS.includes(normalized)) {
    const error = new Error(
      `Unsupported CSTP request sort direction "${normalized}".`,
    );
    error.code = "CSTP_REQUESTS_LIST_SORT_DIRECTION_INVALID";
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
  error.code = "CSTP_REQUESTS_LIST_BOOLEAN_INVALID";
  throw error;
}

function validateRequestStatus(status) {
  if (!CSTP_REQUEST_STATUSES.includes(status)) {
    const error = new Error(`Unsupported CSTP request status "${status}".`);
    error.code = "CSTP_REQUESTS_LIST_STATUS_INVALID";
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
    code: error?.code || "CSTP_REQUESTS_LIST_UNKNOWN_ERROR",
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

module.exports = handleCstpRequestsList;

module.exports._private = {
  buildCstpRequestsListQuery,
  executeCstpRequestsListQuery,
  getRequestQueryParams,
  handleCstpRequestsList,
};
