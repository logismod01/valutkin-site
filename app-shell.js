// Общая боковая панель, темы и кнопка аккаунта для всех страниц.
(() => {
  const root = document.documentElement;
  const path = location.pathname;
  const inSubfolder = /\/(exchange|stocks)\//.test(path) || /\/(exchange|stocks)\/?$/.test(path);
  const base = inSubfolder ? "../" : "./";
  const accountHref = `${base}auth.html`;
  if(window.ValutkinI18n&&!document.querySelector('script[data-i18n-pages]')){const translations=document.createElement('script');translations.src=`${base}i18n-pages.js`;translations.dataset.i18nPages='true';document.head.appendChild(translations)}
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
    [`${base}`, "🏠", "Главная"], [`${base}travel.html`, "✈️", "Путешествия"], [`${base}exchange/`, "💱", "Где купить"],
    [`${base}stocks/`, "📈", "Акции"], [`${base}assets.html`, "🔎", "Все активы мира"], [`${base}materials.html`, "⛏️", "Ценные металлы"], [`${base}reviews.html`, "⭐", "Отзывы"], [`${base}wallet.html`, "◈", "Кошелёк"], [`${base}support.html`, "❓", "Поддержка"], [`${base}macro.html`, "🌐", "Сырьё и ставки"], [`${base}news.html`, "📰", "Новости рынка"], [`${base}market-tools.html`, "🧰", "Инструменты рынка"], [`${base}game.html`, "🎮", "Биржевая игра"], [`${base}compare.html`, "⚖️", "Сравнение"], [accountHref, "👤", "Войти"],
    [`${base}hq.html`, "🧭", "Финансовый штаб"], [`${base}profile.html`, "🔔", "Портфель и уведомления"], [`${base}goals.html`, "🎯", "Цели накопления"], [`${base}planner.html`, "🗓️", "Будущие расходы"], [`${base}world.html`, "🌍", "Мировая экономика"], [`${base}crisis-lab.html`, "🧪", "Лаборатория кризисов"], [`${base}academy.html`, "🎓", "Академия"], [`${base}vault.html`, "🔐", "Зашифрованная копия"], [`${base}updates.html`, "✨", "Что нового"], [`${base}install.html`, "📲", "Установить приложение"]
  ];

  const linkDescriptions = {"Главная":"Курсы, конвертер и обзор","Путешествия":"50 стран и умный переводчик","Где купить":"Банки и обменные сервисы","Акции":"Компании и отрасли мира","Все активы мира":"466 инструментов в одном месте","Ценные металлы":"Сырьё и стратегические материалы","Отзывы":"Опыт сообщества","Кошелёк":"Защищённое Web3-подключение","Поддержка":"Помощь и обратная связь","Сырьё и ставки":"Макроэкономический радар","Новости рынка":"Важные события без шума","Инструменты рынка":"Калькуляторы и аналитика","Биржевая игра":"Тренировка без реальных денег","Сравнение":"Сопоставление активов","Финансовый штаб":"Персональная панель управления","Портфель и уведомления":"Активы, цели и сигналы","Цели накопления":"Планы и контроль прогресса","Будущие расходы":"Финансовый календарь","Мировая экономика":"Показатели разных стран","Лаборатория кризисов":"Безопасные сценарии риска","Академия":"48 интерактивных уроков","Зашифрованная копия":"Локальная защита данных","Что нового":"История обновлений","Установить приложение":"Валюткин всегда под рукой"};

  function setTheme(name) {
    root.dataset.theme = name;
    storageSet(localStore,"valutkin_theme",name);
    document.querySelectorAll("[data-shell-theme]").forEach(x => x.classList.toggle("active", x.dataset.shellTheme === name));
  }
  function mount() {
    if (document.querySelector(".side-drawer")) return;
    const brand=document.querySelector(".header-left");
    if(brand&&brand.tagName!=="A"){
      const link=document.createElement("a");link.className=brand.className;link.href=base;link.setAttribute("aria-label","На главную страницу");while(brand.firstChild)link.appendChild(brand.firstChild);brand.replaceWith(link);
    }else if(brand&&!brand.getAttribute("href"))brand.href=base;
    const aside = document.createElement("aside");
    aside.className = "side-drawer";
    aside.setAttribute("aria-label", "Быстрое меню");
    aside.innerHTML = `<button class="drawer-handle" aria-label="Открыть меню" aria-expanded="false"><span>☰</span><b>Меню</b></button>
      <div class="drawer-body"><div class="drawer-brand"><img src="${base}assets/logo.png" alt=""><div><b>Валюткин</b><small>Все разделы</small></div><button class="drawer-close" type="button" aria-label="Закрыть меню">×</button></div>
      <nav class="drawer-links">${links.map(([url, icon, text]) => `<a href="${url}" data-label="${text}"><span class="drawer-link-icon">${icon}</span><span class="drawer-link-copy"><b>${text}</b><small>${linkDescriptions[text]||"Личный кабинет Валюткина"}</small></span><i aria-hidden="true">→</i></a>`).join("")}</nav>
      <div class="drawer-section"><div class="drawer-section-title">Темы <small>крутите колёсико</small></div>
      <div class="drawer-themes" tabindex="0">${themes.map(([id, icon, title]) => `<button data-shell-theme="${id}" title="${title}"><span>${icon}</span>${title}</button>`).join("")}</div></div>
      <div class="drawer-section font-section"><div class="drawer-section-title">Шрифт</div><select id="shell-font">${fonts.map(([id,name])=>`<option value="${id}">${name}</option>`).join("")}</select></div>
      <div class="drawer-section language-section"><div class="drawer-section-title">Язык <small>все страницы</small></div><select id="shell-language" data-language-select aria-label="Язык интерфейса">${Object.entries(window.ValutkinI18n?.languages||{ru:"Русский"}).map(([id,name])=>`<option value="${id}">${name}</option>`).join("")}</select><small class="language-note">Настройки языка применяются ко всем страницам</small></div>
      <div class="drawer-tools"><button type="button" data-shell-action="search">⌕ Поиск и команды <kbd>Ctrl K</kbd></button><button type="button" data-shell-action="text">Аа Увеличить текст</button><button type="button" data-shell-action="motion">◉ Меньше анимаций</button><button type="button" data-shell-action="top">↑ Наверх</button><button type="button" data-shell-action="share">↗ Поделиться</button><button type="button" data-shell-action="offline">☁ Офлайн-центр</button></div>
      <button class="drawer-install" type="button">📲 Установить приложение</button>
      <a class="drawer-telegram" href="https://t.me/valutkin_bot" target="_blank" rel="noopener noreferrer">✈️ Открыть в Telegram</a></div>`;
    document.body.appendChild(aside);
    const drawerBackdrop=document.createElement("button");drawerBackdrop.className="drawer-backdrop";drawerBackdrop.type="button";drawerBackdrop.setAttribute("aria-label","Закрыть меню");document.body.appendChild(drawerBackdrop);
    const mobileNav=document.createElement("nav");mobileNav.className="mobile-bottom-nav";mobileNav.setAttribute("aria-label","Мобильная навигация");const mobileLinks=[[`${base}`,"⌂","Главная"],[`${base}stocks/`,"↗","Рынки"],[`${base}travel.html`,"✈","Путешествия"],[`${base}profile.html`,"♙","Профиль"]];mobileNav.innerHTML=mobileLinks.map(([url,icon,text])=>`<a href="${url}" title="${text}"><span>${icon}</span><small>${text}</small></a>`).join("")+`<button type="button" data-mobile-more aria-label="Открыть всё меню"><span>☰</span><small>Меню</small></button>`;document.body.appendChild(mobileNav);const phoneDevice=!(/iPad|Tablet|PlayBook|Silk/i.test(navigator.userAgent)||(/Android/i.test(navigator.userAgent)&&!/Mobile/i.test(navigator.userAgent)))&&(/iPhone|iPod|Android.*Mobile|Windows Phone|Opera Mini|IEMobile/i.test(navigator.userAgent)||navigator.userAgentData?.mobile===true);if(phoneDevice){const mobileGame=mobileNav.querySelector('a[href$="game.html"] small');if(mobileGame)mobileGame.textContent="Игра · ПК";aside.querySelectorAll('a[href$="game.html"]').forEach(link=>{link.title="Игра доступна на компьютере, ноутбуке или планшете";link.insertAdjacentHTML("beforeend",'<small class="device-only-badge">ПК</small>')})}mobileNav.querySelector("[data-mobile-more]").onclick=event=>{event.stopPropagation();aside.classList.add("open");drawerBackdrop.classList.add("open");handle?.setAttribute("aria-expanded","true")};const current=(location.pathname.replace(/index\.html$/,"")||"/");mobileNav.querySelectorAll("a").forEach(link=>{const target=new URL(link.href,location.href).pathname.replace(/index\.html$/,"");link.classList.toggle("active",target===current||(target.endsWith("/")&&target!=="/"&&current.startsWith(target)))});
    const headerRight=document.querySelector(".header-right");
    if(headerRight&&!document.querySelector(".travel-shortcut")){const travelShortcut=document.createElement("a");travelShortcut.className="travel-shortcut";travelShortcut.href=`${base}travel.html`;travelShortcut.innerHTML='<span>✈</span><b>Путешествия</b>';travelShortcut.setAttribute("aria-label","Открыть раздел путешествий");headerRight.prepend(travelShortcut)}
    if(headerRight&&window.ValutkinI18n){
      const languageBox=document.createElement("div");languageBox.className="header-language";
      const makeLanguageMenu=()=>{const current=window.ValutkinI18n.language,currency=window.ValutkinI18n.currency;languageBox.innerHTML=`<button type="button" class="header-language-button" aria-expanded="false" aria-label="Язык и основная валюта">🌐 <b>${current.toUpperCase()}</b><small>${currency}</small></button><div class="header-language-menu" role="menu">${Object.entries(window.ValutkinI18n.languages).map(([id,name])=>`<button type="button" data-quick-language="${id}" class="${id===current?'active':''}"><span>${id.toUpperCase()}</span><b>${name}</b><small>${window.ValutkinI18n.currencies[id]}</small></button>`).join("")}</div>`;const trigger=languageBox.querySelector(".header-language-button"),menu=languageBox.querySelector(".header-language-menu");trigger.onclick=()=>{const open=languageBox.classList.toggle("open");trigger.setAttribute("aria-expanded",String(open))};menu.querySelectorAll("[data-quick-language]").forEach(button=>button.onclick=()=>{window.ValutkinI18n.setLanguage(button.dataset.quickLanguage);makeLanguageMenu()})};makeLanguageMenu();headerRight.prepend(languageBox);document.addEventListener("click",event=>{if(!languageBox.contains(event.target))languageBox.classList.remove("open")});
    }
    if(!document.querySelector('link[data-copilot-style]')){const style=document.createElement('link');style.rel='stylesheet';style.href=`${base}copilot.css`;style.dataset.copilotStyle='true';document.head.appendChild(style)}
    if(!document.querySelector('script[data-copilot]')){const copilot=document.createElement('script');copilot.src=`${base}copilot.js`;copilot.dataset.copilot='true';document.body.appendChild(copilot)}
    if(!document.querySelector('script[data-feature-suite]')){const suite=document.createElement('script');suite.src=`${base}feature-suite.js`;suite.dataset.featureSuite='true';document.body.appendChild(suite)}
    if(!document.querySelector('script[data-personal-suite]')){const personal=document.createElement('script');personal.src=`${base}personal-suite.js`;personal.dataset.personalSuite='true';document.body.appendChild(personal)}
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
    const menuHeader=document.querySelector(".header-right"), menuShortcut=document.createElement("button");
    menuShortcut.type="button";menuShortcut.className="header-menu-shortcut";menuShortcut.setAttribute("aria-label","Открыть все разделы");menuShortcut.setAttribute("aria-expanded","false");menuShortcut.innerHTML='<span>☰</span><b>Разделы</b>';menuHeader?.prepend(menuShortcut);
    const closeDrawer=()=>{aside.classList.remove("open");drawerBackdrop.classList.remove("open");handle.setAttribute("aria-expanded","false");menuShortcut.setAttribute("aria-expanded","false")};
    const toggleDrawer=()=>{const open=aside.classList.toggle("open");drawerBackdrop.classList.toggle("open",open);handle.setAttribute("aria-expanded",String(open));menuShortcut.setAttribute("aria-expanded",String(open))};
    handle.addEventListener("click",toggleDrawer);menuShortcut.addEventListener("click",toggleDrawer);
    aside.querySelector(".drawer-close").onclick=closeDrawer;drawerBackdrop.onclick=closeDrawer;
    document.addEventListener("keydown",event=>{if(event.key==="Escape")closeDrawer()});
    document.addEventListener("click", e => { if (innerWidth <= 760 && aside.classList.contains("open")&&!aside.contains(e.target)&&!mobileNav.contains(e.target))closeDrawer(); });
    aside.querySelectorAll("[data-shell-theme]").forEach(button => button.addEventListener("click", () => setTheme(button.dataset.shellTheme)));
    const scroller = aside.querySelector(".drawer-themes");
    scroller.addEventListener("wheel", e => {
      const atTop=scroller.scrollTop<=0&&e.deltaY<0,atBottom=Math.ceil(scroller.scrollTop+scroller.clientHeight)>=scroller.scrollHeight&&e.deltaY>0;
      if(atTop||atBottom)return;
      e.stopPropagation();
    }, { passive: true });
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
    const languageSelect=aside.querySelector("#shell-language");languageSelect.value=window.ValutkinI18n?.language||"ru";languageSelect.onchange=()=>window.ValutkinI18n?.setLanguage(languageSelect.value);
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
  function setupMotionDetails() {
    // Производительный режим: глобальный MutationObserver и blur-анимации удалены.
    // Небольшие CSS-переходы остаются только на элементах, с которыми взаимодействует пользователь.
  }
  function setupAppConnectivity() {
    const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
    if(!standalone)return;
    const banner=document.createElement("div");banner.className="app-offline-banner";banner.setAttribute("role","status");banner.textContent="Офлайн-режим: сохранённые страницы и функции устройства доступны";document.body.appendChild(banner);
    const onlineOnlySelector='.drawer-telegram,a[href^="http://"],a[href^="https://"],form[action] button[type="submit"],#auth-form button[type="submit"],#review-form button[type="submit"],#new-goal,.goal-actions button,#goal-form button[type="submit"],[data-push-enable],[data-push-test]';
    const update=()=>{const offline=!navigator.onLine;document.body.classList.toggle("app-is-offline",offline);document.querySelectorAll(onlineOnlySelector).forEach(element=>{if(element.tagName==="A"){element.setAttribute("aria-disabled",String(offline));element.classList.toggle("online-disabled",offline)}else{if(offline){element.dataset.onlineWasDisabled=String(element.disabled);element.disabled=true;element.title="Нужен интернет"}else if(element.dataset.onlineWasDisabled!==undefined){element.disabled=element.dataset.onlineWasDisabled==="true";delete element.dataset.onlineWasDisabled;element.removeAttribute("title")}}})};
    document.addEventListener("click",event=>{const target=event.target.closest('a[aria-disabled="true"]');if(!target)return;event.preventDefault();showShellToast("Это действие требует подключения к интернету","info")},true);
    addEventListener("online",()=>{update();showShellToast("Соединение восстановлено","success")});addEventListener("offline",update);update();
  }
  async function registerWorker() {
    if (!navigator.serviceWorker?.register) return;
    try {
      const registration=await navigator.serviceWorker.register(`${base}service-worker.js`);
      const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
      const announceUpdate=worker=>{if(!worker)return;if(!standalone){storageSet(sessionStore,"valutkin_sw_reloading","1");worker.postMessage({type:"SKIP_WAITING"});return}showShellToast("Новая версия приложения готова. Хотите обновить её сейчас?","info",()=>{storageSet(sessionStore,"valutkin_sw_reloading","1");worker.postMessage({type:"SKIP_WAITING"});});};
      if(standalone)(registration.active||navigator.serviceWorker.controller)?.postMessage({type:"PWA_CLIENT"});
      if(registration.waiting&&navigator.serviceWorker.controller)announceUpdate(registration.waiting);
      registration.addEventListener("updatefound",()=>{const worker=registration.installing;if(!worker)return;worker.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller)announceUpdate(worker);});});
      navigator.serviceWorker.addEventListener("controllerchange",()=>{if(storageGet(sessionStore,"valutkin_sw_reloading"))location.reload();});
      window.addEventListener("load",()=>storageRemove(sessionStore,"valutkin_sw_reloading"),{once:true});
    } catch(error) { console.warn("Service Worker:",error); }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded",()=>{mount();setupMotionDetails();setupAppConnectivity();registerWorker();}) : (mount(),setupMotionDetails(),setupAppConnectivity(),registerWorker());
})();
