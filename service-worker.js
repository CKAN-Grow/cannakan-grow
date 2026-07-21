const CACHE_NAME = "cannakan-grow-shell-v34-profile-editorial-illustration";
const APP_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/profile-hero-catalog-data.js",
  "/profile-hero-catalog.js",
  "/assets/images/profile-heroes/catalog.json",
  "/supabase-config.js",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
];
const NETWORK_FIRST_PATHS = new Set([
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/profile-hero-catalog.js",
  "/assets/images/profile-heroes/catalog.json",
  "/supabase-config.js",
  "/manifest.json",
]);
const loggedPrecacheWarnings = new Set();

function logPrecacheWarningOnce(assetPath, error) {
  const normalizedAssetPath = String(assetPath || "").trim();
  if (!normalizedAssetPath || loggedPrecacheWarnings.has(normalizedAssetPath)) {
    return;
  }

  loggedPrecacheWarnings.add(normalizedAssetPath);
  console.warn("[Service Worker] Skipped missing precache asset", {
    assetPath: normalizedAssetPath,
    message: String(error?.message || error || "").trim(),
  });
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.all(APP_SHELL_ASSETS.map(async (assetPath) => {
    try {
      const request = new Request(assetPath, { cache: "reload" });
      const response = await fetch(request);
      if (!response || !response.ok) {
        logPrecacheWarningOnce(assetPath, `HTTP ${response?.status || "missing"}`);
        return;
      }

      await cache.put(request, response.clone());
    } catch (error) {
      logPrecacheWarningOnce(assetPath, error);
    }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAppShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME)
        .map((key) => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type === "opaque") {
    return response;
  }

  let responseClone = null;
  try {
    responseClone = response.clone();
  } catch (error) {
    return response;
  }

  void caches.open(CACHE_NAME).then((cache) => {
    return cache.put(request, responseClone);
  }).catch(() => {});
  return response;
}

function fetchNetworkFirst(request, fallbackToIndex = false) {
  return fetch(request)
    .then((response) => cacheResponse(request, response))
    .catch(async () => {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }

      if (fallbackToIndex) {
        return caches.match("/index.html");
      }

      throw new Error(`Network request failed for ${request.url}`);
    });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigationRequest = event.request.mode === "navigate";
  const shouldUseNetworkFirst = isSameOrigin && (isNavigationRequest || NETWORK_FIRST_PATHS.has(requestUrl.pathname));

  if (shouldUseNetworkFirst) {
    event.respondWith(fetchNetworkFirst(event.request, isNavigationRequest));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => isSameOrigin ? cacheResponse(event.request, response) : response)
        .catch(() => isNavigationRequest ? caches.match("/index.html") : undefined);
    }),
  );
});

function normalizeNotificationAction(action = {}, index = 0, fallback = {}) {
  const source = action && typeof action === "object" ? action : {};
  const actionId = String(source.action || source.kind || source.id || `action-${index + 1}`).trim();
  const actionTitle = String(source.title || source.label || "").trim();
  const sessionId = String(source.sessionId || source.session_id || fallback.sessionId || "").trim();
  const eventKey = String(source.eventKey || source.event_key || fallback.eventKey || "").trim();
  const route = String(source.route || fallback.route || "").trim();
  if (!actionId || !actionTitle) {
    return null;
  }

  return {
    action: actionId,
    kind: String(source.kind || actionId).trim(),
    title: actionTitle,
    label: actionTitle,
    route,
    focusTarget: String(source.focusTarget || source.focus_target || "").trim(),
    sessionId,
    eventKey,
    snoozeOptions: Array.isArray(source.snoozeOptions || source.snooze_options)
      ? (source.snoozeOptions || source.snooze_options).map((option) => String(option || "").trim()).filter(Boolean)
      : [],
    showButton: source.showButton !== false && source.notificationButton !== false,
  };
}

function buildNotificationActionRoute(action = {}, fallback = {}) {
  const explicitRoute = String(action?.route || "").trim();
  if (explicitRoute) {
    return explicitRoute;
  }

  const sessionId = String(action?.sessionId || fallback.sessionId || "").trim();
  const eventKey = encodeURIComponent(String(action?.eventKey || fallback.eventKey || "").trim());
  const actionKind = String(action?.kind || action?.action || "").trim();
  if (!sessionId || !actionKind) {
    return String(fallback.route || "#home").trim() || "#home";
  }

  switch (actionKind) {
    case "snooze-reminder":
      return `#sessions/${sessionId}/notify/snooze/${eventKey}`;
    case "session-complete":
      return `#sessions/${sessionId}/notify/mark-completed/${eventKey}`;
    case "session-focus-results":
      return `#sessions/${sessionId}/notify/focus-results/${eventKey}`;
    case "open-session":
    case "route":
    default:
      return `#sessions/${sessionId}`;
  }
}

