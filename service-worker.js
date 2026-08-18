/* Offline cache for Star Readers.
   Strategy: NETWORK-FIRST for our own files, so when the iPad is online it
   always gets the latest code (no more stale-cache surprises), and falls back
   to the cache only when offline. Cross-origin requests (Wikipedia / dictionary
   look-ups and their audio) bypass the worker entirely. */
const CACHE = "star-readers-v17";
const ASSETS = [
  "index.html",
  "styles.css",
  "pictures.js",
  "content.js",
  "chess.js",
  "app.js",
  "manifest.webmanifest",
  "icons/icon-180.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // let cross-origin pass straight through
  event.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match("index.html")))
  );
});
