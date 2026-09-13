// ============================================
// ВАЛЮТКИН — script.js
// Под index.html версии "2026 full"
// ============================================

const API_KEY = '9999ee83e8af1409272c9ef2';
const FIAT_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;
const CRYPTO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,the-open-network,tether,binancecoin,solana,ripple,cardano,dogecoin,tron&vs_currencies=usd,rub';

// Категории для валют
const CATEGORIES = {
  popular: ['USD','EUR','CNY','GBP','JPY','KZT','BYN','UAH','TRY','RUB'],
  asia: ['CNY','JPY','KRW','INR','IDR','MYR','PHP','THB','VND','SGD','HKD','TWD','PKR','BDT','LKR','NPR','KHR','LAK','MMK','MNT','KZT','UZS','KGS','TJS','TMT','AZN','GEL','AMD','AFN','IQD','IRR','ILS','SAR','AED','QAR','KWD','BHD','OMR','JOD','LBP','SYP','YER'],
  europe: ['EUR','GBP','CHF','SEK','NOK','DKK','PLN','CZK','HUF','RON','BGN','HRK','RSD','MKD','ALL','BAM','MDL','UAH','BYN','TRY','ISK'],
  america: ['USD','CAD','MXN','BRL','ARS','CLP','COP','PEN','UYU','PYG','BOB','VES','GTQ','HNL','NIO','CRC','PAB','DOP','CUP','JMD','TTD','BBD','BSD','BZD','GYD','SRD','HTG'],
  mena: ['AED','SAR','QAR','KWD','BHD','OMR','JOD','LBP','IQD','IRR','ILS','TRY','EGP','LYD','TND','DZD','MAD','YER','SYP'],
  africa: ['ZAR','EGP','NGN','KES','GHS','MAD','TND','DZD','LYD','ETB','UGX','TZS','RWF','BIF','CDF','XAF','XOF','MZN','ZMW','MWK','BWP','NAD','SZL','LSL','MUR','SCR','MGA','KMF','DJF','SOS','SDG','SSP','ERN','GMD','GNF','LRD','SLL','SLE','AOA','CVE','STN'],
  oceania: ['AUD','NZD','FJD','PGK','SBD','VUV','WST','TOP','XPF']
};

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
let searchQuery = '';
let currentCategory = 'popular';
let currentSort = 'none';

// ============================================
// ЗАГРУЗКА ДАННЫХ
// ============================================

async function loadFiatRates() {
  try {
    const r = await fetch(FIAT_URL);
    if (!r.ok) throw new Error('fiat api');
    const d = await r.json();
    fiatRates = d.conversion_rates || {};
    return true;
  } catch (e) {
    console.error('FIAT error:', e);
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
    console.error('CRYPTO error:', e);
    return false;
  }
}

// ============================================
// ФОРМИРОВАНИЕ СПИСКА ПО КАТЕГОРИИ
// ============================================

function getFilteredList() {
  if (currentCategory === 'crypto') return [];

  let list = CURRENCIES.slice();

  if (currentCategory === 'all' || currentCategory === 'popular') {
    // все или популярные — берём как есть
  } else {
    const codes = CATEGORIES[currentCategory] || [];
    list = list.filter(c => codes.includes(c.code));
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }

  if (currentSort === 'alpha') {
    list.sort((a, b) => a.code.localeCompare(b.code));
  } else if (currentSort === 'price-desc' || currentSort === 'price-asc') {
    list.sort((a, b) => {
      const ra = fiatRates[a.code] ? 1 / fiatRates[a.code] : 0;
      const rb = fiatRates[b.code] ? 1 / fiatRates[b.code] : 0;
      return currentSort === 'price-desc' ? rb - ra : ra - rb;
    });
  }

  return list;
}

// ============================================
// ОТРИСОВКА
// ============================================

