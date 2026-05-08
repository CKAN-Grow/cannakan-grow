const webpush = require("web-push");

const GROW_SESSIONS_TABLE = "grow_sessions";
const USER_NOTIFICATION_PREFERENCES_TABLE = "user_notification_preferences";
const USER_PUSH_SUBSCRIPTIONS_TABLE = "user_push_subscriptions";
const PUSH_DELIVERIES_TABLE = "push_notification_deliveries";
const REMINDER_EVENTS_TABLE = "grow_session_reminder_events";
const PAGE_SIZE = 500;
const MAX_SEND_ATTEMPTS = 3;
const PUSH_NOTIFICATION_SNOOZE_ACTION_OPTIONS = Object.freeze(["30m", "1h", "tonight", "tomorrow-morning"]);

const GROW_REMINDER_RULES = Object.freeze([
  Object.freeze({
    key: "soaking-check-18h",
    stage: "soaking",
    category: "soaking-reminder",
    sendAfterHours: 18,
    maxHours: null,
    level: "guidance",
    title: "Time to check soaking progress",
    body: "Time to check soaking progress.",
    skipReasonDisabled: "Soaking reminders are disabled for this user.",
    urgency: "normal",
    actions: Object.freeze([
      Object.freeze({ action: "open-session", title: "Open Session", routeMode: "session" }),
      Object.freeze({ action: "review-session", title: "Review Session", routeMode: "session" }),
    ]),
  }),
  Object.freeze({
    key: "soaking-warning-24h",
    stage: "soaking",
    category: "soaking-reminder",
    sendAfterHours: 24,
    maxHours: null,
    level: "critical",
    title: "Urgent soaking warning",
    body: "Your seeds should not remain soaking much longer. Move them into germination to avoid drowning risk.",
    skipReasonDisabled: "Soaking reminders are disabled for this user.",
    urgency: "high",
    actions: Object.freeze([
      Object.freeze({ action: "open-session", title: "Open Session", routeMode: "session" }),
      Object.freeze({ action: "review-session", title: "Review Stage", routeMode: "session" }),
    ]),
  }),
  Object.freeze({
    key: "germination-check-window",
    stage: "germinating",
    category: "germination-reminder",
    sendAfterHours: 18,
    maxHours: 30,
    level: "guidance",
    title: "Time to check germination progress",
    body: "Time to check germination progress.",
    skipReasonDisabled: "Germination reminders are disabled for this user.",
    urgency: "normal",
    actions: Object.freeze([
      Object.freeze({ action: "open-session", title: "Open Session", routeMode: "session" }),
      Object.freeze({ action: "review-results", title: "Update Results", routeMode: "session" }),
    ]),
  }),
  Object.freeze({
    key: "completion-reminder-42h",
    stage: "germinating",
    category: "germination-reminder",
    sendAfterHours: 42,
    maxHours: null,
    level: "guidance",
    title: "Review your session when ready",
    body: "Review your session and mark completed when ready.",
    skipReasonDisabled: "Germination reminders are disabled for this user.",
    urgency: "normal",
    actions: Object.freeze([
      Object.freeze({ action: "open-session", title: "Open Session", routeMode: "session" }),
      Object.freeze({ action: "review-results", title: "Review Results", routeMode: "session" }),
    ]),
  }),
  Object.freeze({
    key: "completion-urgent-54h",
    stage: "germinating",
    category: "germination-reminder",
    sendAfterHours: 54,
    maxHours: null,
    level: "critical",
    title: "Session may need attention",
    body: "Your session may need attention. Mark completed or postpone the reminder.",
    skipReasonDisabled: "Germination reminders are disabled for this user.",
    urgency: "high",
    supportsPostpone: true,
    postponeOptionsHours: Object.freeze([2, 6, 12]),
    actions: Object.freeze([
      Object.freeze({ action: "open-session", title: "Open Session", routeMode: "session" }),
      Object.freeze({ action: "review-results", title: "Review Results", routeMode: "session" }),
    ]),
  }),
  Object.freeze({
    key: "wellness-check-72h",
    stage: "germinating",
    category: "germination-reminder",
    sendAfterHours: 72,
    maxHours: null,
    level: "critical",
    title: "Session wellness check",
    body: "Is everything okay with this session?",
    skipReasonDisabled: "Germination reminders are disabled for this user.",
    urgency: "normal",
    actions: Object.freeze([
      Object.freeze({ action: "open-session", title: "Open Session", routeMode: "session" }),
      Object.freeze({ action: "review-results", title: "Review Results", routeMode: "session" }),
    ]),
  }),
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
    appOrigin: getEnv("CANNAKAN_APP_ORIGIN"),
    cronSecret: getEnv("CRON_SECRET"),
  };
}

