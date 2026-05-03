const CACHE_NAME = "cannakan-grow-shell-v14";
const APP_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/supabase-config.js",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
];
const NETWORK_FIRST_PATHS = new Set([
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
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