function renderCurrencies() {
  const grid = document.getElementById('currencies-grid');
  if (!grid) return;

  // Если категория крипта — рендерим крипту
  if (currentCategory === 'crypto') {
    if (!Object.keys(cryptoRates).length) {
      grid.innerHTML = '<div class="loading">Загружаем крипту...</div>';
      return;
    }
    let html = '';
    CRYPTO.forEach(coin => {
      const d = cryptoRates[coin.id];
      if (!d) return;
      const usd = d.usd ? '$' + d.usd.toFixed(2) : '—';
      const rub = d.rub ? d.rub.toFixed(0) + ' ₽' : '—';
      html += `
        <div class="currency-card">
          <div class="currency-flag">${coin.flag}</div>
          <div class="currency-info">
            <div class="currency-name">${coin.name}</div>
            <div class="currency-code">${coin.code}</div>
          </div>
          <div class="currency-rate">${usd}<br><span class="rub">${rub}</span></div>
        </div>`;
    });
    grid.innerHTML = html;
    return;
  }

  // Валюта
  if (!Object.keys(fiatRates).length) {
    grid.innerHTML = '<div class="loading">Загружаем курсы...</div>';
    return;
  }

  const list = getFilteredList();
  if (!list.length) {
    grid.innerHTML = '<div class="loading">Ничего не найдено</div>';
    return;
  }

  let html = '';
  list.forEach(cur => {
    const rate = fiatRates[cur.code];
    if (rate === undefined) return;
    const rub = (1 / rate).toFixed(2);
    html += `
      <div class="currency-card" data-code="${cur.code}">
        <div class="currency-flag">${cur.flag}</div>
        <div class="currency-info">
          <div class="currency-name">${cur.name}</div>
          <div class="currency-code">${cur.code}</div>
        </div>
        <div class="currency-rate">${rub} ₽</div>
      </div>`;
  });
  grid.innerHTML = html;

  // Клик по карточке — открыть модалку
  grid.querySelectorAll('.currency-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.code));
  });
}

// ============================================
// ОБНОВЛЕНИЕ
// ============================================

async function refreshAll() {
  const [f, k] = await Promise.all([loadFiatRates(), loadCryptoRates()]);
  if (!f && !k) {
    const grid = document.getElementById('currencies-grid');
    if (grid) grid.innerHTML = '<div class="loading">Ошибка загрузки. Проверь API-ключ.</div>';
    return;
  }
  renderCurrencies();
  updateConverter();
}

// ============================================
// КОНВЕРТЕР
// ============================================

function updateConverter() {
  const sel = document.getElementById('from-currency');
  if (!sel) return;
  const val = sel.value;
  sel.innerHTML = '';
  CURRENCIES.forEach(c => {
    if (fiatRates[c.code] === undefined) return;
    const opt = document.createElement('option');
    opt.value = c.code;
    opt.textContent = c.flag + ' ' + c.code + ' — ' + c.name;
    sel.appendChild(opt);
  });
  if (val) sel.value = val;

  const btn = document.getElementById('convert-btn');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', doConvert);
  }
}

function doConvert() {
  const amount = parseFloat(document.getElementById('amount').value) || 0;
  const from = document.getElementById('from-currency').value;
  const resultEl = document.getElementById('convert-result');
  if (!resultEl || !fiatRates[from]) return;
  const rub = (amount / fiatRates[from]).toFixed(2);
  const usd = (amount / fiatRates[from] * fiatRates['USD']).toFixed(2);
  resultEl.innerHTML = `<b>${amount} ${from}</b> = <b>${rub} ₽</b> = <b>$${usd}</b>`;
}

// ============================================
// МОДАЛКА С ГРАФИКОМ
// ============================================

let chartInstance = null;

function openModal(code) {
  const cur = CURRENCIES.find(c => c.code === code);
  if (!cur) return;
  const modal = document.getElementById('modal');
  if (!modal) return;

  document.getElementById('modal-flag').textContent = cur.flag;
  document.getElementById('modal-code').textContent = cur.code;
  document.getElementById('modal-name').textContent = cur.name;
  const rate = fiatRates[cur.code];
  const rub = rate ? (1 / rate).toFixed(2) : '—';
  document.getElementById('modal-price').textContent = rub + ' ₽';
  document.getElementById('modal-unit').textContent = 'за 1 ' + cur.code;

  modal.classList.add('active');

  document.getElementById('modal-chart-error').style.display = 'none';
  document.getElementById('modal-chart-loading').style.display = 'block';

  // Заглушка графика (реальный API истории требует другой endpoint)
  setTimeout(() => {
    document.getElementById('modal-chart-loading').style.display = 'none';
    document.getElementById('modal-chart-error').style.display = 'block';
  }, 500);
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) modal.classList.remove('active');
}

// ============================================
// СОБЫТИЯ UI
// ============================================

function setupSearch() {
  const i = document.getElementById('search');
  if (!i) return;
  i.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderCurrencies();
  });
}

function setupCategories() {
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderCurrencies();
    });
  });
}

function setupSort() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      renderCurrencies();
    });
  });
}

function setupModal() {
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  const modal = document.getElementById('modal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
  }

  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

// ============================================
// ЗАПУСК
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  setupCategories();
  setupSort();
  setupModal();
  refreshAll();
  setInterval(refreshAll, 5 * 60 * 1000);
});
