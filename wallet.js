(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const KEY = "valutkin_watch_addresses_v2";
  const OLD_KEY = "valutkin_watch_addresses_v1";
  const HISTORY_KEY = "valutkin_wallet_history_v1";
  const chains = {
    "0x1": { name: "Ethereum", symbol: "ETH", rpc: "https://ethereum-rpc.publicnode.com", explorer: "https://etherscan.io/address/" },
    "0x89": { name: "Polygon", symbol: "POL", rpc: "https://polygon-bor-rpc.publicnode.com", explorer: "https://polygonscan.com/address/" },
    "0x38": { name: "BNB Smart Chain", symbol: "BNB", rpc: "https://bsc-rpc.publicnode.com", explorer: "https://bscscan.com/address/" },
    "0xa4b1": { name: "Arbitrum One", symbol: "ETH", rpc: "https://arbitrum-one-rpc.publicnode.com", explorer: "https://arbiscan.io/address/" },
    "0xa": { name: "Optimism", symbol: "ETH", rpc: "https://mainnet.optimism.io", explorer: "https://optimistic.etherscan.io/address/" },
    "0x2105": { name: "Base", symbol: "ETH", rpc: "https://mainnet.base.org", explorer: "https://basescan.org/address/" },
    "0xa86a": { name: "Avalanche C-Chain", symbol: "AVAX", rpc: "https://api.avax.network/ext/bc/C/rpc", explorer: "https://snowtrace.io/address/" },
    "0xaa36a7": { name: "Ethereum Sepolia", symbol: "Sepolia ETH", rpc: "https://ethereum-sepolia-rpc.publicnode.com", explorer: "https://sepolia.etherscan.io/address/", txExplorer: "https://sepolia.etherscan.io/tx/", testnet: true },
    "0x13882": { name: "Polygon Amoy", symbol: "Amoy POL", rpc: "https://polygon-amoy-bor-rpc.publicnode.com", explorer: "https://amoy.polygonscan.com/address/", txExplorer: "https://amoy.polygonscan.com/tx/", testnet: true },
    "0x14a34": { name: "Base Sepolia", symbol: "Sepolia ETH", rpc: "https://sepolia.base.org", explorer: "https://sepolia.basescan.org/address/", txExplorer: "https://sepolia.basescan.org/tx/", testnet: true },
  };
  let account = "";
  let chain = "";
  let selectedProvider = null, mainnetUntil = 0;
  const discoveredProviders = [];
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };
  let watch = read(KEY, null);
  if (!Array.isArray(watch)) watch = read(OLD_KEY, []).map((item) => ({ ...item, chain: "0x1" }));
  watch = watch.filter((item) => item && valid(item.address) && chains[item.chain || "0x1"]).slice(0, 30);
  const provider = () => selectedProvider || window.ethereum;
  function valid(value) { return /^0x[a-fA-F0-9]{40}$/.test(value || ""); }
  const short = (value) => value ? `${value.slice(0, 7)}…${value.slice(-5)}` : "";
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  function toast(text) { const el = $("wallet-toast"); el.textContent = text; el.classList.add("show"); clearTimeout(el.t); el.t = setTimeout(() => el.classList.remove("show"), 2200); }
  function status(text, error = false) { $("wallet-status").textContent = text; $("wallet-status").classList.toggle("error", error); }
  function renderNetworks() { $("network-list").innerHTML = Object.entries(chains).map(([id, item]) => `<div class="network-row ${chain === id ? "active" : ""}"><span>${chain === id ? "●" : "○"}</span><b>${item.name}</b><small>${item.symbol}</small></div>`).join(""); }
  function saveWatch() { write(KEY, watch.slice(0, 30)); renderWatch(); }
  function renderWatch() {
    $("watch-list").innerHTML = watch.length ? watch.map((item) => `<div class="watch-row"><span>◈</span><div><b>${escapeHtml(item.name || "Адрес")}</b><small>${short(item.address)} · ${escapeHtml(chains[item.chain]?.name || "EVM")}</small></div><button data-load="${item.address}" data-chain="${item.chain}">Показать</button><a href="${chains[item.chain].explorer}${item.address}" target="_blank" rel="noopener noreferrer" aria-label="Открыть в обозревателе">↗</a><button data-delete="${item.address}" data-delete-chain="${item.chain}" aria-label="Удалить">×</button></div>`).join("") : '<div class="wallet-empty">Сохранённых публичных адресов пока нет</div>';
    document.querySelectorAll("[data-load]").forEach((button) => button.onclick = () => loadBalance(button.dataset.load, button.dataset.chain, false));
    document.querySelectorAll("[data-delete]").forEach((button) => button.onclick = () => { watch = watch.filter((item) => !(item.address.toLowerCase() === button.dataset.delete.toLowerCase() && item.chain === button.dataset.deleteChain)); saveWatch(); });
  }
  function addHistory(address, chainId, balance) {
    const rows = read(HISTORY_KEY, []);
    rows.unshift({ address, chain: chainId, balance, at: new Date().toISOString() });
    write(HISTORY_KEY, rows.slice(0, 20));
    renderHistory();
  }
  function renderHistory() {
    const rows = read(HISTORY_KEY, []).filter((row) => valid(row.address) && chains[row.chain]);
    $("wallet-history").innerHTML = rows.length ? rows.map((row) => `<div><span><b>${short(row.address)}</b><small>${escapeHtml(chains[row.chain].name)} · ${new Date(row.at).toLocaleString("ru-RU")}</small></span><strong>${Number(row.balance).toLocaleString("ru-RU", { maximumFractionDigits: 6 })} ${chains[row.chain].symbol}</strong></div>`).join("") : '<div class="wallet-empty">История проверок пуста</div>';
  }
  async function publicBalance(address, chainId) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(chains[chainId].rpc, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [address, "latest"] }), signal: controller.signal });
      if (!response.ok) throw Error("RPC");
      const data = await response.json();
      if (data.error || !/^0x[0-9a-f]+$/i.test(data.result || "")) throw Error("RPC");
      return data.result;
    } finally { clearTimeout(timer); }
  }
  async function loadBalance(address = account, chainId = chain || "0x1", useWallet = true) {
    if (!valid(address) || !chains[chainId]) return toast("Некорректный публичный адрес или сеть");
    try {
      status("Запрашиваем публичный баланс…");
      let raw;
      if (useWallet && provider()) {
        chainId = await provider().request({ method: "eth_chainId" });
        if (!chains[chainId]) throw Error("UNSUPPORTED");
        raw = await provider().request({ method: "eth_getBalance", params: [address, "latest"] });
      } else raw = await publicBalance(address, chainId);
      const value = Number(BigInt(raw)) / 1e18;
      chain = chainId;
      $("wallet-address").textContent = short(address);
      $("wallet-address").title = address;
      $("wallet-network").textContent = chains[chainId].name;
      $("wallet-balance").textContent = value.toLocaleString("ru-RU", { maximumFractionDigits: 6 });
      $("wallet-symbol").textContent = chains[chainId].symbol;
      $("wallet-copy").disabled = false;
      status("✓ Получены только публичные данные. Разрешения на перевод не запрашивались.");
      addHistory(address, chainId, value);
      renderNetworks();
    } catch (error) {
      status(error?.code === 4001 ? "Запрос отменён в кошельке." : error.message === "UNSUPPORTED" ? "Эта сеть пока не поддерживается." : "Публичный RPC временно недоступен. Попробуйте позже или другую сеть.", true);
    }
  }
  const boundProviders=new WeakSet();
  function bindProviderEvents(value){if(!value?.on||boundProviders.has(value))return;boundProviders.add(value);value.on("accountsChanged",accounts=>accounts?.[0]?(account=accounts[0],loadBalance(account).then(renderReceive)):disconnect());value.on("chainChanged",id=>{chain=id;pendingTransaction=null;$("transaction-send").hidden=true;updateMainnetState();if(account)loadBalance(account).then(renderReceive);else{renderNetworks();renderReceive()}})}
  async function connect() {
    if (!provider()) { renderProviderOptions(); return status("Кошелёк не найден. Откройте сайт во встроенном браузере кошелька или установите совместимый кошелёк.", true); }
    try {
      status("Ожидаем подтверждение адреса в кошельке…");
      bindProviderEvents(provider());
      const accounts = await provider().request({ method: "eth_requestAccounts" });
      if (!accounts?.[0]) throw Error();
      account = accounts[0];
      $("wallet-connect").hidden = true;
      $("wallet-disconnect").hidden = false;
      await loadBalance(account); renderReceive();
    } catch (error) { status(error?.code === 4001 ? "Подключение отменено." : "Не удалось подключить кошелёк.", true); }
  }
  function disconnect() {
    account = ""; chain = ""; renderReceive();
    $("wallet-address").textContent = "Не подключён"; $("wallet-address").removeAttribute("title");
    $("wallet-balance").textContent = "—"; $("wallet-network").textContent = "Сеть не выбрана"; $("wallet-symbol").textContent = "Баланс нативной монеты";
    $("wallet-connect").hidden = false; $("wallet-disconnect").hidden = true; $("wallet-copy").disabled = true;
    status("Связь удалена из интерфейса. При необходимости отключите сайт и в настройках кошелька."); renderNetworks();
  }
  let pendingTransaction = null;
  function parseUnits(value) { const normalized = String(value).trim(); if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(normalized)) throw Error("AMOUNT"); const [whole, fraction = ""] = normalized.split("."); return BigInt(whole) * 10n ** 18n + BigInt((fraction + "0".repeat(18)).slice(0, 18)); }
  function renderReceive() { const box=$("receive-request"),amount=$("receive-amount")?.value.trim(); if (!box) return; if (!account || !chains[chain]) { box.textContent="Сначала подключите кошелёк."; box.dataset.uri=""; return; } let uri=`ethereum:${account}@${BigInt(chain).toString()}`; try { if(amount) uri+=`?value=${parseUnits(amount)}`; } catch {} box.textContent=uri; box.dataset.uri=uri; }
  function mainnetActive(){return Date.now()<mainnetUntil}
  function updateMainnetState(){const active=mainnetActive(),left=Math.max(0,Math.ceil((mainnetUntil-Date.now())/60000));$("mainnet-state").textContent=active?`Mainnet включён ещё примерно на ${left} мин`:"Mainnet выключен";$("transaction-mode").textContent=active?"MAINNET GUARD":"TESTNET"}
  async function prepareTransaction(event) { event.preventDefault(); pendingTransaction=null; $("transaction-send").hidden=true; if(!account||!provider()) return status("Сначала подключите внешний кошелёк.",true); const network=chains[chain],isMainnet=!network?.testnet; if(isMainnet&&!mainnetActive()) { $("transaction-preview").innerHTML="<b>Реальная сеть заблокирована</b><span>Включите защищённый режим Mainnet ниже.</span>"; return; } const to=$("transaction-to").value.trim(),amount=$("transaction-amount").value.trim(); if(!valid(to)) return toast("Проверьте адрес получателя"); try { const value=parseUnits(amount); if(value<=0n||(isMainnet&&value>parseUnits("0.1"))) throw Error("AMOUNT"); const transaction={from:account,to,value:`0x${value.toString(16)}`},gas=await provider().request({method:"eth_estimateGas",params:[transaction]}); pendingTransaction={transaction,to,amount,isMainnet}; $("transaction-preview").innerHTML=`<b>${escapeHtml(network.name)}</b><span>Получатель: ${short(to)}</span><span>Сумма: ${escapeHtml(amount)} ${escapeHtml(network.symbol)}</span><span>Оценка газа: ${BigInt(gas).toLocaleString("ru-RU")} единиц</span>${isMainnet?`<div class="mainnet-confirm"><small>Повторите полный адрес и сумму</small><input id="confirm-mainnet-to" placeholder="0x…"><input id="confirm-mainnet-amount" placeholder="${escapeHtml(amount)}"></div>`:""}`; $("transaction-send").hidden=false; } catch(error) { $("transaction-preview").innerHTML=`<b>Не удалось подготовить перевод</b><span>${error?.code===4001?"Запрос отменён.":"Проверьте баланс, адрес, сумму и лимит 0,1 монеты."}</span>`; } }
  async function sendTransaction() { if(!pendingTransaction)return; if(pendingTransaction.isMainnet&&(!mainnetActive()||$("confirm-mainnet-to")?.value.trim().toLowerCase()!==pendingTransaction.to.toLowerCase()||$("confirm-mainnet-amount")?.value.trim()!==pendingTransaction.amount))return toast("Повтор адреса или суммы не совпадает"); const button=$("transaction-send"); button.disabled=true; try { const hash=await provider().request({method:"eth_sendTransaction",params:[pendingTransaction.transaction]}); const explorer=chains[chain].txExplorer||chains[chain].explorer.replace("/address/","/tx/"); pendingTransaction=null; button.hidden=true; $("transaction-preview").innerHTML=`<b>Транзакция передана внешнему кошельку</b><a href="${explorer}${hash}" target="_blank" rel="noopener noreferrer">Открыть в обозревателе ↗</a><small>Статус в блокчейне может обновиться не сразу.</small>`; } catch(error) { toast(error?.code===4001?"Подтверждение отменено":"Кошелёк не отправил транзакцию"); } finally { button.disabled=false; } }
  $("mainnet-unlock").onclick=()=>{if(!$("mainnet-adult").checked||$("mainnet-phrase").value.trim().toUpperCase()!=="ПОНИМАЮ РИСК")return toast("Подтвердите предупреждение и введите фразу точно");mainnetUntil=Date.now()+10*60*1000;$("mainnet-phrase").value="";updateMainnetState();toast("Mainnet включён на 10 минут")};updateMainnetState();
  $("transaction-form").onsubmit=prepareTransaction; $("transaction-send").onclick=sendTransaction; $("receive-amount").oninput=renderReceive; $("receive-copy").onclick=()=>{const uri=$("receive-request").dataset.uri;if(uri)navigator.clipboard?.writeText(uri).then(()=>toast("Запрос скопирован"))}; $("receive-share").onclick=async()=>{const uri=$("receive-request").dataset.uri;if(!uri)return toast("Сначала подключите кошелёк");try{if(navigator.share)await navigator.share({title:"Запрос Web3-платежа",text:uri});else await navigator.clipboard?.writeText(uri)}catch(error){if(error.name!=="AbortError")toast("Не удалось поделиться")}};
  $("watch-chain").innerHTML = Object.entries(chains).map(([id, item]) => `<option value="${id}">${item.name} · ${item.symbol}</option>`).join("");
  function renderProviderOptions(){const root=$("wallet-provider-list");root.innerHTML=discoveredProviders.map((item,index)=>`<button type="button" data-wallet-provider="${index}">${escapeHtml(item.info?.name||"EVM Wallet")}</button>`).join("")+(provider()?"":`<a href="https://metamask.app.link/dapp/${location.host}${location.pathname}" target="_blank" rel="noopener noreferrer">Открыть в MetaMask</a>`);root.querySelectorAll("[data-wallet-provider]").forEach(button=>button.onclick=()=>{selectedProvider=discoveredProviders[+button.dataset.walletProvider].provider;connect()})}
  window.addEventListener("eip6963:announceProvider",event=>{if(!discoveredProviders.some(item=>item.info?.uuid===event.detail.info?.uuid)){discoveredProviders.push(event.detail);renderProviderOptions()}});window.dispatchEvent(new Event("eip6963:requestProvider"));renderProviderOptions();
  $("wallet-connect").onclick = connect;
  $("wallet-disconnect").onclick = disconnect;
  $("wallet-copy").onclick = () => navigator.clipboard?.writeText($("wallet-address").title || "").then(() => toast("Адрес скопирован"));
  $("watch-form").onsubmit = (event) => {
    event.preventDefault();
    const address = $("watch-address").value.trim(), chainId = $("watch-chain").value, name = $("watch-name").value.trim().slice(0, 40) || `Адрес ${watch.length + 1}`;
    if (!valid(address)) return toast("Введите EVM-адрес: 0x и 40 символов");
    if (!watch.some((item) => item.address.toLowerCase() === address.toLowerCase() && item.chain === chainId)) watch.unshift({ address, name, chain: chainId });
    $("watch-address").value = ""; $("watch-name").value = ""; saveWatch(); loadBalance(address, chainId, false);
  };
  $("wallet-export").onclick = () => { const blob = new Blob([JSON.stringify({ version: 1, addresses: watch }, null, 2)], { type: "application/json" }), link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "valutkin-watch-only.json"; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); };
  $("wallet-import").onchange = async (event) => { try { const data = JSON.parse(await event.target.files[0].text()), rows = data.addresses; if (!Array.isArray(rows)) throw Error(); watch = rows.filter((item) => item && valid(item.address) && chains[item.chain]).slice(0, 30).map((item) => ({ address: item.address, chain: item.chain, name: String(item.name || "Адрес").slice(0, 40) })); saveWatch(); toast(`Импортировано: ${watch.length}`); } catch { toast("Не удалось импортировать файл"); } event.target.value = ""; };
  $("wallet-clear-history").onclick = () => { write(HISTORY_KEY, []); renderHistory(); };
  bindProviderEvents(provider());
  saveWatch(); renderNetworks(); renderHistory(); renderReceive();
})();
