const CACHE_NAME = 'tickoro-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './drag-drop-touch.js',
  './manifest.json',
  './icons/icon.svg'
];

// Kurulum (Install) aşaması - Dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Önbellek açıldı');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Etkinleşme (Activate) aşaması - Eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski önbellek siliniyor', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// İstek (Fetch) aşaması - İnternet yoksa cache'ten ver
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache'te varsa onu döndür, yoksa internetten çek
      return response || fetch(event.request);
    })
  );
});
