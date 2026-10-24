// Общая боковая панель, темы и кнопка аккаунта для всех страниц.
(() => {
  const root = document.documentElement;
  const path = location.pathname;
  const inSubfolder = /\/(exchange|stocks)\//.test(path) || /\/(exchange|stocks)\/?$/.test(path);
  const base = inSubfolder ? "../" : "./";
  const session = localStorage.getItem("valutkin_demo_session");
  const accountHref = session ? `${base}profile.html` : `${base}auth.html`;
  const themes = [
    ["dark", "🌙", "Тёмная"], ["light", "☀️", "Светлая"],
    ["blue", "💙", "Океан"], ["cyberpunk", "🌈", "Киберпанк"],
    ["forest", "🌲", "Лес"], ["sunset", "🌅", "Закат"], ["violet", "🔮", "Фиолетовая"],
    ["aurora", "🌌", "Аврора"], ["coffee", "☕", "Кофе"], ["mono", "◼️", "Моно"], ["rose", "🌸", "Сакура"]
  ];
  const links = [
    [`${base}`, "🏠", "Главная"], [`${base}exchange/`, "💱", "Где купить"],
    [`${base}stocks/`, "📈", "Акции"], [`${base}compare.html`, "⚖️", "Сравнение"], [accountHref, "👤", session ? "Мой профиль" : "Войти"],
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
      <div class="drawer-section font-section"><div class="drawer-section-title">Шрифт</div><select id="shell-font"><option value="system">Системный</option><option value="rounded">Мягкий</option><option value="serif">Классический</option><option value="mono">Моноширинный</option></select></div>
      <a class="drawer-telegram" href="https://t.me/valutkin_bot" target="_blank" rel="noopener noreferrer">✈️ Открыть в Telegram</a></div>`;
    document.body.appendChild(aside);
    const handle = aside.querySelector(".drawer-handle");
    handle.addEventListener("click", () => { const open = aside.classList.toggle("open"); handle.setAttribute("aria-expanded", String(open)); });
    document.addEventListener("click", e => { if (innerWidth <= 760 && !aside.contains(e.target)) aside.classList.remove("open"); });
    aside.querySelectorAll("[data-shell-theme]").forEach(button => button.addEventListener("click", () => setTheme(button.dataset.shellTheme)));
    const scroller = aside.querySelector(".drawer-themes");
    scroller.addEventListener("wheel", e => { e.preventDefault(); scroller.scrollTop += e.deltaY; }, { passive: false });
    setTheme(localStorage.getItem("valutkin_theme") || "dark");
    const font = localStorage.getItem("valutkin_font") || "system";
    root.dataset.font = font;
    const fontSelect = aside.querySelector("#shell-font"); fontSelect.value = font;
    fontSelect.addEventListener("change", () => { root.dataset.font = fontSelect.value; localStorage.setItem("valutkin_font", fontSelect.value); });

    const right = document.querySelector(".header-right");
    if (right && !right.querySelector(".account-shortcut")) {
      const account = document.createElement("a");
      account.href = accountHref; account.className = "account-shortcut";
      account.innerHTML = `<span>👤</span><b>${session ? "Профиль" : "Войти"}</b>`;
      right.appendChild(account);
    }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();
})();
