// Общая боковая панель, темы и кнопка аккаунта для всех страниц.
(() => {
  const root = document.documentElement;
  const path = location.pathname;
  const inSubfolder = /\/(exchange|stocks)\//.test(path) || /\/(exchange|stocks)\/?$/.test(path);
  const base = inSubfolder ? "../" : "./";
  const accountHref = `${base}auth.html`;
  let localStore=null,sessionStore=null;
  try{localStore=window.localStorage}catch(_){}
  try{sessionStore=window.sessionStorage}catch(_){}
  const storageGet=(storage,key,fallback=null)=>{try{return storage?.getItem(key)??fallback}catch(_){return fallback}};
  const storageSet=(storage,key,value)=>{try{storage?.setItem(key,value);return Boolean(storage)}catch(_){return false}};
  const storageRemove=(storage,key)=>{try{storage?.removeItem(key)}catch(_){}};
  const shellEscape=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const themes = [
    ["dark", "🌙", "Тёмная"], ["light", "☀️", "Светлая"],
    ["blue", "💙", "Океан"], ["cyberpunk", "🌈", "Киберпанк"],
    ["forest", "🌲", "Лес"], ["sunset", "🌅", "Закат"], ["violet", "🔮", "Фиолетовая"],
    ["aurora", "🌌", "Аврора"], ["coffee", "☕", "Кофе"], ["mono", "◼️", "Моно"], ["rose", "🌸", "Сакура"],
    ["arctic", "🧊", "Арктика"], ["gold", "✨", "Золото"], ["matrix", "💻", "Матрица"],
    ["peach", "🍑", "Персик"], ["space", "🚀", "Космос"], ["mint", "🍃", "Мята"],
    ["volcano", "🌋", "Вулкан"], ["paper", "📜", "Бумага"]
  ];
  const fonts = [
    ["system","Системный"],["rounded","Мягкий"],["serif","Классический"],["mono","Моноширинный"],
    ["humanist","Гуманистический"],["condensed","Компактный"],["editorial","Журнальный"],["technical","Технический"],
    ["accessible","Читаемый"],["playful","Игровой"]
  ];
  const links = [
    [`${base}`, "🏠", "Главная"], [`${base}exchange/`, "💱", "Где купить"],
    [`${base}stocks/`, "📈", "Акции"], [`${base}game.html`, "🎮", "Биржевая игра"], [`${base}compare.html`, "⚖️", "Сравнение"], [accountHref, "👤", "Войти"],
    [`${base}profile.html`, "🔔", "Портфель и уведомления"]
  ];

  function setTheme(name) {
    root.dataset.theme = name;
    storageSet(localStore,"valutkin_theme",name);
    document.querySelectorAll("[data-shell-theme]").forEach(x => x.classList.toggle("active", x.dataset.shellTheme === name));
  }
  function mount() {
    if (document.querySelector(".side-drawer")) return;
    const aside = document.createElement("aside");
    aside.className = "side-drawer";
    aside.setAttribute("aria-label", "Быстрое меню");
    aside.innerHTML = `<button class="drawer-handle" aria-label="Открыть меню" aria-expanded="false"><span>☰</span><b>Меню</b></button>
      <div class="drawer-body"><div class="drawer-brand"><img src="${base}assets/logo.png" alt=""><div><b>Валюткин</b><small>Быстрое меню</small></div></div>
      <nav class="drawer-links">${links.map(([url, icon, text]) => `<a href="${url}"><span>${icon}</span>${text}</a>`).join("")}</nav>
      <div class="drawer-section"><div class="drawer-section-title">Темы <small>крутите колёсико</small></div>
      <div class="drawer-themes" tabindex="0">${themes.map(([id, icon, title]) => `<button data-shell-theme="${id}" title="${title}"><span>${icon}</span>${title}</button>`).join("")}</div></div>
      <div class="drawer-section font-section"><div class="drawer-section-title">Шрифт</div><select id="shell-font">${fonts.map(([id,name])=>`<option value="${id}">${name}</option>`).join("")}</select></div>
      <div class="drawer-tools"><button type="button" data-shell-action="search">⌕ Поиск и команды <kbd>Ctrl K</kbd></button><button type="button" data-shell-action="text">Аа Увеличить текст</button><button type="button" data-shell-action="motion">◉ Меньше анимаций</button><button type="button" data-shell-action="top">↑ Наверх</button><button type="button" data-shell-action="share">↗ Поделиться</button><button type="button" data-shell-action="offline">☁ Офлайн-центр</button></div>
      <button class="drawer-install" type="button">📲 Установить приложение</button>
      <a class="drawer-telegram" href="https://t.me/valutkin_bot" target="_blank" rel="noopener noreferrer">✈️ Открыть в Telegram</a></div>`;
    document.body.appendChild(aside);
    const palette=document.createElement("div");
    palette.className="shell-palette";
    palette.innerHTML=`<div role="dialog" aria-modal="true" aria-label="Поиск по Валюткину"><div class="palette-search"><span>⌕</span><input type="search" placeholder="Страница, функция или тема…" aria-label="Поиск команд"><button type="button" aria-label="Закрыть">✕</button></div><div class="palette-results"></div><small>↑↓ выбор · Enter открыть · Esc закрыть</small></div>`;
    document.body.appendChild(palette);
    const offlinePanel=document.createElement("div");
    offlinePanel.className="shell-offline-panel";
    offlinePanel.innerHTML=`<div role="dialog" aria-modal="true" aria-labelledby="offline-title"><button class="offline-close" type="button" aria-label="Закрыть">✕</button><p class="eyebrow">ПРИЛОЖЕНИЕ</p><h2 id="offline-title">Офлайн-центр</h2><div class="offline-state"><span>●</span><div><b>Проверяем соединение…</b><small>Статус сети и локального кэша</small></div></div><div class="offline-metrics"><div><b data-cache-size>—</b><small>занято сайтом</small></div><div><b data-storage-mode>—</b><small>защита хранилища</small></div></div><p>Сохранённые портфели, настройки и игра доступны на этом устройстве. Рыночные котировки без сети показывают последний успешно загруженный результат.</p><div class="offline-actions"><button type="button" data-offline-download>↓ Скачать страницы</button><button type="button" data-offline-persist>🛡 Защитить данные</button><button type="button" data-push-enable>🔔 Включить Web Push</button><button type="button" data-push-test>Отправить тест</button><button type="button" data-system-check>✓ Проверить настройку</button><button type="button" data-offline-clear>Очистить кэш</button></div><div class="push-state">Push: проверяем поддержку…</div><div class="system-checks"></div><div class="offline-result" aria-live="polite"></div></div>`;
    document.body.appendChild(offlinePanel);
    const commands=[...links.map(([url,icon,text])=>({name:text,icon,url,keywords:"страница навигация"})),...themes.map(([id,icon,name])=>({name:`Тема: ${name}`,icon,theme:id,keywords:"цвет оформление"})),{name:"Установить приложение",icon:"📲",action:"install",keywords:"pwa скачать"},{name:"Увеличить текст",icon:"Аа",action:"text",keywords:"доступность шрифт"},{name:"Наверх страницы",icon:"↑",action:"top",keywords:"прокрутка"},{name:"Офлайн-центр",icon:"☁",action:"offline",keywords:"без интернета кэш скачать приложение"}];
    const handle = aside.querySelector(".drawer-handle");
    handle.addEventListener("click", () => { const open = aside.classList.toggle("open"); handle.setAttribute("aria-expanded", String(open)); });
    document.addEventListener("click", e => { if (innerWidth <= 760 && !aside.contains(e.target)) aside.classList.remove("open"); });
    aside.querySelectorAll("[data-shell-theme]").forEach(button => button.addEventListener("click", () => setTheme(button.dataset.shellTheme)));
    const scroller = aside.querySelector(".drawer-themes");
    scroller.addEventListener("wheel", e => { e.preventDefault(); scroller.scrollTop += e.deltaY; }, { passive: false });
    const installButton = aside.querySelector(".drawer-install");
    let installPrompt = null;
    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault(); installPrompt = event; installButton.hidden = false;
    });
    installButton.addEventListener("click", async () => {
      if (installPrompt) { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; installButton.hidden = true; }
      else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) showShellToast("На iPhone: Поделиться → На экран «Домой»", "info");
      else showShellToast("Установка доступна в меню браузера", "info");
    });
    window.addEventListener("appinstalled", () => { installButton.hidden = true; showShellToast("Валюткин установлен!", "success"); });
    if (matchMedia("(display-mode: standalone)").matches || navigator.standalone) installButton.hidden = true;

    const runAction=async action=>{
      if(action==="search") return openPalette();
      if(action==="offline") return openOfflineCenter();
      if(action==="text"){const large=root.dataset.textSize!=="large";root.dataset.textSize=large?"large":"normal";storageSet(localStore,"valutkin_text_size",root.dataset.textSize);showShellToast(large?"Текст увеличен":"Обычный размер текста");}
      if(action==="motion"){const reduced=root.dataset.motion!=="reduced";root.dataset.motion=reduced?"reduced":"normal";storageSet(localStore,"valutkin_motion",root.dataset.motion);showShellToast(reduced?"Анимации уменьшены":"Анимации включены");}
      if(action==="top") scrollTo({top:0,behavior:root.dataset.motion==="reduced"?"auto":"smooth"});
      if(action==="share"){try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);showShellToast("Ссылка скопирована","success");}}catch(error){if(error.name!=="AbortError")showShellToast("Не удалось поделиться");}}
    };
    aside.querySelectorAll("[data-shell-action]").forEach(button=>button.addEventListener("click",()=>runAction(button.dataset.shellAction)));
    async function updateOfflineInfo(){const state=offlinePanel.querySelector(".offline-state"),online=navigator.onLine;state.classList.toggle("online",online);state.classList.toggle("offline",!online);state.querySelector("b").textContent=online?"Сеть доступна":"Автономный режим";state.querySelector("small").textContent=online?"Котировки можно обновить":"Используются последние сохранённые данные";try{const estimate=await navigator.storage?.estimate?.(),used=estimate?.usage||0;offlinePanel.querySelector("[data-cache-size]").textContent=used<1048576?`${Math.round(used/1024)} КБ`:`${(used/1048576).toFixed(1)} МБ`;const persisted=await navigator.storage?.persisted?.();offlinePanel.querySelector("[data-storage-mode]").textContent=persisted?"Постоянно":"Обычно"}catch(_){}}
    function openOfflineCenter(){offlinePanel.classList.add("active");updateOfflineInfo()}
    function closeOfflineCenter(){offlinePanel.classList.remove("active")}
    offlinePanel.querySelector(".offline-close").onclick=closeOfflineCenter;offlinePanel.onclick=e=>{if(e.target===offlinePanel)closeOfflineCenter()};
    offlinePanel.querySelector("[data-offline-download]").onclick=async e=>{const button=e.currentTarget,result=offlinePanel.querySelector(".offline-result");button.disabled=true;result.textContent="Сохраняем основные страницы…";try{const registration=await navigator.serviceWorker?.ready;if(!registration?.active)throw Error("Service Worker недоступен");const channel=new MessageChannel();const answer=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error("timeout")),15000);channel.port1.onmessage=event=>{clearTimeout(timer);event.data?.ok?resolve(event.data):reject(Error(event.data?.error||"cache"))}});registration.active.postMessage({type:"CACHE_ALL"},[channel.port2]);await answer;result.textContent="✓ Основные страницы сохранены для офлайн-работы";await updateOfflineInfo()}catch(_){result.textContent="Не удалось скачать всё. Проверьте соединение и повторите."}finally{button.disabled=false}};
    offlinePanel.querySelector("[data-offline-persist]").onclick=async()=>{const result=offlinePanel.querySelector(".offline-result");try{const granted=await navigator.storage?.persist?.();result.textContent=granted?"✓ Браузер защитил данные от автоматической очистки":"Браузер не предоставил постоянное хранилище";await updateOfflineInfo()}catch(_){result.textContent="Эта функция не поддерживается браузером"}};
    offlinePanel.querySelector("[data-offline-clear]").onclick=async()=>{if(!confirm("Очистить кэш страниц? Портфели и игровые сохранения останутся."))return;try{const names=await caches.keys();await Promise.all(names.filter(x=>x.startsWith("valutkin-")).map(x=>caches.delete(x)));offlinePanel.querySelector(".offline-result").textContent="Кэш очищен. Личные данные сохранены.";await navigator.serviceWorker?.getRegistration()?.then(r=>r?.update());await updateOfflineInfo()}catch(_){offlinePanel.querySelector(".offline-result").textContent="Не удалось очистить кэш"}};
    const pushState=offlinePanel.querySelector(".push-state");
    const pushSupported=()=>"Notification" in window&&"serviceWorker" in navigator&&"PushManager" in window;
    const urlBase64ToUint8Array=value=>{const padding="=".repeat((4-value.length%4)%4),base64=(value+padding).replace(/-/g,"+").replace(/_/g,"/");return Uint8Array.from(atob(base64),c=>c.charCodeAt(0))};
    async function updatePushState(){if(!pushSupported()){pushState.textContent="Push: браузер не поддерживает уведомления";return}if(Notification.permission==="denied"){pushState.textContent="Push: заблокирован в настройках браузера";return}try{const registration=await navigator.serviceWorker.ready,subscription=await registration.pushManager.getSubscription();pushState.textContent=subscription?"Push: включён на этом устройстве":"Push: выключен"}catch(_){pushState.textContent="Push: недоступен"}}
    async function enableWebPush(){const result=offlinePanel.querySelector(".offline-result"),key=window.VALUTKIN_SUPABASE?.vapidPublicKey;if(!pushSupported())return result.textContent="Этот браузер не поддерживает Web Push";if(!key)return result.textContent="Сначала настройте публичный VAPID-ключ по инструкции supabase/functions/push-notify/README.md";if(typeof getSupabase!=="function")return result.textContent="Supabase недоступен";try{const db=getSupabase(),{data:{user}}=await db.auth.getUser();if(!user)return result.textContent="Войдите в аккаунт перед включением Push";const permission=await Notification.requestPermission();if(permission!=="granted")return result.textContent="Разрешение на уведомления не выдано";const registration=await navigator.serviceWorker.ready,subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(key)}),json=subscription.toJSON();const {error}=await db.from("push_subscriptions").upsert({user_id:user.id,endpoint:subscription.endpoint,p256dh:json.keys?.p256dh,auth:json.keys?.auth,user_agent:navigator.userAgent,updated_at:new Date().toISOString()},{onConflict:"endpoint"});if(error)throw error;result.textContent="✓ Web Push включён на этом устройстве";await updatePushState()}catch(error){console.warn("Push subscribe:",error);result.textContent=`Не удалось включить Push: ${error.message||"ошибка"}`}}
    async function testWebPush(){const result=offlinePanel.querySelector(".offline-result");if(typeof getSupabase!=="function")return result.textContent="Supabase недоступен";try{result.textContent="Отправляем тестовое уведомление…";const {data,error}=await getSupabase().functions.invoke("push-notify",{body:{title:"Валюткин работает!",body:"Серверные уведомления настроены правильно.",url:location.href}});if(error)throw error;result.textContent=`✓ Отправлено на устройств: ${data?.sent??0}`}catch(error){console.warn("Push test:",error);result.textContent="Тест не отправлен. Проверьте deploy Edge Function и VAPID Secrets."}}
    async function runSystemCheck(){const box=offlinePanel.querySelector(".system-checks"),checks=[];box.innerHTML='<div class="check-running">Проверяем компоненты…</div>';const add=(name,ok,note)=>checks.push({name,ok,note});add("Защищённое соединение",location.protocol==="https:"||location.hostname==="localhost",location.protocol);add("Service Worker","serviceWorker" in navigator,"офлайн-режим");add("Web Push",pushSupported(),pushSupported()?Notification.permission:"не поддерживается");add("Публичный VAPID-ключ",Boolean(window.VALUTKIN_SUPABASE?.vapidPublicKey),window.VALUTKIN_SUPABASE?.vapidPublicKey?"настроен":"нужно добавить");try{const response=await fetch(`${base}.well-known/assetlinks.json`,{cache:"no-store"});add("Android Asset Links",response.ok,response.ok?"опубликован":"нужен release fingerprint")}catch(_){add("Android Asset Links",false,"недоступен")}if(typeof getSupabase==="function"){try{const db=getSupabase(),{data:{user}}=await db.auth.getUser();add("Аккаунт Supabase",Boolean(user),user?"выполнен вход":"гостевой режим");if(user){const probes=await Promise.all([db.from("game_saves").select("user_id",{head:true,count:"exact"}).eq("user_id",user.id),db.from("push_subscriptions").select("id",{head:true,count:"exact"}).eq("user_id",user.id),db.from("push_rate_alerts").select("id",{head:true,count:"exact"}).eq("user_id",user.id)]);add("Облачная игра",!probes[0].error,probes[0].error?.message||"таблица доступна");add("Push-подписки",!probes[1].error,probes[1].error?.message||"таблица доступна");add("Ценовые условия",!probes[2].error,probes[2].error?.message||"таблица доступна")}}catch(error){add("Supabase",false,error.message)}}else add("Supabase",false,"клиент не загружен");box.innerHTML=checks.map(x=>`<div class="system-check ${x.ok?'ok':'fail'}"><span>${x.ok?'✓':'!'}</span><div><b>${shellEscape(x.name)}</b><small>${shellEscape(x.note)}</small></div></div>`).join("")}
    offlinePanel.querySelector("[data-push-enable]").onclick=enableWebPush;offlinePanel.querySelector("[data-push-test]").onclick=testWebPush;offlinePanel.querySelector("[data-system-check]").onclick=runSystemCheck;
    addEventListener("online",updateOfflineInfo);addEventListener("offline",updateOfflineInfo);updatePushState();
    const paletteInput=palette.querySelector("input"),results=palette.querySelector(".palette-results");let activeCommand=0,shown=[];
    function drawCommands(query=""){const q=query.toLowerCase().trim();shown=commands.filter(c=>`${c.name} ${c.keywords||""}`.toLowerCase().includes(q)).slice(0,12);activeCommand=Math.min(activeCommand,Math.max(0,shown.length-1));results.innerHTML=shown.length?shown.map((c,i)=>`<button type="button" data-command="${i}" class="${i===activeCommand?'active':''}"><span>${c.icon}</span><b>${c.name}</b>${c.url?'<small>Открыть</small>':'<small>Выполнить</small>'}</button>`).join(""):'<div class="palette-empty">Ничего не найдено</div>';results.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>executeCommand(shown[+b.dataset.command]));}
    function executeCommand(command){if(!command)return;if(command.url)location.href=command.url;else if(command.theme){setTheme(command.theme);closePalette();showShellToast(`Тема «${command.name.replace("Тема: ","")}» включена`);}else if(command.action==="install")installButton.click();else{runAction(command.action);closePalette();}}
    function openPalette(){palette.classList.add("active");paletteInput.value="";drawCommands();setTimeout(()=>paletteInput.focus(),20)}
    function closePalette(){palette.classList.remove("active")}
    paletteInput.oninput=()=>{activeCommand=0;drawCommands(paletteInput.value)};paletteInput.onkeydown=e=>{if(e.key==="ArrowDown"){e.preventDefault();activeCommand=Math.min(activeCommand+1,shown.length-1);drawCommands(paletteInput.value)}if(e.key==="ArrowUp"){e.preventDefault();activeCommand=Math.max(0,activeCommand-1);drawCommands(paletteInput.value)}if(e.key==="Enter"){e.preventDefault();executeCommand(shown[activeCommand])}};palette.querySelector(".palette-search button").onclick=closePalette;palette.onclick=e=>{if(e.target===palette)closePalette()};document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPalette()}if(e.key==="Escape")closePalette()});

    setTheme(storageGet(localStore,"valutkin_theme","dark"));
    root.dataset.textSize=storageGet(localStore,"valutkin_text_size","normal");root.dataset.motion=storageGet(localStore,"valutkin_motion","normal");
    const font = storageGet(localStore,"valutkin_font","system");
    root.dataset.font = font;
    const fontSelect = aside.querySelector("#shell-font"); fontSelect.value = font;
    fontSelect.addEventListener("change", () => { root.dataset.font = fontSelect.value; storageSet(localStore,"valutkin_font",fontSelect.value); });

    const right = document.querySelector(".header-right");
    if (right && !right.querySelector(".account-shortcut")) {
      const account = document.createElement("a");
      account.href = accountHref; account.className = "account-shortcut";
      account.innerHTML = `<span>👤</span><b>Войти</b>`;
      right.appendChild(account);
    }
    if (window.getSupabase) getSupabase().auth.getSession().then(({data}) => {
      if (!data.session) return;
      aside.querySelectorAll(`a[href$="auth.html"]`).forEach(a => { a.href=`${base}profile.html`; a.innerHTML="<span>👤</span>Мой профиль"; });
      const shortcut=document.querySelector(".account-shortcut"); if(shortcut){shortcut.href=`${base}profile.html`;shortcut.innerHTML="<span>👤</span><b>Профиль</b>";}
    }).catch(()=>{});
  }
  function showShellToast(text, type="info", action) {
    document.querySelector(".shell-toast")?.remove();
    const toast=document.createElement("div");toast.className=`shell-toast ${type}`;toast.innerHTML=`<span>${shellEscape(text)}</span>${action?'<button type="button">Обновить</button>':''}<button type="button" class="toast-close" aria-label="Закрыть">✕</button>`;document.body.appendChild(toast);
    toast.querySelector(".toast-close").onclick=()=>toast.remove();if(action)toast.querySelector("button:not(.toast-close)").onclick=action;setTimeout(()=>toast.remove(),action?15000:5000);
  }
  async function registerWorker() {
    if (!navigator.serviceWorker?.register) return;
    try {
      const registration=await navigator.serviceWorker.register(`${base}service-worker.js`);
      registration.addEventListener("updatefound",()=>{const worker=registration.installing;if(!worker)return;worker.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller)showShellToast("Доступна новая версия сайта","info",()=>{navigator.serviceWorker.addEventListener("controllerchange",()=>location.reload(),{once:true});worker.postMessage({type:"SKIP_WAITING"});});});});
      navigator.serviceWorker.addEventListener("controllerchange",()=>{if(storageGet(sessionStore,"valutkin_sw_reloading"))return;storageSet(sessionStore,"valutkin_sw_reloading","1");location.reload();});
      window.addEventListener("load",()=>storageRemove(sessionStore,"valutkin_sw_reloading"),{once:true});
    } catch(error) { console.warn("Service Worker:",error); }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded",()=>{mount();registerWorker();}) : (mount(),registerWorker());
})();