function json(response, status, payload) {
  response.setHeader("Cache-Control", "no-store");
  return response.status(status).json(payload);
}

function getAuthorizationHeader(request) {
  const headers = request?.headers || {};
  return String(headers.authorization || headers.Authorization || "").trim();
}

function getRequestOrigin(request) {
  const forwardedProto = String(request?.headers?.["x-forwarded-proto"] || "").trim();
  const forwardedHost = String(request?.headers?.["x-forwarded-host"] || request?.headers?.host || "").trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return "";
}

function isLocalRequest(request) {
  const host = String(request?.headers?.host || "").trim().toLowerCase();
  return host.startsWith("localhost:")
    || host.startsWith("127.0.0.1:")
    || host.startsWith("[::1]:")
    || host === "localhost"
    || host === "127.0.0.1"
    || host === "[::1]";
}

function isAuthorizedRunnerRequest(request, config) {
  const authorizationHeader = getAuthorizationHeader(request);
  if (config.cronSecret) {
    return authorizationHeader === `Bearer ${config.cronSecret}`;
  }
  return isLocalRequest(request);
}

function getBackendReadiness(config = {}) {
  const supabaseConfigured = Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
  const vapidConfigured = Boolean(config.vapidPublicKey && config.vapidPrivateKey);
  const cronSecretAvailable = Boolean(config.cronSecret);
  return {
    configured: Boolean(supabaseConfigured && vapidConfigured),
    supabaseConfigured,
    vapidConfigured,
    cronSecretAvailable,
    appOriginAvailable: Boolean(config.appOrigin),
  };
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
  const pushPreferenceKeys = ["push_notifications_enabled", "pushNotificationsEnabled", "push_notifications"];
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
    pushNotificationsEnabled: getObjectBooleanValue(
      row,
      pushPreferenceKeys,
      hasPushPreference ? growRemindersEnabled : (hasPreferenceRow ? growRemindersEnabled : false),
    ),
    push_notifications_enabled: getObjectBooleanValue(
      row,
      pushPreferenceKeys,
      hasPushPreference ? growRemindersEnabled : (hasPreferenceRow ? growRemindersEnabled : false),
    ),
    pushPreferenceConfigured: hasPushPreference,
  };
}

function normalizeSessionStatus(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  if (["germinating", "germination", "first-germinated"].includes(normalized)) {
    return "germinating";
  }
  if (["completed", "closed"].includes(normalized)) {
    return "completed";
  }
  if (normalized === "soaking") {
    return "soaking";
  }
  return "";
}

