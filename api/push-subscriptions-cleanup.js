const PUSH_SUBSCRIPTIONS_TABLE = "user_push_subscriptions";
const PUSH_DELIVERIES_TABLE = "push_notification_deliveries";
const CLEANUP_MODES = new Set(["remove-device", "remove-failed", "keep-current"]);
const FAILED_DELIVERY_STATUSES = new Set(["failed", "invalid", "rejected", "expired", "stale"]);

function getEnv(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
}

function createRequestError(message, statusCode = 500, payload = {}) {
  const error = new Error(message || `Request failed with ${statusCode}`);
  error.statusCode = Number(statusCode) || 500;
  error.status = error.statusCode;
  error.payload = payload && typeof payload === "object" ? payload : {};
  error.body = String(payload?.body || payload?.message || message || "").trim();
  return error;
}

function getRuntimeConfig() {
  return {
    supabaseUrl: getEnv(
      "CANNAKAN_SUPABASE_URL",
      getEnv("SUPABASE_URL", getEnv("NEXT_PUBLIC_SUPABASE_URL")),
    ),
    supabaseServiceRoleKey: getEnv(
      "CANNAKAN_SUPABASE_SERVICE_ROLE_KEY",
      getEnv("SUPABASE_SERVICE_ROLE_KEY", getEnv("SUPABASE_SERVICE_KEY", getEnv("SUPABASE_SECRET_KEY"))),
    ),
  };
}

function json(response, status, payload) {
  response.setHeader("Cache-Control", "no-store");
  return response.status(status).json(payload);
}

function getErrorStatusCode(error) {
  return Number(error?.statusCode || error?.status || error?.payload?.status || 0) || 0;
}

function getErrorMessage(error, fallback = "Unknown error.") {
  return String(error?.body || error?.message || error?.payload?.body || fallback).trim() || fallback;
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

async function supabaseAuthGetUser(token, config) {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createRequestError(errorText || `Supabase auth user lookup failed with ${response.status}`, response.status, {
      body: errorText,
    });
  }

  return response.json();
}

