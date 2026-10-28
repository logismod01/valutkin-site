const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const withoutExternalScripts = html => html.replace(/<script[^>]*src[^>]*><\/script>/g, "");
const evaluate = (window, file) => window.eval(read(file));

function browser(htmlFile) {
  const dom = new JSDOM(withoutExternalScripts(read(htmlFile)), {
    url: `https://example.test/${htmlFile}`,
    runScripts: "outside-only"
  });
  dom.window.confirm = () => true;
  dom.window.prompt = (_, fallback = "") => fallback;
  dom.window.alert = () => {};
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  dom.window.matchMedia = () => ({ matches: false });
  dom.window.scrollTo = () => {};
  dom.window.AudioContext = function () { throw new Error("Audio disabled in tests"); };
  return dom;
}

function testShellWithoutStorage() {
  const dom = new JSDOM('<!doctype html><header><div class="header-left"><b>Валюткин</b></div><div class="header-right"></div></header>', {
    url: "https://example.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  Object.defineProperty(window, "localStorage", { get() { throw new window.DOMException("denied", "SecurityError"); } });
  Object.defineProperty(window, "sessionStorage", { get() { throw new window.DOMException("denied", "SecurityError"); } });
  window.matchMedia = () => ({ matches: false });
  window.scrollTo = () => {};
  evaluate(window, "app-shell.js");
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
  assert.ok(window.document.querySelector(".side-drawer"));
  assert.equal(window.document.querySelector("a.header-left")?.getAttribute("href"), "./", "site brand must link to homepage");
  assert.equal(window.document.querySelectorAll("[data-shell-theme]").length, 19);
  assert.equal(window.document.querySelectorAll("#shell-font option").length, 10);
  window.document.querySelector('[data-shell-theme="matrix"]').click();
  assert.equal(window.document.documentElement.dataset.theme, "matrix");
}

function testGame() {
  const { window } = browser("game.html");
  evaluate(window, "game.js");
  const document = window.document;
  assert.ok(document.querySelector("#difficulty-modal.active"));
  document.querySelector('[data-difficulty="easy"]').click();
  assert.equal(document.querySelectorAll(".market-asset").length, 89);
  assert.equal(document.querySelectorAll(".employee").length, 15);
  assert.equal(document.querySelectorAll(".achievement").length, 15);
  assert.equal(document.querySelectorAll(".lesson-card").length, 8);
  assert.match(document.querySelector("#game-season").textContent, /Сезон 1/);
  document.querySelector('[data-choice="0"]').click();
  document.querySelector("#next-day").click();
  assert.equal(document.querySelector("#game-day").textContent, "2");
}

function testGameWithoutStorage() {
  const dom = browser("game.html");
  const { window } = dom;
  Object.defineProperty(window, "localStorage", { get() { throw new window.DOMException("denied", "SecurityError"); } });
  evaluate(window, "game.js");
  assert.equal(window.document.querySelectorAll(".market-asset").length, 89);
}

function testProfile() {
  const { window } = browser("profile.html");
  window.getSupabase = () => ({ auth: { getUser: async () => ({ data: { user: null } }) } });
  window.fetch = async url => ({ ok: true, json: async () => String(url).includes("coingecko") ? {} : { rates: { RUB: 90 } } });
  evaluate(window, "profile.js");
  evaluate(window, "profile-upgrade.js");
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
  const document = window.document;
  assert.equal(document.querySelectorAll(".profile-upgrade-grid .dashboard-card").length, 3);
  document.querySelector("#asset-code").value = "BTC";
  document.querySelector("#asset-amount").value = "2";
  document.querySelector("#asset-buy-price").value = "50";
  document.querySelector("#save-asset").click();
  document.querySelector("#asset-amount").value = "1";
  document.querySelector("#asset-buy-price").value = "80";
  document.querySelector("#save-asset").click();
  const data = JSON.parse(window.localStorage.getItem("valutkin_profile_data"));
  assert.equal(data.assets[0].amount, 3);
  assert.equal(data.assets[0].buyPrice, 60);
}

function testUntrustedContentEscaping() {
  const profileDom = browser("profile.html");
  const profileWindow = profileDom.window;
  profileWindow.localStorage.setItem("valutkin_profile_data", JSON.stringify({
    portfolios: [{ id: "main", name: '<img src=x onerror="window.hacked=1">', assets: [] }],
    activePortfolio: "main",
    notifications: [{ text: '<img src=x onerror="window.hacked=1">', kind: "info", time: new Date().toISOString() }]
  }));
  profileWindow.getSupabase = () => ({ auth: { getUser: async () => ({ data: { user: null } }) } });
  profileWindow.fetch = async url => ({ ok: true, json: async () => String(url).includes("coingecko") ? {} : { rates: { RUB: 90 } } });
  evaluate(profileWindow, "profile.js");
  assert.equal(profileWindow.document.querySelector("#portfolio-select img"), null);
  assert.equal(profileWindow.document.querySelector("#notifications-list img"), null);
  assert.equal(profileWindow.hacked, undefined);

  const gameDom = browser("game.html");
  const gameWindow = gameDom.window;
  gameWindow.localStorage.setItem("valutkin_market_game_v1", JSON.stringify({
    day: 2,
    log: [{ day: 2, text: '<img src=x onerror="window.hacked=1">' }]
  }));
  evaluate(gameWindow, "game.js");
  assert.equal(gameWindow.document.querySelector("#game-log img"), null);
  assert.equal(gameWindow.hacked, undefined);

  const shellSource = read("app-shell.js");
  assert.match(shellSource, /shellEscape\(x\.note\)/, "diagnostic details must be escaped");
  assert.match(shellSource, /shellEscape\(text\)/, "toast text must be escaped");
  const authSource = read("auth.js");
  assert.match(authSource, /authEscape\(user\.email/, "account metadata must be escaped");
  const companySource = read("company.js");
  assert.match(companySource, /new URL\(profile\.weburl\)/, "company links must be validated");
  assert.doesNotMatch(companySource, /href=[\"`]\$\{profile\.weburl\}/, "raw company URL interpolation is unsafe");
  const labSource = read("market-lab.js");
  assert.match(labSource, /labEscape\(x\.summary\)/, "stored conversion history must be escaped");
  assert.match(labSource, /CURRENCIES\[x\.code\]/, "stored alerts must be allowlisted");
}

function testSplitMarketPages() {
  const main = browser("index.html");
  main.window.getRubValue = code => ({ RUB: 1, USD: 80, EUR: 90, CNY: 11 }[code] || 10);
  const from = main.window.document.querySelector("#from-currency");
  from.innerHTML = '<option value="USD">USD</option>';
  evaluate(main.window, "converter-hub.js");
  assert.equal(main.window.document.querySelectorAll("[data-converter-tab]").length, 3);
  main.window.document.querySelector('[data-converter-tab="multi"]').click();
  assert.equal(main.window.document.querySelector('[data-converter-view="multi"]').hidden, false);
  main.window.document.querySelector("#run-multi-converter").click();
  assert.match(main.window.document.querySelector("#multi-result").textContent, /RUB/);
  assert.equal(main.window.document.querySelector(".market-lab"), null, "extra tools should not overload the homepage");

  const tools = browser("market-tools.html");
  tools.window.setInterval = () => 0;
  tools.window.fetch = async url => String(url).includes("daily_json")
    ? { ok: true, json: async () => ({ Date: new Date().toISOString(), Valute: { USD: { Value: 80, Nominal: 1 }, EUR: { Value: 90, Nominal: 1 }, CNY: { Value: 11, Nominal: 1 }, GBP: { Value: 100, Nominal: 1 }, JPY: { Value: 55, Nominal: 100 } } }) }
    : { ok: true, json: async () => ({ rates: { RUB: 80, USD: 1, EUR: .9, CNY: 7.2, GBP: .8, JPY: 150, KZT: 500, CHF: .9, AED: 3.67, TRY: 30 } }) };
  evaluate(tools.window, "market-tools.js");
  assert.equal(tools.window.document.querySelectorAll("#cbdc-list > div").length, 8);
  assert.ok(tools.window.document.querySelector("#alerts"));
}

function testNewsPage() {
  const { window } = browser("news.html");
  window.localStorage.setItem("valutkin_news_cache_v1", JSON.stringify({ at: Date.now(), items: [
    { id: "safe-1", topic: "crypto", title: '<img src=x onerror="window.hacked=1"> Bitcoin растёт', description: "Описание", source: "Тестовое СМИ", date: Date.now(), link: "https://example.com/story" },
    { id: "safe-2", topic: "currency", title: "Курс валют", description: "Решение центрального банка", source: "Другое СМИ", date: Date.now(), link: "https://example.org/story" }
  ] }));
  window.fetch = async () => { throw new Error("cached data expected"); };
  window.setInterval = () => 0;
  evaluate(window, "news.js");
  const document = window.document;
  assert.equal(document.querySelectorAll(".news-card").length, 2);
  assert.equal(document.querySelector(".news-card img"), null);
  assert.equal(window.hacked, undefined);
  document.querySelector('[data-news-category="crypto"]').click();
  assert.equal(document.querySelectorAll(".news-card").length, 1);
  document.querySelector(".news-save").click();
  assert.equal(JSON.parse(window.localStorage.getItem("valutkin_saved_news_v1")).length, 1);
  assert.match(read("app-shell.js"), /news\.html.*Новости рынка/);
  const newsSource = read("news.js");
  assert.match(newsSource, /\.\/data\/news\.json/, "news must load a same-origin snapshot");
  assert.doesNotMatch(newsSource, /rss2json|news\.google\.com/, "browser must not call cross-origin RSS services");
}

function testExchangeDirectory() {
  const { window } = browser("exchange/index.html");
  evaluate(window, "exchange/exchange.js");
  const document = window.document;
  assert.ok(document.querySelectorAll("[data-cur]").length >= 40, "exchange directory needs broad currency choice");
  assert.ok(document.querySelectorAll(".service-card").length >= 5);
  assert.ok([...document.querySelectorAll(".service-card")].every(link => link.rel.includes("noopener")));
  document.querySelector("#exchange-search").value = "тенге";
  document.querySelector("#exchange-search").dispatchEvent(new window.Event("input"));
  assert.equal(document.querySelectorAll("[data-cur]").length, 1);
  document.querySelector("[data-cur]").click();
  assert.match(document.querySelector(".exchange-header").textContent, /KZT/);
}

function testTenLanguageInterface() {
  const { window } = browser("index.html");
  evaluate(window, "i18n.js");
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
  const i18n = window.ValutkinI18n;
  assert.deepEqual(Object.keys(i18n.languages), ["ru","en","zh","es","fr","de","ar","pt","ja","ko"]);
  for (const language of Object.keys(i18n.languages)) {
    i18n.setLanguage(language);
    assert.notEqual(i18n.translate("Главная"), "", `missing ${language} translation`);
  }
  i18n.setLanguage("en");
  assert.equal(i18n.currency, "USD");
  assert.equal(JSON.parse(window.localStorage.getItem("valutkin_base_currency")), "USD");
  assert.equal(window.document.documentElement.lang, "en");
  assert.match(window.document.querySelector(".converter-hub .section-title").textContent, /All conversion modes/);
  assert.match(window.document.querySelector('[data-converter-tab="single"]').textContent, /Standard/);
  assert.equal(i18n.translate("КОНВЕРТЕРЫ"), "CONVERTERS");
  assert.equal(i18n.translate("Другие инструменты →"), "More tools →");
  assert.equal(i18n.translate("Комиссия обмена"), "Exchange fee");
  assert.equal(i18n.translate("Аа Увеличить текст"), "Aa Increase text");
  i18n.setLanguage("ar");
  assert.equal(window.document.documentElement.dir, "rtl");
  assert.equal(window.localStorage.getItem("valutkin_language"), "ar");
  assert.match(read("app-shell.js"), /shell-language/);
}

function testWalletAndFreeSecurityFeatures() {
  const wallet = browser("wallet.html");
  assert.match(wallet.window.document.querySelector(".police-tape").textContent, /СКОРО ОТКРОЕТСЯ/);
  assert.equal(wallet.window.document.querySelectorAll(".wallet-plans article").length, 3);
  const authHtml = read("auth.html");
  const authSource = read("auth.js");
  assert.match(authHtml, /data-oauth="google"/);
  assert.match(authHtml, /data-oauth="github"/);
  assert.match(authSource, /signInWithOAuth/);
  assert.match(authSource, /mfa\.enroll/);
  assert.match(authSource, /mfa\.verify/);
  assert.match(authSource, /signOut\(\{scope:"global"\}\)/);
  assert.match(authSource, /linkIdentity/);
  assert.match(authSource, /unlinkIdentity/);
  const profileUpgrade = read("profile-upgrade.js");
  assert.match(profileUpgrade, /valutkin_profile_custom_v1/);
  assert.match(profileUpgrade, /valutkin_profile_privacy_v2/);
  assert.match(profileUpgrade, /valutkin_account_activity_v1/);
  assert.match(read("app-shell.js"), /wallet\.html.*Кошелёк/);
  assert.match(read("app-shell.js"), /support\.html.*Поддержка/);
  assert.ok(fs.existsSync(path.join(ROOT, "support.html")));
  const reviewsHtml = read("reviews.html");
  const reviewsSource = read("reviews.js");
  const setupSql = read("supabase-setup.sql");
  assert.match(reviewsHtml, /name="rating" value="5"/);
  assert.match(reviewsSource, /\.from\("reviews"\)\.upsert/);
  assert.match(reviewsSource, /comment\.textContent=row\.comment/, "review comments must render as text");
  assert.match(setupSql, /reviews_own_insert/);
  assert.match(setupSql, /char_length\(comment\) between 3 and 500/);
  assert.match(setupSql, /primary key \(user_id,slot\)/, "cloud game saves must support multiple funds");
  assert.match(read("app-shell.js"), /reviews\.html.*Отзывы/);
  assert.match(read("app-shell.js"), /install\.html.*Установить приложение/);
  assert.match(read("dashboard-settings.js"), /data-move/, "dashboard widgets must be reorderable");
  assert.match(read("game.js"), /globalProfiles\.filter/, "season leaderboard must use real public profiles");
  assert.doesNotMatch(read("game.js"), /Фонд Север|Капитал Лис/, "leaderboard must not contain fake rivals");
  assert.ok(fs.existsSync(path.join(ROOT, "install.html")));
  assert.ok(fs.existsSync(path.join(ROOT, "goals.html")));
  assert.ok(fs.existsSync(path.join(ROOT, "updates.html")));
  assert.match(read("goals.js"), /\.from\("savings_goals"\)/);
  assert.match(setupSql, /scheduled_goal_targets/);
  assert.match(read("app-shell.js"), /goals\.html.*Цели накопления/);
  assert.match(read("app-shell.js"), /updates\.html.*Что нового/);
}

function testStaticFiles() {
  const scripts = [
    ...fs.readdirSync(ROOT).filter(name => name.endsWith(".js")),
    "stocks/stocks.js", "exchange/exchange.js"
  ];
  for (const script of scripts) execFileSync(process.execPath, ["--check", path.join(ROOT, script)]);
  const shellCss = read("shell.css");
  assert.match(shellCss, /\.drawer-body\{height:100%;max-height:none;overflow-x:hidden;overflow-y:auto/, "mobile drawer must expose all controls by scrolling");
  assert.match(shellCss, /safe-area-inset-top/, "mobile drawer must respect the top safe area");
  const featureSource = read("feature-suite.js");
  assert.match(featureSource, /valutkin_hidden_promos/, "internal promos must support dismissal");
  assert.match(featureSource, /7\*86400000/, "dismissed promos must stay hidden temporarily");
  assert.match(featureSource, /20000/, "promos must disappear automatically");
  const mainSource = read("script.js");
  assert.match(mainSource, /translucentAccent/, "chart colors must normalize short CSS hex values");
  assert.doesNotMatch(mainSource, /addColorStop\(0, `\$\{accent\}66`\)/, "short CSS hex must not create an invalid Canvas color");
  const compareSource = read("compare.js");
  assert.match(compareSource, /api\.binance\.com\/api\/v3\/klines/, "crypto comparison needs a rate-limit-resistant primary source");
  assert.match(compareSource, /api\.coingecko\.com/, "crypto comparison needs a fallback source");
  const serviceWorker = read("service-worker.js");
  const block = serviceWorker.match(/const APP_SHELL = \[([\s\S]*?)\];/);
  assert.ok(block, "APP_SHELL is missing");
  const resources = [...block[1].matchAll(/"([^"]+)"/g)].map(match => match[1]);
  for (const resource of resources) {
    let relative = resource.split("?")[0].replace(/^\.\//, "") || "index.html";
    if (relative.endsWith("/")) relative += "index.html";
    assert.ok(fs.existsSync(path.join(ROOT, relative)), `Missing cached resource: ${resource}`);
  }
}

const tests = [
  ["shell without storage", testShellWithoutStorage],
  ["game", testGame],
  ["game without storage", testGameWithoutStorage],
  ["profile weighted average", testProfile],
  ["untrusted content escaping", testUntrustedContentEscaping],
  ["split market pages and converter modes", testSplitMarketPages],
  ["news page filters, saved items and escaping", testNewsPage],
  ["exchange directory choices and safe links", testExchangeDirectory],
  ["ten-language interface and RTL", testTenLanguageInterface],
  ["wallet preview and free account security", testWalletAndFreeSecurityFeatures],
  ["static files and PWA paths", testStaticFiles]
];

for (const [name, test] of tests) {
  test();
  console.log(`✓ ${name}`);
}
console.log(`\n${tests.length} smoke tests passed.`);
