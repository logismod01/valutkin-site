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
        { symbol: "AMD", name: "AMD", flag: "💻" },
        { symbol: "INTC", name: "Intel", flag: "🔵" },
        { symbol: "DIS", name: "Disney", flag: "🏰" },
        { symbol: "KO", name: "Coca-Cola", flag: "🥤" },
        { symbol: "NKE", name: "Nike", flag: "👟" },
        { symbol: "MCD", name: "McDonald's", flag: "🍔" },
        { symbol: "SBUX", name: "Starbucks", flag: "☕" },
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
        { symbol: "ADBE", name: "Adobe", flag: "🎨" },
        { symbol: "QCOM", name: "Qualcomm", flag: "📡" },
        { symbol: "IBM", name: "IBM", flag: "💼" },
        { symbol: "CSCO", name: "Cisco", flag: "🌐" },
        { symbol: "AVGO", name: "Broadcom", flag: "🔌" },
        { symbol: "TXN", name: "Texas Instruments", flag: "⚙️" },
        { symbol: "ASML", name: "ASML", flag: "🇳🇱" },
    ],
    "auto": [
        { symbol: "TSLA", name: "Tesla", flag: "🚗" },
        { symbol: "F", name: "Ford", flag: "🔵" },
        { symbol: "GM", name: "General Motors", flag: "🔷" },
        { symbol: "TM", name: "Toyota", flag: "🇯🇵" },
        { symbol: "HMC", name: "Honda", flag: "🏍️" },
        { symbol: "RIVN", name: "Rivian", flag: "⚡" },
        { symbol: "FERRARI", name: "Ferrari", flag: "🏎️" },
        { symbol: "BMWYY", name: "BMW", flag: "🇩🇪" },
        { symbol: "STLA", name: "Stellantis", flag: "🚙" },
        { symbol: "NSANY", name: "Nissan", flag: "🇯🇵" },
        { symbol: "LCID", name: "Lucid", flag: "✨" },
        { symbol: "NIO", name: "NIO", flag: "🔋" },
        { symbol: "XPEV", name: "XPeng", flag: "🚘" },
        { symbol: "LI", name: "Li Auto", flag: "🏎️" },
        { symbol: "RACE", name: "Ferrari NV", flag: "🐎" },
    ],
    "finance": [
        { symbol: "JPM", name: "JPMorgan", flag: "🏦" },
        { symbol: "BAC", name: "Bank of America", flag: "🏛️" },
        { symbol: "WFC", name: "Wells Fargo", flag: "🦅" },
        { symbol: "GS", name: "Goldman Sachs", flag: "💼" },
        { symbol: "V", name: "Visa", flag: "💳" },
        { symbol: "MA", name: "Mastercard", flag: "💳" },
        { symbol: "PYPL", name: "PayPal", flag: "💸" },
        { symbol: "C", name: "Citigroup", flag: "🏢" },
        { symbol: "MS", name: "Morgan Stanley", flag: "💎" },
        { symbol: "BLK", name: "BlackRock", flag: "⬛" },
        { symbol: "AXP", name: "American Express", flag: "💳" },
        { symbol: "SCHW", name: "Charles Schwab", flag: "📊" },
        { symbol: "BRK.B", name: "Berkshire Hathaway", flag: "🎩" },
        { symbol: "USB", name: "US Bancorp", flag: "🏦" },
        { symbol: "PNC", name: "PNC Financial", flag: "💰" },
    ],
    "food": [
        { symbol: "MCD", name: "McDonald's", flag: "🍔" },
        { symbol: "KO", name: "Coca-Cola", flag: "🥤" },
        { symbol: "PEP", name: "PepsiCo", flag: "🥤" },
        { symbol: "SBUX", name: "Starbucks", flag: "☕" },
        { symbol: "DPZ", name: "Domino's Pizza", flag: "🍕" },
        { symbol: "CMG", name: "Chipotle", flag: "🌯" },
        { symbol: "KHC", name: "Kraft Heinz", flag: "🍅" },
        { symbol: "MDLZ", name: "Mondelez", flag: "🍫" },
        { symbol: "NSRGY", name: "Nestle", flag: "🍫" },
        { symbol: "YUM", name: "Yum! Brands", flag: "🍗" },
        { symbol: "WEN", name: "Wendy's", flag: "🍔" },
        { symbol: "HSY", name: "Hershey", flag: "🍫" },
        { symbol: "GIS", name: "General Mills", flag: "🥣" },
        { symbol: "K", name: "Kellogg's", flag: "🥣" },
        { symbol: "TAP", name: "Molson Coors", flag: "🍺" },
    ],
    "entertainment": [
        { symbol: "NFLX", name: "Netflix", flag: "🎬" },
        { symbol: "DIS", name: "Disney", flag: "🏰" },
        { symbol: "WBD", name: "Warner Bros", flag: "🎥" },
        { symbol: "SONY", name: "Sony", flag: "🎮" },
        { symbol: "SPOT", name: "Spotify", flag: "🎵" },
        { symbol: "EA", name: "Electronic Arts", flag: "🎮" },
        { symbol: "ATVI", name: "Activision", flag: "🔫" },
        { symbol: "RBLX", name: "Roblox", flag: "🧱" },
        { symbol: "TTWO", name: "Take-Two", flag: "🚗" },
        { symbol: "LYV", name: "Live Nation", flag: "🎤" },
        { symbol: "PARA", name: "Paramount", flag: "🎞️" },
        { symbol: "FOXA", name: "Fox Corp", flag: "📺" },
        { symbol: "AMC", name: "AMC", flag: "🎦" },
        { symbol: "IMAX", name: "IMAX", flag: "🎬" },
        { symbol: "WMG", name: "Warner Music", flag: "🎶" },
    ],
    "china": [
        { symbol: "BABA", name: "Alibaba", flag: "🇨🇳" },
        { symbol: "TCEHY", name: "Tencent", flag: "🐧" },
        { symbol: "BIDU", name: "Baidu", flag: "🔍" },
        { symbol: "JD", name: "JD.com", flag: "🛒" },
        { symbol: "XIACY", name: "Xiaomi", flag: "📱" },
        { symbol: "NIO", name: "NIO", flag: "🔋" },
        { symbol: "PDD", name: "Pinduoduo", flag: "🛍️" },
        { symbol: "NTES", name: "NetEase", flag: "🎮" },
        { symbol: "TCOM", name: "Trip.com", flag: "✈️" },
        { symbol: "BZUN", name: "Baozun", flag: "📦" },
        { symbol: "WB", name: "Weibo", flag: "💬" },
        { symbol: "MOMO", name: "Momo", flag: "📱" },
        { symbol: "IQ", name: "iQIYI", flag: "🎬" },
        { symbol: "TAL", name: "TAL Education", flag: "📚" },
        { symbol: "EDU", name: "New Oriental", flag: "🎓" },
    ],
};

// ============================================
// ЗАГРУЗКА (с задержкой — чтобы не было 429)
// ============================================
async function loadStocks(category) {
    const grid = document.getElementById("stocks-grid");
    const list = STOCKS[category];

    grid.innerHTML = '<div class="loading">Загрузка акций...</div>';

    const results = [];

    for (const stock of list) {
        try {
            const r = await fetch(`${FINNHUB_URL}?symbol=${stock.symbol}&token=${FINNHUB_KEY}`);
            const data = await r.json();
            results.push({ stock, data });
        } catch (e) {
            results.push({ stock, data: null });
        }
        // Пауза 150 мс между запросами
        await new Promise(resolve => setTimeout(resolve, 150));
    }

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
