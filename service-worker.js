// Service Worker: свежая версия страниц при навигации, офлайн-кэш для статики.
const CACHE_NAME = "valutkin-v7";
const APP_SHELL = [
  "./", "./index.html", "./style.css", "./script.js", "./manifest.json",
  "./theme.js", "./app-shell.js", "./shell.css", "./profile.html", "./profile.css", "./profile.js", "./auth.html", "./auth.css", "./auth.js", "./assets/logo.png", "./assets/fox.png", "./exchange/", "./exchange/exchange.css",
  "./exchange/exchange.js", "./stocks/", "./stocks/stocks.css", "./stocks/stocks.js"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;

  // Документы всегда сначала берём из сети: это устраняет показ прошлой версии.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    }).catch(() => caches.match(request).then(r => r || caches.match("./index.html"))));
    return;
  }

  // Статика показывается сразу из кэша и обновляется в фоне.
  event.respondWith(caches.match(request).then(cached => {
    const network = fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => cached);
    return cached || network;
  }));
});
