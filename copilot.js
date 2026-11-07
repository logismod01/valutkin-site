(() => {
  "use strict";
  if (document.querySelector(".fox-copilot")) return;
  const base = /\/(exchange|stocks)\//.test(location.pathname) ? "../" : "./";
  const pages = [
    ["главная валюты конвертер", "Главная", "", "⌂"], ["рынки акции компании", "Акции", "stocks/", "📈"], ["путешествия страны отели", "Путешествия", "travel.html", "✈️"],
    ["академия уроки обучение", "Академия", "academy.html", "🎓"], ["кошелек web3 транзакции", "Web3-центр", "wallet.html", "◈"], ["штаб бюджет финансы", "Финансовый штаб", "hq.html", "🧭"],
    ["цели накопления", "Цели", "goals.html", "🎯"], ["расходы календарь", "Расходы", "planner.html", "🗓️"], ["новости", "Новости", "news.html", "📰"],
    ["инструменты рынка pro", "Рынки Pro", "market-tools.html", "🧰"], ["профиль портфель", "Профиль", "profile.html", "👤"], ["копия vault шифрование", "Valutkin Vault", "vault.html", "🔐"],
  ];
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const box = document.createElement("section"); box.className = "fox-copilot"; box.setAttribute("aria-label", "Локальный помощник Валюткина");
  box.innerHTML = `<button class="copilot-launch" type="button" aria-expanded="false" aria-label="Открыть помощника"><span>🦊</span><b>Помощник</b></button><div class="copilot-panel" role="dialog" aria-modal="false" aria-labelledby="copilot-title"><header><span>🦊</span><div><b id="copilot-title">Валюткин Copilot</b><small>Локально · без отправки данных</small></div><button type="button" data-copilot-close aria-label="Закрыть">×</button></header><div class="copilot-chat" aria-live="polite"></div><div class="copilot-suggestions"><button type="button">Что мне делать дальше?</button><button type="button">Мой прогресс</button><button type="button">Открой кошелёк</button></div><form><input type="text" maxlength="180" autocomplete="off" placeholder="Спросите или напишите «открой Академию»" aria-label="Команда помощнику"><button type="button" data-copilot-voice aria-label="Голосовой ввод">🎙</button><button type="submit" aria-label="Отправить">➜</button></form><footer>Не является финансовой рекомендацией. Секретные данные вводить нельзя.</footer></div>`;
  document.body.appendChild(box);
  const panel = box.querySelector(".copilot-panel"), launch = box.querySelector(".copilot-launch"), chat = box.querySelector(".copilot-chat"), input = box.querySelector("input");
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let responseQueue = Promise.resolve(), busy = false;
  function setBusy(value) { busy = value; input.disabled = value; box.querySelector('form button[type="submit"]').disabled = value; box.querySelectorAll(".copilot-suggestions button").forEach((button) => button.disabled = value); }
  function message(text, who = "bot", action = null) {
    if (who === "user") { const row = document.createElement("div"), bubble = document.createElement("div"); row.className = "copilot-message user"; bubble.textContent = text; row.appendChild(bubble); chat.appendChild(row); chat.scrollTop = chat.scrollHeight; return Promise.resolve(); }
    responseQueue = responseQueue.then(async () => { setBusy(true); const typing = document.createElement("div"); typing.className = "copilot-typing"; typing.innerHTML = "<i></i><i></i><i></i><span>Валюткин печатает</span>"; chat.appendChild(typing); chat.scrollTop = chat.scrollHeight; await wait(550 + Math.min(650, text.length * 4)); typing.remove(); const row = document.createElement("div"), bubble = document.createElement("div"); row.className = "copilot-message bot"; row.appendChild(bubble); chat.appendChild(row); for (let index = 0; index < text.length; index += 3) { bubble.textContent = text.slice(0, index + 3); chat.scrollTop = chat.scrollHeight; await wait(18); } if (action) { const link = document.createElement("a"); link.href = `${base}${action.href}`; link.textContent = `${action.label} →`; row.appendChild(link); } await wait(1200); setBusy(false); input.focus(); });
    return responseQueue;
  }
  function snapshot() {
    const academy = read("valutkin_academy_progress_v1", { done: [], xp: 0 }), trip = read("valutkin_trip_planner_v1", {}), saved = read("valutkin_saved_places", []), pairs = read("valutkin_market_watchlist_v1", [["USD", "RUB"], ["EUR", "RUB"], ["CNY", "RUB"]]), wallets = read("valutkin_watch_addresses_v2", []), finance = read("valutkin_finance_hq_v1", {}), hidden = (() => { try { return localStorage.getItem("valutkin_hq_private") === "1"; } catch { return false; } })();
    return { lessons: Array.isArray(academy.done) ? academy.done.length : 0, xp: Number(academy.xp) || 0, tripDays: Array.isArray(trip.days) ? trip.days.length : Array.isArray(trip) ? trip.length : 0, saved: Array.isArray(saved) ? saved.length : 0, pairs: Array.isArray(pairs) ? pairs.length : 0, wallets: Array.isArray(wallets) ? wallets.length : 0, finance, hidden };
  }
  function answer(raw) {
    const query = raw.toLocaleLowerCase("ru-RU").trim(), state = snapshot();
    if (!query || busy) return;
    message(raw, "user");
    const open = query.match(/(?:открой|перейди|покажи)\s+(.+)/u)?.[1];
    if (open) { const terms = open.split(/\s+/).filter((word) => word.length > 2), page = pages.find(([words, title]) => { const haystack = `${words} ${title}`.toLocaleLowerCase("ru-RU"); return haystack.includes(open) || open.includes(title.toLocaleLowerCase("ru-RU")) || terms.some((word) => haystack.split(/\s+/).some((candidate) => candidate.startsWith(word.slice(0, 5)))); }); if (page) return message(`Нашёл раздел «${page[1]}».`, "bot", { href: page[2], label: `Открыть ${page[1]}` }); }
    if (/что.*дальше|следующ|продолж/u.test(query)) {
      if (state.lessons < 36) return message(`Лучший следующий шаг — продолжить Академию. Завершено ${state.lessons} из 36 уроков.`, "bot", { href: "academy.html", label: "Продолжить урок" });
      if (!state.tripDays) return message("Академия завершена. Можно собрать первый маршрут путешествия по дням.", "bot", { href: "travel.html", label: "Создать маршрут" });
      return message("Основные сценарии уже начаты. Проверьте финансовый штаб — он соберёт актуальные показатели в одном месте.", "bot", { href: "hq.html", label: "Открыть штаб" });
    }
    if (/прогресс|сводк|статус|как дела/u.test(query)) return message(`Академия: ${state.lessons}/36 уроков и ${state.xp} XP. Маршрут: ${state.tripDays} дней. Сохранено мест: ${state.saved}. Рыночных пар: ${state.pairs}. Watch-only адресов: ${state.wallets}.`);
    if (/академ|урок|xp/u.test(query)) return message(`Завершено ${state.lessons} из 36 уроков, получено ${state.xp} XP.`, "bot", { href: "academy.html", label: "Открыть Академию" });
    if (/кошел|web3|транзак/u.test(query)) return message(`В watch-only сохранено адресов: ${state.wallets}. Реальные сети защищены от отправки; тестовые транзакции подтверждаются только внешним кошельком.`, "bot", { href: "wallet.html", label: "Открыть Web3-центр" });
    if (/поезд|стран|отел|путеше/u.test(query)) return message(`В плане ${state.tripDays} дней, сохранено ${state.saved} мест. В каталоге доступны 51 страна, 510 мест и 102 отеля.`, "bot", { href: "travel.html", label: "Открыть путешествия" });
    if (/рын|валют|курс|пар/u.test(query)) return message(`В списке наблюдения ${state.pairs} валютных пар. Котировки могут поступать с задержкой и не являются рекомендацией.`, "bot", { href: "market-tools.html", label: "Открыть Рынки Pro" });
    if (/бюджет|деньг|доход|расход|финанс/u.test(query)) { if (state.hidden) return message("Финансовые суммы скрыты настройкой приватности. Откройте штаб, чтобы управлять отображением.", "bot", { href: "hq.html", label: "Открыть штаб" }); const income = Number(state.finance.income) || 0, expenses = (Number(state.finance.essential) || 0) + (Number(state.finance.flexible) || 0) + (Number(state.finance.savings) || 0); return message(income ? `По локальному плану после основных категорий остаётся ${Math.round(income - expenses).toLocaleString("ru-RU")} ${state.finance.currency || "RUB"}. Перепроверьте будущие расходы в штабе.` : "Показатели бюджета ещё не заполнены. Банковские реквизиты для этого не нужны.", "bot", { href: "hq.html", label: "Открыть штаб" }); }
    if (/безопас|секрет|seed|парол/u.test(query)) return message("Никому не сообщайте seed-фразу, приватный ключ, банковский пароль или код подтверждения. Валюткин их не запрашивает.");
    const found = pages.filter(([words, title]) => query.split(/\s+/).some((word) => word.length > 3 && `${words} ${title}`.toLocaleLowerCase("ru-RU").includes(word))).slice(0, 1)[0];
    if (found) return message(`Возможно, вам нужен раздел «${found[1]}».`, "bot", { href: found[2], label: `Открыть ${found[1]}` });
    message("Я работаю локально и умею показывать прогресс, искать разделы, открывать функции и подсказывать следующий шаг. Попробуйте: «мой прогресс» или «открой путешествия». ");
  }
  function toggle(force) { const open = force ?? !box.classList.contains("open"); box.classList.toggle("open", open); launch.setAttribute("aria-expanded", String(open)); if (open) setTimeout(() => input.focus(), 50); }
  launch.onclick = () => toggle(); box.querySelector("[data-copilot-close]").onclick = () => toggle(false); box.querySelector("form").onsubmit = (event) => { event.preventDefault(); const value = input.value; input.value = ""; answer(value); }; box.querySelectorAll(".copilot-suggestions button").forEach((button) => button.onclick = () => answer(button.textContent));
  box.querySelector("[data-copilot-voice]").onclick = () => { const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!Recognition) return message("Голосовой ввод не поддерживается этим браузером."); const recognition = new Recognition(); recognition.lang = "ru-RU"; recognition.onresult = (event) => { input.value = event.results[0][0].transcript; input.focus(); }; recognition.onerror = () => message("Не удалось распознать речь."); recognition.start(); };
  document.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key === "/") { event.preventDefault(); toggle(); } if (event.key === "Escape" && box.classList.contains("open")) toggle(false); });
  message("Привет! Я локальный помощник. Могу собрать прогресс, найти функцию или подсказать следующий шаг — без отправки ваших данных.");
})();
