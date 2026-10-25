import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

Deno.serve(async request=>{
  try{
    if(request.method!=="POST")return Response.json({ok:false,error:"POST required"},{status:405});
    const supplied=request.headers.get("x-cron-secret"),cronSecret=Deno.env.get("PUSH_CRON_SECRET");
    if(!supplied||!cronSecret||supplied!==cronSecret)return Response.json({ok:false,error:"Unauthorized"},{status:401});
    const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY"),subject=Deno.env.get("VAPID_SUBJECT"),publicKey=Deno.env.get("VAPID_PUBLIC_KEY"),privateKey=Deno.env.get("VAPID_PRIVATE_KEY");
    if(!url||!anon||!subject||!publicKey||!privateKey)throw new Error("Secrets не настроены");
    const db=createClient(url,anon),{data:rows,error}=await db.rpc("scheduled_push_targets",{p_secret:cronSecret});if(error)throw error;
    if(!rows?.length)return Response.json({ok:true,checked:0,triggered:0,sent:0});
    const response=await fetch("https://open.er-api.com/v6/latest/USD",{headers:{accept:"application/json"}});if(!response.ok)throw new Error("Источник курсов недоступен");
    const market=await response.json(),rub=Number(market.rates?.RUB);if(!(rub>0))throw new Error("Некорректные курсы");
    webpush.setVapidDetails(subject,publicKey,privateKey);
    const grouped=new Map<string,{alert:any,subscriptions:any[]}>();
    for(const row of rows){const entry=grouped.get(row.alert_id)||{alert:row,subscriptions:[]};entry.subscriptions.push({id:row.subscription_id,endpoint:row.endpoint,p256dh:row.p256dh,auth:row.auth});grouped.set(row.alert_id,entry);}
    const triggered:string[]=[],expired:number[]=[];let sent=0;
    for(const [id,{alert,subscriptions}] of grouped){const quote=Number(market.rates?.[alert.asset_code]),price=alert.asset_code==="RUB"?1:quote>0?rub/quote:null;if(!price)continue;const hit=alert.direction==="above"?price>=Number(alert.target):price<=Number(alert.target);if(!hit)continue;
      const payload=JSON.stringify({title:`${alert.asset_code}: цель достигнута`,body:`Курс ${price.toFixed(4)} ₽, цель ${Number(alert.target).toFixed(4)} ₽`,url:"/valutkin-site/",tag:`rate-${id}`});
      await Promise.all(subscriptions.map(async subscription=>{try{await webpush.sendNotification({endpoint:subscription.endpoint,keys:{p256dh:subscription.p256dh,auth:subscription.auth}},payload);sent++}catch(error){if(error?.statusCode===404||error?.statusCode===410)expired.push(subscription.id);else console.error("Push delivery",error)}}));triggered.push(id);
    }
    const {error:markError}=await db.rpc("mark_scheduled_alerts",{p_secret:cronSecret,p_alert_ids:triggered,p_expired_subscription_ids:[...new Set(expired)]});if(markError)throw markError;
    return Response.json({ok:true,checked:grouped.size,triggered:triggered.length,sent,expired:expired.length});
  }catch(error){console.error(error);return Response.json({ok:false,error:error instanceof Error?error.message:"Ошибка"},{status:500})}
});