function parseTimestamp(value) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return null;
  }
  const parsed = new Date(normalizedValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseSessionStartDateTime(sessionDate = "", sessionTime = "") {
  const normalizedDate = String(sessionDate || "").trim();
  if (!normalizedDate) {
    return null;
  }
  const normalizedTime = String(sessionTime || "").trim() || "00:00";
  const parsed = new Date(`${normalizedDate}T${normalizedTime}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getStageStartDateTime(session = {}, stage = "") {
  if (stage === "germinating") {
    return parseTimestamp(session?.germinationStartedAt || session?.germination_started_at || "")
      || parseSessionStartDateTime(session?.date || "", session?.time || "");
  }
  return parseSessionStartDateTime(session?.date || "", session?.time || "");
}

function buildAbsoluteUrl(appOrigin = "", route = "#home") {
  const normalizedOrigin = String(appOrigin || "").trim().replace(/\/+$/, "");
  const normalizedRoute = String(route || "").trim() || "#home";
  if (!normalizedOrigin) {
    return "";
  }
  if (normalizedRoute.startsWith("http")) {
    return normalizedRoute;
  }
  if (normalizedRoute.startsWith("/")) {
    return `${normalizedOrigin}${normalizedRoute}`;
  }
  return `${normalizedOrigin}/${normalizedRoute.startsWith("#") ? normalizedRoute : `#${normalizedRoute.replace(/^#/, "")}`}`;
}

function buildStageProgressReminderEventKey(sessionId = "", reminderKey = "", attemptCount = 1) {
  const normalizedSessionId = String(sessionId || "").trim();
  const normalizedReminderKey = String(reminderKey || "").trim();
  const normalizedAttemptCount = Math.max(1, Number(attemptCount) || 1);
  if (!normalizedSessionId || !normalizedReminderKey) {
    return "";
  }
  return normalizedAttemptCount > 1
    ? `stage-progress:${normalizedSessionId}:${normalizedReminderKey}:attempt-${normalizedAttemptCount}`
    : `stage-progress:${normalizedSessionId}:${normalizedReminderKey}`;
}

function buildReminderRoute(session = {}) {
  const sessionId = String(session?.id || "").trim();
  return sessionId ? `#sessions/${sessionId}` : "#sessions";
}

function buildReminderActionRoute(sessionId = "", actionKind = "open-session", eventKey = "") {
  const normalizedSessionId = String(sessionId || "").trim();
  if (!normalizedSessionId) {
    return "#sessions";
  }
  const normalizedActionKind = String(actionKind || "open-session").trim();
  if (!normalizedActionKind || normalizedActionKind === "open-session") {
    return `#sessions/${normalizedSessionId}`;
  }
  return `#sessions/${normalizedSessionId}/notify/${normalizedActionKind}/${encodeURIComponent(String(eventKey || "").trim())}`;
}

function buildReminderAvailableActions(rule, session, eventKey) {
  const sessionId = String(session?.id || "").trim();
  const normalizedStatus = normalizeSessionStatus(session?.sessionStatus || "");
  if (!sessionId) {
    return [];
  }

  const actions = [
    {
      kind: "open-session",
      action: "open-session",
      label: "Open Session",
      title: "Open Session",
      route: buildReminderActionRoute(sessionId, "open-session", eventKey),
      sessionId,
      eventKey,
      notificationButton: false,
    },
    {
      kind: "snooze-reminder",
      action: "snooze-reminder",
      label: "Remind Me Later",
      title: "Remind Me Later",
      route: buildReminderActionRoute(sessionId, "snooze", eventKey),
      sessionId,
      eventKey,
      snoozeOptions: PUSH_NOTIFICATION_SNOOZE_ACTION_OPTIONS,
    },
    {
      kind: "session-update-stage",
      action: "session-update-stage",
      label: "Update Stage",
      title: "Update Stage",
      route: buildReminderActionRoute(sessionId, "update-stage", eventKey),
      sessionId,
      eventKey,
    },
  ];

  if (normalizedStatus === "soaking") {
    actions.push({
      kind: "session-stage-germinating",
      action: "session-stage-germinating",
      label: "Mark Germinating",
      title: "Mark Germinating",
      route: buildReminderActionRoute(sessionId, "mark-germinating", eventKey),
      sessionId,
      eventKey,
    });
  } else if (normalizedStatus === "germinating" && String(rule?.key || "").trim() === "completion-urgent-54h") {
    actions.push({
      kind: "session-stage-completed",
      action: "session-stage-completed",
      label: "Mark Completed",
      title: "Mark Completed",
      route: buildReminderActionRoute(sessionId, "mark-completed", eventKey),
      sessionId,
      eventKey,
    });
  } else if (normalizedStatus === "germinating") {
    actions.push({
      kind: "session-stage-first-germinated",
      action: "session-stage-first-germinated",
      label: "Mark Germination Started",
      title: "Mark Germination Started",
      route: buildReminderActionRoute(sessionId, "mark-first-germinated", eventKey),
      sessionId,
      eventKey,
    });
  }

  return actions;
}

function buildReminderNotificationPayload(rule, session, appOrigin, attemptCount = 1) {
  const route = buildReminderRoute(session);
  const eventKey = buildStageProgressReminderEventKey(session?.id || "", rule?.key || "", attemptCount);
  const availableActions = buildReminderAvailableActions(rule, session, eventKey);
  const actions = availableActions
    .filter((action) => action.notificationButton !== false && action.kind !== "open-session")
    .slice(0, 2);

  return {
    eventKey,
    payload: {
      title: String(rule?.title || "Cannakan Grow reminder").trim(),
      body: String(rule?.body || "").trim(),
      tag: eventKey,
      notification_type: "grow-reminder",
      notificationType: "grow-reminder",
      data: {
        route,
        url: buildAbsoluteUrl(appOrigin, route),
        notificationType: "grow-reminder",
        notification_type: "grow-reminder",
        sessionId: String(session?.id || "").trim(),
        eventKey,
        reminderKey: String(rule?.key || "").trim(),
        supportsPostpone: rule?.supportsPostpone === true,
        postponeOptionsHours: Array.isArray(rule?.postponeOptionsHours) ? rule.postponeOptionsHours : [],
        availableActions,
        available_actions: availableActions,
      },
      availableActions,
      available_actions: availableActions,
      actions,
    },
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
    pushEnabled: record?.push_enabled === true,
    disabledAt: record?.disabled_at ? String(record.disabled_at).trim() : "",
    subscription,
  };
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

async function fetchAllCandidateSessions(config) {
  const sessions = [];
  let offset = 0;

  while (true) {
    const rows = await supabaseRest(
      `${GROW_SESSIONS_TABLE}?select=id,user_id,date,time,session_name,custom_session_name,session_status,germination_started_at,completed_at,is_deleted&is_deleted=is.false&session_status=in.(soaking,germinating,completed)&order=created_at.asc&limit=${PAGE_SIZE}&offset=${offset}`,
      config,
    );
    const normalizedRows = Array.isArray(rows) ? rows : [];
    sessions.push(...normalizedRows);
    if (normalizedRows.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }

  return sessions.map((row) => ({
    id: String(row?.id || "").trim(),
    userId: String(row?.user_id || "").trim(),
    date: String(row?.date || "").trim(),
    time: String(row?.time || "").trim(),
    sessionName: String(row?.session_name || row?.custom_session_name || "").trim(),
    sessionStatus: normalizeSessionStatus(row?.session_status || ""),
    germinationStartedAt: String(row?.germination_started_at || "").trim(),
    completedAt: String(row?.completed_at || "").trim(),
  })).filter((row) => row.id && row.userId && row.sessionStatus);
}

async function loadReminderEventsForSession(userId, sessionId, config) {
  const rows = await supabaseRest(
    `${REMINDER_EVENTS_TABLE}?user_id=eq.${encodeURIComponent(userId)}&session_id=eq.${encodeURIComponent(sessionId)}&select=*`,
    config,
  );
  const map = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    map.set(String(row?.reminder_key || "").trim(), row);
  });
  return map;
}

async function upsertReminderEventRecord(record, config) {
  const rows = await supabaseRest(
    `${REMINDER_EVENTS_TABLE}?on_conflict=user_id,session_id,reminder_key`,
    config,
    {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=representation",
      body: record,
    },
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function loadUserNotificationPreferences(userId, config, cache) {
  if (cache.has(userId)) {
    return cache.get(userId);
  }
  const rows = await supabaseRest(
    `${USER_NOTIFICATION_PREFERENCES_TABLE}?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    config,
  );
  const normalized = Array.isArray(rows) && rows.length
    ? normalizeNotificationPreferencesRow(rows[0])
    : normalizeNotificationPreferencesRow({});
  console.info("[Push Preferences] grow-reminders loaded", {
    userId,
    rowPushNotificationsEnabled: Array.isArray(rows) && rows.length ? rows[0]?.push_notifications_enabled : undefined,
    rowCachedPushNotificationsEnabled: Array.isArray(rows) && rows.length ? rows[0]?.pushNotificationsEnabled : undefined,
    computedPushNotificationsEnabled: normalized.pushNotificationsEnabled,
  });
  cache.set(userId, normalized);
  return normalized;
}

async function loadActivePushSubscriptions(userId, config) {
  const rows = await supabaseRest(
    `${USER_PUSH_SUBSCRIPTIONS_TABLE}?user_id=eq.${encodeURIComponent(userId)}&push_enabled=is.true&permission_state=eq.granted&disabled_at=is.null&select=*`,
    config,
  );
  return (Array.isArray(rows) ? rows : [])
    .map((row) => normalizePushSubscriptionRecord(row))
    .filter(Boolean);
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
    `${USER_PUSH_SUBSCRIPTIONS_TABLE}?id=eq.${encodeURIComponent(record.id)}`,
    config,
    {
      method: "DELETE",
      prefer: "return=minimal",
    },
  );
}

async function updatePushSubscriptionDeliveryTimestamp(record, config, sentAtIso) {
  if (!record?.id || !sentAtIso) {
    return;
  }
  await supabaseRest(
    `${USER_PUSH_SUBSCRIPTIONS_TABLE}?id=eq.${encodeURIComponent(record.id)}`,
    config,
    {
      method: "PATCH",
      prefer: "return=minimal",
      body: {
        last_delivery_at: sentAtIso,
        disabled_at: null,
      },
    },
  );
}

function shouldTreatSubscriptionAsExpired(error) {
  const statusCode = Number(error?.statusCode || error?.status || 0);
  return statusCode === 404 || statusCode === 410;
}

function getRuleDueAt(session, rule) {
  const stageStart = getStageStartDateTime(session, rule?.stage || "");
  if (!(stageStart instanceof Date) || Number.isNaN(stageStart.getTime())) {
    return null;
  }
  return new Date(stageStart.getTime() + (Math.max(0, Number(rule?.sendAfterHours) || 0) * 60 * 60 * 1000));
}

function getRuleElapsedHours(session, rule, now) {
  const stageStart = getStageStartDateTime(session, rule?.stage || "");
  if (!(stageStart instanceof Date) || Number.isNaN(stageStart.getTime())) {
    return -1;
  }
  return Math.max(0, (now.getTime() - stageStart.getTime()) / (60 * 60 * 1000));
}

function isReminderRecordTerminal(record = {}) {
  const status = String(record?.status || "").trim().toLowerCase();
  return ["sent", "suppressed", "skipped", "invalidated"].includes(status);
}

function getCurrentActiveRule(session, now) {
  const normalizedStatus = normalizeSessionStatus(session?.sessionStatus || "");
  if (!normalizedStatus || normalizedStatus === "completed") {
    return null;
  }

  const dueRules = GROW_REMINDER_RULES
    .filter((rule) => rule.stage === normalizedStatus)
    .filter((rule) => {
      const dueAt = getRuleDueAt(session, rule);
      if (!dueAt || now.getTime() < dueAt.getTime()) {
        return false;
      }
      const elapsedHours = getRuleElapsedHours(session, rule, now);
      if (Number.isFinite(rule.maxHours) && elapsedHours > Number(rule.maxHours)) {
        return false;
      }
      return true;
    })
    .sort((left, right) => (Number(right.sendAfterHours) || 0) - (Number(left.sendAfterHours) || 0));

  return dueRules[0] || null;
}

function getSuppressionReason(session, rule, activeRule, now) {
  const normalizedStatus = normalizeSessionStatus(session?.sessionStatus || "");
  const dueAt = getRuleDueAt(session, rule);
  if (!dueAt || now.getTime() < dueAt.getTime()) {
    return "";
  }
  if (rule.stage === "soaking" && normalizedStatus !== "soaking") {
    return "session-left-soaking-before-reminder";
  }
  if (rule.stage === "germinating" && normalizedStatus === "completed") {
    return "session-completed-before-reminder";
  }
  const elapsedHours = getRuleElapsedHours(session, rule, now);
  if (Number.isFinite(rule.maxHours) && elapsedHours > Number(rule.maxHours)) {
    return "reminder-window-expired";
  }
  if (activeRule && activeRule.key !== rule.key && activeRule.stage === rule.stage && Number(activeRule.sendAfterHours) > Number(rule.sendAfterHours)) {
    return `superseded-by-${activeRule.key}`;
  }
  return "";
}

function buildReminderEventUpsert(session, rule, existingRecord, status, extras = {}) {
  const dueAt = getRuleDueAt(session, rule);
  const resolvedPostponedUntil = Object.prototype.hasOwnProperty.call(extras, "postponedUntil")
    ? extras.postponedUntil
    : (status === "postponed" ? (existingRecord?.postponed_until || null) : null);
  const basePayload = {
    user_id: session.userId,
    session_id: session.id,
    reminder_key: rule.key,
    reminder_type: rule.key,
    category: rule.category,
    session_status: normalizeSessionStatus(session.sessionStatus || ""),
    status,
    skip_reason: String(extras.skipReason || "").trim(),
    scheduled_for: dueAt ? dueAt.toISOString() : null,
    due_at: dueAt ? dueAt.toISOString() : null,
    sent_at: extras.sentAt || (existingRecord?.sent_at || null),
    postponed_until: resolvedPostponedUntil,
    last_evaluated_at: new Date().toISOString(),
    attempt_count: Math.max(0, Number(extras.attemptCount ?? existingRecord?.attempt_count ?? 0) || 0),
    delivery_count: Math.max(0, Number(extras.deliveryCount ?? existingRecord?.delivery_count ?? 0) || 0),
    postpone_count: Math.max(0, Number(extras.postponeCount ?? existingRecord?.postpone_count ?? 0) || 0),
    event_key: String(extras.eventKey || existingRecord?.event_key || "").trim(),
    notification_payload: extras.notificationPayload || existingRecord?.notification_payload || {},
    metadata: extras.metadata || existingRecord?.metadata || {},
  };
  return basePayload;
}

function buildExecutionSummary(readiness) {
  return {
    ok: true,
    configured: readiness.configured,
    supabaseConfigured: readiness.supabaseConfigured,
    vapidConfigured: readiness.vapidConfigured,
    cronSecretAvailable: readiness.cronSecretAvailable,
    appOriginAvailable: readiness.appOriginAvailable,
    processedSessions: 0,
    sent: 0,
    skipped: 0,
    suppressed: 0,
    postponed: 0,
    invalidated: 0,
    failed: 0,
    duplicatesPrevented: 0,
    errors: [],
  };
}

async function deliverReminder(rule, session, existingRecord, config, preferencesCache) {
  const preferences = await loadUserNotificationPreferences(session.userId, config, preferencesCache);
  if (preferences.growRemindersEnabled === false) {
    return {
      status: "skipped",
      skipReason: "grow-reminders-disabled",
      message: "Grow reminders are disabled for this user.",
    };
  }
  if (rule.stage === "soaking" && preferences.notifySoakingReminders === false) {
    return {
      status: "skipped",
      skipReason: "soaking-reminders-disabled",
      message: rule.skipReasonDisabled,
    };
  }
  if (rule.stage === "germinating" && preferences.notifyGerminationReminders === false) {
    return {
      status: "skipped",
      skipReason: "germination-reminders-disabled",
      message: rule.skipReasonDisabled,
    };
  }
  if (preferences.pushNotificationsEnabled !== true) {
    return {
      status: "skipped",
      skipReason: "push-notifications-disabled",
      message: "Push notifications are disabled for this user.",
    };
  }

  const postponedUntil = parseTimestamp(existingRecord?.postponed_until || "");
  if (postponedUntil && postponedUntil.getTime() > Date.now()) {
    return {
      status: "postponed",
      skipReason: "postponed-until-future-time",
      postponedUntil: postponedUntil.toISOString(),
      message: "Reminder is postponed until a later time.",
    };
  }

  const existingAttemptCount = Math.max(0, Number(existingRecord?.attempt_count || 0) || 0);
  if (String(existingRecord?.status || "").trim().toLowerCase() === "failed" && existingAttemptCount >= MAX_SEND_ATTEMPTS) {
    return {
      status: "failed",
      skipReason: "max-send-attempts-reached",
      message: "Reminder reached the maximum retry count.",
    };
  }

  const subscriptions = await loadActivePushSubscriptions(session.userId, config);
  if (!subscriptions.length) {
    return {
      status: "skipped",
      skipReason: "no-active-device",
      message: "No active push subscriptions are available for this user.",
    };
  }

  const attemptCount = existingAttemptCount + 1;
  const appOrigin = config.appOrigin || getEnv("CANNAKAN_APP_ORIGIN");
  const { eventKey, payload } = buildReminderNotificationPayload(rule, session, appOrigin, attemptCount);
  const sentAtIso = new Date().toISOString();
  const sentDeviceKeys = [];
  const invalidatedDeviceKeys = [];
  const failedDeviceKeys = [];

  webpush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey);

  for (const subscriptionRecord of subscriptions) {
    try {
      await webpush.sendNotification(subscriptionRecord.subscription, JSON.stringify(payload), {
        TTL: 60 * 60,
        urgency: rule.urgency === "high" ? "high" : "normal",
        topic: payload.tag || eventKey,
      });

      await upsertPushDeliveryRecord({
        user_id: session.userId,
        event_key: eventKey,
        device_key: subscriptionRecord.deviceKey,
        session_id: session.id,
        category: rule.category,
        endpoint: subscriptionRecord.endpoint,
        status: "sent",
        notification_payload: payload,
        failure_code: "",
        failure_reason: "",
        sent_at: sentAtIso,
      }, config);
      await updatePushSubscriptionDeliveryTimestamp(subscriptionRecord, config, sentAtIso);
      sentDeviceKeys.push(subscriptionRecord.deviceKey);
    } catch (error) {
      if (shouldTreatSubscriptionAsExpired(error)) {
        await deletePushSubscriptionRecord(subscriptionRecord, config);
        await upsertPushDeliveryRecord({
          user_id: session.userId,
          event_key: eventKey,
          device_key: subscriptionRecord.deviceKey,
          session_id: session.id,
          category: rule.category,
          endpoint: subscriptionRecord.endpoint,
          status: "invalid",
          notification_payload: payload,
          failure_code: String(error?.statusCode || error?.status || "").trim(),
          failure_reason: String(error?.body || error?.message || "Push subscription expired.").trim(),
          sent_at: null,
        }, config);
        invalidatedDeviceKeys.push(subscriptionRecord.deviceKey);
        continue;
      }

      await upsertPushDeliveryRecord({
        user_id: session.userId,
        event_key: eventKey,
        device_key: subscriptionRecord.deviceKey,
        session_id: session.id,
        category: rule.category,
        endpoint: subscriptionRecord.endpoint,
        status: "failed",
        notification_payload: payload,
        failure_code: String(error?.statusCode || error?.status || "").trim(),
        failure_reason: String(error?.body || error?.message || "Push delivery failed.").trim(),
        sent_at: null,
      }, config);
      failedDeviceKeys.push(subscriptionRecord.deviceKey);
    }
  }

  if (sentDeviceKeys.length) {
    return {
      status: "sent",
      sentAt: sentAtIso,
      eventKey,
      attemptCount,
      deliveryCount: Math.max(0, Number(existingRecord?.delivery_count || 0) || 0) + sentDeviceKeys.length,
      notificationPayload: payload,
      metadata: {
        sentDeviceKeys,
        invalidatedDeviceKeys,
        failedDeviceKeys,
        supportsPostpone: rule.supportsPostpone === true,
        postponeOptionsHours: Array.isArray(rule.postponeOptionsHours) ? rule.postponeOptionsHours : [],
      },
    };
  }

  if (invalidatedDeviceKeys.length && !failedDeviceKeys.length) {
    return {
      status: "invalidated",
      skipReason: "all-subscriptions-expired",
      eventKey,
      attemptCount,
      notificationPayload: payload,
      metadata: {
        sentDeviceKeys,
        invalidatedDeviceKeys,
        failedDeviceKeys,
      },
    };
  }

  return {
    status: "failed",
    skipReason: "push-delivery-failed",
    eventKey,
    attemptCount,
    notificationPayload: payload,
    metadata: {
      sentDeviceKeys,
      invalidatedDeviceKeys,
      failedDeviceKeys,
    },
  };
}

async function processSessionReminders(session, config, preferencesCache, summary, now) {
  const existingRecords = await loadReminderEventsForSession(session.userId, session.id, config);
  const activeRule = getCurrentActiveRule(session, now);

  for (const rule of GROW_REMINDER_RULES) {
    const existingRecord = existingRecords.get(rule.key) || null;
    const suppressionReason = getSuppressionReason(session, rule, activeRule, now);
    if (rule.key !== activeRule?.key && suppressionReason && !["sent", "suppressed"].includes(String(existingRecord?.status || "").trim().toLowerCase())) {
      await upsertReminderEventRecord(buildReminderEventUpsert(session, rule, existingRecord, "suppressed", {
        skipReason: suppressionReason,
        metadata: {
          activeRuleKey: String(activeRule?.key || "").trim(),
          sessionStatus: normalizeSessionStatus(session.sessionStatus || ""),
        },
      }), config);
      existingRecords.set(rule.key, { ...(existingRecord || {}), status: "suppressed", skip_reason: suppressionReason });
      summary.suppressed += 1;
    }
  }

  if (!activeRule) {
    return;
  }

  const existingRecord = existingRecords.get(activeRule.key) || null;
  if (isReminderRecordTerminal(existingRecord)) {
    summary.duplicatesPrevented += 1;
    return;
  }

  const deliveryResult = await deliverReminder(activeRule, session, existingRecord, config, preferencesCache);
  const currentAttemptCount = Math.max(0, Number(existingRecord?.attempt_count || 0) || 0);
  const currentDeliveryCount = Math.max(0, Number(existingRecord?.delivery_count || 0) || 0);

  if (deliveryResult.status === "postponed") {
    await upsertReminderEventRecord(buildReminderEventUpsert(session, activeRule, existingRecord, "postponed", {
      skipReason: deliveryResult.skipReason,
      postponedUntil: deliveryResult.postponedUntil || existingRecord?.postponed_until || null,
      attemptCount: currentAttemptCount,
      deliveryCount: currentDeliveryCount,
      metadata: {
        ...(existingRecord?.metadata || {}),
        lastMessage: deliveryResult.message,
      },
    }), config);
    summary.postponed += 1;
    return;
  }

  if (deliveryResult.status === "sent") {
    await upsertReminderEventRecord(buildReminderEventUpsert(session, activeRule, existingRecord, "sent", {
      sentAt: deliveryResult.sentAt,
      eventKey: deliveryResult.eventKey,
      attemptCount: deliveryResult.attemptCount,
      deliveryCount: deliveryResult.deliveryCount,
      notificationPayload: deliveryResult.notificationPayload,
      metadata: deliveryResult.metadata,
    }), config);
    summary.sent += 1;
    return;
  }

  if (deliveryResult.status === "invalidated") {
    await upsertReminderEventRecord(buildReminderEventUpsert(session, activeRule, existingRecord, "invalidated", {
      skipReason: deliveryResult.skipReason,
      eventKey: deliveryResult.eventKey,
      attemptCount: deliveryResult.attemptCount,
      deliveryCount: currentDeliveryCount,
      notificationPayload: deliveryResult.notificationPayload,
      metadata: deliveryResult.metadata,
    }), config);
    summary.invalidated += 1;
    return;
  }

  if (deliveryResult.status === "failed") {
    await upsertReminderEventRecord(buildReminderEventUpsert(session, activeRule, existingRecord, "failed", {
      skipReason: deliveryResult.skipReason,
      eventKey: deliveryResult.eventKey || existingRecord?.event_key || "",
      attemptCount: deliveryResult.attemptCount || currentAttemptCount,
      deliveryCount: currentDeliveryCount,
      notificationPayload: deliveryResult.notificationPayload || existingRecord?.notification_payload || {},
      metadata: deliveryResult.metadata || existingRecord?.metadata || {},
    }), config);
    summary.failed += 1;
    return;
  }

  await upsertReminderEventRecord(buildReminderEventUpsert(session, activeRule, existingRecord, "skipped", {
    skipReason: deliveryResult.skipReason,
    attemptCount: currentAttemptCount,
    deliveryCount: currentDeliveryCount,
    metadata: {
      ...(existingRecord?.metadata || {}),
      lastMessage: deliveryResult.message,
    },
  }), config);
  summary.skipped += 1;
}

async function executeReminderRun(config) {
  const readiness = getBackendReadiness(config);
  const summary = buildExecutionSummary(readiness);

  if (!readiness.configured) {
    return summary;
  }

  const now = new Date();
  const preferencesCache = new Map();
  const sessions = await fetchAllCandidateSessions(config);
  summary.processedSessions = sessions.length;

  for (const session of sessions) {
    try {
      await processSessionReminders(session, config, preferencesCache, summary, now);
    } catch (error) {
      summary.failed += 1;
      summary.errors.push({
        sessionId: session.id,
        message: String(error?.message || error || "Reminder processing failed."),
      });
    }
  }

  console.log("[Grow Reminders] Execution summary", summary);
  return summary;
}

async function runAuthorizedExecution(request, response, config) {
  const readiness = getBackendReadiness(config);
  if (!readiness.configured) {
    return json(response, 202, {
      ok: false,
      reachable: true,
      configured: false,
      supabaseConfigured: readiness.supabaseConfigured,
      vapidConfigured: readiness.vapidConfigured,
      cronSecretAvailable: readiness.cronSecretAvailable,
      error: "Grow reminder delivery backend is not configured yet.",
    });
  }
  const summary = await executeReminderRun(config);
  return json(response, 200, summary);
}

async function handler(request, response) {
  const config = getRuntimeConfig();
  const readiness = getBackendReadiness(config);

  if (request.method === "GET") {
    if (isAuthorizedRunnerRequest(request, config)) {
      return runAuthorizedExecution(request, response, config);
    }
    return json(response, 200, {
      ok: true,
      reachable: true,
      configured: readiness.configured,
      supabaseConfigured: readiness.supabaseConfigured,
      vapidConfigured: readiness.vapidConfigured,
      cronSecretAvailable: readiness.cronSecretAvailable,
      appOriginAvailable: readiness.appOriginAvailable,
      message: readiness.configured
        ? "Grow reminder runner is configured."
        : "Grow reminder runner is waiting on backend configuration.",
    });
  }

  if (request.method === "POST") {
    if (!isAuthorizedRunnerRequest(request, config)) {
      return json(response, 401, {
        ok: false,
        error: "Unauthorized reminder runner request.",
      });
    }
    return runAuthorizedExecution(request, response, config);
  }

  response.setHeader("Allow", "GET, POST");
  return json(response, 405, { ok: false, error: "Method not allowed" });
}

module.exports = handler;
module.exports._private = {
  GROW_REMINDER_RULES,
  buildStageProgressReminderEventKey,
  buildReminderNotificationPayload,
  buildReminderEventUpsert,
  deliverReminder,
  executeReminderRun,
  getCurrentActiveRule,
  getSuppressionReason,
  getRuleDueAt,
  getRuleElapsedHours,
  getRuntimeConfig,
  getBackendReadiness,
  isAuthorizedRunnerRequest,
  normalizeNotificationPreferencesRow,
  normalizeSessionStatus,
  parseSessionStartDateTime,
};
