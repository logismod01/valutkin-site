// Свежая версия интерфейса при наличии сети и полноценный офлайн-режим.
const CACHE_NAME = "valutkin-v60";
const APP_SHELL = [
  "./", "./index.html", "./offline.html", "./style.css", "./dashboard-settings.css", "./script.js", "./market-lab.js?v=40", "./manifest.json", "./.well-known/assetlinks.template.json",
  "./theme.js", "./i18n.js", "./feature-suite.js", "./macro.html", "./macro.js", "./macro.css", "./supabase-config.js", "./app-shell.js", "./shell.css",
  "./game.html", "./game.css", "./game.js?v=48", "./company.html", "./company.css", "./company.js?v=46", "./dashboard-settings.js",
  "./compare.html", "./compare.css", "./compare.js", "./news.html", "./news.css", "./news.js", "./market-tools.html", "./market-tools.css", "./market-tools.js", "./converter-hub.js", "./profile.html", "./profile.css", "./profile.js?v=49",
  "./auth.html", "./auth.css", "./auth.js", "./assets/logo.png", "./assets/fox.png", "./assets/icon-192.png", "./assets/icon-512.png", "./assets/icon-maskable-512.png",
  "./exchange/", "./exchange/exchange.css", "./exchange/exchange.js",
  "./stocks/", "./stocks/stocks.css", "./stocks/stocks.js"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    const results=await Promise.allSettled(APP_SHELL.map(path=>cache.add(path)));
    const saved=results.filter(result=>result.status==="fulfilled").length;
    if(!saved) throw new Error("Не удалось сохранить оболочку приложения");
    console.info(`Офлайн-кэш: ${saved}/${APP_SHELL.length}`);
  }));
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
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try {
    const response = await fetch(request,{signal:controller.signal});
    if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone());
    return response;
  } catch {
    const cached=await caches.match(request);
    if(cached)return cached;
    if(request.mode==="navigate"){
      const offline=await caches.match("./offline.html");
      return offline||new Response("Валюткин сейчас недоступен офлайн. Подключитесь к сети и повторите попытку.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
    }
    return Response.error();
  } finally { clearTimeout(timer); }
}
self.addEventListener("push", event => {
  let payload={title:"Валюткин",body:"Новое уведомление",url:"./"};
  try { if(event.data) payload={...payload,...event.data.json()}; } catch { if(event.data) payload.body=event.data.text(); }
  event.waitUntil(self.registration.showNotification(payload.title,{body:payload.body,icon:"./assets/icon-192.png",badge:"./assets/icon-192.png",tag:payload.tag||"valutkin",data:{url:payload.url||"./"},renotify:Boolean(payload.renotify)}));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target=new URL(event.notification.data?.url||"./",self.location.origin).href;
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{const existing=list.find(client=>client.url===target);return existing?existing.focus():clients.openWindow(target)}));
});
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
