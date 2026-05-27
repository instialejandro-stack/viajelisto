const CACHE_NAME = "viajelisto-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install: pre-cache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for navigation, network-first for API
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and non-http requests
  if (!request.url.startsWith("http")) return;

  // Navigation requests: cache-first with network fallback
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then((cached) => {
        if (cached) return cached;
        return fetch(request).catch(() => caches.match("/index.html"));
      })
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images): cache-first
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }
});
