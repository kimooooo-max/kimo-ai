const cacheName = "card-ledger-v2";
const shellAssets = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./app-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(shellAssets)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key)))),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/api/ocr") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (event.request.method === "GET" && (response.ok || response.type === "opaque")) {
          const copy = response.clone();
          caches.open(cacheName).then((cache) => cache.put(event.request, copy));
        }
        return response;
      });
    }),
  );
});
