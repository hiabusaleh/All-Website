// Service worker: shell আগে থেকে cache হয় (offline mode); বাকি পাতা প্রথমবার খোলার পর cache হয়.
// __VERSION__ আর __PRECACHE__ build.js বসায়.
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const CACHE = `ielts-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ielts-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // audio range request cache করা হয় না
  if (req.headers.has('range') || /\.(mp3|m4a|ogg|wav)$/i.test(url.pathname)) return;

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then((res) => {
          if (res.ok && res.type === 'basic') cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
