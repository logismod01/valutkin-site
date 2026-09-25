// ============================================
// ДАННЫЕ О ВАЛЮТАХ
// ============================================
const EXCHANGE_DATA = {
    "USD": {
        name: "Доллар США",
        flag: "🇺🇸",
        services: [
            { type: "🏦 Банки РФ", items: [
                { name: "Тинькофф", rating: 4, desc: "Обмен в приложении", link: "https://www.tinkoff.ru" },
                { name: "Сбер", rating: 3, desc: "Обмен в приложении", link: "https://www.sberbank.ru" },
                { name: "Альфа-Банк", rating: 4, desc: "Обмен в приложении", link: "https://alfabank.ru" },
                { name: "ВТБ", rating: 3, desc: "Обмен в приложении", link: "https://www.vtb.ru" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "BestChange", rating: 5, desc: "Агрегатор всех обменников", link: "https://www.bestchange.ru" },
                { name: "Cashin", rating: 3, desc: "Обменник", link: "https://cashin.ru" },
            ]},
            { type: "📊 Биржи", items: [
                { name: "Мосбиржа", rating: 5, desc: "Лучший курс (через брокера)", link: "https://www.moex.com" },
            ]},
            { type: "🪙 Крипта", items: [
                { name: "Binance P2P", rating: 5, desc: "P2P-обмен", link: "https://p2p.binance.com" },
                { name: "Bybit P2P", rating: 4, desc: "P2P-обмен", link: "https://www.bybit.com/p2p" },
            ]},
        ],
        map_query: "обмен валюты доллар",
    },
    "EUR": {
        name: "Евро",
        flag: "🇪🇺",
        services: [
            { type: "🏦 Банки РФ", items: [
                { name: "Тинькофф", rating: 4, desc: "Обмен в приложении", link: "https://www.tinkoff.ru" },
                { name: "Сбер", rating: 3, desc: "Обмен в приложении", link: "https://www.sberbank.ru" },
                { name: "Альфа-Банк", rating: 4, desc: "Обмен", link: "https://alfabank.ru" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "BestChange", rating: 5, desc: "Агрегатор", link: "https://www.bestchange.ru" },
            ]},
            { type: "📊 Биржи", items: [
                { name: "Мосбиржа", rating: 5, desc: "Через брокера", link: "https://www.moex.com" },
            ]},
        ],
        map_query: "обмен валюты евро",
    },
    "RUB": {
        name: "Российский рубль",
        flag: "🇷🇺",
        services: [
            { type: "🏦 Банки РФ", items: [
                { name: "Тинькофф", rating: 4, desc: "Обмен", link: "https://www.tinkoff.ru" },
                { name: "Сбер", rating: 3, desc: "Обмен", link: "https://www.sberbank.ru" },
            ]},
        ],
        map_query: "обмен рублей",
    },
    "KZT": {
        name: "Казахстанский тенге",
        flag: "🇰🇿",
        services: [
            { type: "🏦 Банки Казахстана", items: [
                { name: "Kaspi Bank", rating: 5, desc: "Обмен в приложении", link: "https://kaspi.kz" },
                { name: "Halyk Bank", rating: 4, desc: "Обмен", link: "https://halykbank.kz" },
                { name: "ForteBank", rating: 4, desc: "Обмен", link: "https://forte.kz" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "BestChange", rating: 4, desc: "Агрегатор", link: "https://www.bestchange.ru" },
            ]},
        ],
        map_query: "обмен валюты тенге Казахстан",
    },
    "CNY": {
        name: "Китайский юань",
        flag: "🇨🇳",
        services: [
            { type: "🏦 Банки Китая", items: [
                { name: "Bank of China", rating: 4, desc: "Обмен", link: "https://www.boc.cn" },
                { name: "ICBC", rating: 4, desc: "Обмен", link: "https://www.icbc.com.cn" },
            ]},
            { type: "🏦 Банки РФ", items: [
                { name: "Тинькофф", rating: 4, desc: "Обмен", link: "https://www.tinkoff.ru" },
            ]},
            { type: "📱 Alipay", items: [
                { name: "Alipay", rating: 5, desc: "Платежи в Китае", link: "https://www.alipay.com" },
            ]},
        ],
        map_query: "обмен валюты юань",
    },
    "KRW": {
        name: "Южнокорейская вона",
        flag: "🇰🇷",
        services: [
            { type: "🏦 Банки Кореи", items: [
                { name: "KB Bank", rating: 4, desc: "Обмен", link: "https://www.kbstar.com" },
                { name: "Shinhan Bank", rating: 4, desc: "Обмен", link: "https://www.shinhan.com" },
                { name: "Woori Bank", rating: 4, desc: "Обмен", link: "https://www.wooribank.com" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "BestChange", rating: 4, desc: "Агрегатор", link: "https://www.bestchange.ru" },
            ]},
        ],
        map_query: "обмен валюты вона Корея",
    },
    "MNT": {
        name: "Монгольский тугрик",
        flag: "🇲🇳",
        services: [
            { type: "🏦 Банки Монголии", items: [
                { name: "Khan Bank", rating: 5, desc: "Обмен", link: "https://www.khanbank.com" },
                { name: "Golomt Bank", rating: 4, desc: "Обмен", link: "https://www.golomtbank.com" },
                { name: "Trade Development Bank", rating: 4, desc: "Обмен", link: "https://www.tdbm.mn" },
            ]},
        ],
        map_query: "обмен валюты тугрик Монголия",
    },
    "TRY": {
        name: "Турецкая лира",
        flag: "🇹🇷",
        services: [
            { type: "🏦 Банки Турции", items: [
                { name: "Ziraat Bank", rating: 4, desc: "Обмен", link: "https://www.ziraatbank.com.tr" },
                { name: "Garanti BBVA", rating: 4, desc: "Обмен", link: "https://www.garantibbva.com.tr" },
                { name: "İş Bankası", rating: 4, desc: "Обмен", link: "https://www.isbank.com.tr" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "Обменники Стамбул", rating: 5, desc: "Гранд-базар", link: "https://www.bestchange.ru" },
            ]},
        ],
        map_query: "обмен валюты лира Стамбул",
    },
    "GBP": {
        name: "Фунт стерлингов",
        flag: "🇬🇧",
        services: [
            { type: "🏦 Банки РФ", items: [
                { name: "Тинькофф", rating: 4, desc: "Обмен", link: "https://www.tinkoff.ru" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "BestChange", rating: 5, desc: "Агрегатор", link: "https://www.bestchange.ru" },
            ]},
        ],
        map_query: "обмен валюты фунт",
    },
    "JPY": {
        name: "Японская иена",
        flag: "🇯🇵",
        services: [
            { type: "🏦 Банки Японии", items: [
                { name: "MUFG Bank", rating: 4, desc: "Обмен", link: "https://www.bk.mufg.jp" },
                { name: "SMBC", rating: 4, desc: "Обмен", link: "https://www.smbc.co.jp" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "BestChange", rating: 4, desc: "Агрегатор", link: "https://www.bestchange.ru" },
            ]},
        ],
        map_query: "обмен валюты иена",
    },
    "AED": {
        name: "Дирхам ОАЭ",
        flag: "🇦🇪",
        services: [
            { type: "🏦 Банки ОАЭ", items: [
                { name: "Emirates NBD", rating: 4, desc: "Обмен", link: "https://www.emiratesnbd.com" },
                { name: "ADCB", rating: 4, desc: "Обмен", link: "https://www.adcb.com" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "Обменники Дубай", rating: 5, desc: "Аэропорт / Моллы", link: "https://www.bestchange.ru" },
            ]},
        ],
        map_query: "обмен валюты дирхам Дубай",
    },
    "UAH": {
        name: "Украинская гривна",
        flag: "🇺🇦",
        services: [
            { type: "🏦 Банки Украины", items: [
                { name: "ПриватБанк", rating: 4, desc: "Обмен", link: "https://privatbank.ua" },
                { name: "monobank", rating: 4, desc: "Обмен", link: "https://www.monobank.ua" },
            ]},
            { type: "💱 Обменники", items: [
                { name: "BestChange", rating: 4, desc: "Агрегатор", link: "https://www.bestchange.ru" },
            ]},
        ],
        map_query: "обмен валюты гривна",
    },
};


