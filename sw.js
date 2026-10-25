self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('mufeed-tools-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/en/index',
        '/ur/index',
        '/ar/index'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});