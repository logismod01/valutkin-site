(() => {
  const HISTORY_KEY="valutkin_conversion_history_v1",TARGETS_KEY="valutkin_multi_targets";
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const tabs=[...document.querySelectorAll("[data-converter-tab]")],views=[...document.querySelectorAll("[data-converter-view]")];
  const show=name=>{tabs.forEach(tab=>{const active=tab.dataset.converterTab===name;tab.classList.toggle("active",active);tab.setAttribute("aria-selected",String(active))});views.forEach(view=>{const active=view.dataset.converterView===name;view.classList.toggle("active",active);view.hidden=!active})};
  tabs.forEach(tab=>tab.onclick=()=>show(tab.dataset.converterTab));
  const money=(n,code)=>new Intl.NumberFormat("ru-RU",{style:"currency",currency:code,maximumFractionDigits:4}).format(n);
  const historyBox=document.getElementById("conversion-history");
  function renderHistory(){const rows=read(HISTORY_KEY,[]);historyBox.innerHTML=rows.length?rows.slice(0,30).map(row=>`<div><b>${escape(row.amount)} ${escape(row.from)}</b><span>${escape(row.summary)}</span><small>${new Date(row.at).toLocaleString("ru-RU")}</small></div>`).join(""):'<p class="empty-lab">История пока пуста</p>'}
  function remember(amount,from,summary){const rows=read(HISTORY_KEY,[]);rows.unshift({amount,from,summary,at:Date.now()});write(HISTORY_KEY,rows.slice(0,30));renderHistory()}
  const targetBox=document.getElementById("multi-targets"),available=["RUB","USD","EUR","CNY","KZT","GBP","JPY","CHF","AED","TRY"];
  function selected(){return [...targetBox.querySelectorAll("button.active")].map(x=>x.dataset.code)}
  function renderTargets(){const stored=read(TARGETS_KEY,["RUB","USD","EUR","CNY"]);targetBox.innerHTML=available.map(code=>`<button type="button" data-code="${code}" class="${stored.includes(code)?"active":""}">${code}</button>`).join("");targetBox.querySelectorAll("button").forEach(button=>button.onclick=()=>{button.classList.toggle("active");write(TARGETS_KEY,selected())})}
  document.getElementById("run-multi-converter").onclick=()=>{const amount=+document.getElementById("amount").value,from=document.getElementById("from-currency").value,fromRub=typeof getRubValue==="function"?getRubValue(from):null;if(!(amount>0)||!fromRub)return;const items=selected().map(code=>{const rate=code==="RUB"?1:getRubValue(code);return{code,value:amount*fromRub/rate}}).filter(x=>Number.isFinite(x.value));document.getElementById("multi-result").innerHTML=items.map(x=>`<div><b>${x.code}</b><span>${money(x.value,x.code)}</span></div>`).join("");remember(amount,from,items.map(x=>`${x.value.toFixed(2)} ${x.code}`).join(" · "))};
  document.getElementById("clear-conversion-history").onclick=()=>{write(HISTORY_KEY,[]);renderHistory()};
  document.getElementById("convert-btn").addEventListener("click",()=>setTimeout(()=>{const result=document.getElementById("convert-result").textContent.trim(),amount=+document.getElementById("amount").value;if(result&&amount>0)remember(amount,document.getElementById("from-currency").value,result)},0));
  renderTargets();renderHistory();show("single");
})();
