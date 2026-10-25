// Общая боковая панель, темы и кнопка аккаунта для всех страниц.
(() => {
  const root = document.documentElement;
  const path = location.pathname;
  const inSubfolder = /\/(exchange|stocks)\//.test(path) || /\/(exchange|stocks)\/?$/.test(path);
  const base = inSubfolder ? "../" : "./";
  const accountHref = `${base}auth.html`;
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
    localStorage.setItem("valutkin_theme", name);
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
      <div class="drawer-tools"><button type="button" data-shell-action="search">⌕ Поиск и команды <kbd>Ctrl K</kbd></button><button type="button" data-shell-action="text">Аа Увеличить текст</button><button type="button" data-shell-action="motion">◉ Меньше анимаций</button><button type="button" data-shell-action="top">↑ Наверх</button><button type="button" data-shell-action="share">↗ Поделиться</button></div>
      <button class="drawer-install" type="button">📲 Установить приложение</button>
      <a class="drawer-telegram" href="https://t.me/valutkin_bot" target="_blank" rel="noopener noreferrer">✈️ Открыть в Telegram</a></div>`;
    document.body.appendChild(aside);
    const palette=document.createElement("div");
    palette.className="shell-palette";
    palette.innerHTML=`<div role="dialog" aria-modal="true" aria-label="Поиск по Валюткину"><div class="palette-search"><span>⌕</span><input type="search" placeholder="Страница, функция или тема…" aria-label="Поиск команд"><button type="button" aria-label="Закрыть">✕</button></div><div class="palette-results"></div><small>↑↓ выбор · Enter открыть · Esc закрыть</small></div>`;
    document.body.appendChild(palette);
    const commands=[...links.map(([url,icon,text])=>({name:text,icon,url,keywords:"страница навигация"})),...themes.map(([id,icon,name])=>({name:`Тема: ${name}`,icon,theme:id,keywords:"цвет оформление"})),{name:"Установить приложение",icon:"📲",action:"install",keywords:"pwa скачать"},{name:"Увеличить текст",icon:"Аа",action:"text",keywords:"доступность шрифт"},{name:"Наверх страницы",icon:"↑",action:"top",keywords:"прокрутка"}];
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
      if(action==="text"){const large=root.dataset.textSize!=="large";root.dataset.textSize=large?"large":"normal";localStorage.setItem("valutkin_text_size",root.dataset.textSize);showShellToast(large?"Текст увеличен":"Обычный размер текста");}
      if(action==="motion"){const reduced=root.dataset.motion!=="reduced";root.dataset.motion=reduced?"reduced":"normal";localStorage.setItem("valutkin_motion",root.dataset.motion);showShellToast(reduced?"Анимации уменьшены":"Анимации включены");}
      if(action==="top") scrollTo({top:0,behavior:root.dataset.motion==="reduced"?"auto":"smooth"});
      if(action==="share"){try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);showShellToast("Ссылка скопирована","success");}}catch(error){if(error.name!=="AbortError")showShellToast("Не удалось поделиться");}}
    };
    aside.querySelectorAll("[data-shell-action]").forEach(button=>button.addEventListener("click",()=>runAction(button.dataset.shellAction)));
    const paletteInput=palette.querySelector("input"),results=palette.querySelector(".palette-results");let activeCommand=0,shown=[];
    function drawCommands(query=""){const q=query.toLowerCase().trim();shown=commands.filter(c=>`${c.name} ${c.keywords||""}`.toLowerCase().includes(q)).slice(0,12);activeCommand=Math.min(activeCommand,Math.max(0,shown.length-1));results.innerHTML=shown.length?shown.map((c,i)=>`<button type="button" data-command="${i}" class="${i===activeCommand?'active':''}"><span>${c.icon}</span><b>${c.name}</b>${c.url?'<small>Открыть</small>':'<small>Выполнить</small>'}</button>`).join(""):'<div class="palette-empty">Ничего не найдено</div>';results.querySelectorAll("[data-command]").forEach(b=>b.onclick=()=>executeCommand(shown[+b.dataset.command]));}
    function executeCommand(command){if(!command)return;if(command.url)location.href=command.url;else if(command.theme){setTheme(command.theme);closePalette();showShellToast(`Тема «${command.name.replace("Тема: ","")}» включена`);}else if(command.action==="install")installButton.click();else{runAction(command.action);closePalette();}}
    function openPalette(){palette.classList.add("active");paletteInput.value="";drawCommands();setTimeout(()=>paletteInput.focus(),20)}
    function closePalette(){palette.classList.remove("active")}
    paletteInput.oninput=()=>{activeCommand=0;drawCommands(paletteInput.value)};paletteInput.onkeydown=e=>{if(e.key==="ArrowDown"){e.preventDefault();activeCommand=Math.min(activeCommand+1,shown.length-1);drawCommands(paletteInput.value)}if(e.key==="ArrowUp"){e.preventDefault();activeCommand=Math.max(0,activeCommand-1);drawCommands(paletteInput.value)}if(e.key==="Enter"){e.preventDefault();executeCommand(shown[activeCommand])}};palette.querySelector(".palette-search button").onclick=closePalette;palette.onclick=e=>{if(e.target===palette)closePalette()};document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPalette()}if(e.key==="Escape")closePalette()});

    setTheme(localStorage.getItem("valutkin_theme") || "dark");
    root.dataset.textSize=localStorage.getItem("valutkin_text_size")||"normal";root.dataset.motion=localStorage.getItem("valutkin_motion")||"normal";
    const font = localStorage.getItem("valutkin_font") || "system";
    root.dataset.font = font;
    const fontSelect = aside.querySelector("#shell-font"); fontSelect.value = font;
    fontSelect.addEventListener("change", () => { root.dataset.font = fontSelect.value; localStorage.setItem("valutkin_font", fontSelect.value); });

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
    const toast=document.createElement("div");toast.className=`shell-toast ${type}`;toast.innerHTML=`<span>${text}</span>${action?'<button type="button">Обновить</button>':''}<button type="button" class="toast-close" aria-label="Закрыть">✕</button>`;document.body.appendChild(toast);
    toast.querySelector(".toast-close").onclick=()=>toast.remove();if(action)toast.querySelector("button:not(.toast-close)").onclick=action;setTimeout(()=>toast.remove(),action?15000:5000);
  }
  async function registerWorker() {
    if (!navigator.serviceWorker?.register) return;
    try {
      const registration=await navigator.serviceWorker.register(`${base}service-worker.js`);
      registration.addEventListener("updatefound",()=>{const worker=registration.installing;if(!worker)return;worker.addEventListener("statechange",()=>{if(worker.state==="installed"&&navigator.serviceWorker.controller)showShellToast("Доступна новая версия сайта","info",()=>{navigator.serviceWorker.addEventListener("controllerchange",()=>location.reload(),{once:true});worker.postMessage({type:"SKIP_WAITING"});});});});
      navigator.serviceWorker.addEventListener("controllerchange",()=>{if(sessionStorage.getItem("valutkin_sw_reloading"))return;sessionStorage.setItem("valutkin_sw_reloading","1");location.reload();});
      window.addEventListener("load",()=>sessionStorage.removeItem("valutkin_sw_reloading"),{once:true});
    } catch(error) { console.warn("Service Worker:",error); }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded",()=>{mount();registerWorker();}) : (mount(),registerWorker());
})();
