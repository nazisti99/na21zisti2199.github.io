/**
 * GIF Vault Service Worker — offline caching for static assets
 * Placed at the root of your site alongside index.html
 */

const CACHE_NAME = 'gifvault-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js',
];

// ── Install: cache all static assets ─────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ── Activate: delete old caches ───────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ── Fetch: cache-first for static assets, network-first for APIs ──────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Skip non-GET requests and browser-extension URLs
    if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) return;

    // API calls → network first, no cache
    const isAPI = url.hostname !== self.location.hostname
        || url.pathname.includes('/api/');
    if (isAPI) return; // Let browser handle natively

    // Static assets → cache first, fallback to network
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200) return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            });
        })
    );
});
