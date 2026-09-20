// ============================================
// SERVICE WORKER — offline-режим
// ============================================
const CACHE_NAME = "valutkin-v1";
const URLS_TO_CACHE = [
    "/valutkin-site/",
    "/valutkin-site/index.html",
    "/valutkin-site/style.css",
    "/valutkin-site/script.js",
    "/valutkin-site/manifest.json",
    "/valutkin-site/assets/logo.png"
];

// Установка — кэшируем файлы
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("📦 Кэшируем файлы...");
            return cache.addAll(URLS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Активация — чистим старый кэш
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Запросы — сначала кэш, потом сеть
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
