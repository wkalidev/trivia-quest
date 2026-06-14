const CACHE_NAME = "triviq-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/", "/quiz", "/checkin", "/leaderboard"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const API_CACHE_NAME = "triviq-api-v1";
const API_CACHE_URLS = ["/api/stats", "/api/ai-question"];
const API_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  const isApiCacheable = API_CACHE_URLS.some((p) => url.pathname.startsWith(p));

  if (isApiCacheable && e.request.method === "GET") {
    e.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(e.request);
        if (cached) {
          const age = Date.now() - Number(cached.headers.get("x-sw-cached-at") ?? 0);
          if (age < API_CACHE_TTL_MS) return cached;
        }
        const response = await fetch(e.request);
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set("x-sw-cached-at", String(Date.now()));
          const copy = new Response(await response.clone().arrayBuffer(), {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
          cache.put(e.request, copy);
        }
        return response;
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});

// ── Push notifications ────────────────────────────────
self.addEventListener("push", (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title ?? "TriviaQ 🎮", {
      body: data.body ?? "Your daily check-in is ready! Earn 100 TRIVQ now.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url ?? "/checkin" },
      actions: [
        { action: "checkin", title: "Check-in 🔥" },
        { action: "play", title: "Play 🎮" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.action === "play" ? "/quiz" : "/checkin";
  e.waitUntil(clients.openWindow(url));
});