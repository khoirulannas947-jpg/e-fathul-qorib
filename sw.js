/* E-Fathul Qorib — service worker: aplikasi bisa dipasang & dibaca offline.
   - Halaman utama: ambil dari jaringan dulu, kalau offline pakai salinan terakhir.
   - Data kitab (/data/*.json): disimpan setelah dibuka/diunduh, lalu dibaca dari simpanan (diperbarui diam-diam).
   - /api/* (Tanya AI) selalu lewat jaringan. */
const SHELL = "efq-shell-v2";
const DATA = "efq-data-v2";
const LIB = "efq-lib-v1";
const KEEP = [SHELL, DATA, LIB];
const SHELL_URLS = ["/", "/login", "/auth-config.js", "/auth-client.js", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

const okToStore = (r) => r && r.ok && !r.redirected && r.type !== "opaqueredirect";

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await Promise.all(SHELL_URLS.map(async (u) => {
      try { const r = await fetch(u, { credentials: "same-origin", cache: "no-cache" }); if (okToStore(r)) await c.put(u, r); } catch (_) {}
    }));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (!KEEP.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", (e) => {
  if (e.data === "hapus-data") e.waitUntil(Promise.all([caches.delete(DATA), caches.delete(SHELL)]));
});

async function swr(cacheName, req, key) {
  const c = await caches.open(cacheName);
  const hit = await c.match(key || req);
  const net = fetch(req).then(async (r) => { if (okToStore(r)) { try { await c.put(key || req, r.clone()); } catch (_) {} } return r; }).catch(() => null);
  if (hit) { net.catch(() => {}); return hit; }
  const r = await net;
  return r || new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "content-type": "application/json" } });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (url.pathname.startsWith("/api/")) return;
    if (req.mode === "navigate") {
      e.respondWith((async () => {
        try {
          const r = await fetch(req);
          if (okToStore(r) && (url.pathname === "/" || url.pathname === "/index.html")) (await caches.open(SHELL)).put("/", r.clone());
          if (okToStore(r) && url.pathname === "/login") (await caches.open(SHELL)).put("/login", r.clone());
          return r;
        } catch (_) {
          const c = await caches.open(SHELL);
          return (url.pathname.startsWith("/login") ? await c.match("/login") : await c.match("/")) || (await c.match("/login")) ||
            new Response("<h1>Offline</h1><p>Sambungkan internet sekali untuk membuka aplikasi.</p>", { headers: { "content-type": "text/html; charset=utf-8" } });
        }
      })());
      return;
    }
    if (url.pathname.startsWith("/data/")) { e.respondWith(swr(DATA, req, url.pathname)); return; }
    if (/^\/(auth-config\.js|auth-client\.js|manifest\.webmanifest|icons\/)/.test(url.pathname)) { e.respondWith(swr(SHELL, req, url.pathname)); return; }
    return;
  }

  // Pustaka luar: font Google & SDK Firebase (versi tetap) disimpan agar aplikasi tetap jalan saat offline.
  if (/^(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com)$/.test(url.hostname)) {
    e.respondWith(swr(LIB, req));
  }
});
