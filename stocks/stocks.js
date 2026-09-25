// ============================================
// КОНФИГ
// ============================================
const FINNHUB_KEY = "dar7h19r01qn6lvcoj9gdar7h19r01qn6lvcoja0";
const FINNHUB_URL = "https://finnhub.io/api/v1/quote";

const STOCKS = {
    "popular": [
        { symbol: "AAPL", name: "Apple", flag: "🍎" },
        { symbol: "TSLA", name: "Tesla", flag: "🚗" },
        { symbol: "MSFT", name: "Microsoft", flag: "🪟" },
        { symbol: "GOOGL", name: "Google", flag: "🔍" },
        { symbol: "AMZN", name: "Amazon", flag: "📦" },
        { symbol: "META", name: "Meta", flag: "👥" },
        { symbol: "NVDA", name: "NVIDIA", flag: "🎮" },
        { symbol: "NFLX", name: "Netflix", flag: "🎬" },
    ],
    "tech": [
        { symbol: "AAPL", name: "Apple", flag: "🍎" },
        { symbol: "MSFT", name: "Microsoft", flag: "🪟" },
        { symbol: "GOOGL", name: "Google", flag: "🔍" },
        { symbol: "NVDA", name: "NVIDIA", flag: "🎮" },
        { symbol: "AMD", name: "AMD", flag: "💻" },
        { symbol: "INTC", name: "Intel", flag: "🔵" },
        { symbol: "ORCL", name: "Oracle", flag: "🔴" },
        { symbol: "CRM", name: "Salesforce", flag: "☁️" },
    ],
    "auto": [
        { symbol: "TSLA", name: "Tesla", flag: "🚗" },
        { symbol: "F", name: "Ford", flag: "🔵" },
        { symbol: "GM", name: "General Motors", flag: "🔷" },
        { symbol: "TM", name: "Toyota", flag: "🇯🇵" },
        { symbol: "HMC", name: "Honda", flag: "🏍️" },
        { symbol: "RIVN", name: "Rivian", flag: "⚡" },
    ],
    "finance": [
        { symbol: "JPM", name: "JPMorgan", flag: "🏦" },
        { symbol: "BAC", name: "Bank of America", flag: "🏛️" },
        { symbol: "WFC", name: "Wells Fargo", flag: "🦅" },
        { symbol: "GS", name: "Goldman Sachs", flag: "💼" },
        { symbol: "V", name: "Visa", flag: "💳" },
        { symbol: "MA", name: "Mastercard", flag: "💳" },
    ],
    "russia": [
        { symbol: "SBER.ME", name: "Сбербанк", flag: "🟢" },
        { symbol: "GAZP.ME", name: "Газпром", flag: "🔵" },
        { symbol: "LKOH.ME", name: "Лукойл", flag: "🛢️" },
        { symbol: "GMKN.ME", name: "Норникель", flag: "⛏️" },
        { symbol: "ROSN.ME", name: "Роснефть", flag: "🛢️" },
        { symbol: "MTSS.ME", name: "МТС", flag: "📱" },
    ],
};

// ============================================
// ЗАГРУЗКА
// ============================================
async function loadStocks(category) {
    const grid = document.getElementById("stocks-grid");
    const list = STOCKS[category];

    grid.innerHTML = '<div class="loading">Загрузка акций...</div>';

    const promises = list.map(stock =>
        fetch(`${FINNHUB_URL}?symbol=${stock.symbol}&token=${FINNHUB_KEY}`)
            .then(r => r.json())
            .then(data => ({ stock, data }))
            .catch(() => ({ stock, data: null }))
    );

    const results = await Promise.all(promises);
    grid.innerHTML = results.map(r => renderStockCard(r.stock, r.data)).join("");
}

function renderStockCard(stock, data) {
    if (!data || !data.c || data.c === 0) {
        return `
            <div class="stock-card">
                <div class="stock-header">
                    <span class="stock-flag">${stock.flag}</span>
                    <span class="stock-symbol">${stock.symbol}</span>
                </div>
                <div class="stock-name">${stock.name}</div>
                <div class="stock-price">— нет данных</div>
            </div>
        `;
    }

    const price = data.c.toFixed(2);
    const change = data.d ? data.d.toFixed(2) : "0.00";
    const changePercent = data.dp ? data.dp.toFixed(2) : "0.00";
    const isUp = parseFloat(change) >= 0;
    const cls = isUp ? "up" : "down";
    const arrow = isUp ? "📈" : "📉";
    const sign = isUp ? "+" : "";

    return `
        <div class="stock-card">
            <div class="stock-header">
                <span class="stock-flag">${stock.flag}</span>
                <span class="stock-symbol">${stock.symbol}</span>
            </div>
            <div class="stock-name">${stock.name}</div>
            <div class="stock-price">$${price}</div>
            <div class="stock-change ${cls}">
                ${arrow} ${sign}${change} (${sign}${changePercent}%)
            </div>
        </div>
    `;
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    loadStocks("popular");

    document.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadStocks(btn.dataset.cat);
        });
    });
});
