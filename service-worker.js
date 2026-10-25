// Свежая версия интерфейса при наличии сети и полноценный офлайн-режим.
const CACHE_NAME = "valutkin-v35";
const APP_SHELL = [
  "./", "./index.html", "./offline.html", "./style.css", "./dashboard-settings.css", "./script.js", "./market-lab.js?v=29", "./manifest.json",
  "./theme.js", "./supabase-config.js", "./app-shell.js", "./shell.css",
  "./game.html", "./game.css", "./game.js?v=35", "./company.html", "./company.css", "./company.js?v=22", "./dashboard-settings.js",
  "./compare.html", "./compare.css", "./compare.js", "./profile.html", "./profile.css", "./profile.js?v=30",
  "./auth.html", "./auth.css", "./auth.js", "./assets/logo.png", "./assets/fox.png", "./assets/icon-192.png", "./assets/icon-512.png", "./assets/icon-maskable-512.png",
  "./exchange/", "./exchange/exchange.css", "./exchange/exchange.js",
  "./stocks/", "./stocks/stocks.css", "./stocks/stocks.js"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CACHE_ALL") {
    const task=caches.open(CACHE_NAME).then(cache=>Promise.allSettled(APP_SHELL.map(path=>cache.add(path)))).then(results=>{
      const saved=results.filter(x=>x.status==="fulfilled").length;
      const payload={ok:saved===APP_SHELL.length,saved,total:APP_SHELL.length,error:saved===APP_SHELL.length?null:`Сохранено ${saved} из ${APP_SHELL.length}`};
      event.ports?.[0]?.postMessage(payload);
      return payload;
    }).catch(error=>event.ports?.[0]?.postMessage({ok:false,error:error.message}));
    event.waitUntil(task);
  }
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request)) || (request.mode === "navigate" ? caches.match("./offline.html") : Response.error());
  }
}
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) return;
  const destination = request.destination;
  // HTML, CSS и JS должны обновляться вместе — иначе новый JS может открыться со старым CSS.
  if (request.mode === "navigate" || destination === "style" || destination === "script") {
    event.respondWith(networkFirst(request));
    return;
  }
  // Изображения показываем мгновенно из кэша и обновляем в фоне.
  event.respondWith(caches.match(request).then(cached => {
    const fresh = fetch(request).then(async response => {
      if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
      return response;
    }).catch(() => cached || Response.error());
    return cached || fresh;
  }));
});
