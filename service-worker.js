const CACHE_NAME = "cannakan-grow-shell-v6";
const APP_SHELL_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/icons/ck-grow-apple-touch-180-v5.png",
  "/icons/ck-grow-pwa-192-v5.png",
  "/icons/ck-grow-pwa-512-v5.png",
  "/icons/ck-grow-favicon-32-v5.png",
  "/icons/ck-grow-favicon-16-v5.png",
  "/src/assets/Cannakan_GROW_darkmode.png",
  "/src/assets/Cannakan_GROW_lightmode.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_ASSETS)),
  );
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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        const requestUrl = new URL(event.request.url);
        if (requestUrl.origin === self.location.origin) {
          const clonedResponse = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return networkResponse;
      }).catch(() => caches.match("/index.html"));
    }),
  );
});
