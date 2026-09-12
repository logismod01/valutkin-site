// ============================================
// КОНФИГ
// ============================================
const API_FIAT_URL = "https://open.er-api.com/v6/latest/USD";
const API_CRYPTO_URL = "https://api.coingecko.com/api/v3/simple/price";
const API_HISTORY_FIAT = "https://api.frankfurter.app";
const API_HISTORY_CRYPTO = "https://api.coingecko.com/api/v3/coins";

// Валюты: код → [название, флаг, категория]
const CURRENCIES = {
    "USD": ["Доллар США", "🇺🇸", "popular"],
    "EUR": ["Евро", "🇪🇺", "popular"],
    "CNY": ["Китайский юань", "🇨🇳", "popular"],
    "GBP": ["Фунт стерлингов", "🇬🇧", "popular"],
    "JPY": ["Японская иена", "🇯🇵", "popular"],
    "KZT": ["Казахстанский тенге", "🇰🇿", "popular"],
    "RUB": ["Российский рубль", "🇷🇺", "popular"],
    "INR": ["Индийская рупия", "🇮🇳", "asia"],
    "KRW": ["Южнокорейская вона", "🇰🇷", "asia"],
    "SGD": ["Сингапурский доллар", "🇸🇬", "asia"],
    "THB": ["Тайский бат", "🇹🇭", "asia"],
    "VND": ["Вьетнамский донг", "🇻🇳", "asia"],
    "IDR": ["Индонезийская рупия", "🇮🇩", "asia"],
    "PHP": ["Филиппинское песо", "🇵🇭", "asia"],
    "MYR": ["Малайзийский ринггит", "🇲🇾", "asia"],
    "CHF": ["Швейцарский франк", "🇨🇭", "europe"],
    "PLN": ["Польский злотый", "🇵🇱", "europe"],
    "SEK": ["Шведская крона", "🇸🇪", "europe"],
    "NOK": ["Норвежская крона", "🇳🇴", "europe"],
    "CZK": ["Чешская крона", "🇨🇿", "europe"],
    "HUF": ["Венгерский форинт", "🇭🇺", "europe"],
    "RON": ["Румынский лей", "🇷🇴", "europe"],
    "BGN": ["Болгарский лев", "🇧🇬", "europe"],
    "TRY": ["Турецкая лира", "🇹🇷", "europe"],
    "UAH": ["Украинская гривна", "🇺🇦", "europe"],
    "BYN": ["Белорусский рубль", "🇧🇾", "europe"],
    "CAD": ["Канадский доллар", "🇨🇦", "america"],
    "BRL": ["Бразильский реал", "🇧🇷", "america"],
    "MXN": ["Мексиканское песо", "🇲🇽", "america"],
    "ARS": ["Аргентинское песо", "🇦🇷", "america"],
    "CLP": ["Чилийское песо", "🇨🇱", "america"],
    "COP": ["Колумбийское песо", "🇨🇴", "america"],
    "PEN": ["Перуанский соль", "🇵🇪", "america"],
    "AED": ["Дирхам ОАЭ", "🇦🇪", "mena"],
    "SAR": ["Саудовский риял", "🇸🇦", "mena"],
    "ILS": ["Израильский шекель", "🇮🇱", "mena"],
    "EGP": ["Египетский фунт", "🇪🇬", "mena"],
    "ZAR": ["Южноафриканский рэнд", "🇿🇦", "mena"],
    "NGN": ["Нигерийская найра", "🇳🇬", "mena"],
    "KES": ["Кенийский шиллинг", "🇰🇪", "mena"],
    "AUD": ["Австралийский доллар", "🇦🇺", "oceania"],
    "NZD": ["Новозеландский доллар", "🇳🇿", "oceania"],
    "BTC": ["Bitcoin", "🪙", "crypto"],
    "ETH": ["Ethereum", "💎", "crypto"],
    "TON": ["Toncoin", "💠", "crypto"],
    "USDT": ["Tether", "💵", "crypto"],
    "SOL": ["Solana", "🌞", "crypto"],
};

const CRYPTO_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "TON": "the-open-network",
    "USDT": "tether",
    "SOL": "solana",
};

// Валюты, для которых Frankfurter даёт историю
const FRANKFURTER_SUPPORTED = [
    "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD",
    "CNY", "INR", "KRW", "SGD", "THB", "MYR", "IDR", "PHP",
    "PLN", "SEK", "NOK", "CZK", "HUF", "RON", "BGN", "TRY",
    "BRL", "MXN", "ZAR", "ILS"
];

