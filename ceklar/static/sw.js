const cacheStorage = 'ceklar-v1';
const staticAssets = [
    "/",
    "/static/sw.js",
    "/static/manifest.json",
    "/static/js/game.js",
    "/static/images/icons/icon.png"
];


self.addEventListener('install', async e => {
    const cache = await caches.open(cacheStorage);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
});

self.addEventListener('activate', e => {
    self.clients.claim();
});

self.addEventListener('fetch', e => {    
    e.respondWith( caches.match(e.request).then((response) => response || fetch(e.request)) );
});


async function cacheFirst(req) {
    const cache = await caches.open(cacheStorage);
    const cached = await cache.match(req);
    return cached || fetch(req);
}

async function networkAndCache(req) {
    const cache = await caches.open(cacheStorage);
    try {
        const fresh = await fetch(req);
        await cache.put(req, fresh.clone());
        return fresh;
    }
    catch (e) {
        const cached = await cache.match(req);
        return cached;
    }
}