function buildNotificationPayload(payload = {}) {
  const title = String(payload.title || "Cannakan® Grow").trim() || "Cannakan® Grow";
  const body = String(payload.body || "").trim();
  const tag = String(payload.tag || "cannakan-grow-notification").trim();
  const route = String(payload?.data?.route || payload.route || "#home").trim() || "#home";
  const notificationType = String(
    payload.notification_type
    || payload.notificationType
    || payload?.data?.notification_type
    || payload?.data?.notificationType
    || "",
  ).trim();
  const fallback = {
    route,
    sessionId: String(payload?.data?.sessionId || payload?.data?.session_id || "").trim(),
    eventKey: String(payload?.data?.eventKey || payload?.data?.event_key || "").trim(),
  };
  const rawAvailableActions = Array.isArray(payload.available_actions)
    ? payload.available_actions
    : (Array.isArray(payload.availableActions) ? payload.availableActions : payload.actions);
  const availableActions = Array.isArray(rawAvailableActions)
    ? rawAvailableActions.map((action, index) => normalizeNotificationAction(action, index, fallback)).filter(Boolean)
    : [];
  const visibleActions = availableActions
    .filter((action) => action.showButton && action.kind !== "open-session")
    .map((action) => ({
      ...action,
      route: buildNotificationActionRoute(action, fallback),
    }))
    .slice(0, 2);
  const absoluteUrl = String(payload?.data?.url || "").trim()
    || `${self.location.origin}/${route.startsWith("#") ? route : `#${route.replace(/^#/, "")}`}`;
  return {
    title,
    options: {
      body,
      tag,
      icon: String(payload.icon || "/icon-192.png").trim() || "/icon-192.png",
      badge: String(payload.badge || "/favicon-32x32.png").trim() || "/favicon-32x32.png",
      renotify: Boolean(payload.renotify),
      actions: visibleActions.map((action) => ({
        action: action.action,
        title: action.title,
      })),
      data: {
        route,
        url: absoluteUrl,
        notificationType,
        notification_type: notificationType,
        sessionId: fallback.sessionId,
        eventKey: fallback.eventKey,
        availableActions,
        available_actions: availableActions,
        actions: visibleActions,
      },
    },
  };
}

async function showPushNotification(payload = {}) {
  const { title, options } = buildNotificationPayload(payload);
  await self.registration.showNotification(title, options);
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SHOW_LOCAL_NOTIFICATION") {
    return;
  }

  if (typeof event.waitUntil === "function") {
    event.waitUntil(showPushNotification(event.data.payload || {}));
    return;
  }

  void showPushNotification(event.data.payload || {});
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data?.json?.() || {};
  } catch (error) {
    payload = {
      title: "Cannakan® Grow",
      body: event.data?.text?.() || "You have a new grow reminder.",
    };
  }

  event.waitUntil(showPushNotification(payload));
});

self.addEventListener("notificationclick", (event) => {
  event.notification?.close();
  const actionDefinitions = Array.isArray(event.notification?.data?.availableActions)
    ? event.notification.data.availableActions
    : Array.isArray(event.notification?.data?.available_actions)
    ? event.notification.data.available_actions
    : Array.isArray(event.notification?.data?.actions)
    ? event.notification.data.actions
    : [];
  const matchedAction = actionDefinitions.find((action) => String(action?.action || action?.kind || "").trim() === String(event.action || "").trim()) || null;
  const targetRoute = String(
    matchedAction
      ? buildNotificationActionRoute(matchedAction, event.notification?.data || {})
      : (event.notification?.data?.route || "#home"),
  ).trim() || "#home";
  const actionUrl = targetRoute.startsWith("http")
    ? targetRoute
    : `${self.location.origin}/${targetRoute.startsWith("#") ? targetRoute : targetRoute.startsWith("/") ? targetRoute.replace(/^\//, "") : `#${targetRoute.replace(/^#/, "")}`}`;
  const targetUrl = String(
    matchedAction ? actionUrl : (event.notification?.data?.url || actionUrl),
  ).trim();

  event.waitUntil((async () => {
    const existingClients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    for (const client of existingClients) {
      if (!client?.url) {
        continue;
      }

      if (client.url.startsWith(self.location.origin)) {
        if ("focus" in client) {
          await client.focus();
        }
        if ("navigate" in client && targetUrl && client.url !== targetUrl) {
          await client.navigate(targetUrl);
        }
        return;
      }
    }

    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});
