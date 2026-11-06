const CACHE_PREFIX = "snapcode-";
const CACHE = `${CACHE_PREFIX}__BUILD_VERSION__`;
const CORE = ["/index.html", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/icon.svg"];

self.addEventListener("install", (event) => {
  // Updates wait until existing tabs close, so an unsaved snippet is never reloaded.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request);
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
          event.waitUntil(cache.put("/index.html", response.clone()));
          return response;
        }
        return (await cache.match("/index.html")) || response;
      } catch {
        return (await cache.match("/index.html")) || new Response("Snapcode isn't cached yet. Reconnect and reload once.", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })());
    return;
  }
  if (!CORE.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(url.pathname);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) event.waitUntil(cache.put(url.pathname, response.clone()));
    return response;
  })());
});