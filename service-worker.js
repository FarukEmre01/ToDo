const CACHE_NAME = 'tickoro-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './drag-drop-touch.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Önbellek açıldı v2');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Bildirim etkileşimlerini (buton tıklamalarını) dinle
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          // Açık bir sekme varsa ona mesaj gönder
          client.postMessage({
            action: action || 'click',
            payload: data
          });
          // Bildirime basıldığında sekmeyi öne getir
          if (!action || action === 'click') client.focus();
          return;
        }
      }
      // Hiç açık sekme yoksa uygulamayı aç
      if (self.clients.openWindow && (!action || action === 'click')) {
        return self.clients.openWindow('./');
      }
    })
  );
});
