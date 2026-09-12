// ============================================
// КОНФИГ
// ============================================
const API_FIAT_URL = "https://open.er-api.com/v6/latest/USD";
const API_CRYPTO_URL = "https://api.coingecko.com/api/v3/simple/price";

// Список валют (код: [название, флаг, категория])
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

// ============================================
// СОСТОЯНИЕ
// ============================================
let state = {
    rates: {},          // фиатные курсы (USD → X)
    crypto: {},         // крипта
    activeCategory: "popular",
    searchQuery: "",
    updatedAt: null,
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
// РЕНДЕР СЕТКИ ВАЛЮТ
// ============================================
function renderCurrencies() {
    const grid = document.getElementById("currencies-grid");
    const q = state.searchQuery.toLowerCase().trim();
    const cat = state.activeCategory;

    let codes = Object.keys(CURRENCIES).filter(code => {
        const [name, flag, category] = CURRENCIES[code];

        // Фильтр по категории
        if (cat !== "all" && category !== cat) return false;

        // Фильтр по поиску
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
}

function renderCard(code) {
    const [name, flag] = CURRENCIES[code];
    const rubValue = getRubValue(code);

    if (rubValue === null) {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-flag">${flag}</span>
                    <span class="card-code">${code}</span>
                </div>
                <div class="card-price">—</div>
            </div>
        `;
    }

    // Курс: сколько единиц валюты в 1 рубле, либо наоборот
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

    // Fake изменение (пока нет истории на сайте)
    const change = ((Math.random() * 2 - 1) * 1.5).toFixed(2);
    const changeClass = change >= 0 ? "up" : "down";
    const changeText = change >= 0 ? `📈 +${change}%` : `📉 ${change}%`;

    return `
        <div class="card">
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

    // Переводим в популярные валюты
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

    if (extra.length > 0) {
        text += " • " + extra.join(" • ");
    }

    result.textContent = text;
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    // Загружаем курсы
    loadRates();

    // Обновляем каждые 5 минут
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
});