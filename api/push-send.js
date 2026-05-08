const webpush = require("web-push");

const PUSH_SUBSCRIPTIONS_TABLE = "user_push_subscriptions";
const PUSH_DELIVERIES_TABLE = "push_notification_deliveries";
const USER_NOTIFICATION_PREFERENCES_TABLE = "user_notification_preferences";
const ELIGIBLE_PUSH_CATEGORIES = new Set([
  "soaking-reminder",
  "germination-reminder",
  "snapshot-reminder",
  "supply-reminder",
  "system-notice",
]);

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
    vapidPublicKey: getEnv(
      "VAPID_PUBLIC_KEY",
      getEnv("CANNAKAN_PUSH_PUBLIC_KEY", getEnv("CANNAKAN_PUSH_VAPID_PUBLIC_KEY")),
    ),
    vapidPrivateKey: getEnv(
      "VAPID_PRIVATE_KEY",
      getEnv("CANNAKAN_PUSH_VAPID_PRIVATE_KEY"),
    ),
    vapidSubject: getEnv(
      "VAPID_SUBJECT",
      getEnv("CANNAKAN_PUSH_VAPID_SUBJECT", "mailto:info@cannakan.com"),
    ),
  };
}

function getBackendReadiness(config = {}) {
  const supabaseUrlAvailable = Boolean(config.supabaseUrl);
  const supabaseServerKeyAvailable = Boolean(config.supabaseServiceRoleKey);
  const vapidPublicKeyAvailable = Boolean(config.vapidPublicKey);
  const vapidConfigured = Boolean(config.vapidPublicKey && config.vapidPrivateKey);
  const configured = Boolean(supabaseUrlAvailable && supabaseServerKeyAvailable && vapidConfigured);

  let statusLabel = "Ready";
  let message = "Push delivery backend is fully configured.";
  if (!supabaseUrlAvailable) {
    statusLabel = "Needs Supabase URL";
    message = "The push delivery backend is missing its Supabase project URL.";
  } else if (!supabaseServerKeyAvailable) {
    statusLabel = "Needs server key";
    message = "The push delivery backend is missing its Supabase server/service-role key.";
  } else if (!vapidPublicKeyAvailable) {
    statusLabel = "Needs public key";
    message = "The push delivery backend is missing its VAPID public key.";
  } else if (!vapidConfigured) {
    statusLabel = "Needs VAPID keys";
    message = "The push delivery backend is missing one or more VAPID server keys.";
  }

  return {
    configured,
    supabaseConfigured: Boolean(supabaseUrlAvailable && supabaseServerKeyAvailable),
    supabaseUrlAvailable,
    supabaseServerKeyAvailable,
    vapidConfigured,
    vapidPublicKeyAvailable,
    statusLabel,
    message,
  };
}

function json(response, status, payload) {
  return response.status(status).json(payload);
}

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null) {
    return fallback;
  }
  return value !== false;
}

function getObjectBooleanValue(source, keys, fallback = false) {
  const normalizedKeys = Array.isArray(keys) ? keys : [keys];
  for (const key of normalizedKeys) {
    if (Object.prototype.hasOwnProperty.call(source || {}, key)) {
      return toBoolean(source[key], fallback);
    }
  }
  return fallback;
}

function hasAnyObjectKey(source, keys) {
  const normalizedKeys = Array.isArray(keys) ? keys : [keys];
  return normalizedKeys.some((key) => Object.prototype.hasOwnProperty.call(source || {}, key));
}

