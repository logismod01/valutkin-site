const PROFILE_KEY = "valutkin_profile_data";
const DEFAULT_DATA = { assets: [], portfolios: [], activePortfolio: "main", favorites: ["USD", "EUR", "CNY"], notifications: [], widgets:{}, updatedAt:null };
const cryptoMeta = { BTC:["Bitcoin","₿","bitcoin"],ETH:["Ethereum","◆","ethereum"],TON:["Toncoin","💎","the-open-network"],SOL:["Solana","◎","solana"],USDT:["Tether","₮","tether"],BNB:["BNB","🟡","binancecoin"],XRP:["XRP","✕","ripple"],ADA:["Cardano","🔷","cardano"],DOGE:["Dogecoin","🐕","dogecoin"],TRX:["TRON","🔺","tron"],DOT:["Polkadot","⚪","polkadot"],AVAX:["Avalanche","🔻","avalanche-2"],LINK:["Chainlink","🔗","chainlink"] };
const fiatMeta = {USD:["Доллар США","🇺🇸"],EUR:["Евро","🇪🇺"],CNY:["Юань","🇨🇳"],GBP:["Фунт","🇬🇧"],JPY:["Иена","🇯🇵"],KZT:["Тенге","🇰🇿"],AED:["Дирхам","🇦🇪"],TRY:["Лира","🇹🇷"],GEL:["Лари","🇬🇪"]};
let profileStorage=null;try{profileStorage=window.localStorage}catch(_){}
const pGet=(key,fallback=null)=>{try{return profileStorage?.getItem(key)??fallback}catch(_){return fallback}};
const pSet=(key,value)=>{try{profileStorage?.setItem(key,value)}catch(_){}};
const pRemove=key=>{try{profileStorage?.removeItem(key)}catch(_){}};
function normalizeProfileData(value) {
 const source=value&&typeof value==="object"?value:{};
 const cleanAssets=list=>Array.isArray(list)?list.filter(a=>a&&cryptoMeta[a.code]&&Number.isFinite(+a.amount)&&+a.amount>0).map(a=>({...a,amount:+a.amount,buyPrice:Number.isFinite(+a.buyPrice)?+a.buyPrice:0})):[];
 const legacy=cleanAssets(source.assets),portfolios=Array.isArray(source.portfolios)?source.portfolios.filter(p=>p&&typeof p.id==="string").slice(0,12).map(p=>({id:p.id,name:String(p.name||"Портфель").slice(0,30),assets:cleanAssets(p.assets)})):[];
 if(!portfolios.length)portfolios.push({id:"main",name:"Основной",assets:legacy});
 const activePortfolio=portfolios.some(p=>p.id===source.activePortfolio)?source.activePortfolio:portfolios[0].id;
 return {
  assets:portfolios.find(p=>p.id===activePortfolio).assets,portfolios,activePortfolio,
  favorites:Array.isArray(source.favorites)?[...new Set(source.favorites.filter(code=>fiatMeta[code]))]:[...DEFAULT_DATA.favorites],
  notifications:Array.isArray(source.notifications)?source.notifications.filter(n=>n&&typeof n.text==="string").slice(0,30):[],
  widgets:source.widgets&&typeof source.widgets==="object"?source.widgets:{},
  updatedAt:typeof source.updatedAt==="string"&&!Number.isNaN(Date.parse(source.updatedAt))?source.updatedAt:null
 };
}
let data; try { data=normalizeProfileData(JSON.parse(pGet(PROFILE_KEY)||"{}")); } catch { data=normalizeProfileData(DEFAULT_DATA); }
let market = { crypto:{}, rates:{} };
let cloudUser = null,profileSyncTimer=null,profileSyncing=false,profileSyncPending=false;
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("ru-RU",{style:"currency",currency:"RUB",maximumFractionDigits:2}).format(n || 0);
function persistProfileLocal(){pSet(PROFILE_KEY,JSON.stringify(data))}
async function syncProfileCloud(){if(!cloudUser||typeof getSupabase!=="function")return false;if(profileSyncing){profileSyncPending=true;return false}profileSyncing=true;profileSyncPending=false;try{const snapshot=JSON.parse(JSON.stringify(data)),{error}=await getSupabase().from("user_data").upsert({user_id:cloudUser.id,data:snapshot,updated_at:snapshot.updatedAt||new Date().toISOString()});if(error)throw error;return true}catch(error){console.warn("Cloud save:",error.message||error);return false}finally{profileSyncing=false;if(profileSyncPending)scheduleProfileCloudSync(100)}}
function scheduleProfileCloudSync(delay=700){clearTimeout(profileSyncTimer);profileSyncTimer=setTimeout(syncProfileCloud,delay)}
function save(){data.updatedAt=new Date().toISOString();persistProfileLocal();scheduleProfileCloudSync()}
function notify(text,kind="info"){ data.notifications.unshift({text,kind,time:new Date().toISOString()}); data.notifications=data.notifications.slice(0,30); save(); }
async function userInfo(){
 try {
  const db=getSupabase(),{data:{user}}=await db.auth.getUser(); cloudUser=user;
  if(!user){$("guest-warning").classList.remove("hidden");return;}
  const [{data:profile},{data:cloud}]=await Promise.all([db.from("profiles").select("name,phone,avatar").eq("id",user.id).maybeSingle(),db.from("user_data").select("data,updated_at").eq("user_id",user.id).maybeSingle()]);
  if(cloud?.data&&Object.keys(cloud.data).length){const cloudTime=Date.parse(cloud.updated_at||cloud.data.updatedAt||0),localTime=Date.parse(data.updatedAt||0);if(cloudTime>localTime){data=normalizeProfileData({...cloud.data,updatedAt:cloud.updated_at||cloud.data.updatedAt});persistProfileLocal();render()}else if(localTime>cloudTime)await syncProfileCloud();}else if(data.updatedAt)await syncProfileCloud();
  $("welcome").textContent=`Здравствуйте, ${profile?.name||user.user_metadata?.name||"пользователь"}`;$("contacts").textContent=`${user.email||""}${profile?.phone?` • ${profile.phone}`:""}`;
 } catch(e){$("guest-warning").classList.remove("hidden");}
}
async function loadMarket(){
 const ids=Object.values(cryptoMeta).map(x=>x[2]).join(",");
 const settled=await Promise.allSettled([fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=rub&include_24hr_change=true`).then(r=>r.ok?r.json():Promise.reject()),fetch("https://open.er-api.com/v6/latest/USD").then(r=>r.ok?r.json():Promise.reject())]);
 if(settled[0].status==="fulfilled") market.crypto=settled[0].value;
 if(settled[1].status==="fulfilled") market.rates=settled[1].value.rates||{};
 createPriceNotifications(); render();
}
function createPriceNotifications(){
 const previous=JSON.parse(pGet("valutkin_price_snapshot")||"{}"); const current={};
 Object.entries(cryptoMeta).forEach(([code,m])=>{const price=market.crypto[m[2]]?.rub;if(!price)return;current[code]=price;if(previous[code]){const change=(price-previous[code])/previous[code]*100;if(Math.abs(change)>=1)notify(`${code} ${change>0?"вырос":"снизился"} на ${Math.abs(change).toFixed(2)}% с прошлого просмотра`,change>0?"up":"down");}});
 if(Object.keys(current).length)pSet("valutkin_price_snapshot",JSON.stringify(current));
}
function render(){ renderPortfolioControls();renderPortfolio();renderFavorites();renderNotifications();renderMonthlyReport();renderWidgetSettings(); }
function renderPortfolio(){
 let total=0; const list=$("portfolio-list");
 if(!data.assets.length)list.innerHTML='<div class="empty-state">Добавьте BTC, ETH, TON или другую криптовалюту</div>';
 else list.innerHTML=data.assets.map((a,i)=>{const m=cryptoMeta[a.code],quote=market.crypto[m[2]]||{},value=a.amount*(quote.rub||0),invested=a.amount*(a.buyPrice||0),profit=invested?value-invested:0,profitPct=invested?profit/invested*100:0;total+=value;const ch=quote.rub_24h_change||0;return `<div class="data-row"><span class="data-icon">${m[1]}</span><div><b>${m[0]}</b><small>${a.amount} ${a.code}${a.buyDate?` • ${new Date(a.buyDate).toLocaleDateString("ru-RU")}`:""}</small>${invested?`<small>Средняя цена: ${money(a.buyPrice)} • вложено ${money(invested)}</small>`:""}</div><div class="data-value"><b>${quote.rub?money(value):"—"}</b>${invested?`<small class="${profit>=0?"positive":"negative"}">${profit>=0?"+":""}${money(profit)} (${profitPct.toFixed(1)}%)</small>`:`<small class="${ch>=0?"positive":"negative"}">${ch>=0?"+":""}${ch.toFixed(2)}% за сутки</small>`}<button class="remove-item" data-remove="${i}" title="Удалить">✕</button></div></div>`}).join("");
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
$("add-asset").onclick=()=>$("asset-form").classList.toggle("hidden");$("save-asset").onclick=()=>{const code=$("asset-code").value,amount=+$("asset-amount").value,buyPrice=+$("asset-buy-price").value||0,buyDate=$("asset-buy-date").value;if(!(amount>0))return;const existing=data.assets.find(x=>x.code===code);if(existing){const oldAmount=existing.amount,total=oldAmount+amount;existing.buyPrice=buyPrice?((oldAmount*(existing.buyPrice||0)+amount*buyPrice)/total):(existing.buyPrice||0);existing.amount=total;existing.buyDate=buyDate||existing.buyDate}else data.assets.push({code,amount,buyPrice,buyDate});notify(`В портфель добавлено ${amount} ${code}`);save();$("asset-form").classList.add("hidden");render();};
function activePortfolio(){return data.portfolios.find(p=>p.id===data.activePortfolio)||data.portfolios[0]}
function renderPortfolioControls(){const select=$("portfolio-select");select.innerHTML=data.portfolios.map(p=>`<option value="${p.id}">${p.name} · ${p.assets.length}</option>`).join("");select.value=data.activePortfolio}
function switchPortfolio(id){const target=data.portfolios.find(p=>p.id===id);if(!target)return;data.activePortfolio=id;data.assets=target.assets;save();render()}
function createPortfolio(){const name=prompt("Название нового портфеля:",`Портфель ${data.portfolios.length+1}`)?.trim();if(!name||data.portfolios.length>=12)return;const item={id:`p-${Date.now()}`,name:name.slice(0,30),assets:[]};data.portfolios.push(item);data.activePortfolio=item.id;data.assets=item.assets;save();render()}
function renamePortfolio(){const p=activePortfolio(),name=prompt("Новое название портфеля:",p.name)?.trim();if(!name)return;p.name=name.slice(0,30);save();render()}
function deletePortfolio(){if(data.portfolios.length<=1)return alert("Нельзя удалить единственный портфель.");const p=activePortfolio();if(!confirm(`Удалить портфель «${p.name}»?`))return;data.portfolios=data.portfolios.filter(x=>x.id!==p.id);data.activePortfolio=data.portfolios[0].id;data.assets=data.portfolios[0].assets;save();render()}
function encodeSharedPortfolio(){const p=activePortfolio(),payload={v:1,name:p.name,created:new Date().toISOString(),assets:p.assets.map(({code,amount,buyPrice})=>({code,amount,buyPrice}))};const bytes=new TextEncoder().encode(JSON.stringify(payload));let raw="";bytes.forEach(b=>raw+=String.fromCharCode(b));return btoa(raw).replaceAll("+","-").replaceAll("/","_").replaceAll("=","")}
async function sharePortfolio(){const url=`${location.origin}${location.pathname}#share=${encodeSharedPortfolio()}`;try{if(navigator.share)await navigator.share({title:`Портфель «${activePortfolio().name}»`,url});else{await navigator.clipboard.writeText(url);alert("Публичная ссылка скопирована. Она содержит только состав выбранного портфеля.")}}catch(error){if(error.name!=="AbortError")prompt("Скопируйте публичную ссылку:",url)}}
function loadSharedPortfolio(){const encoded=location.hash.match(/^#share=([A-Za-z0-9_-]+)$/)?.[1];if(!encoded)return false;try{const normalized=encoded.replaceAll("-","+").replaceAll("_","/");const raw=atob(normalized),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)),payload=JSON.parse(new TextDecoder().decode(bytes));if(!payload||!Array.isArray(payload.assets))return false;const shared=normalizeProfileData({assets:payload.assets});shared.portfolios[0].name=String(payload.name||"Публичный портфель").slice(0,30);data=shared;document.body.insertAdjacentHTML("afterbegin",`<div class="profile-share-banner"><button onclick="location.hash='';location.reload()">✕</button><b>🔗 Публичный обезличенный портфель</b><br><small>Контакты и данные владельца не передаются. Котировки обновляются при открытии.</small></div>`);$("welcome").textContent=`Портфель «${shared.portfolios[0].name}»`;$("contacts").textContent="Режим просмотра по публичной ссылке";document.querySelectorAll("#add-asset,#new-portfolio,#rename-portfolio,#delete-portfolio,#share-portfolio,#privacy-toggle,#identity-toggle").forEach(x=>x.hidden=true);return true}catch(error){console.warn("Invalid shared portfolio",error);return false}}
function portfolioMetrics(){let value=0,invested=0;data.assets.forEach(a=>{const price=market.crypto[cryptoMeta[a.code][2]]?.rub||0;value+=a.amount*price;invested+=a.amount*(a.buyPrice||0)});return{value,invested,profit:value-invested}}
function renderMonthlyReport(){const m=portfolioMetrics(),month=new Date().toLocaleDateString("ru-RU",{month:"long",year:"numeric"}),p=m.invested?m.profit/m.invested*100:0,recent=data.assets.filter(a=>a.buyDate&&new Date(a.buyDate).getMonth()===new Date().getMonth()).length;$("monthly-report").innerHTML=`<div class="report-metrics"><div><b>${month}</b><small>отчётный период</small></div><div><b>${money(m.value)}</b><small>текущая стоимость</small></div><div><b>${money(m.invested)}</b><small>вложено</small></div><div><b class="${m.profit>=0?"positive":"negative"}">${m.profit>=0?"+":""}${money(m.profit)} · ${p.toFixed(1)}%</b><small>результат</small></div></div><p class="report-note">Новых позиций в этом месяце: ${recent}. Расчёт основан на введённых ценах покупки и текущих котировках.</p>`}
function exportReport(){const m=portfolioMetrics(),lines=["Валюткин — отчёт портфеля",`Портфель: ${activePortfolio().name}`,`Дата: ${new Date().toLocaleString("ru-RU")}`,`Стоимость: ${money(m.value)}`,`Вложено: ${money(m.invested)}`,`Результат: ${money(m.profit)}`,"",...data.assets.map(a=>`${a.code}: ${a.amount} шт., средняя цена ${money(a.buyPrice||0)}`),"","Информационный отчёт, не инвестиционная рекомендация."];const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`valutkin-${new Date().toISOString().slice(0,7)}.txt`;a.click();URL.revokeObjectURL(url)}
const WIDGETS=[["summary","Сводная статистика",".summary-grid"],["favorites","Важные валюты","#favorites-list"],["notifications","Уведомления",".notifications-card"],["tips","Финансовый обзор",".tips-card"]];
function renderWidgetSettings(){$("widget-settings").innerHTML=WIDGETS.map(([id,name])=>`<label><input type="checkbox" data-widget="${id}" ${data.widgets[id]!==false?"checked":""}>${name}</label>`).join("");WIDGETS.forEach(([id,,selector])=>document.querySelector(selector)?.classList.toggle("widget-hidden",data.widgets[id]===false));document.querySelectorAll("[data-widget]").forEach(x=>x.onchange=()=>{data.widgets[x.dataset.widget]=x.checked;save();renderWidgetSettings()})}
$("portfolio-select").onchange=e=>switchPortfolio(e.target.value);$("new-portfolio").onclick=createPortfolio;$("rename-portfolio").onclick=renamePortfolio;$("delete-portfolio").onclick=deletePortfolio;$("share-portfolio").onclick=sharePortfolio;$("export-report").onclick=exportReport;
$("choose-currencies").onclick=()=>$("currency-picker").classList.toggle("hidden");$("clear-notifications").onclick=()=>{data.notifications=[];save();renderNotifications();};
const avatars = ["🦊","🐻","🐼","🐯","🦁","🐸","🐧","🦄","🐺","🐱","🐶","🐵"];
const avatarPicker = $("avatar-picker");
const savedPhoto = pGet("valutkin_avatar_photo");
$("avatar-button").textContent = savedPhoto ? "" : (pGet("valutkin_avatar") || "🦊");
if (savedPhoto) $("avatar-button").style.backgroundImage = `url(${savedPhoto})`;
avatarPicker.querySelector("div").innerHTML = avatars.map(a => `<span data-avatar="${a}">${a}</span>`).join("");
$("avatar-button").onclick = () => avatarPicker.classList.toggle("hidden");
avatarPicker.querySelectorAll("[data-avatar]").forEach(x => x.onclick = () => { pSet("valutkin_avatar", x.dataset.avatar); pRemove("valutkin_avatar_photo"); $("avatar-button").style.backgroundImage=""; $("avatar-button").textContent=x.dataset.avatar; avatarPicker.classList.add("hidden"); });
$("avatar-file").addEventListener("change", event => {
  const file = event.target.files[0]; if (!file) return;
  if (file.size > 2 * 1024 * 1024) return alert("Фото должно быть меньше 2 МБ");
  const reader = new FileReader(); reader.onload = () => { pSet("valutkin_avatar_photo", reader.result); $("avatar-button").textContent=""; $("avatar-button").style.backgroundImage=`url(${reader.result})`; avatarPicker.classList.add("hidden"); }; reader.readAsDataURL(file);
});
let financesHidden = pGet("valutkin_hide_finances") === "true";
let identityHidden = pGet("valutkin_hide_identity") === "true";
function applyPrivacy(){ document.body.classList.toggle("finances-hidden",financesHidden);document.body.classList.toggle("identity-hidden",identityHidden);$("privacy-toggle").textContent=financesHidden?"👁️ Показать финансы":"🙈 Скрыть финансы";$("identity-toggle").textContent=identityHidden?"👁️ Показать аккаунт":"🕶️ Скрыть аккаунт"; }
$("privacy-toggle").onclick=()=>{financesHidden=!financesHidden;pSet("valutkin_hide_finances",financesHidden);applyPrivacy();};
$("identity-toggle").onclick=()=>{identityHidden=!identityHidden;pSet("valutkin_hide_identity",identityHidden);applyPrivacy();};
applyPrivacy();
window.addEventListener("online",()=>scheduleProfileCloudSync(0));const sharedMode=loadSharedPortfolio();render();loadMarket();if(!sharedMode)userInfo();
