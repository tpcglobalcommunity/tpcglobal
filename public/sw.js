// Service Worker with SPA-safe fetching
const CACHE_NAME = 'tpc-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// SPA-safe fetch handler - prevents "Failed to fetch" errors
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // SPA navigation fallback: return index.html safely
  const isNav = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isNav) {
    event.respondWith((async () => {
      try {
        // Network-first for HTML navigation
        const net = await fetch(req);
        return net;
      } catch (e) {
        // Fallback to cached index.html if available
        const cache = await caches.open(CACHE_NAME);
        const cachedIndex = await cache.match('/index.html');
        if (cachedIndex) return cachedIndex;

        // Final fallback: try fetch index.html directly
        try {
          const idx = await fetch('/index.html', { cache: 'no-store' });
          return idx;
        } catch {
          return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        }
      }
    })());
    return;
  }

  // Non-navigation assets: cache-first but NEVER throw errors
  event.respondWith((async () => {
    try {
      const cached = await caches.match(req);
      if (cached) return cached;

      const net = await fetch(req);
      // Optional: cache successful responses
      if (net.ok && net.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, net.clone()).catch(()=>{});
      }
      return net;
    } catch {
      // Never throw - return empty response for failed asset requests
      return new Response('', { status: 204 });
    }
  })());
});
