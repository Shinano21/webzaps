const CACHE = 'zaps-img-v1';
const IMG_RE = /\.(jpe?g|png|gif|webp|svg|avif)(\?.*)?$/i;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'clear') caches.delete(CACHE);
});

self.addEventListener('fetch', e => {
  if (!IMG_RE.test(new URL(e.request.url).pathname)) return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(hit => {
        if (hit) return hit;
        return fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit);
      })
    )
  );
});
