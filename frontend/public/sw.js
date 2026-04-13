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

self.addEventListener("fetch", (e) => {
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