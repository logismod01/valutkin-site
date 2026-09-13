// ============================================
// ВАЛЮТКИН — script.js — Часть 1/6
// Настройки, константы, списки валют и крипты
// ============================================

const API_KEY = '9999ee83e8af1409272c9ef2';
const FIAT_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;
const CRYPTO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,the-open-network,tether,binancecoin,solana,ripple,cardano,dogecoin,tron&vs_currencies=usd,rub';

const CURRENCIES = [
  { code: 'USD', name: 'Доллар США', flag: '🇺🇸', premium: false },
  { code: 'EUR', name: 'Евро', flag: '🇪🇺', premium: false },
  { code: 'CNY', name: 'Юань', flag: '🇨🇳', premium: false },
  { code: 'GBP', name: 'Фунт стерлингов', flag: '🇬🇧', premium: false },
  { code: 'JPY', name: 'Йена', flag: '🇯🇵', premium: false },
  { code: 'KZT', name: 'Тенге', flag: '🇰🇿', premium: false },
  { code: 'BYN', name: 'Белорусский рубль', flag: '🇧🇾', premium: false },
  { code: 'UAH', name: 'Гривна', flag: '🇺🇦', premium: false },
  { code: 'TRY', name: 'Турецкая лира', flag: '🇹🇷', premium: false },
  { code: 'CHF', name: 'Швейцарский франк', flag: '🇨🇭', premium: true },
  { code: 'CAD', name: 'Канадский доллар', flag: '🇨🇦', premium: true },
  { code: 'AUD', name: 'Австралийский доллар', flag: '🇦🇺', premium: true },
  { code: 'KRW', name: 'Вона', flag: '🇰🇷', premium: true },
  { code: 'INR', name: 'Рупия', flag: '🇮🇳', premium: true },
  { code: 'BRL', name: 'Реал', flag: '🇧🇷', premium: true },
  { code: 'AED', name: 'Дирхам ОАЭ', flag: '🇦🇪', premium: true },
  { code: 'PLN', name: 'Злотый', flag: '🇵🇱', premium: true },
  { code: 'CZK', name: 'Чешская крона', flag: '🇨🇿', premium: true },
  { code: 'SEK', name: 'Шведская крона', flag: '🇸🇪', premium: true },
  { code: 'NOK', name: 'Норвежская крона', flag: '🇳🇴', premium: true },
  { code: 'SGD', name: 'Сингапурский доллар', flag: '🇸🇬', premium: true },
  { code: 'HKD', name: 'Гонконгский доллар', flag: '🇭🇰', premium: true },
  { code: 'MXN', name: 'Мексиканское песо', flag: '🇲🇽', premium: true },
  { code: 'ZAR', name: 'Рэнд', flag: '🇿🇦', premium: true },
  { code: 'THB', name: 'Бат', flag: '🇹🇭', premium: true },
  { code: 'VND', name: 'Донг', flag: '🇻🇳', premium: true },
  { code: 'IDR', name: 'Рупия Индонезии', flag: '🇮🇩', premium: true },
  { code: 'MYR', name: 'Ринггит', flag: '🇲🇾', premium: true },
  { code: 'PHP', name: 'Песо Филиппин', flag: '🇵🇭', premium: true },
  { code: 'EGP', name: 'Египетский фунт', flag: '🇪🇬', premium: true },
  { code: 'NGN', name: 'Найра', flag: '🇳🇬', premium: true },
  { code: 'ARS', name: 'Аргентинское песо', flag: '🇦🇷', premium: true },
  { code: 'CLP', name: 'Чилийское песо', flag: '🇨🇱', premium: true },
  { code: 'COP', name: 'Колумбийское песо', flag: '🇨🇴', premium: true },
  { code: 'GEL', name: 'Лари', flag: '🇬🇪', premium: true },
  { code: 'AMD', name: 'Драм', flag: '🇦🇲', premium: true },
  { code: 'AZN', name: 'Манат', flag: '🇦🇿', premium: true },
  { code: 'UZS', name: 'Сум', flag: '🇺🇿', premium: true },
  { code: 'KGS', name: 'Сом', flag: '🇰🇬', premium: true },
  { code: 'ILS', name: 'Шекель', flag: '🇮🇱', premium: true },
  { code: 'SAR', name: 'Риял', flag: '🇸🇦', premium: true },
  { code: 'QAR', name: 'Катарский риал', flag: '🇶🇦', premium: true },
  { code: 'KWD', name: 'Кувейтский динар', flag: '🇰🇼', premium: true },
  { code: 'BGN', name: 'Болгарский лев', flag: '🇧🇬', premium: true },
  { code: 'RON', name: 'Румынский лей', flag: '🇷🇴', premium: true },
  { code: 'HUF', name: 'Форинт', flag: '🇭🇺', premium: true },
  { code: 'DKK', name: 'Датская крона', flag: '🇩🇰', premium: true },
  { code: 'NZD', name: 'Новозеландский доллар', flag: '🇳🇿', premium: true }
];

