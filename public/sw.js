// Service Worker with Cache Busting
const CACHE_NAME = 'tpc-global-v1.0.0';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Clear all caches on activate to force refresh
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Don't cache anything - always fetch from network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-HTTP requests
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  
  // Always fetch from network, no caching
  event.respondWith(fetch(event.request));
});
