<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Валюткин — курсы валют онлайн</title>
    <meta name="description" content="Курсы 120+ валют и криптовалют в реальном времени. Telegram-бот Валюткин.">
    <link rel="icon" type="image/png" href="assets/logo.png">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>

    <header class="header">
        <div class="header-left">
            <img src="assets/logo.png" alt="Валюткин" class="header-logo">
            <span class="header-title">Валюткин</span>
        </div>
        <div class="header-right">
            <a href="https://t.me/Valutkin2026Bot" target="_blank" class="btn-telegram">
                ✈️ Открыть в Telegram
            </a>
        </div>
    </header>

    <main class="container">

        <section class="converter">
            <h2 class="section-title">💱 Конвертер валют</h2>
            <div class="converter-form">
                <input type="number" id="amount" value="100" min="0" step="0.01" class="input">
                <select id="from-currency" class="select"></select>
                <button id="convert-btn" class="btn-primary">Конвертировать</button>
            </div>
            <div id="convert-result" class="convert-result"></div>
        </section>

        <section class="search-section">
            <input type="text" id="search" placeholder="🔍 Поиск валюты (USD, Евро, Юань...)" class="search-input">
        </section>

        <section class="categories">
            <button class="cat-btn active" data-cat="popular">⭐ Популярные</button>
            <button class="cat-btn" data-cat="asia">🌏 Азия</button>
            <button class="cat-btn" data-cat="europe">🌍 Европа</button>
            <button class="cat-btn" data-cat="america">🌎 Америка</button>
            <button class="cat-btn" data-cat="mena">🏜 Ближний Восток</button>
            <button class="cat-btn" data-cat="africa">🌍 Африка</button>
            <button class="cat-btn" data-cat="oceania">🌊 Океания</button>
            <button class="cat-btn" data-cat="crypto">🪙 Крипта</button>
            <button class="cat-btn" data-cat="all">📋 Все</button>
        </section>

        <section class="sort-section">
            <span class="sort-label">Сортировка:</span>
            <button class="sort-btn active" data-sort="none">🔤 По умолчанию</button>
            <button class="sort-btn" data-sort="alpha">🅰️ A-Z</button>
            <button class="sort-btn" data-sort="price-desc">💰 Дорогие</button>
            <button class="sort-btn" data-sort="price-asc">💸 Дешёвые</button>
        </section>

        <section id="currencies-grid" class="grid">
            <div class="loading">Загружаем курсы...</div>
        </section>

    </main>

    <footer class="footer">
        <div class="footer-content">
            <img src="assets/fox.png" alt="Лис" class="footer-fox">
            <div class="footer-text">
                <p><b>Валюткин</b> — курсы 120+ валют в реальном времени</p>
                <p class="footer-small">Данные: exchangerate-api.com, fawazahmed0, coingecko.com</p>
            </div>
            <div class="footer-links">
                <a href="https://t.me/Valutkin2026Bot" target="_blank">Telegram-бот</a>
                <a href="https://t.me/Yehndhkw" target="_blank">@Yehndhkw</a>
            </div>
        </div>
    </footer>

    <div id="modal" class="modal">
        <div class="modal-content">
            <button class="modal-close" id="modal-close">✕</button>

            <div class="modal-header">
                <span class="modal-flag" id="modal-flag">🇺🇸</span>
                <div class="modal-title-group">
                    <div class="modal-code" id="modal-code">USD</div>
                    <div class="modal-name" id="modal-name">Доллар США</div>
                </div>
            </div>

            <div class="modal-price">
                <div class="modal-price-value" id="modal-price">—</div>
                <div class="modal-price-unit" id="modal-unit">—</div>
            </div>

            <div class="modal-change" id="modal-change">—</div>

            <div class="modal-periods">
                <button class="period-btn active" data-period="1">24 часа</button>
                <button class="period-btn" data-period="7">7 дней</button>
                <button class="period-btn" data-period="30">30 дней</button>
            </div>

            <div class="modal-chart-wrapper">
                <canvas id="modal-chart"></canvas>
                <div id="modal-chart-loading" class="modal-chart-loading">Загружаем график...</div>
                <div id="modal-chart-error" class="modal-chart-error" style="display:none;">
                    📊 График для этой валюты недоступен
                </div>
            </div>

            <a href="https://t.me/Valutkin2026Bot" target="_blank" class="modal-btn-telegram">
                ✈️ Открыть в Telegram-боте
            </a>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
