const PROFILE_KEY = "valutkin_profile_data";
const DEFAULT_DATA = { assets: [], favorites: ["USD", "EUR", "CNY"], notifications: [] };
const cryptoMeta = { BTC:["Bitcoin","₿","bitcoin"],ETH:["Ethereum","◆","ethereum"],TON:["Toncoin","💎","the-open-network"],SOL:["Solana","◎","solana"],USDT:["Tether","₮","tether"],BNB:["BNB","🟡","binancecoin"],XRP:["XRP","✕","ripple"],ADA:["Cardano","🔷","cardano"],DOGE:["Dogecoin","🐕","dogecoin"],TRX:["TRON","🔺","tron"],DOT:["Polkadot","⚪","polkadot"],AVAX:["Avalanche","🔻","avalanche-2"],LINK:["Chainlink","🔗","chainlink"] };
const fiatMeta = {USD:["Доллар США","🇺🇸"],EUR:["Евро","🇪🇺"],CNY:["Юань","🇨🇳"],GBP:["Фунт","🇬🇧"],JPY:["Иена","🇯🇵"],KZT:["Тенге","🇰🇿"],AED:["Дирхам","🇦🇪"],TRY:["Лира","🇹🇷"],GEL:["Лари","🇬🇪"]};
let data; try { data = {...DEFAULT_DATA, ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}")}; } catch { data = structuredClone(DEFAULT_DATA); }
let market = { crypto:{}, rates:{} };
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("ru-RU",{style:"currency",currency:"RUB",maximumFractionDigits:2}).format(n || 0);
function save(){ localStorage.setItem(PROFILE_KEY,JSON.stringify(data)); }
function notify(text,kind="info"){ data.notifications.unshift({text,kind,time:new Date().toISOString()}); data.notifications=data.notifications.slice(0,30); save(); }
function userInfo(){
 const email=localStorage.getItem("valutkin_demo_session"); const users=JSON.parse(localStorage.getItem("valutkin_demo_users")||"[]"); const user=users.find(x=>x.email===email);
 if(user){$("welcome").textContent=`Здравствуйте, ${user.name}`;$("contacts").textContent=`${user.email} • ${user.phone}`;} else $("guest-warning").classList.remove("hidden");
}
async function loadMarket(){
 const ids=Object.values(cryptoMeta).map(x=>x[2]).join(",");
 const settled=await Promise.allSettled([fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=rub&include_24hr_change=true`).then(r=>r.ok?r.json():Promise.reject()),fetch("https://open.er-api.com/v6/latest/USD").then(r=>r.ok?r.json():Promise.reject())]);
 if(settled[0].status==="fulfilled") market.crypto=settled[0].value;
 if(settled[1].status==="fulfilled") market.rates=settled[1].value.rates||{};
 createPriceNotifications(); render();
}
function createPriceNotifications(){
 const previous=JSON.parse(localStorage.getItem("valutkin_price_snapshot")||"{}"); const current={};
 Object.entries(cryptoMeta).forEach(([code,m])=>{const price=market.crypto[m[2]]?.rub;if(!price)return;current[code]=price;if(previous[code]){const change=(price-previous[code])/previous[code]*100;if(Math.abs(change)>=1)notify(`${code} ${change>0?"вырос":"снизился"} на ${Math.abs(change).toFixed(2)}% с прошлого просмотра`,change>0?"up":"down");}});
 if(Object.keys(current).length)localStorage.setItem("valutkin_price_snapshot",JSON.stringify(current));
}
function render(){ renderPortfolio();renderFavorites();renderNotifications(); }
function renderPortfolio(){
 let total=0; const list=$("portfolio-list");
 if(!data.assets.length)list.innerHTML='<div class="empty-state">Добавьте BTC, ETH, TON или другую криптовалюту</div>';
 else list.innerHTML=data.assets.map((a,i)=>{const m=cryptoMeta[a.code],quote=market.crypto[m[2]]||{},value=a.amount*(quote.rub||0);total+=value;const ch=quote.rub_24h_change||0;return `<div class="data-row"><span class="data-icon">${m[1]}</span><div><b>${m[0]}</b><small>${a.amount} ${a.code}</small></div><div class="data-value"><b>${quote.rub?money(value):"—"}</b><small class="${ch>=0?"positive":"negative"}">${ch>=0?"+":""}${ch.toFixed(2)}%</small><button class="remove-item" data-remove="${i}" title="Удалить">✕</button></div></div>`}).join("");
 $("portfolio-total").textContent=money(total);$("asset-count").textContent=data.assets.length;
 const changes=data.assets.map(a=>market.crypto[cryptoMeta[a.code][2]]?.rub_24h_change).filter(Number.isFinite);const avg=changes.length?changes.reduce((a,b)=>a+b,0)/changes.length:0;$("portfolio-change").textContent=changes.length?`${avg>=0?"▲":"▼"} ${Math.abs(avg).toFixed(2)}% за 24 часа`:"Ожидаем котировки";$("portfolio-change").className=avg>=0?"positive":"negative";
 list.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{data.assets.splice(+b.dataset.remove,1);save();render();});
 const best=changes.length?Math.max(...changes):null;$("insight").innerHTML=best===null?"Добавьте активы, чтобы получать персональный обзор.":`Среднее изменение вашего портфеля за сутки: <b class="${avg>=0?"positive":"negative"}">${avg>=0?"+":""}${avg.toFixed(2)}%</b>. ${avg>=0?"Сегодня портфель показывает положительную динамику.":"Рынок снизился — избегайте эмоциональных решений."}`;
}
function rubRate(code){if(code==="USD")return market.rates.RUB;return market.rates.RUB&&market.rates[code]?market.rates.RUB/market.rates[code]:null;}
function renderFavorites(){
 $("favorite-count").textContent=data.favorites.length;$("currency-picker").innerHTML=Object.entries(fiatMeta).map(([c,m])=>`<button data-currency="${c}" class="${data.favorites.includes(c)?"active":""}">${m[1]} ${c}</button>`).join("");
 $("favorites-list").innerHTML=data.favorites.map(c=>{const m=fiatMeta[c],rate=rubRate(c);return `<div class="data-row"><span class="data-icon">${m[1]}</span><div><b>${c}</b><small>${m[0]}</small></div><div class="data-value"><b>${rate?money(rate):"—"}</b><small>за 1 ${c}</small></div></div>`}).join("")||'<div class="empty-state">Выберите важные валюты</div>';
 document.querySelectorAll("[data-currency]").forEach(b=>b.onclick=()=>{const c=b.dataset.currency,i=data.favorites.indexOf(c);i>=0?data.favorites.splice(i,1):data.favorites.push(c);save();renderFavorites();});
}
function renderNotifications(){$("notification-count").textContent=data.notifications.length;$("notifications-list").innerHTML=data.notifications.map(n=>`<div class="notification"><span>${n.kind==="up"?"📈":n.kind==="down"?"📉":"🔔"}</span><div>${n.text}<time>${new Date(n.time).toLocaleString("ru-RU")}</time></div></div>`).join("")||'<div class="empty-state">Новых уведомлений пока нет</div>';}
$("add-asset").onclick=()=>$("asset-form").classList.toggle("hidden");$("save-asset").onclick=()=>{const code=$("asset-code").value,amount=+$('asset-amount').value;if(!(amount>0))return;const existing=data.assets.find(x=>x.code===code);existing?existing.amount=amount:data.assets.push({code,amount});notify(`В портфель добавлено ${amount} ${code}`);save();$("asset-form").classList.add("hidden");render();};
$("choose-currencies").onclick=()=>$("currency-picker").classList.toggle("hidden");$("clear-notifications").onclick=()=>{data.notifications=[];save();renderNotifications();};
const avatars = ["🦊","🐻","🐼","🐯","🦁","🐸","🐧","🦄","🐺","🐱","🐶","🐵"];
const avatarPicker = $("avatar-picker");
const savedPhoto = localStorage.getItem("valutkin_avatar_photo");
$("avatar-button").textContent = savedPhoto ? "" : (localStorage.getItem("valutkin_avatar") || "🦊");
if (savedPhoto) $("avatar-button").style.backgroundImage = `url(${savedPhoto})`;
avatarPicker.querySelector("div").innerHTML = avatars.map(a => `<span data-avatar="${a}">${a}</span>`).join("");
$("avatar-button").onclick = () => avatarPicker.classList.toggle("hidden");
avatarPicker.querySelectorAll("[data-avatar]").forEach(x => x.onclick = () => { localStorage.setItem("valutkin_avatar", x.dataset.avatar); localStorage.removeItem("valutkin_avatar_photo"); $("avatar-button").style.backgroundImage=""; $("avatar-button").textContent=x.dataset.avatar; avatarPicker.classList.add("hidden"); });
$("avatar-file").addEventListener("change", event => {
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 2 * 1024 * 1024) return alert("Фото должно быть меньше 2 МБ");
  const reader = new FileReader(); reader.onload = () => { localStorage.setItem("valutkin_avatar_photo", reader.result); $("avatar-button").textContent=""; $("avatar-button").style.backgroundImage=`url(${reader.result})`; avatarPicker.classList.add("hidden"); }; reader.readAsDataURL(file);
});
let financesHidden = localStorage.getItem("valutkin_hide_finances") === "true";
let identityHidden = localStorage.getItem("valutkin_hide_identity") === "true";
function applyPrivacy(){ document.body.classList.toggle("finances-hidden",financesHidden);document.body.classList.toggle("identity-hidden",identityHidden);$("privacy-toggle").textContent=financesHidden?"👁️ Показать финансы":"🙈 Скрыть финансы";$("identity-toggle").textContent=identityHidden?"👁️ Показать аккаунт":"🕶️ Скрыть аккаунт"; }
$("privacy-toggle").onclick=()=>{financesHidden=!financesHidden;localStorage.setItem("valutkin_hide_finances",financesHidden);applyPrivacy();};
$("identity-toggle").onclick=()=>{identityHidden=!identityHidden;localStorage.setItem("valutkin_hide_identity",identityHidden);applyPrivacy();};
applyPrivacy();
userInfo();render();loadMarket();