const CRYPTO = [
  { id: 'bitcoin', code: 'BTC', name: 'Bitcoin', flag: '₿' },
  { id: 'ethereum', code: 'ETH', name: 'Ethereum', flag: 'Ξ' },
  { id: 'the-open-network', code: 'TON', name: 'Toncoin', flag: '💎' },
  { id: 'tether', code: 'USDT', name: 'Tether', flag: '💵' },
  { id: 'binancecoin', code: 'BNB', name: 'BNB', flag: '🟡' },
  { id: 'solana', code: 'SOL', name: 'Solana', flag: '🟣' },
  { id: 'ripple', code: 'XRP', name: 'XRP', flag: '💧' },
  { id: 'cardano', code: 'ADA', name: 'Cardano', flag: '🔵' },
  { id: 'dogecoin', code: 'DOGE', name: 'Dogecoin', flag: '🐕' },
  { id: 'tron', code: 'TRX', name: 'TRON', flag: '🔴' }
];

let fiatRates = {};
let cryptoRates = {};
let isPremium = false;
let favorites = JSON.parse(localStorage.getItem('valutkin_favorites') || '[]');
let searchQuery = '';
// ============================================
// ВАЛЮТКИН — script.js — Часть 2/6
// Загрузка курсов валют и крипты с API
// ============================================

async function loadFiatRates() {
  try {
    const r = await fetch(FIAT_URL);
    if (!r.ok) throw new Error('fiat api');
    const d = await r.json();
    fiatRates = d.conversion_rates;
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function loadCryptoRates() {
  try {
    const r = await fetch(CRYPTO_URL);
    if (!r.ok) throw new Error('crypto api');
    cryptoRates = await r.json();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
// ============================================
// ВАЛЮТКИН — script.js — Часть 3/6
// Избранное и отрисовка таблицы валют
// ============================================

function toggleFavorite(code) {
  const i = favorites.indexOf(code);
  if (i === -1) favorites.push(code);
  else favorites.splice(i, 1);
  localStorage.setItem('valutkin_favorites', JSON.stringify(favorites));
  renderFiatTable();
}

function renderFiatTable() {
  const c = document.getElementById('fiat-container');
  if (!c) return;
  let list = CURRENCIES.slice();
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(x => x.name.toLowerCase().includes(q) || x.code.toLowerCase().includes(q));
  }
  list.sort((a, b) => {
    const fa = favorites.includes(a.code) ? 1 : 0;
    const fb = favorites.includes(b.code) ? 1 : 0;
    return fb - fa;
  });
  let html = '';
  list.forEach(cur => {
    const rate = fiatRates[cur.code];
    if (rate === undefined) return;
    const rub = (1 / rate).toFixed(2);
    const locked = cur.premium && !isPremium;
    const fav = favorites.includes(cur.code);
    html += `
      <div class="currency-card ${locked ? 'locked' : ''}">
        <div class="currency-flag">${cur.flag}</div>
        <div class="currency-info">
          <div class="currency-name">${cur.name}</div>
          <div class="currency-code">${cur.code}</div>
        </div>
        <div class="currency-rate">${locked ? '🔒 Premium' : rub + ' ₽'}</div>
        <div class="fav-btn" data-code="${cur.code}">${fav ? '★' : '☆'}</div>
      </div>`;
  });
  c.innerHTML = html;
  c.querySelectorAll('.fav-btn').forEach(b => {
    b.addEventListener('click', () => toggleFavorite(b.dataset.code));
  });
}
// ============================================
// ВАЛЮТКИН — script.js — Часть 4/6
// Отрисовка таблицы криптовалют
// ============================================

function renderCryptoTable() {
  const c = document.getElementById('crypto-container');
  if (!c) return;
  let html = '';
  CRYPTO.forEach(coin => {
    const d = cryptoRates[coin.id];
    if (!d) return;
    const usd = d.usd ? d.usd.toFixed(2) : '—';
    const rub = d.rub ? d.rub.toFixed(0) : '—';
    html += `
      <div class="crypto-card">
        <div class="crypto-flag">${coin.flag}</div>
        <div class="crypto-info">
          <div class="crypto-name">${coin.name}</div>
          <div class="crypto-code">${coin.code}</div>
        </div>
        <div class="crypto-rate">
          <div>$${usd}</div>
          <div class="rub">${rub} ₽</div>
        </div>
      </div>`;
  });
  c.innerHTML = html;
}
// ============================================
// ВАЛЮТКИН — script.js — Часть 5/6
// Обновление данных, кнопки, поиск
// ============================================

async function refreshAll() {
  const s = document.getElementById('status');
  if (s) s.textContent = 'Загрузка...';
  const [f, k] = await Promise.all([loadFiatRates(), loadCryptoRates()]);
  if (f) renderFiatTable();
  if (k) renderCryptoTable();
  if (s) s.textContent = (f && k) ? 'Обновлено: ' + new Date().toLocaleTimeString('ru-RU') : 'Ошибка загрузки';
}

function setupPremiumButton() {
  const b = document.getElementById('premium-btn');
  if (!b) return;
  b.addEventListener('click', () => {
    isPremium = !isPremium;
    renderFiatTable();
    b.textContent = isPremium ? '✅ Premium активен' : '⭐ Купить Premium';
  });
}

function setupRefreshButton() {
  const b = document.getElementById('refresh-btn');
  if (!b) return;
  b.addEventListener('click', refreshAll);
}

function setupSearch() {
  const i = document.getElementById('search-input');
  if (!i) return;
  i.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderFiatTable();
  });
}
// ============================================
// ВАЛЮТКИН — script.js — Часть 6/6
// Запуск при загрузке страницы
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupPremiumButton();
  setupRefreshButton();
  setupSearch();
  refreshAll();
  setInterval(refreshAll, 5 * 60 * 1000);
});