function normalizeNotificationPreferencesRow(row = {}) {
  const hasPreferenceRow = Boolean(row && typeof row === "object" && Object.keys(row).length);
  const growRemindersEnabled = getObjectBooleanValue(
    row,
    ["growRemindersEnabled", "grow_reminders_enabled", "session_reminders", "notifyCompletion", "notify_completion"],
    true,
  );
  const pushPreferenceKeys = ["pushNotificationsEnabled", "push_notifications_enabled", "push_notifications"];
  const hasPushPreference = hasAnyObjectKey(row, pushPreferenceKeys);
  return {
    growRemindersEnabled,
    notifySoakingReminders: getObjectBooleanValue(
      row,
      ["notifySoakingReminders", "soaking_reminders"],
      growRemindersEnabled,
    ),
    notifyGerminationReminders: getObjectBooleanValue(
      row,
      ["notifyGerminationReminders", "germination_reminders"],
      growRemindersEnabled,
    ),
    notifySnapshotReminders: getObjectBooleanValue(
      row,
      ["notifySnapshotReminders", "snapshot_reminders", "notifySnapshot", "notify_snapshot", "email_notifications"],
      true,
    ),
    notifySupplyReminders: getObjectBooleanValue(
      row,
      ["notifySupplyReminders", "supply_reminders", "notifyLike", "notify_like", "low_filter_alerts"],
      true,
    ),
    notifyCommunityActivity: getObjectBooleanValue(
      row,
      ["notifyCommunityActivity", "community_activity_notifications", "notifyFollow", "notify_follow", "community_updates"],
      true,
    ),
    pushNotificationsEnabled: getObjectBooleanValue(
      row,
      pushPreferenceKeys,
      hasPushPreference ? false : (hasPreferenceRow ? growRemindersEnabled : false),
    ),
    pushPreferenceConfigured: hasPushPreference,
  };
}

function isPushCategoryEnabled(category = "", preferences = {}) {
  switch (String(category || "").trim()) {
    case "soaking-reminder":
      return preferences.growRemindersEnabled !== false && preferences.notifySoakingReminders !== false;
    case "germination-reminder":
      return preferences.growRemindersEnabled !== false && preferences.notifyGerminationReminders !== false;
    case "snapshot-reminder":
      return preferences.notifySnapshotReminders !== false;
    case "supply-reminder":
      return preferences.notifySupplyReminders !== false;
    case "system-notice":
      return preferences.pushNotificationsEnabled === true;
    default:
      return false;
  }
}

function normalizeRoute(route = "#home") {
  const rawRoute = String(route || "").trim() || "#home";
  if (rawRoute.startsWith("http")) {
    return rawRoute;
  }
  if (rawRoute.startsWith("/") || rawRoute.startsWith("#")) {
    return rawRoute;
  }
  return `#${rawRoute.replace(/^#/, "")}`;
}

function buildAbsoluteUrl(appOrigin = "", route = "#home") {
  const normalizedOrigin = String(appOrigin || "").trim().replace(/\/+$/, "");
  const normalizedRoute = normalizeRoute(route);
  if (!normalizedOrigin || normalizedRoute.startsWith("http")) {
    return "";
  }
  if (normalizedRoute.startsWith("/")) {
    return `${normalizedOrigin}${normalizedRoute}`;
  }
  return `${normalizedOrigin}/${normalizedRoute}`;
}

function getRequestOrigin(request) {
  const forwardedProto = String(request?.headers?.["x-forwarded-proto"] || "").trim();
  const forwardedHost = String(request?.headers?.["x-forwarded-host"] || request?.headers?.host || "").trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return "";
}

