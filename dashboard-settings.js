(() => {
let dashboardStorage=null;try{dashboardStorage=window.localStorage}catch(_){}
const dashboardGet=(key,fallback=null)=>{try{return dashboardStorage?.getItem(key)??fallback}catch(_){return fallback}};
const dashboardSet=(key,value)=>{try{dashboardStorage?.setItem(key,value)}catch(_){}};
const dashboardRemove=key=>{try{dashboardStorage?.removeItem(key)}catch(_){}};
const dashboardClear=()=>{try{dashboardStorage?.clear()}catch(_){}};

  const defaults = { converter: true, search: true, categories: true, market: true, compact: false };
  let stored = {};
  try { stored = JSON.parse(dashboardGet("valutkin_dashboard") || "{}"); } catch { dashboardRemove("valutkin_dashboard"); }
  const settings = { ...defaults, ...stored };
  const items = [["converter","Конвертер"],["search","Поиск"],["categories","Категории"],["market","Карточки рынка"],["compact","Компактные карточки"]];
  const panel = document.createElement("div");
  panel.className = "dashboard-settings";
  panel.innerHTML = `<button class="dashboard-settings-button" type="button" aria-expanded="false"><span class="settings-icon">⚙️</span><span>Настроить экран</span></button><div class="dashboard-settings-popover" role="dialog" aria-label="Настройка главного экрана"><b>Мой главный экран</b>${items.map(([key,name]) => `<label><input type="checkbox" data-setting="${key}" ${settings[key] ? "checked" : ""}> ${name}</label>`).join("")}<button type="button" data-reset>Сбросить</button></div>`;
  document.body.appendChild(panel);

  function apply() {
    document.querySelector(".converter")?.classList.toggle("widget-hidden", !settings.converter);
    document.querySelector(".search-section")?.classList.toggle("widget-hidden", !settings.search);
    document.querySelector(".categories")?.classList.toggle("widget-hidden", !settings.categories);
    document.querySelector("#currencies-grid")?.classList.toggle("widget-hidden", !settings.market);
    document.querySelector("#currencies-grid")?.classList.toggle("compact-grid", settings.compact);
    dashboardSet("valutkin_dashboard", JSON.stringify(settings));
  }
  function toggle(open = !panel.classList.contains("open")) {
    panel.classList.toggle("open", open);
    panel.querySelector(".dashboard-settings-button").setAttribute("aria-expanded", String(open));
  }
  panel.querySelector(".dashboard-settings-button").addEventListener("click", () => toggle());
  panel.querySelectorAll("[data-setting]").forEach(input => input.addEventListener("change", () => { settings[input.dataset.setting] = input.checked; apply(); }));
  panel.querySelector("[data-reset]").addEventListener("click", () => {
    Object.assign(settings, defaults);
    panel.querySelectorAll("[data-setting]").forEach(input => { input.checked = settings[input.dataset.setting]; });
    apply();
  });
  document.addEventListener("click", event => { if (!panel.contains(event.target)) toggle(false); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") toggle(false); });
  apply();
})();
