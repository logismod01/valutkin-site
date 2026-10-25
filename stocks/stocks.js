let stockStorage=null;try{stockStorage=window.localStorage}catch(_){}
const stockGet=(key,fallback=null)=>{try{return stockStorage?.getItem(key)??fallback}catch(_){return fallback}};
const stockSet=(key,value)=>{try{stockStorage?.setItem(key,value)}catch(_){}};
const stockRemove=key=>{try{stockStorage?.removeItem(key)}catch(_){}};
const stockClear=()=>{try{stockStorage?.clear()}catch(_){}};
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
        { symbol: "CRWD", name: "CrowdStrike", flag: "🛡️" },
        { symbol: "MSTR", name: "Strategy", flag: "₿" },
        { symbol: "ARM", name: "Arm Holdings", flag: "🦾" },

        { symbol: "PLTR", name: "Palantir", flag: "🔮" },
        { symbol: "AVGO", name: "Broadcom", flag: "🔌" },
        { symbol: "ORCL", name: "Oracle", flag: "🔴" },

        { symbol: "V", name: "Visa", flag: "💳" },
        { symbol: "JPM", name: "JPMorgan", flag: "🏦" },
        { symbol: "WMT", name: "Walmart", flag: "🛒" },
        { symbol: "XOM", name: "Exxon Mobil", flag: "🛢️" },
        { symbol: "LLY", name: "Eli Lilly", flag: "💊" },
        { symbol: "COST", name: "Costco", flag: "🏬" },
        { symbol: "UBER", name: "Uber", flag: "🚕" },

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
        { symbol: "NET", name: "Cloudflare", flag: "☁️" },
        { symbol: "DDOG", name: "Datadog", flag: "🐕" },
        { symbol: "MDB", name: "MongoDB", flag: "🍃" },
        { symbol: "ZS", name: "Zscaler", flag: "🔐" },

        { symbol: "UBER", name: "Uber", flag: "🚕" },
        { symbol: "ABNB", name: "Airbnb", flag: "🏠" },
        { symbol: "DELL", name: "Dell", flag: "💻" },
        { symbol: "APP", name: "AppLovin", flag: "📱" },

        { symbol: "NOW", name: "ServiceNow", flag: "☁️" },
        { symbol: "INTU", name: "Intuit", flag: "🧾" },
        { symbol: "AMAT", name: "Applied Materials", flag: "🔧" },
        { symbol: "MU", name: "Micron", flag: "💾" },
        { symbol: "PANW", name: "Palo Alto Networks", flag: "🔐" },
        { symbol: "SNOW", name: "Snowflake", flag: "❄️" },
        { symbol: "SHOP", name: "Shopify", flag: "🛍️" },

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
        { symbol: "ALV", name: "Autoliv", flag: "🛡️" },
        { symbol: "APTV", name: "Aptiv", flag: "🔌" },
        { symbol: "GNTX", name: "Gentex", flag: "🪞" },

        { symbol: "BYDDY", name: "BYD", flag: "🔋" },
        { symbol: "MBLY", name: "Mobileye", flag: "👁️" },
        { symbol: "PAG", name: "Penske Automotive", flag: "🚙" },

        { symbol: "MBGYY", name: "Mercedes-Benz", flag: "⭐" },
        { symbol: "VWAGY", name: "Volkswagen", flag: "🇩🇪" },
        { symbol: "POAHY", name: "Porsche", flag: "🏎️" },
        { symbol: "HYMTF", name: "Hyundai", flag: "🇰🇷" },
        { symbol: "KIMTF", name: "Kia", flag: "🇰🇷" },
        { symbol: "PSNY", name: "Polestar", flag: "⚡" },
        { symbol: "ZK", name: "Zeekr", flag: "🔋" },

        { symbol: "TSLA", name: "Tesla", flag: "🚗" },
        { symbol: "F", name: "Ford", flag: "🔵" },
        { symbol: "GM", name: "General Motors", flag: "🔷" },
        { symbol: "TM", name: "Toyota", flag: "🇯🇵" },
        { symbol: "HMC", name: "Honda", flag: "🏍️" },
        { symbol: "RIVN", name: "Rivian", flag: "⚡" },
        { symbol: "RACE", name: "Ferrari", flag: "🏎️" },
        { symbol: "BMWYY", name: "BMW", flag: "🇩🇪" },
        { symbol: "STLA", name: "Stellantis", flag: "🚙" },
        { symbol: "NSANY", name: "Nissan", flag: "🇯🇵" },
        { symbol: "LCID", name: "Lucid", flag: "✨" },
        { symbol: "NIO", name: "NIO", flag: "🔋" },
        { symbol: "XPEV", name: "XPeng", flag: "🚘" },
        { symbol: "LI", name: "Li Auto", flag: "🏎️" },
        { symbol: "VLVLY", name: "Volvo", flag: "🇸🇪" },
    ],
    "finance": [
        { symbol: "IBKR", name: "Interactive Brokers", flag: "📊" },
        { symbol: "AFRM", name: "Affirm", flag: "💳" },
        { symbol: "UPST", name: "Upstart", flag: "🤖" },
        { symbol: "OWL", name: "Blue Owl", flag: "🦉" },

        { symbol: "HOOD", name: "Robinhood", flag: "🏹" },
        { symbol: "SOFI", name: "SoFi", flag: "💰" },
        { symbol: "NU", name: "Nu Holdings", flag: "🟣" },

        { symbol: "COF", name: "Capital One", flag: "💳" },
        { symbol: "BK", name: "BNY Mellon", flag: "🏦" },
        { symbol: "TROW", name: "T. Rowe Price", flag: "📊" },
        { symbol: "ICE", name: "Intercontinental Exchange", flag: "📈" },
        { symbol: "CME", name: "CME Group", flag: "📉" },
        { symbol: "SPGI", name: "S&P Global", flag: "📋" },
        { symbol: "MCO", name: "Moody’s", flag: "📑" },

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
        { symbol: "WING", name: "Wingstop", flag: "🍗" },
        { symbol: "SHAK", name: "Shake Shack", flag: "🍔" },
        { symbol: "TXRH", name: "Texas Roadhouse", flag: "🥩" },

        { symbol: "CAVA", name: "Cava", flag: "🥙" },
        { symbol: "CELH", name: "Celsius", flag: "⚡" },
        { symbol: "BROS", name: "Dutch Bros", flag: "☕" },

        { symbol: "MNST", name: "Monster Beverage", flag: "⚡" },
        { symbol: "KDP", name: "Keurig Dr Pepper", flag: "🥤" },
        { symbol: "TSN", name: "Tyson Foods", flag: "🍗" },
        { symbol: "CAG", name: "Conagra", flag: "🥫" },
        { symbol: "SJM", name: "J.M. Smucker", flag: "🍓" },
        { symbol: "HRL", name: "Hormel Foods", flag: "🥩" },
        { symbol: "MKC", name: "McCormick", flag: "🌶️" },

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
        { symbol: "CHTR", name: "Charter", flag: "📺" },
        { symbol: "NYT", name: "New York Times", flag: "📰" },
        { symbol: "LVS", name: "Las Vegas Sands", flag: "🎰" },

        { symbol: "DUOL", name: "Duolingo", flag: "🦉" },
        { symbol: "U", name: "Unity", flag: "🎮" },
        { symbol: "SE", name: "Sea Limited", flag: "🌊" },

        { symbol: "ROKU", name: "Roku", flag: "📺" },
        { symbol: "TKO", name: "TKO Group", flag: "🥊" },
        { symbol: "CMCSA", name: "Comcast", flag: "📡" },
        { symbol: "NWSA", name: "News Corp", flag: "📰" },
        { symbol: "MTCH", name: "Match Group", flag: "💘" },
        { symbol: "PINS", name: "Pinterest", flag: "📌" },
        { symbol: "RDDT", name: "Reddit", flag: "👽" },

        { symbol: "NFLX", name: "Netflix", flag: "🎬" },
        { symbol: "DIS", name: "Disney", flag: "🏰" },
        { symbol: "WBD", name: "Warner Bros", flag: "🎥" },
        { symbol: "SONY", name: "Sony", flag: "🎮" },
        { symbol: "SPOT", name: "Spotify", flag: "🎵" },
        { symbol: "EA", name: "Electronic Arts", flag: "🎮" },
        { symbol: "TTWO", name: "Take-Two", flag: "🎮" },
        { symbol: "RBLX", name: "Roblox", flag: "🧱" },
        { symbol: "DKNG", name: "DraftKings", flag: "🏀" },
        { symbol: "LYV", name: "Live Nation", flag: "🎤" },
        { symbol: "PARA", name: "Paramount", flag: "🎞️" },
        { symbol: "FOXA", name: "Fox Corp", flag: "📺" },
        { symbol: "AMC", name: "AMC", flag: "🎦" },
        { symbol: "IMAX", name: "IMAX", flag: "🎬" },
        { symbol: "WMG", name: "Warner Music", flag: "🎶" },
    ],
    "energy": [
        { symbol: "VST", name: "Vistra", flag: "⚡" },
        { symbol: "CEG", name: "Constellation Energy", flag: "⚛️" },
        { symbol: "OKLO", name: "Oklo", flag: "☢️" },
        { symbol: "SMR", name: "NuScale Power", flag: "🔋" },

        { symbol: "XOM", name: "Exxon Mobil", flag: "🛢️" }, { symbol: "CVX", name: "Chevron", flag: "⛽" },
        { symbol: "SHEL", name: "Shell", flag: "🐚" }, { symbol: "BP", name: "BP", flag: "🟢" },
        { symbol: "COP", name: "ConocoPhillips", flag: "🛢️" }, { symbol: "SLB", name: "SLB", flag: "⚙️" },
        { symbol: "NEE", name: "NextEra Energy", flag: "🌬️" }, { symbol: "ENPH", name: "Enphase", flag: "☀️" },
        { symbol: "FSLR", name: "First Solar", flag: "🔆" }, { symbol: "OXY", name: "Occidental", flag: "🏭" },
    ],
    "health": [
        { symbol: "VRTX", name: "Vertex", flag: "🧬" },
        { symbol: "REGN", name: "Regeneron", flag: "🔬" },
        { symbol: "DXCM", name: "Dexcom", flag: "🩸" },
        { symbol: "HIMS", name: "Hims & Hers", flag: "🩺" },

        { symbol: "LLY", name: "Eli Lilly", flag: "💊" }, { symbol: "JNJ", name: "Johnson & Johnson", flag: "🩺" },
        { symbol: "UNH", name: "UnitedHealth", flag: "🏥" }, { symbol: "PFE", name: "Pfizer", flag: "💉" },
        { symbol: "MRK", name: "Merck", flag: "🧬" }, { symbol: "ABBV", name: "AbbVie", flag: "🔬" },
        { symbol: "TMO", name: "Thermo Fisher", flag: "🧪" }, { symbol: "ISRG", name: "Intuitive Surgical", flag: "🤖" },
        { symbol: "AMGN", name: "Amgen", flag: "🧫" }, { symbol: "GILD", name: "Gilead", flag: "🧬" },
    ],
    "retail": [
        { symbol: "CVNA", name: "Carvana", flag: "🚘" },
        { symbol: "CHWY", name: "Chewy", flag: "🐾" },
        { symbol: "BURL", name: "Burlington", flag: "🧥" },
        { symbol: "ULTA", name: "Ulta Beauty", flag: "💄" },

        { symbol: "WMT", name: "Walmart", flag: "🛒" }, { symbol: "COST", name: "Costco", flag: "🏬" },
        { symbol: "HD", name: "Home Depot", flag: "🛠️" }, { symbol: "TGT", name: "Target", flag: "🎯" },
        { symbol: "LOW", name: "Lowe's", flag: "🏠" }, { symbol: "EBAY", name: "eBay", flag: "📦" },
        { symbol: "ETSY", name: "Etsy", flag: "🧶" }, { symbol: "BABA", name: "Alibaba", flag: "🛍️" },
        { symbol: "JD", name: "JD.com", flag: "🛒" }, { symbol: "MELI", name: "MercadoLibre", flag: "💛" },
    ],
    "china": [
        { symbol: "HTHT", name: "H World", flag: "🏨" },
        { symbol: "TIGR", name: "UP Fintech", flag: "🐯" },
        { symbol: "KC", name: "Kingsoft Cloud", flag: "☁️" },

        { symbol: "MNSO", name: "MINISO", flag: "🛍️" },
        { symbol: "QFIN", name: "Qifu Technology", flag: "💳" },
        { symbol: "FINV", name: "FinVolution", flag: "💰" },

        { symbol: "ZTO", name: "ZTO Express", flag: "📦" },
        { symbol: "YUMC", name: "Yum China", flag: "🍜" },
        { symbol: "BEKE", name: "KE Holdings", flag: "🏠" },
        { symbol: "FUTU", name: "Futu", flag: "📈" },
        { symbol: "VIPS", name: "Vipshop", flag: "🛍️" },
        { symbol: "BILI", name: "Bilibili", flag: "📺" },
        { symbol: "ZLAB", name: "Zai Lab", flag: "🧬" },

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
let loadRequestId = 0;
let visibleStockResults = [];
let stockLoadController = null;
const STOCK_DISK_CACHE_KEY = "valutkin_stock_quotes_v2";
try { Object.assign(CACHE, JSON.parse(stockGet(STOCK_DISK_CACHE_KEY) || "{}")); } catch { stockRemove(STOCK_DISK_CACHE_KEY); }
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function loadStocks(category) {
    const grid = document.getElementById("stocks-grid");
    const list = STOCKS[category] || [];
    const requestId = ++loadRequestId;
    grid.setAttribute("aria-busy", "true");
    grid.innerHTML = Array.from({length: 8}, () => '<div class="stock-skeleton"><i></i><b></b><span></span><em></em></div>').join("");

    // Загружаем небольшими пачками: расширенный каталог не должен получать HTTP 429.
    stockLoadController?.abort();
    stockLoadController = new AbortController();
    const results = [];
    for (let offset = 0; offset < list.length; offset += 6) {
        if (requestId !== loadRequestId) return;
        const batch = list.slice(offset, offset + 6);
        const batchResults = await Promise.all(batch.map(async stock => {
            const cached = CACHE[stock.symbol];
            if (cached && Date.now() - cached.time < 5 * 60 * 1000) return { stock, data: cached.data };
            try {
                const r = await fetch(`${FINNHUB_URL}?symbol=${encodeURIComponent(stock.symbol)}&token=${FINNHUB_KEY}`, { signal: stockLoadController.signal });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const data = await r.json();
                if (!data || !Number.isFinite(data.c) || data.c <= 0) throw new Error("no_data");
                CACHE[stock.symbol] = { data, time: Date.now() };
                return { stock, data };
            } catch (error) {
                if (error.name === "AbortError") return { stock, data: cached?.data || null };
                return { stock, data: cached?.data || null };
            }
        }));
        results.push(...batchResults);
        if (offset + 6 < list.length) await wait(220);
    }
    try { stockSet(STOCK_DISK_CACHE_KEY, JSON.stringify(CACHE)); } catch (_) {}

    // Не даём запоздавшему ответу прошлой категории затереть новую страницу.
    if (requestId !== loadRequestId || category !== currentCategory) return;
    visibleStockResults = results;
    renderStocksView();
    grid.setAttribute("aria-busy", "false");
}

function stockFavorites() { try { const value=JSON.parse(stockGet("valutkin_favorite_stocks") || "[]"); return Array.isArray(value)?value:[]; } catch { stockRemove("valutkin_favorite_stocks"); return []; } }
function toggleStockFavorite(symbol) { const list=stockFavorites(),i=list.indexOf(symbol);i>=0?list.splice(i,1):list.push(symbol);stockSet("valutkin_favorite_stocks",JSON.stringify(list));renderStocksView(); }
function renderStocksView() {
    const grid=document.getElementById("stocks-grid"); if(!grid)return;
    const q=(document.getElementById("stock-search")?.value||"").trim().toLowerCase();
    const only=document.getElementById("stocks-favorites-only")?.checked, fav=stockFavorites();
    let rows=visibleStockResults.filter(r=>(!q||`${r.stock.symbol} ${r.stock.name}`.toLowerCase().includes(q))&&(!only||fav.includes(r.stock.symbol)));
    const sort=document.getElementById("stock-sort")?.value;
    if(sort==="growth")rows.sort((a,b)=>(b.data?.dp||-Infinity)-(a.data?.dp||-Infinity));
    if(sort==="decline")rows.sort((a,b)=>(a.data?.dp||Infinity)-(b.data?.dp||Infinity));
    if(sort==="price-high")rows.sort((a,b)=>(b.data?.c||0)-(a.data?.c||0));
    if(sort==="name")rows.sort((a,b)=>a.stock.name.localeCompare(b.stock.name,"ru"));
    grid.innerHTML=rows.length?rows.map(r=>renderStockCard(r.stock,r.data)).join(""):'<div class="loading">Ничего не найдено</div>';
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
            <div class="stock-card" data-symbol="${stock.symbol}">
                <button class="stock-favorite ${stockFavorites().includes(stock.symbol)?"active":""}" onclick="event.stopPropagation();toggleStockFavorite('${stock.symbol}')" title="В избранное">★</button>
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
        <div class="stock-card" data-symbol="${stock.symbol}" onclick="openStockModal('${stock.symbol}')">
            <button class="stock-favorite ${stockFavorites().includes(stock.symbol)?"active":""}" onclick="event.stopPropagation();toggleStockFavorite('${stock.symbol}')" title="В избранное">★</button>
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
    document.getElementById("stock-search")?.addEventListener("input", renderStocksView);
    document.getElementById("stock-sort")?.addEventListener("change", renderStocksView);
    document.getElementById("stocks-favorites-only")?.addEventListener("change", renderStocksView);
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
        // Закрытие модального окна
    const modal = document.getElementById("stock-modal");
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target.id === "stock-modal") closeStockModal();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeStockModal();
    });

    // Периоды графика
    document.querySelectorAll(".period-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".period-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const days = parseInt(btn.dataset.days);
            currentDays = days;
            if (currentStock) {
                loadStockChart(currentStock.symbol, days);
            }
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

function openStockModal(symbol) {
    // Находим акцию по symbol в текущей категории
    const stock = STOCKS[currentCategory].find(s => s.symbol === symbol);
    if (!stock) return;
    currentStock = stock;
    currentDays = 7;
    document.getElementById("company-details-link").href = `../company.html?symbol=${encodeURIComponent(stock.symbol)}&name=${encodeURIComponent(stock.name)}&icon=${encodeURIComponent(stock.flag)}`;

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
    stockChartRequestId++;
    if (stockChart) {
        stockChart.destroy();
        stockChart = null;
    }
}

let stockChartRequestId = 0;
const STOCK_CHART_CACHE_MS = 6 * 60 * 60 * 1000;

function chartCacheKey(symbol, days) { return `valutkin_stock_chart_${symbol}_${days}`; }
function readChartCache(symbol, days, allowExpired=false) {
    try { const item=JSON.parse(stockGet(chartCacheKey(symbol,days))); return item&&(allowExpired||Date.now()-item.time<STOCK_CHART_CACHE_MS)?item:null; } catch { return null; }
}
function saveChartCache(symbol, days, points, source) {
    try { stockSet(chartCacheKey(symbol,days),JSON.stringify({time:Date.now(),points,source})); } catch (_) {}
}
async function fetchFinnhubHistory(symbol, days) {
    const to=Math.floor(Date.now()/1000),from=to-days*86400;
    const resolution=days<=7?"60":days<=90?"D":"W";
    const url=`https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`;
    const r=await fetch(url); if(!r.ok)throw new Error(`Finnhub ${r.status}`); const x=await r.json();
    if(x.s!=="ok"||!Array.isArray(x.c))throw new Error("Finnhub no_data");
    return x.c.map((v,i)=>({t:x.t[i]*1000,v})).filter(p=>Number.isFinite(p.v));
}
async function fetchYahooHistory(symbol, days) {
    const yahooSymbol=symbol.replace(".","-");
    const range=days<=7?"5d":days<=30?"1mo":days<=90?"3mo":"1y";
    const interval=days<=7?"1h":days<=90?"1d":"1wk";
    const r=await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${range}&interval=${interval}`);
    if(!r.ok)throw new Error(`Yahoo ${r.status}`);const x=await r.json(),result=x.chart?.result?.[0];if(!result)throw new Error("Yahoo no_data");
    return result.timestamp.map((t,i)=>({t:t*1000,v:result.indicators.quote[0].close[i]})).filter(p=>Number.isFinite(p.v));
}
async function fetchStooqHistory(symbol, days) {
    const end=new Date(),start=new Date(Date.now()-days*86400000); const date=d=>d.toISOString().slice(0,10).replaceAll("-","");
    const stooqSymbol=symbol.toLowerCase().replace(".","-")+".us";
    const r=await fetch(`https://stooq.com/q/d/l/?s=${encodeURIComponent(stooqSymbol)}&d1=${date(start)}&d2=${date(end)}&i=d`);
    if(!r.ok)throw new Error(`Stooq ${r.status}`);const text=await r.text();
    return text.trim().split(/\r?\n/).slice(1).map(row=>{const c=row.split(",");return{t:new Date(c[0]+"T12:00:00Z").getTime(),v:Number(c[4])}}).filter(p=>Number.isFinite(p.t)&&Number.isFinite(p.v));
}
async function loadStockChart(symbol, days, force=false) {
    const requestId=++stockChartRequestId,loading=document.getElementById("chart-loading"),canvas=document.getElementById("stock-chart"),meta=document.getElementById("stock-chart-meta");
    loading.classList.remove("error");loading.style.display="grid";loading.textContent="Загрузка графика…";canvas.style.opacity="0.25";meta.innerHTML="";
    if(!force){const cached=readChartCache(symbol,days);if(cached?.points?.length>1){renderStockChart(cached.points,symbol);showStockChartMeta(cached.points,`${cached.source} • из кэша`);loading.style.display="none";canvas.style.opacity="1";return;}}
    const providers=[["Finnhub",fetchFinnhubHistory],["Yahoo Finance",fetchYahooHistory],["Stooq",fetchStooqHistory]];let lastError;
    for(const [name,provider] of providers){
      try{const points=await provider(symbol,days);if(requestId!==stockChartRequestId||currentStock?.symbol!==symbol)return;if(points.length<2)throw new Error("Мало данных");saveChartCache(symbol,days,points,name);renderStockChart(points,symbol);showStockChartMeta(points,name);loading.style.display="none";canvas.style.opacity="1";return;}catch(e){lastError=e;console.warn(`${name}:`,e.message);}
    }
    if(requestId!==stockChartRequestId)return;const stale=readChartCache(symbol,days,true);
    if(stale?.points?.length>1){renderStockChart(stale.points,symbol);showStockChartMeta(stale.points,`${stale.source} • сохранённые данные`);loading.style.display="none";canvas.style.opacity="1";return;}
    loading.classList.add("error");loading.innerHTML=`<div><b>График временно недоступен</b><span>Источники котировок не ответили</span><button type="button" id="retry-stock-chart">Повторить</button></div>`;document.getElementById("retry-stock-chart").onclick=()=>loadStockChart(symbol,days,true);console.error("Все источники графика недоступны",lastError);
}
function showStockChartMeta(points,source){const values=points.map(p=>p.v),first=values[0],last=values.at(-1),change=(last/first-1)*100;document.getElementById("stock-chart-meta").innerHTML=`<span>Мин. <b>$${Math.min(...values).toFixed(2)}</b></span><span>Макс. <b>$${Math.max(...values).toFixed(2)}</b></span><span>Период <b class="${change>=0?"up":"down"}">${change>=0?"+":""}${change.toFixed(2)}%</b></span><small>${source}</small>`;}

function renderStockChart(points, symbol) {
    if (typeof Chart === "undefined") throw new Error("Chart.js не загрузился");
    const canvas = document.getElementById("stock-chart");
    const ctx = canvas.getContext("2d");

    if (stockChart) stockChart.destroy();

    const labels = points.map(p => new Date(p.t).toLocaleDateString("ru-RU", { day:"2-digit", month:"short", year: currentDays >= 365 ? "2-digit" : undefined }));
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
