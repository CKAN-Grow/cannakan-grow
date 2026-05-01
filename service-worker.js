const CACHE_VERSION = "1.0.0-f787396-20260501T065809322Z";
const CACHE_PREFIX = "cannakan-grow-shell";
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const APP_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/supabase-config.js",
  "/build-info.js",
  "/build-info.json",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/src/assets/Cannakan_GROW_darkmode.png",
  "/src/assets/Cannakan_GROW_lightmode.png",
];
const NETWORK_FIRST_PATHS = new Set([
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/supabase-config.js",
  "/build-info.js",
  "/build-info.json",
  "/manifest.json",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
      self.skipWaiting(),
    ]),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )),
      self.clients.claim(),
    ]),
  );
});

function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type === "opaque") {
    return response;
  }

  let responseForCache = null;
  try {
    responseForCache = response.clone();
  } catch (error) {
    console.warn("[Cannakan SW] Could not clone response for cache storage", {
      url: request?.url || "",
      error: error?.message || String(error || "Unknown clone error"),
    });
    return response;
  }

  caches.open(CACHE_NAME).then((cache) => {
    cache.put(request, responseForCache);
  });
  return response;
}

function fetchNetworkFirst(request, fallbackToIndex = false) {
  return fetch(request)
    .then((response) => {
      let responseForClient = response;
      try {
        responseForClient = response.clone();
      } catch (error) {
        console.warn("[Cannakan SW] Could not clone network response for client delivery", {
          url: request?.url || "",
          error: error?.message || String(error || "Unknown clone error"),
        });
      }

      cacheResponse(request, response);
      return responseForClient;
    })
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
        .then((response) => {
          if (!isSameOrigin) {
            return response;
          }

          let responseForClient = response;
          try {
            responseForClient = response.clone();
          } catch (error) {
            console.warn("[Cannakan SW] Could not clone same-origin response for client delivery", {
              url: event.request?.url || "",
              error: error?.message || String(error || "Unknown clone error"),
            });
          }

          cacheResponse(event.request, response);
          return responseForClient;
        })
        .catch(() => isNavigationRequest ? caches.match("/index.html") : undefined);
    }),
  );
});
