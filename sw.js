/* Service Worker – Bestellungen
   Holt immer zuerst die neueste Version aus dem Netz,
   nur ohne Netz wird die gespeicherte Kopie benutzt. */
const CACHE = 'bestellungen-v1.4';
const DATEIEN = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(DATEIEN.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  /* fremde Adressen (GitHub-Abgleich) und Versions-Prüfungen (?v=…) nicht anfassen */
  if (req.method !== 'GET' || url.origin !== location.origin || url.search) return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const kopie = res.clone();
        caches.open(CACHE).then(c => c.put(req, kopie));
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
