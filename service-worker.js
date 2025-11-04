const CACHE_NAME = "desmos-pwa-v2";
const REMOTE_FILES = [
  "https://www.desmos.com/api/v1.11/calculator.js?apiKey=fd0fac42e3fc4fbeaf59459b0c37f0da",
  "https://www.desmos.com/assets/pwa/icon-192x192.png",
  "https://www.desmos.com/assets/pwa/icon-512x512.png",
  "https://www.desmos.com/assets/img/apps/graphing/favicon.ico",
  "https://www.desmos.com/apple-touch-icon.png",
];

const LOCAL_FILES = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Try to cache both remote and local assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => cache.addAll([...LOCAL_FILES, ...REMOTE_FILES]))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Try to serve from cache, else fetch and store if remote
        if (response) return response;
        return fetch(event.request).then(fetchRes => {
          return caches.open(CACHE_NAME).then(cache => {
            // Cache successful GET requests only, exclude opaque responses
            if (
              event.request.method === "GET" &&
              fetchRes.status === 200 &&
              fetchRes.type !== "opaque"
            ) {
              cache.put(event.request, fetchRes.clone());
            }
            return fetchRes;
          });
        }).catch(() => {
          // Offline fallback optional: could show a default message/UI here
        });
      })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
});
