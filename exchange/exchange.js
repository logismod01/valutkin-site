// Каталог легальных способов покупки валюты. Наличие конкретной валюты зависит от страны и отделения.
const CURRENCIES = {
 USD:["Доллар США","🇺🇸","США"],EUR:["Евро","🇪🇺","Еврозона"],CNY:["Китайский юань","🇨🇳","Китай"],GBP:["Фунт стерлингов","🇬🇧","Великобритания"],JPY:["Японская иена","🇯🇵","Япония"],CHF:["Швейцарский франк","🇨🇭","Швейцария"],KZT:["Казахстанский тенге","🇰🇿","Казахстан"],AED:["Дирхам ОАЭ","🇦🇪","ОАЭ"],TRY:["Турецкая лира","🇹🇷","Турция"],KRW:["Южнокорейская вона","🇰🇷","Южная Корея"],INR:["Индийская рупия","🇮🇳","Индия"],THB:["Тайский бат","🇹🇭","Таиланд"],VND:["Вьетнамский донг","🇻🇳","Вьетнам"],IDR:["Индонезийская рупия","🇮🇩","Индонезия"],MYR:["Малайзийский ринггит","🇲🇾","Малайзия"],SGD:["Сингапурский доллар","🇸🇬","Сингапур"],HKD:["Гонконгский доллар","🇭🇰","Гонконг"],AUD:["Австралийский доллар","🇦🇺","Австралия"],NZD:["Новозеландский доллар","🇳🇿","Новая Зеландия"],CAD:["Канадский доллар","🇨🇦","Канада"],BRL:["Бразильский реал","🇧🇷","Бразилия"],MXN:["Мексиканское песо","🇲🇽","Мексика"],GEL:["Грузинский лари","🇬🇪","Грузия"],AMD:["Армянский драм","🇦🇲","Армения"],AZN:["Азербайджанский манат","🇦🇿","Азербайджан"],KGS:["Киргизский сом","🇰🇬","Кыргызстан"],UZS:["Узбекский сум","🇺🇿","Узбекистан"],PLN:["Польский злотый","🇵🇱","Польша"],CZK:["Чешская крона","🇨🇿","Чехия"],HUF:["Венгерский форинт","🇭🇺","Венгрия"],NOK:["Норвежская крона","🇳🇴","Норвегия"],SEK:["Шведская крона","🇸🇪","Швеция"],DKK:["Датская крона","🇩🇰","Дания"],ILS:["Израильский шекель","🇮🇱","Израиль"],SAR:["Саудовский риял","🇸🇦","Саудовская Аравия"],QAR:["Катарский риал","🇶🇦","Катар"],ZAR:["Южноафриканский рэнд","🇿🇦","ЮАР"],EGP:["Египетский фунт","🇪🇬","Египет"],MNT:["Монгольский тугрик","🇲🇳","Монголия"],RUB:["Российский рубль","🇷🇺","Россия"]
};
const REGIONAL = {
 KZT:[["Kaspi.kz","https://kaspi.kz","Приложение и отделения"],["Halyk Bank","https://halykbank.kz","Отделения и приложение"]],
 CNY:[["Bank of China","https://www.boc.cn","Банк страны валюты"],["ICBC","https://www.icbc.com.cn","Банк страны валюты"]],
 AED:[["Emirates NBD","https://www.emiratesnbd.com","Банк ОАЭ"],["Al Ansari Exchange","https://alansariexchange.com","Сеть обменных пунктов"]],
 TRY:[["Ziraat Bankası","https://www.ziraatbank.com.tr","Банк Турции"],["Türkiye İş Bankası","https://www.isbank.com.tr","Банк Турции"]],
 KRW:[["KB Kookmin Bank","https://www.kbstar.com","Банк Южной Кореи"],["Shinhan Bank","https://www.shinhan.com","Банк Южной Кореи"]],
 JPY:[["MUFG Bank","https://www.bk.mufg.jp","Банк Японии"],["SMBC","https://www.smbc.co.jp","Банк Японии"]],
 GBP:[["Barclays","https://www.barclays.co.uk","Банк Великобритании"],["Wise","https://wise.com","Мультивалютный сервис; доступность зависит от страны"]],
 CHF:[["UBS","https://www.ubs.com","Банк Швейцарии"]],
 GEL:[["Bank of Georgia","https://bankofgeorgia.ge","Банк Грузии"],["TBC Bank","https://www.tbcbank.ge","Банк Грузии"]],
 AMD:[["Ameriabank","https://ameriabank.am","Банк Армении"]],
 UZS:[["Kapitalbank","https://kapitalbank.uz","Банк Узбекистана"]],
 KGS:[["Optima Bank","https://optimabank.kg","Банк Кыргызстана"]],
 INR:[["State Bank of India","https://sbi.co.in","Банк Индии"]],
 THB:[["Bangkok Bank","https://www.bangkokbank.com","Банк Таиланда"]],
 VND:[["Vietcombank","https://www.vietcombank.com.vn","Банк Вьетнама"]],
 SGD:[["DBS","https://www.dbs.com.sg","Банк Сингапура"]],
 AUD:[["Commonwealth Bank","https://www.commbank.com.au","Банк Австралии"]],
 CAD:[["RBC","https://www.rbcroyalbank.com","Банк Канады"]],
 BRL:[["Banco do Brasil","https://www.bb.com.br","Банк Бразилии"]],
 RUB:[["СберБанк","https://www.sberbank.ru","Приложение и отделения"],["ВТБ","https://www.vtb.ru","Приложение и отделения"],["Альфа-Банк","https://alfabank.ru","Приложение и отделения"]]
};
const selector=document.getElementById("currency-selector"),content=document.getElementById("exchange-content"),search=document.getElementById("exchange-search");
let selected="USD";
const safeUrl=value=>{try{const url=new URL(value);return url.protocol==="https:"?url.href:"#"}catch{return"#"}};
function services(code){const [name,,country]=CURRENCIES[code],local=REGIONAL[code]||[];return[
 {type:"📍 Рядом с вами",note:"Сравните наличный курс и комиссию до поездки",items:[
  ["Google Maps",`https://www.google.com/maps/search/${encodeURIComponent(`обмен ${name} ${code}`)}`,"Ближайшие банки и обменные пункты"],
  ["Яндекс Карты",`https://yandex.ru/maps/?text=${encodeURIComponent(`обмен ${name} ${code}`)}`,"Поиск по городу и отзывам"],
  ["2ГИС",`https://2gis.ru/search/${encodeURIComponent(`обмен ${code}`)}`,"Организации, телефоны и время работы"]]},
 {type:`🏦 В стране валюты · ${country}`,note:"Официальные сайты; счёт и документы могут быть обязательны",items:local.length?local:[["Найти лицензированные банки",`https://www.google.com/search?q=${encodeURIComponent(`${country} licensed banks exchange ${code}`)}`,"Проверьте лицензию у местного регулятора"]]},
 {type:"🔎 Сравнить предложения",note:"Агрегатор не является стороной сделки",items:[["BestChange","https://www.bestchange.ru","Мониторинг электронных обменников; проверяйте условия"],["Wise Currency Converter",`https://wise.com/ru/currency-converter/${code.toLowerCase()}-to-rub-rate`,"Ориентир по среднерыночному курсу"]]}
]}
function drawSelector(){const q=search.value.trim().toLowerCase(),rows=Object.entries(CURRENCIES).filter(([code,[name,,country]])=>`${code} ${name} ${country}`.toLowerCase().includes(q));selector.innerHTML=rows.map(([code,[name,flag]])=>`<button class="curr-btn ${code===selected?"active":""}" data-cur="${code}" type="button"><span>${flag}</span><b>${code}</b><small>${name}</small></button>`).join("")||'<p class="selector-empty">Ничего не найдено</p>';selector.querySelectorAll("[data-cur]").forEach(button=>button.onclick=()=>{selected=button.dataset.cur;drawSelector();renderCurrency()})}
function renderCurrency(){const [name,flag,country]=CURRENCIES[selected];content.innerHTML=`<div class="exchange-header"><div><span>${flag}</span><div><small>Где купить</small><h2>${name} · ${selected}</h2><p>${country} · проверяйте доступность и итоговый курс</p></div></div><a href="../?currency=${selected}#currencies-grid">Посмотреть курс →</a></div>${services(selected).map(group=>`<section class="service-group"><div class="group-heading"><h3>${group.type}</h3><small>${group.note}</small></div><div class="service-list">${group.items.map(([title,link,desc])=>`<a href="${safeUrl(link)}" target="_blank" rel="noopener noreferrer" class="service-card"><span class="service-arrow">↗</span><b>${title}</b><p>${desc}</p><small>Открыть официальный сайт</small></a>`).join("")}</div></section>`).join("")}<div class="exchange-tip"><b>Как покупать безопаснее</b><ol><li>Сравните курс с официальным и уточните комиссию.</li><li>Проверьте лицензию банка или обменника.</li><li>Не переводите деньги незнакомцам и не сообщайте коды из SMS.</li><li>Для наличных заранее уточните наличие нужной суммы.</li></ol></div>`}
search.oninput=drawSelector;document.getElementById("exchange-clear").onclick=()=>{search.value="";drawSelector();search.focus()};drawSelector();renderCurrency();
