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
  const dom = new JSDOM('<!doctype html><header><div class="header-right"></div></header>', {
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
  const document = window.document;
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
  ["static files and PWA paths", testStaticFiles]
];

for (const [name, test] of tests) {
  test();
  console.log(`✓ ${name}`);
}
console.log(`\n${tests.length} smoke tests passed.`);