function getAuthorizationHeader(request) {
  const headers = request?.headers || {};
  return String(
    headers.authorization
    || headers.Authorization
    || "",
  ).trim();
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

function normalizePushPayload(payload = {}, fallback = {}) {
  const route = normalizeRoute(payload?.data?.route || payload.route || fallback.route || "#home");
  const notificationType = String(
    payload.notification_type
    || payload.notificationType
    || payload?.data?.notification_type
    || payload?.data?.notificationType
    || fallback.notificationType
    || "",
  ).trim();
  const rawAvailableActions = Array.isArray(payload.available_actions)
    ? payload.available_actions
    : (Array.isArray(payload.availableActions) ? payload.availableActions : payload.actions);
  const availableActions = Array.isArray(rawAvailableActions)
    ? rawAvailableActions
      .map((action, index) => {
        const actionId = String(action?.action || action?.kind || action?.id || `action-${index + 1}`).trim();
        const title = String(action?.title || action?.label || "").trim();
        const actionRoute = normalizeRoute(action?.route || route);
        if (!actionId || !title) {
          return null;
        }
        return {
          action: actionId,
          kind: String(action?.kind || actionId).trim(),
          title,
          label: title,
          route: actionRoute,
          focusTarget: String(action?.focusTarget || action?.focus_target || "").trim(),
          sessionId: String(action?.sessionId || action?.session_id || payload?.data?.sessionId || fallback.sessionId || "").trim(),
          eventKey: String(action?.eventKey || action?.event_key || payload?.data?.eventKey || fallback.eventKey || "").trim(),
          snoozeOptions: Array.isArray(action?.snoozeOptions || action?.snooze_options)
            ? (action.snoozeOptions || action.snooze_options).map((option) => String(option || "").trim()).filter(Boolean)
            : [],
          notificationButton: action?.notificationButton !== false && action?.showButton !== false,
        };
      })
      .filter(Boolean)
    : [];
  const actions = availableActions
    .filter((action) => action.notificationButton !== false && action.kind !== "open-session")
    .slice(0, 2);

  return {
    title: String(payload.title || fallback.title || "Cannakan® Grow").trim() || "Cannakan® Grow",
    body: String(payload.body || fallback.body || "").trim(),
    tag: String(payload.tag || fallback.eventKey || "cannakan-grow-notification").trim(),
    icon: String(payload.icon || "/icon-192.png").trim() || "/icon-192.png",
    badge: String(payload.badge || "/favicon-32x32.png").trim() || "/favicon-32x32.png",
    renotify: Boolean(payload.renotify),
    data: {
      route,
      url: "",
      notificationType,
      notification_type: notificationType,
      sessionId: String(payload?.data?.sessionId || fallback.sessionId || "").trim(),
      eventKey: String(payload?.data?.eventKey || fallback.eventKey || "").trim(),
      availableActions,
      available_actions: availableActions,
    },
    availableActions,
    available_actions: availableActions,
    actions,
  };
}

function normalizePushSubscriptionRecord(record = {}) {
  const subscriptionObject = record?.subscription && typeof record.subscription === "object"
    ? record.subscription
    : {};
  const endpoint = String(record?.endpoint || subscriptionObject?.endpoint || "").trim();
  const p256dhKey = String(record?.p256dh_key || "").trim();
  const authKey = String(record?.auth_key || "").trim();
  const subscription = endpoint
    ? {
      endpoint,
      expirationTime: subscriptionObject?.expirationTime || null,
      keys: {
        p256dh: subscriptionObject?.keys?.p256dh || p256dhKey,
        auth: subscriptionObject?.keys?.auth || authKey,
      },
    }
    : null;

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return null;
  }

  return {
    id: String(record?.id || "").trim(),
    userId: String(record?.user_id || "").trim(),
    deviceKey: String(record?.device_key || "").trim(),
    endpoint,
    permissionState: String(record?.permission_state || "default").trim().toLowerCase() || "default",
    pushEnabled: record?.push_enabled === true,
    disabledAt: record?.disabled_at ? String(record.disabled_at).trim() : "",
    subscription,
  };
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
    throw new Error(errorText || `Supabase auth user lookup failed with ${response.status}`);
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
    throw new Error(errorText || `Supabase REST request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function loadUserNotificationPreferences(userId, config) {
  const records = await supabaseRest(
    `${USER_NOTIFICATION_PREFERENCES_TABLE}?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    config,
  );
  return Array.isArray(records) && records.length ? normalizeNotificationPreferencesRow(records[0]) : normalizeNotificationPreferencesRow({});
}

async function loadActivePushSubscriptions(userId, excludeDeviceKeys = [], config, targetDeviceKeys = []) {
  const rows = await supabaseRest(
    `${PUSH_SUBSCRIPTIONS_TABLE}?user_id=eq.${encodeURIComponent(userId)}&push_enabled=is.true&permission_state=eq.granted&disabled_at=is.null&select=*`,
    config,
  );
  const excluded = new Set((Array.isArray(excludeDeviceKeys) ? excludeDeviceKeys : []).map((entry) => String(entry || "").trim()).filter(Boolean));
  const targeted = new Set((Array.isArray(targetDeviceKeys) ? targetDeviceKeys : []).map((entry) => String(entry || "").trim()).filter(Boolean));
  return (Array.isArray(rows) ? rows : [])
    .map((row) => normalizePushSubscriptionRecord(row))
    .filter((record) => record && !excluded.has(record.deviceKey))
    .filter((record) => !targeted.size || targeted.has(record.deviceKey));
}

