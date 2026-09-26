// ============================================
// КОНФИГ
// ============================================
const FINNHUB_KEY = "dar7h19r01qn6lvcoj9gdar7h19r01qn6lvcoja0";
const FINNHUB_URL = "https://finnhub.io/api/v1/quote";
// КЭШ — чтобы не дёргать Finnhub повторно
const CACHE = {};
const CACHE_TIME = 60000; // 60 секунд

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
        const cacheKey = stock.symbol;
        const now = Date.now();

        if (CACHE[cacheKey] && (now - CACHE[cacheKey].time) < CACHE_TIME) {
            // Берём из кэша
            results.push({ stock, data: CACHE[cacheKey].data });
        } else {
            // Запрашиваем Finnhub
            try {
                const r = await fetch(`${FINNHUB_URL}?symbol=${stock.symbol}&token=${FINNHUB_KEY}`);
                const data = await r.json();
                CACHE[cacheKey] = { data, time: now };
                results.push({ stock, data });
            } catch (e) {
                results.push({ stock, data: null });
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    grid.innerHTML = results.map(r => renderStockCard(r.stock, r.data)).join("");
}
// ============================================
// АВТООБНОВЛЕНИЕ (каждые 30 сек)
// ============================================
let autoRefreshTimer = null;
let currentCategory = "popular";

function startAutoRefresh() {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(() => {
        console.log("🔄 Автообновление акций...");
        loadStocks(currentCategory);
    }, 300000); // 5 мин
}

function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
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
    currentCategory = "popular";
    loadStocks("popular");
    startAutoRefresh();

    document.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.dataset.cat;
            loadStocks(currentCategory);
        });
    });

    // Останавливаем автообновление, когда вкладка неактивна
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            startAutoRefresh();
            loadStocks(currentCategory);
        }
    });
});
// ============================================
// ГРАФИК АКЦИИ
// ============================================
let stockChart = null;
let currentStock = null;
let currentDays = 7;

function openStockModal(stock) {
    currentStock = stock;
    currentDays = 7;

    document.getElementById("sm-flag").textContent = stock.flag;
    document.getElementById("sm-symbol").textContent = stock.symbol;
    document.getElementById("sm-name").textContent = stock.name;

    // Цена — берём из карточки
    const card = document.querySelector(`[data-symbol="${stock.symbol}"]`);
    if (card) {
        document.getElementById("sm-price").textContent = card.querySelector(".stock-price").textContent;
        const changeEl = card.querySelector(".stock-change");
        if (changeEl) {
            document.getElementById("sm-change").textContent = changeEl.textContent;
            document.getElementById("sm-change").className = "stock-modal-change " + (changeEl.classList.contains("up") ? "up" : "down");
        }
    }

    document.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.querySelector('.period-btn[data-days="7"]');
    if (activeBtn) activeBtn.classList.add("active");

    document.getElementById("stock-modal").classList.add("active");
    document.body.style.overflow = "hidden";

    loadStockChart(stock.symbol, 7);
}

function closeStockModal() {
    document.getElementById("stock-modal").classList.remove("active");
    document.body.style.overflow = "";
    currentStock = null;
    if (stockChart) {
        stockChart.destroy();
        stockChart = null;
    }
}

async function loadStockChart(symbol, days) {
    const loading = document.getElementById("chart-loading");
    const canvas = document.getElementById("stock-chart");

    loading.style.display = "block";
    loading.textContent = "Загрузка графика...";
    canvas.style.opacity = "0.3";

    try {
        const range = days <= 7 ? "5d" : (days <= 30 ? "1mo" : (days <= 90 ? "3mo" : "1y"));
        const interval = days <= 7 ? "1h" : (days <= 90 ? "1d" : "1wk");

        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
        const resp = await fetch(url).then(r => r.json());

        const result = resp.chart.result[0];
        const timestamps = result.timestamp;
        const prices = result.indicators.quote[0].close;

        const points = [];
        for (let i = 0; i < timestamps.length; i++) {
            if (prices[i] !== null) {
                points.push({
                    t: new Date(timestamps[i] * 1000).toLocaleDateString("ru-RU"),
                    v: prices[i],
                });
            }
        }

        loading.style.display = "none";
        canvas.style.opacity = "1";

        renderStockChart(points, symbol);
    } catch (e) {
        console.error("Ошибка графика:", e);
        loading.textContent = "❌ Не удалось загрузить график";
    }
}

function renderStockChart(points, symbol) {
    const canvas = document.getElementById("stock-chart");
    const ctx = canvas.getContext("2d");

    if (stockChart) stockChart.destroy();

    const labels = points.map(p => p.t);
    const values = points.map(p => p.v);

    const isUp = values[values.length - 1] >= values[0];
    const color = isUp ? "#00ff88" : "#ff4466";

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, isUp ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 68, 102, 0.3)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    stockChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: symbol,
                data: values,
                borderColor: color,
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(10, 10, 26, 0.95)",
                    borderColor: color,
                    borderWidth: 1,
                    titleColor: color,
                    bodyColor: "#e0e0ff",
                    padding: 10,
                    callbacks: {
                        label: (ctx) => "$" + ctx.parsed.y.toFixed(2)
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
