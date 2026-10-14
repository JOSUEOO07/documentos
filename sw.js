const SHELL = "cbo-app-v1", DOCS = "cbo-docs-v1";
const BASE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(BASE))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== DOCS).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (u.pathname.includes("/docs/")) {
    // documentos: primero lo guardado, si no hay se descarga y se guarda
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) { const cp = res.clone(); caches.open(DOCS).then(c => c.put(e.request, cp)); } return res; })));
  } else {
    // app: primero internet (para ver cambios), si no hay, lo guardado
    e.respondWith(fetch(e.request).then(res => { const cp = res.clone(); caches.open(SHELL).then(c => c.put(e.request, cp)); return res; }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
  }
});
