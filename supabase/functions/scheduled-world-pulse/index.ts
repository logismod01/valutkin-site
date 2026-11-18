import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const ASSETS=["EUR","CNY","GBP","JPY","KZT","TRY"];
Deno.serve(async request=>{
  try{
    if(request.method!=="POST")return Response.json({ok:false,error:"POST required"},{status:405});
    const supplied=request.headers.get("x-cron-secret"),secret=Deno.env.get("PUSH_CRON_SECRET");
    if(!supplied||!secret||supplied!==secret)return Response.json({ok:false,error:"Unauthorized"},{status:401});
    const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),subject=Deno.env.get("VAPID_SUBJECT"),publicKey=Deno.env.get("VAPID_PUBLIC_KEY"),privateKey=Deno.env.get("VAPID_PRIVATE_KEY");
    if(!url||!anon||!subject||!publicKey||!privateKey)throw Error("Push secrets are not configured");
    const response=await fetch("https://open.er-api.com/v6/latest/USD",{headers:{accept:"application/json"}});if(!response.ok)throw Error("Rate source unavailable");
    const market=await response.json(),rates=market.rates||{},rub=Number(rates.RUB);if(!(rub>0))throw Error("Invalid rates");
    const quotes=Object.fromEntries(ASSETS.map(code=>[code,rub/Number(rates[code])]).filter(([,v])=>Number.isFinite(v)));
    const db=createClient(url,anon),{data:rows,error}=await db.rpc("scheduled_world_push_targets",{p_secret:secret});if(error)throw error;
    webpush.setVapidDetails(subject,publicKey,privateKey);let sent=0;const expired:number[]=[],digestUsers:string[]=[],importantUsers:string[]=[];const now=new Date();
    for(const row of rows||[]){
      const wanted=(row.assets||ASSETS).filter((x:string)=>quotes[x]),previous=row.previous_rates||{},changes=wanted.map((code:string)=>({code,value:quotes[code],change:previous[code]?((quotes[code]/Number(previous[code]))-1)*100:0})).sort((a:any,b:any)=>Math.abs(b.change)-Math.abs(a.change));
      const localHour=Number(new Intl.DateTimeFormat("en-US",{timeZone:row.timezone||"UTC",hour:"2-digit",hour12:false}).format(now))%24,localDate=new Intl.DateTimeFormat("en-CA",{timeZone:row.timezone||"UTC",year:"numeric",month:"2-digit",day:"2-digit"}).format(now),digestKey=`${localDate}-${localHour}`;
      const digest=(row.mode==="mixed"||row.mode==="digest")&&(row.digest_hours||[9,19]).includes(localHour)&&row.last_digest_key!==digestKey;
      const leader=changes[0],important=(row.mode==="mixed"||row.mode==="important")&&leader&&Math.abs(leader.change)>=Number(row.threshold||1.5)&&(!row.last_important_at||Date.now()-new Date(row.last_important_at).getTime()>6*3600000);
      if(!digest&&!important)continue;
      const title=important?`${leader.code}: заметное изменение ${leader.change>0?"+":""}${leader.change.toFixed(2)}%`:`Мировой пульс · ${localHour}:00`,body=important?`Ориентир ${leader.value.toFixed(2)} ₽. Сравните с официальным источником.`:changes.slice(0,3).map((x:any)=>`${x.code} ${x.value.toFixed(2)} ₽${x.change?` (${x.change>0?"+":""}${x.change.toFixed(1)}%)`:""}`).join(" · ");
      try{await webpush.sendNotification({endpoint:row.endpoint,keys:{p256dh:row.p256dh,auth:row.auth}},JSON.stringify({title,body,url:"/valutkin-site/phone-widget.html",tag:important?`world-${leader.code}`:`digest-${digestKey}`}));sent++;(important?importantUsers:digestUsers).push(row.user_id)}catch(e){if(e?.statusCode===404||e?.statusCode===410)expired.push(row.subscription_id);else console.error("world-pulse delivery",e)}
    }
    const {error:markError}=await db.rpc("mark_world_push_run",{p_secret:secret,p_rates:quotes,p_digest_user_ids:[...new Set(digestUsers)],p_important_user_ids:[...new Set(importantUsers)],p_expired_subscription_ids:[...new Set(expired)]});if(markError)throw markError;
    return Response.json({ok:true,checked:rows?.length||0,sent,expired:expired.length});
  }catch(error){console.error(error);return Response.json({ok:false,error:error instanceof Error?error.message:"Error"},{status:500})}
});
