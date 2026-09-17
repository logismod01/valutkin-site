// ============================================
// КОНФИГ
// ============================================
const API_FIAT_URL = "https://open.er-api.com/v6/latest/USD";
const API_CRYPTO_URL = "https://api.coingecko.com/api/v3/simple/price";
const API_HISTORY = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api";

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
    // ===== МЕТАЛЛЫ =====
    "XAU": ["Золото", "🥇", "metals"],
    "XAG": ["Серебро", "🥈", "metals"],
    "XPT": ["Платина", "🥉", "metals"],
    "XPD": ["Палладий", "💎", "metals"],
};

const CRYPTO_IDS = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "TON": "the-open-network",
    "USDT": "tether",
    "SOL": "solana",
};

// Валюта для fawazahmed0 — строчными буквами
function toLower(code) {
    return code.toLowerCase();
}

let state = {
    rates: {},
    crypto: {},
    activeCategory: "popular",
    searchQuery: "",
    updatedAt: null,
    currentModal: null,
    currentPeriod: 1,
    chart: null,
};

// ============================================
// ЗАГРУЗКА КУРСОВ
// ============================================
async function loadRates() {
    try {
        const [fiatResp, cryptoResp, metalsResp] = await Promise.all([
            fetch(API_FIAT_URL).then(r => r.json()),
            fetch(API_CRYPTO_URL + "?ids=bitcoin,ethereum,the-open-network,tether,solana&vs_currencies=usd,rub")
                .then(r => r.json())
                .catch(() => null),
            fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json")
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
        if (metalsResp && metalsResp.usd) {
            const usd = metalsResp.usd;
            ["XAU", "XAG", "XPT", "XPD"].forEach(code => {
                const lower = code.toLowerCase();
                if (usd[lower]) {
                    state.rates[code] = usd[lower];
                }
            });
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

const METALS = ["XAU", "XAG", "XPT", "XPD"];
const OUNCE_IN_GRAMS = 31.1035;

function getRubValue(code) {
    if (code === "RUB") return 1;
    if (CRYPTO_IDS[code]) {
        const coin = state.crypto[CRYPTO_IDS[code]];
        return coin ? coin.rub : null;
    }
    const rubPerUsd = state.rates["RUB"];
    const rate = state.rates[code];
    if (!rubPerUsd || !rate) return null;
    let rubValue = rubPerUsd / rate;
    // Металлы: цена за унцию → делим на граммы
    if (METALS.includes(code)) {
        rubValue = rubValue / OUNCE_IN_GRAMS;
    }
    return rubValue;
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

    document.getElementById("modal-flag").textContent = flag;
    document.getElementById("modal-code").textContent = code;
    document.getElementById("modal-name").textContent = name;

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

    document.querySelectorAll(".period-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.period === "1") btn.classList.add("active");
    });

    document.getElementById("modal-change").textContent = "Загрузка...";
    document.getElementById("modal-change").className = "modal-change";

    document.getElementById("modal").classList.add("active");
    document.body.style.overflow = "hidden";

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
// ГРАФИК
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
            // Крипта — CoinGecko
            history = await loadCryptoHistory(code, days);
        } else {
            // Фиат — fawazahmed0
            history = await loadFiatHistory(code, days);
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
    // fawazahmed0: запрашиваем historical данные на каждую дату
    // Формат: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@YYYY-MM-DD/v1/currencies/usd.json
    // Возвращает: { "usd": { "rub": 84.19, "eur": 0.86, ... } }
    
    // Нам нужен курс code → RUB. Но fawazahmed0 отдает USD → code.
    // Значит: RUB за 1 code = rate_usd_to_rub / rate_usd_to_code
    
    const dates = [];
    const today = new Date();
    
    // Если дней <= 7, берём каждую дату. Если больше — каждые 3 дня, чтобы не дёргать API 30 раз.
    const step = days <= 7 ? 1 : (days <= 30 ? 3 : 7);
    
    for (let i = days; i >= 0; i -= step) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
    }
    
    // Запрашиваем все даты параллельно (Promise.all)
    const requests = dates.map(date => 
        fetch(`${API_HISTORY}@${date}/v1/currencies/usd.json`)
            .then(r => r.json())
            .then(data => ({ date, data }))
            .catch(() => null)
    );
    
    const results = await Promise.all(requests);
    
    const points = [];
    const codeLower = code.toLowerCase();
    
    for (const r of results) {
        if (!r || !r.data || !r.data.usd) continue;
        
        const usd = r.data.usd;
        const rubPerUsd = usd.rub;
        const rateUsdToCode = usd[codeLower];
        
        if (!rubPerUsd || !rateUsdToCode) continue;
        
        // 1 code = rubPerUsd / rateUsdToCode ₽
        const rubValue = rubPerUsd / rateUsdToCode;
        points.push({ t: r.date, v: rubValue });
    }
    
    console.log(`История ${code}: ${points.length} точек`);
    return points;
}

async function loadCryptoHistory(code, days) {
    const coinId = CRYPTO_IDS[code];
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=rub&days=${days}`;
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
// ТЕМЫ
// ============================================
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("valutkin_theme", theme);
    // Активная кнопка
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
    });
}

function loadTheme() {
    const saved = localStorage.getItem("valutkin_theme") || "dark";
    setTheme(saved);
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    loadTheme();

    // Переключение тем
    document.querySelectorAll(".theme-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            setTheme(btn.dataset.theme);
        });
    });

    document.getElementById("search").addEventListener("input", (e) => {
        state.searchQuery = e.target.value;
        renderCurrencies();
    });

    document.getElementById("convert-btn").addEventListener("click", convert);
    document.getElementById("amount").addEventListener("keypress", (e) => {
        if (e.key === "Enter") convert();
    });

    document.getElementById("modal-close").addEventListener("click", closeModal);
    document.getElementById("modal").addEventListener("click", (e) => { 
        if (e.target.id === "modal") closeModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

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
