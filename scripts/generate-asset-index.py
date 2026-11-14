import json,re
from pathlib import Path

script=Path('script.js').read_text()
block=script[script.index('const CURRENCIES'):script.index('const CRYPTO_IDS')]
assets=[]
for code,name,icon,category in re.findall(r'"([A-Z0-9]+)"\s*:\s*\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]',block):
    assets.append({'id':f'market:{code}','code':code,'name':name,'icon':icon,'type':'crypto' if category=='crypto' else 'metal' if category=='metals' else 'currency','category':category,'href':f'index.html?category={category}&q={code}'})

stocks=Path('stocks/stocks.js').read_text()
main=stocks[stocks.index('const STOCKS'):]
category=None
seen=set()
for line in main.splitlines():
    match=re.match(r'\s*"([a-z]+)"\s*:\s*\[',line)
    if match: category=match.group(1)
    push=re.match(r'STOCKS\.([a-z]+)\.push',line)
    if push: category=push.group(1)
    for symbol,name,icon in re.findall(r'\{\s*symbol:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*flag:\s*"([^"]+)"',line):
        if symbol in seen: continue
        seen.add(symbol)
        assets.append({'id':f'stock:{symbol}','code':symbol,'name':name,'icon':icon,'type':'stock','category':category or 'stocks','href':f'stocks/?q={symbol}'})

assets.sort(key=lambda item:(item['type'],item['code']))
Path('data').mkdir(exist_ok=True)
Path('data/asset-index.js').write_text('window.VALUTKIN_ASSET_INDEX='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'Generated {len(assets)} assets: '+', '.join(f'{kind}={sum(x["type"]==kind for x in assets)}' for kind in ['currency','crypto','metal','stock']))