// ============================================
// РЕНДЕР
// ============================================
function renderCurrency(curCode) {
    const content = document.getElementById("exchange-content");
    const data = EXCHANGE_DATA[curCode];
    if (!data) {
        content.innerHTML = "<p>Валюта не найдена</p>";
        return;
    }

    let html = `
        <div class="exchange-header">
            <h2>${data.flag} ${data.name} (${curCode})</h2>
        </div>
    `;

    for (const group of data.services) {
        html += `<div class="service-group">`;
        html += `<h3>${group.type}</h3>`;
        html += `<div class="service-list">`;
        for (const item of group.items) {
            const stars = "⭐".repeat(item.rating);
            html += `
                <a href="${item.link}" target="_blank" class="service-card">
                    <div class="service-name">${item.name} <span class="stars">${stars}</span></div>
                    <div class="service-desc">${item.desc}</div>
                </a>
            `;
        }
        html += `</div></div>`;
    }

    // Карта
    if (data.map_query) {
        const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(data.map_query)}`;
        html += `
            <div class="map-block">
                <h3>📍 Найти обменники на карте</h3>
                <a href="${mapUrl}" target="_blank" class="map-btn">
                    Открыть Google Maps →
                </a>
            </div>
        `;
    }

    content.innerHTML = html;
}


// ============================================
// ОБРАБОТЧИКИ
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    // Показываем USD по умолчанию
    renderCurrency("USD");

    // Переключение валют
    document.querySelectorAll(".curr-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".curr-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderCurrency(btn.dataset.cur);
        });
    });
});
