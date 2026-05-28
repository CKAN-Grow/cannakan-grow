const GROW_SESSIONS_TABLE = "grow_sessions";
const REMINDER_EVENTS_TABLE = "grow_session_reminder_events";

function getEnv(name, fallback = "") {
  return String(process.env[name] || fallback).trim();
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

async function supabaseAuthGetUser(token, config) {
  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase auth verification failed with ${response.status}.`);
  }
  return response.json();
}

async function supabaseRest(path, config, options = {}) {
  const {
    method = "GET",
    body = undefined,
    prefer = "",
  } = options;
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: config.supabaseServiceRoleKey,
      Authorization: `Bearer ${config.supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase REST ${method} ${path} failed with ${response.status}: ${text}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function resolveSnoozeUntil(optionKey = "") {
  const now = new Date();
  switch (String(optionKey || "").trim()) {
    case "30m":
      return new Date(now.getTime() + 30 * 60 * 1000);
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "2h":
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    case "tonight": {
      const tonight = new Date(now);
      tonight.setHours(20, 0, 0, 0);
      if (tonight.getTime() <= now.getTime()) {
        tonight.setDate(tonight.getDate() + 1);
      }
      return tonight;
    }
    case "tomorrow-morning": {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(8, 0, 0, 0);
      return tomorrow;
    }
    default:
      return new Date(now.getTime() + 30 * 60 * 1000);
  }
}

function normalizeAction(action = "") {
  const normalized = String(action || "").trim();
  return [
    "update-stage-opened",
    "snooze-reminder",
    "mark-germinating",
    "mark-first-germinated",
    "mark-completed",
    "open-session",
  ].includes(normalized) ? normalized : "";
}

function normalizeSessionStatus(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (["soaking", "germinating", "completed"].includes(normalized)) {
    return normalized;
  }
  return "";
}

function isSessionActionInvalid(row = {}) {
  const visibilityStatus = String(row?.visibility_status || "").trim().toLowerCase();
  const sessionStatus = normalizeSessionStatus(row?.session_status || "");
  return Boolean(
    row?.is_deleted === true
    || row?.user_deleted === true
    || ["deleted", "archived", "archived_test", "hidden"].includes(visibilityStatus)
    || ["deleted", "archived", "archived_test"].includes(String(row?.session_status || "").trim().toLowerCase())
    || sessionStatus === "completed"
    || !sessionStatus
  );
}

async function loadOwnedSessionForReminderAction(userId, sessionId, config) {
  const rows = await supabaseRest(
    `${GROW_SESSIONS_TABLE}?user_id=eq.${encodeURIComponent(userId)}&id=eq.${encodeURIComponent(sessionId)}&select=id,user_id,session_status,is_deleted,user_deleted,visibility_status&limit=1`,
    config,
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
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

  const config = getRuntimeConfig();
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    return json(response, 503, { ok: false, error: "Reminder action logging is not configured." });
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
    return json(response, 400, { ok: false, error: "Request body must be valid JSON." });
  }

  const eventKey = String(payload.eventKey || payload.event_key || "").trim();
  const sessionId = String(payload.sessionId || payload.session_id || "").trim();
  const action = normalizeAction(payload.action);
  if (!eventKey || !sessionId || !action) {
    return json(response, 400, { ok: false, error: "Missing event key, session id, or supported action." });
  }

  try {
    const authenticatedUser = await supabaseAuthGetUser(accessToken, config);
    const userId = String(authenticatedUser?.id || "").trim();
    if (!userId) {
      return json(response, 401, { ok: false, error: "Could not verify the signed-in user." });
    }

    const rows = await supabaseRest(
      `${REMINDER_EVENTS_TABLE}?user_id=eq.${encodeURIComponent(userId)}&session_id=eq.${encodeURIComponent(sessionId)}&event_key=eq.${encodeURIComponent(eventKey)}&select=*`,
      config,
    );
    const existingRecord = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (!existingRecord) {
      return json(response, 200, { ok: true, skipped: true, reason: "Reminder event was not found." });
    }

    const session = await loadOwnedSessionForReminderAction(userId, sessionId, config);
    if (!session || isSessionActionInvalid(session)) {
      return json(response, 200, { ok: true, skipped: true, reason: "Reminder session is no longer available." });
    }

    const actionAt = new Date().toISOString();
    const snoozeOption = String(payload.snoozeOption || payload.snooze_option || "").trim();
    const isSnooze = action === "snooze-reminder";
    const postponedUntil = isSnooze ? resolveSnoozeUntil(snoozeOption).toISOString() : existingRecord.postponed_until;
    const metadata = {
      ...(existingRecord.metadata && typeof existingRecord.metadata === "object" ? existingRecord.metadata : {}),
      lastAction: action,
      lastActionAt: actionAt,
      ...(snoozeOption ? { lastSnoozeOption: snoozeOption } : {}),
      actionLog: [
        ...(
          Array.isArray(existingRecord?.metadata?.actionLog)
            ? existingRecord.metadata.actionLog.slice(-9)
            : []
        ),
        {
          action,
          actionAt,
          ...(snoozeOption ? { snoozeOption } : {}),
        },
      ],
    };

    const updatePayload = {
      metadata,
      last_evaluated_at: actionAt,
      ...(isSnooze
        ? {
          status: "postponed",
          postponed_until: postponedUntil,
          postpone_count: Math.max(0, Number(existingRecord.postpone_count || 0) || 0) + 1,
        }
        : {}),
    };

    const updatedRows = await supabaseRest(
      `${REMINDER_EVENTS_TABLE}?user_id=eq.${encodeURIComponent(userId)}&session_id=eq.${encodeURIComponent(sessionId)}&event_key=eq.${encodeURIComponent(eventKey)}&select=*`,
      config,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: updatePayload,
      },
    );

    return json(response, 200, {
      ok: true,
      action,
      postponedUntil: isSnooze ? postponedUntil : "",
      reminderEvent: Array.isArray(updatedRows) && updatedRows.length ? updatedRows[0] : null,
    });
  } catch (error) {
    console.error("[Grow Reminder Action] Failed to record action.", error);
    return json(response, 500, { ok: false, error: "Could not record reminder action." });
  }
};