async function loadExistingPushDeliveries(userId, eventKey, config) {
  const rows = await supabaseRest(
    `${PUSH_DELIVERIES_TABLE}?user_id=eq.${encodeURIComponent(userId)}&event_key=eq.${encodeURIComponent(eventKey)}&select=device_key,status`,
    config,
  );
  return Array.isArray(rows) ? rows : [];
}

async function upsertPushDeliveryRecord(record, config) {
  return supabaseRest(
    `${PUSH_DELIVERIES_TABLE}?on_conflict=user_id,event_key,device_key`,
    config,
    {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: record,
    },
  );
}

async function deletePushSubscriptionRecord(record, config) {
  if (!record?.id) {
    return;
  }
  await supabaseRest(
    `${PUSH_SUBSCRIPTIONS_TABLE}?id=eq.${encodeURIComponent(record.id)}`,
    config,
    {
      method: "DELETE",
      prefer: "return=minimal",
    },
  );
}

function shouldTreatSubscriptionAsExpired(error) {
  const statusCode = Number(error?.statusCode || error?.status || 0);
  return statusCode === 404 || statusCode === 410;
}

module.exports = async function handler(request, response) {
  const config = getRuntimeConfig();
  const readiness = getBackendReadiness(config);
  if (request.method === "GET") {
    return json(response, 200, {
      ok: true,
      reachable: true,
      configured: readiness.configured,
      supabaseConfigured: readiness.supabaseConfigured,
      vapidConfigured: readiness.vapidConfigured,
      vapidPublicKeyAvailable: readiness.vapidPublicKeyAvailable,
      supabaseUrlAvailable: readiness.supabaseUrlAvailable,
      supabaseServerKeyAvailable: readiness.supabaseServerKeyAvailable,
      statusLabel: readiness.statusLabel,
      message: readiness.message,
    });
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    return json(response, 405, { ok: false, error: "Method not allowed" });
  }

  if (!readiness.configured) {
    return json(response, 202, {
      ok: false,
      skipped: true,
      reason: readiness.message,
      statusLabel: readiness.statusLabel,
      supabaseConfigured: readiness.supabaseConfigured,
      vapidConfigured: readiness.vapidConfigured,
      vapidPublicKeyAvailable: readiness.vapidPublicKeyAvailable,
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
    webpush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey);

    const authenticatedUser = await supabaseAuthGetUser(accessToken, config);
    const userId = String(authenticatedUser?.id || "").trim();
    if (!userId) {
      return json(response, 401, { ok: false, error: "Could not verify the signed-in user." });
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
    const appOrigin = getEnv("CANNAKAN_APP_ORIGIN") || getRequestOrigin(request);
    const eventKey = String(payload.eventKey || "").trim();
    const category = String(payload.category || "").trim();
    const sessionId = String(payload.sessionId || payload?.notification?.sessionId || "").trim();
    const excludeDeviceKeys = Array.isArray(payload.excludeDeviceKeys) ? payload.excludeDeviceKeys : [];
    const targetDeviceKeys = Array.isArray(payload.targetDeviceKeys) ? payload.targetDeviceKeys : [];
    const isTest = payload.test === true;
    const notificationPayload = normalizePushPayload(payload.payload || {}, {
      eventKey,
      sessionId,
      route: payload.route || payload?.notification?.route || "#home",
      title: payload.title || payload?.notification?.title || "Cannakan® Grow",
      body: payload.body || payload?.notification?.message || "",
    });

    if (!eventKey) {
      return json(response, 400, { ok: false, error: "Missing event key." });
    }
    if (!ELIGIBLE_PUSH_CATEGORIES.has(category)) {
      return json(response, 400, { ok: false, error: "This notification category is not eligible for push delivery." });
    }

    const preferences = await loadUserNotificationPreferences(userId, config);
    if (preferences.pushNotificationsEnabled !== true) {
      return json(response, 200, { ok: true, skipped: true, reason: "Push notifications are disabled for this user." });
    }
    if (!isTest && !isPushCategoryEnabled(category, preferences)) {
      return json(response, 200, { ok: true, skipped: true, reason: "This notification category is disabled for this user." });
    }

    const subscriptions = await loadActivePushSubscriptions(userId, excludeDeviceKeys, config, targetDeviceKeys);
    if (!subscriptions.length) {
      return json(response, 200, { ok: true, skipped: true, reason: "No active push subscriptions are available for this user." });
    }

    const existingDeliveries = await loadExistingPushDeliveries(userId, eventKey, config);
    const alreadyDeliveredDeviceKeys = new Set(
      existingDeliveries
        .filter((entry) => ["sent", "delivered", "test-sent"].includes(String(entry?.status || "").trim()))
        .map((entry) => String(entry?.device_key || "").trim())
        .filter(Boolean),
    );

    const sentRecords = [];
    const skippedDeviceKeys = [];
    const invalidatedDeviceKeys = [];
    const failedDeviceKeys = [];

    for (const record of subscriptions) {
      if (!record || alreadyDeliveredDeviceKeys.has(record.deviceKey)) {
        if (record?.deviceKey) {
          skippedDeviceKeys.push(record.deviceKey);
        }
        continue;
      }

      const outboundPayload = {
        ...notificationPayload,
        data: {
          ...notificationPayload.data,
          url: buildAbsoluteUrl(appOrigin, notificationPayload.data.route),
        },
      };

      try {
        await webpush.sendNotification(record.subscription, JSON.stringify(outboundPayload), {
          TTL: 60 * 60,
          urgency: category === "supply-reminder" ? "high" : "normal",
          topic: notificationPayload.tag || eventKey,
        });

        await upsertPushDeliveryRecord({
          user_id: userId,
          event_key: eventKey,
          device_key: record.deviceKey,
          session_id: sessionId || null,
          category,
          endpoint: record.endpoint,
          status: isTest ? "test-sent" : "sent",
          notification_payload: outboundPayload,
          failure_code: "",
          failure_reason: "",
          sent_at: new Date().toISOString(),
        }, config);

        sentRecords.push(record.deviceKey);
      } catch (error) {
        if (shouldTreatSubscriptionAsExpired(error)) {
          await deletePushSubscriptionRecord(record, config);
          await upsertPushDeliveryRecord({
            user_id: userId,
            event_key: eventKey,
            device_key: record.deviceKey,
            session_id: sessionId || null,
            category,
            endpoint: record.endpoint,
            status: "invalid",
            notification_payload: outboundPayload,
            failure_code: String(error?.statusCode || error?.status || "").trim(),
            failure_reason: String(error?.body || error?.message || "Push subscription expired.").trim(),
            sent_at: null,
          }, config);
          invalidatedDeviceKeys.push(record.deviceKey);
          continue;
        }

        await upsertPushDeliveryRecord({
          user_id: userId,
          event_key: eventKey,
          device_key: record.deviceKey,
          session_id: sessionId || null,
          category,
          endpoint: record.endpoint,
          status: "failed",
          notification_payload: outboundPayload,
          failure_code: String(error?.statusCode || error?.status || "").trim(),
          failure_reason: String(error?.body || error?.message || "Push delivery failed.").trim(),
          sent_at: null,
        }, config);
        failedDeviceKeys.push(record.deviceKey);
      }
    }

    return json(response, 200, {
      ok: true,
      sentCount: sentRecords.length,
      skippedCount: skippedDeviceKeys.length,
      invalidatedCount: invalidatedDeviceKeys.length,
      failedCount: failedDeviceKeys.length,
      sentDeviceKeys: sentRecords,
      skippedDeviceKeys,
      invalidatedDeviceKeys,
      failedDeviceKeys,
    });
  } catch (error) {
    console.error("[push-send] Failed to send push notifications.", error);
    return json(response, 500, {
      ok: false,
      error: "Could not send push notifications.",
    });
  }
};
