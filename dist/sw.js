/**
 * FogSift Service Worker — v0.2.0
 *
 * Strategy:
 *   - Static assets (CSS, JS, images, fonts): Cache-First → network fallback
 *   - HTML pages:   Network-First → cache fallback (always fresh)
 *   - API routes:   Network-First → no cache (real-time data)
 *   - Offline:      Serve /offline.html if HTML navigation fails
 *
 * Cache names are versioned — bump CACHE_VERSION on each deploy to
 * evict stale caches during the activate event.
 */

const CACHE_VERSION = 'v0.2.0';
const STATIC_CACHE  = `fogsift-static-${CACHE_VERSION}`;
const HTML_CACHE    = `fogsift-html-${CACHE_VERSION}`;

// Core assets to pre-cache on install
const PRECACHE_ASSETS = [
    '/',
    '/styles.css',
    '/app.js',
    '/theme-init.js',
    '/favicon.png',
    '/manifest.json',
    '/offline.html',
    '/assets/logo.png',
];

// Patterns that get network-first treatment
const NETWORK_FIRST_PATTERNS = [
    /\/api\//,
    /\/content\//,
    /\/search-index\.json/,
];

// Patterns that are always fetch-only (external APIs, analytics)
const BYPASS_PATTERNS = [
    /^https:\/\/fonts\./,
    /^https:\/\/api\./,
    /^https:\/\/cloudflareinsights/,
    /^https:\/\/static\.cloudflareinsights/,
];

// ── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => console.warn('[SW] Pre-cache partial failure:', err))
    );
});

// ── Activate: purge old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => k.startsWith('fogsift-') && k !== STATIC_CACHE && k !== HTML_CACHE)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin + GET requests
    if (request.method !== 'GET') return;

    // Always bypass external domains
    if (url.origin !== self.location.origin) {
        if (BYPASS_PATTERNS.some(p => p.test(request.url))) return;
        return; // Don't cache any cross-origin requests
    }

    // API / dynamic content: network-first, no cache write
    if (NETWORK_FIRST_PATTERNS.some(p => p.test(url.pathname))) {
        event.respondWith(networkFirst(request, null));
        return;
    }

    // HTML navigation: network-first, fallback to cache or /offline.html
    if (request.headers.get('Accept')?.includes('text/html')) {
        event.respondWith(networkFirstHtml(request));
        return;
    }

    // Static assets: cache-first
    event.respondWith(cacheFirst(request));
});

// ── Strategy helpers ─────────────────────────────────────────────────────────

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // Static asset unavailable offline — return a minimal fallback
        return new Response('', { status: 503, statusText: 'Offline' });
    }
}

async function networkFirstHtml(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(HTML_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Serve offline page as final fallback
        return caches.match('/offline.html') ||
            new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
    }
}

async function networkFirst(request, cacheName) {
    try {
        return await fetch(request);
    } catch {
        if (cacheName) {
            const cached = await caches.match(request);
            if (cached) return cached;
        }
        return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