async function supabaseRest(path, config, options = {}) {
  const {
    method = "GET",
    body = null,
    prefer = "",
    additionalHeaders = {},
  } = options;
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...additionalHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw createRequestError(errorText || `Supabase REST request failed with ${response.status}`, response.status, {
      body: errorText,
      path,
    });
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function normalizeCleanupMode(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return CLEANUP_MODES.has(normalized) ? normalized : "";
}

function normalizeSubscriptionRow(row = {}) {
  const endpoint = String(row?.endpoint || row?.subscription?.endpoint || "").trim();
  const deviceKey = String(row?.device_key || "").trim();
  if (!deviceKey && !endpoint) {
    return null;
  }
  return {
    id: String(row?.id || "").trim(),
    userId: String(row?.user_id || "").trim(),
    deviceKey: deviceKey || endpoint,
    endpoint,
  };
}

function isInvalidFailureCode(value = "") {
  const code = String(value || "").trim().toLowerCase();
  return code === "404" || code === "410" || code.includes("gone") || code.includes("invalid") || code.includes("expired");
}

function isStaleFailureText(value = "") {
  const text = String(value || "").trim().toLowerCase();
  return Boolean(
    text
    && (
      text.includes("410")
      || text.includes("404")
      || text.includes("gone")
      || text.includes("expired")
      || text.includes("invalid")
      || text.includes("not registered")
      || text.includes("unregistered")
      || text.includes("rejected")
    ),
  );
}

function isFailedCleanupCandidate(record = {}, deliveries = []) {
  const relatedDeliveries = (Array.isArray(deliveries) ? deliveries : [])
    .filter((row) => String(row?.device_key || "").trim() === record.deviceKey);
  const latestDelivery = relatedDeliveries[0] || null;
  const latestStatus = String(latestDelivery?.status || "").trim().toLowerCase();
  const recentFailures = relatedDeliveries
    .slice(0, 5)
    .filter((row) => {
      const status = String(row?.status || "").trim().toLowerCase();
      return FAILED_DELIVERY_STATUSES.has(status)
        || isInvalidFailureCode(row?.failure_code || "")
        || isStaleFailureText(row?.failure_reason || "");
    }).length;
  return FAILED_DELIVERY_STATUSES.has(latestStatus)
    || isInvalidFailureCode(latestDelivery?.failure_code || "")
    || isStaleFailureText(latestDelivery?.failure_reason || "")
    || recentFailures >= 2;
}

async function loadUserSubscriptions(userId, config) {
  const rows = await supabaseRest(
    `${PUSH_SUBSCRIPTIONS_TABLE}?user_id=eq.${encodeURIComponent(userId)}&select=*&order=updated_at.desc`,
    config,
  );
  return (Array.isArray(rows) ? rows : [])
    .map((row) => normalizeSubscriptionRow(row))
    .filter(Boolean)
    .filter((record) => record.userId === userId);
}

async function loadRecentDeliveries(userId, config) {
  const rows = await supabaseRest(
    `${PUSH_DELIVERIES_TABLE}?user_id=eq.${encodeURIComponent(userId)}&select=device_key,status,failure_code,failure_reason,created_at&order=created_at.desc&limit=500`,
    config,
  );
  return Array.isArray(rows) ? rows : [];
}

async function deleteSubscription(record, config) {
  if (!record?.id || !record?.userId) {
    return false;
  }
  await supabaseRest(
    `${PUSH_SUBSCRIPTIONS_TABLE}?id=eq.${encodeURIComponent(record.id)}&user_id=eq.${encodeURIComponent(record.userId)}`,
    config,
    {
      method: "DELETE",
      prefer: "return=minimal",
    },
  );
  return true;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, error: "Method not allowed" });
  }

  const config = getRuntimeConfig();
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    return json(response, 503, {
      ok: false,
      retryable: true,
      code: "push_cleanup_backend_unavailable",
      error: "Push subscription cleanup is temporarily unavailable.",
    });
  }

  const authorizationHeader = getAuthorizationHeader(request);
  const accessToken = authorizationHeader.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length).trim()
    : "";
  if (!accessToken) {
    return json(response, 401, { ok: false, error: "Missing bearer token." });
  }

  try {
    const authenticatedUser = await supabaseAuthGetUser(accessToken, config);
    const userId = String(authenticatedUser?.id || "").trim();
    if (!userId) {
      return json(response, 401, { ok: false, error: "Could not verify the signed-in user." });
    }

    let payload = {};
    try {
      payload = parseRequestBody(request.body);
    } catch (error) {
      return json(response, 400, { ok: false, error: "Request body must be valid JSON." });
    }

    const mode = normalizeCleanupMode(payload.mode || payload.action || "");
    if (!mode) {
      return json(response, 400, { ok: false, error: "Choose a valid push subscription cleanup action." });
    }

    const records = await loadUserSubscriptions(userId, config);
    const requestedDeviceKey = String(payload.deviceKey || payload.device_key || "").trim();
    const requestedEndpoint = String(payload.endpoint || "").trim();
    const currentEndpoint = String(payload.currentEndpoint || payload.current_endpoint || "").trim();
    const currentDeviceKey = String(payload.currentDeviceKey || payload.current_device_key || "").trim();

    let removalCandidates = [];
    if (mode === "remove-device") {
      if (!requestedDeviceKey && !requestedEndpoint) {
        return json(response, 400, { ok: false, error: "Choose a device to remove." });
      }
      removalCandidates = records.filter((record) => (
        (requestedDeviceKey && record.deviceKey === requestedDeviceKey)
        || (requestedEndpoint && record.endpoint === requestedEndpoint)
      ));
    } else if (mode === "remove-failed") {
      const deliveries = await loadRecentDeliveries(userId, config);
      removalCandidates = records.filter((record) => isFailedCleanupCandidate(record, deliveries));
    } else if (mode === "keep-current") {
      if (!currentEndpoint && !currentDeviceKey) {
        return json(response, 400, { ok: false, error: "Current device endpoint is required before removing other devices." });
      }
      removalCandidates = records.filter((record) => (
        currentEndpoint
          ? record.endpoint !== currentEndpoint
          : record.deviceKey !== currentDeviceKey
      ));
    }

    const removedDeviceKeys = [];
    const removedEndpoints = [];
    for (const record of removalCandidates) {
      if (await deleteSubscription(record, config)) {
        removedDeviceKeys.push(record.deviceKey);
        removedEndpoints.push(record.endpoint);
      }
    }

    return json(response, 200, {
      ok: true,
      mode,
      removedCount: removedDeviceKeys.length,
      removedDeviceKeys,
      removedEndpoints,
    });
  } catch (error) {
    const statusCode = getErrorStatusCode(error);
    const responseStatus = statusCode === 401 || statusCode === 403 ? statusCode : 503;
    console.warn("[push-subscriptions-cleanup] Cleanup failed.", {
      statusCode,
      message: getErrorMessage(error),
    });
    return json(response, responseStatus, {
      ok: false,
      retryable: responseStatus >= 500,
      code: "push_cleanup_failed",
      error: responseStatus >= 500 ? "Push subscription cleanup is temporarily unavailable." : "Push subscription cleanup is not authorized.",
    });
  }
};