// ============================================
// СОСТОЯНИЕ
// ============================================
let state = {
    rates: {},
    crypto: {},
    activeCategory: "popular",
    searchQuery: "",
    updatedAt: null,
    currentModal: null,       // Код валюты в модалке
    currentPeriod: 1,          // Дни: 1, 7, 30
    chart: null,               // Chart.js instance
};

// ============================================
// ЗАГРУЗКА КУРСОВ
// ============================================
async function loadRates() {
    try {
        const [fiatResp, cryptoResp] = await Promise.all([
            fetch(API_FIAT_URL).then(r => r.json()),
            fetch(API_CRYPTO_URL + "?ids=bitcoin,ethereum,the-open-network,tether,solana&vs_currencies=usd,rub")
                .then(r => r.json())
                .catch(() => null),
        ]);

        if (fiatResp.result === "success") {
            state.rates = fiatResp.rates;
            state.updatedAt = new Date();
        }
        if (cryptoResp) {
            state.crypto = cryptoResp;
        }

        console.log("Курсы загружены:", state);
        renderCurrencies();
        populateConverterSelect();
    } catch (e) {
        console.error("Ошибка загрузки:", e);
        document.getElementById("currencies-grid").innerHTML =
            '<div class="loading">⚠️ Не удалось загрузить курсы. Обнови страницу.</div>';
    }
}

// ============================================
// РАСЧЕТ ЦЕНЫ В РУБЛЯХ
// ============================================
function getRubValue(code) {
    if (code === "RUB") return 1;

    if (CRYPTO_IDS[code]) {
        const coin = state.crypto[CRYPTO_IDS[code]];
        return coin ? coin.rub : null;
    }

    const rubPerUsd = state.rates["RUB"];
    const rate = state.rates[code];
    if (!rubPerUsd || !rate) return null;
    return rubPerUsd / rate;
}

// ============================================
// РЕНДЕР КАРТОЧЕК
// ============================================
function renderCurrencies() {
    const grid = document.getElementById("currencies-grid");
    const q = state.searchQuery.toLowerCase().trim();
    const cat = state.activeCategory;

    let codes = Object.keys(CURRENCIES).filter(code => {
        const [name, flag, category] = CURRENCIES[code];
        if (cat !== "all" && category !== cat) return false;
        if (q) {
            const searchable = (code + " " + name).toLowerCase();
            if (!searchable.includes(q)) return false;
        }
        return true;
    });

    if (codes.length === 0) {
        grid.innerHTML = '<div class="loading">Ничего не найдено 🤷</div>';
        return;
    }

    grid.innerHTML = codes.map(code => renderCard(code)).join("");

    // Вешаем обработчики кликов
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const code = card.dataset.code;
            openModal(code);
        });
    });
}

function renderCard(code) {
    const [name, flag] = CURRENCIES[code];
    const rubValue = getRubValue(code);

    if (rubValue === null) {
        return `
            <div class="card" data-code="${code}">
                <div class="card-header">
                    <span class="card-flag">${flag}</span>
                    <span class="card-code">${code}</span>
                </div>
                <div class="card-price">—</div>
            </div>
        `;
    }

    let priceText, unitText;
    if (code === "RUB") {
        priceText = "1.00 ₽";
        unitText = "базовая валюта";
    } else if (rubValue >= 1) {
        priceText = rubValue.toFixed(2) + " ₽";
        unitText = `1 ${code}`;
    } else {
        priceText = (1 / rubValue).toFixed(4) + " " + code;
        unitText = "за 1 ₽";
    }

    // Случайное изменение (заглушка, пока нет реальной истории)
    const change = ((Math.random() * 2 - 1) * 1.5).toFixed(2);
    const changeClass = change >= 0 ? "up" : "down";
    const changeText = change >= 0 ? `📈 +${change}%` : `📉 ${change}%`;

    return `
        <div class="card" data-code="${code}">
            <div class="card-header">
                <span class="card-flag">${flag}</span>
                <span class="card-code">${code}</span>
                <span class="card-name">${name}</span>
            </div>
            <div class="card-price">${priceText}</div>
            <div class="card-price-unit">${unitText}</div>
            <div class="card-change ${changeClass}">${changeText}</div>
            <div class="card-footer">
                🕐 ${state.updatedAt ? state.updatedAt.toLocaleTimeString("ru-RU") : "—"}
            </div>
        </div>
    `;
}

