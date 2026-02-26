// Service Worker for BDT NURPAY WALLET PWA
// Supports Android 10-16 (Chrome 80+)

const CACHE_VERSION = 'nurpay-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// App shell files to cache on install
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/nurpay-icon-192.dim_192x192.png',
  '/assets/generated/nurpay-icon-512.dim_512x512.png',
  '/assets/generated/nuropay-logo.dim_128x128.png',
  '/assets/generated/nurpay-logo.dim_80x80.png',
];

// Patterns that should NEVER be cached (admin routes, API calls, IC backend)
const BYPASS_PATTERNS = [
  /^\/admin/,
  /\/api\//,
  /ic0\.app/,
  /icp0\.io/,
  /localhost:\d+\/api/,
  /canister/,
  /\?canisterId/,
  /__webpack/,
];

function shouldBypass(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const fullUrl = url;

  return BYPASS_PATTERNS.some((pattern) => pattern.test(pathname) || pattern.test(fullUrl));
}

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(APP_SHELL).catch((err) => {
          console.warn('SW: Some shell files failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('nurpay-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first for admin/API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Bypass admin routes and backend API calls entirely
  if (shouldBypass(url)) {
    event.respondWith(fetch(request));
    return;
  }

  // For navigation requests (HTML pages), use network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // For static assets (JS, CSS, images, fonts), use cache-first
  if (
    url.includes('/assets/') ||
    url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)(\?.*)?$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: network-first with dynamic cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
