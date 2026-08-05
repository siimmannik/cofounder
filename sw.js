// COFOUNDER service worker — network-first (uuendused jõuavad kohe kohale), offline-fallback cache'ist.
// v2 (05.08.2026): mäng kolis play.html-i, index.html on nüüd landing page.
// Cache'i nime muutus kustutab vana v1 cache'i, kus "./index.html" all oli veel mäng.
const C = "cofounder-v2";
const CORE = ["./", "./index.html", "./play.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(C).then(c => c.put(e.request, cp));
      return r;
    // Offline-fallback: navigeerimispäringud lähevad mängu, mitte landing page'ile —
    // võrguta kasutaja on peaaegu alati äpi/PWA kasutaja, kes tahab mängida.
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./play.html")))
  );
});