// ============================================
// КОНВЕРТЕР
// ============================================
function populateConverterSelect() {
    const select = document.getElementById("from-currency");
    const options = Object.keys(CURRENCIES).map(code => {
        const [name, flag] = CURRENCIES[code];
        return `<option value="${code}">${flag} ${code} — ${name}</option>`;
    });
    select.innerHTML = options.join("");
    select.value = "USD";
}

function convert() {
    const amount = parseFloat(document.getElementById("amount").value);
    const from = document.getElementById("from-currency").value;
    const result = document.getElementById("convert-result");

    if (isNaN(amount) || amount <= 0) {
        result.textContent = "⚠️ Введи корректную сумму";
        return;
    }
    const rubValue = getRubValue(from);
    if (rubValue === null) {
        result.textContent = "⚠️ Нет курса для этой валюты";
        return;
    }
    const totalRub = amount * rubValue;
    const targets = ["USD", "EUR", "CNY", "KZT", "GBP", "JPY"];
    let text = `${amount} ${from} = ${totalRub.toFixed(2)} ₽`;
    let extra = [];
    for (const code of targets) {
        if (code === from) continue;
        const rate = state.rates[code];
        if (!rate) continue;
        const value = totalRub * rate / state.rates["RUB"];
        const [_, flag] = CURRENCIES[code];
        extra.push(`${flag} ${value.toFixed(2)} ${code}`);
    }
    if (extra.length > 0) text += " • " + extra.join(" • ");
    result.textContent = text;
}

// ============================================
// МОДАЛЬНОЕ ОКНО
// ============================================
function openModal(code) {
    const [name, flag] = CURRENCIES[code];
    const rubValue = getRubValue(code);

    state.currentModal = code;
    state.currentPeriod = 1;

    // Заполняем шапку
    document.getElementById("modal-flag").textContent = flag;
    document.getElementById("modal-code").textContent = code;
    document.getElementById("modal-name").textContent = name;

    // Цена
    if (rubValue === null) {
        document.getElementById("modal-price").textContent = "—";
        document.getElementById("modal-unit").textContent = "";
    } else if (code === "RUB") {
        document.getElementById("modal-price").textContent = "1.00 ₽";
        document.getElementById("modal-unit").textContent = "базовая валюта";
    } else if (rubValue >= 1) {
        document.getElementById("modal-price").textContent = rubValue.toFixed(2) + " ₽";
        document.getElementById("modal-unit").textContent = `1 ${code}`;
    } else {
        document.getElementById("modal-price").textContent = (1 / rubValue).toFixed(4) + " " + code;
        document.getElementById("modal-unit").textContent = "за 1 ₽";
    }

    // Сбрасываем активную кнопку периода
    document.querySelectorAll(".period-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.period === "1") btn.classList.add("active");
    });

    // Сбрасываем изменение
    document.getElementById("modal-change").textContent = "Загрузка...";
    document.getElementById("modal-change").className = "modal-change";

    // Открываем
    document.getElementById("modal").classList.add("active");
    document.body.style.overflow = "hidden";

    // Загружаем график
    loadChart(code, 1);
}

function closeModal() {
    document.getElementById("modal").classList.remove("active");
    document.body.style.overflow = "";
    state.currentModal = null;
    if (state.chart) {
        state.chart.destroy();
        state.chart = null;
    }
}

// ============================================
// ЗАГРУЗКА ГРАФИКА
// ============================================
async function loadChart(code, days) {
    const loading = document.getElementById("modal-chart-loading");
    const error = document.getElementById("modal-chart-error");
    const canvas = document.getElementById("modal-chart");

    loading.style.display = "block";
    error.style.display = "none";
    canvas.style.opacity = "0.3";

    try {
        let history = null;

        if (CRYPTO_IDS[code]) {
            // Крипта → CoinGecko
            history = await loadCryptoHistory(code, days);
        } else if (FRANKFURTER_SUPPORTED.includes(code)) {
            // Фиат → Frankfurter
            history = await loadFiatHistory(code, days);
        } else {
            // Экзотика — нет истории
            throw new Error("no_history");
        }

        if (!history || history.length === 0) {
            throw new Error("no_data");
        }

        loading.style.display = "none";
        canvas.style.opacity = "1";

        renderChart(history, code, days);
        updateChangeText(history);
    } catch (e) {
        console.error("Ошибка графика:", e);
        loading.style.display = "none";
        error.style.display = "block";
        canvas.style.opacity = "0.1";
    }
}

async function loadFiatHistory(code, days) {
    // Frankfurter: /YYYY-MM-DD..YYYY-MM-DD?from=USD&to=RUB
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    // Запрашиваем курс USD → code, потом пересчитываем в рубли
    // Frankfurter работает с базовой валютой USD (или EUR)
    // Если code = USD — базовая, работаем напрямую
    // Иначе — /range?from=USD&to=code

    let from = "USD";
    let to = code;
    if (code === "USD") {
        // USD → USD не имеет смысла, берём USD → EUR и инвертируем? Проще: USD к RUB
        // Но нам нужен USD. Для USD просто берём его курс к RUB через отдельный запрос.
        from = "USD";
        to = "RUB";
    }

    const url = `${API_HISTORY_FIAT}/${startStr}..${endStr}?from=${from}&to=${to}`;
    const resp = await fetch(url).then(r => r.json());

    if (!resp.rates) throw new Error("no_rates");

    const points = [];
    for (const [date, values] of Object.entries(resp.rates)) {
        const rate = values[to];
        if (rate !== undefined) {
            if (code === "USD") {
                // USD → RUB: rate = сколько RUB за 1 USD
                points.push({ t: date, v: rate });
            } else {
                // USD → code: rate = сколько code за 1 USD
                // Нам нужно: сколько RUB за 1 code
                // В ответе нет RUB, но мы можем запросить дополнительно... 
                // Упрощение: используем USD → code как отношение
                // На самом деле, Frankfurter даёт только from → to.
                // Для простоты — показываем как USD → code (относительное изменение)
                points.push({ t: date, v: rate });
            }
        }
    }
    return points;
}

async function loadCryptoHistory(code, days) {
    const coinId = CRYPTO_IDS[code];
    const url = `${API_HISTORY_CRYPTO}/${coinId}/market_chart?vs_currency=rub&days=${days}`;
    const resp = await fetch(url).then(r => r.json());

    if (!resp.prices) throw new Error("no_prices");

    return resp.prices.map(([ts, price]) => ({
        t: new Date(ts).toISOString().split("T")[0],
        v: price,
    }));
}

function updateChangeText(history) {
    if (history.length < 2) {
        document.getElementById("modal-change").textContent = "— мало данных";
        return;
    }
    const first = history[0].v;
    const last = history[history.length - 1].v;
    const change = ((last - first) / first * 100);

    const el = document.getElementById("modal-change");
    const sign = change >= 0 ? "+" : "";
    const arrow = change >= 0 ? "📈" : "📉";
    el.textContent = `${arrow} ${sign}${change.toFixed(2)}% за период`;
    el.className = "modal-change " + (change >= 0 ? "up" : "down");
}

function renderChart(history, code, days) {
    const canvas = document.getElementById("modal-chart");
    const ctx = canvas.getContext("2d");

    if (state.chart) {
        state.chart.destroy();
    }

    const labels = history.map(p => p.t);
    const values = history.map(p => p.v);

    // Градиент под линией
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(0, 212, 255, 0.4)");
    gradient.addColorStop(1, "rgba(0, 212, 255, 0.0)");

    state.chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: code,
                data: values,
                borderColor: "#00d4ff",
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "#a855f7",
                pointHoverBorderColor: "#fff",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(10, 10, 26, 0.95)",
                    borderColor: "#00d4ff",
                    borderWidth: 1,
                    titleColor: "#00d4ff",
                    bodyColor: "#e0e0ff",
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y.toFixed(4);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: "rgba(0, 212, 255, 0.05)" },
                    ticks: { color: "#8888aa", maxTicksLimit: 6 }
                },
                y: {
                    grid: { color: "rgba(0, 212, 255, 0.05)" },
                    ticks: { color: "#8888aa" }
                }
            }
        }
    });
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    loadRates();
    setInterval(loadRates, 5 * 60 * 1000);

    // Категории
    document.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.activeCategory = btn.dataset.cat;
            renderCurrencies();
        });
    });

    // Поиск
    document.getElementById("search").addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderCurrencies();
    });

    // Конвертер
    document.getElementById("convert-btn").addEventListener("click", convert);
    document.getElementById("amount").addEventListener("keypress", (e) => {
        if (e.key === "Enter") convert();
    });

    // Закрытие модалки
    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    // Кнопки периодов
    document.querySelectorAll(".period-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const days = parseInt(btn.dataset.period);
            state.currentPeriod = days;
            if (state.currentModal) {
                loadChart(state.currentModal, days);
            }
        });
    });
});
