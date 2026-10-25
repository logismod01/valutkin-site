import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async request=>{
  if(request.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const authorization=request.headers.get("Authorization");
    if(!authorization)throw new Error("Требуется авторизация");
    const baseUrl=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY");
    const subject=Deno.env.get("VAPID_SUBJECT"),publicKey=Deno.env.get("VAPID_PUBLIC_KEY"),privateKey=Deno.env.get("VAPID_PRIVATE_KEY");
    if(!baseUrl||!anon||!subject||!publicKey||!privateKey)throw new Error("Push Secrets не настроены");
    const db=createClient(baseUrl,anon,{global:{headers:{Authorization:authorization}}}),{data:{user},error:userError}=await db.auth.getUser();
    if(userError||!user)throw new Error("Сессия недействительна");
    const [{data:alerts,error:alertsError},{data:subscriptions,error:subscriptionsError}]=await Promise.all([
      db.from("push_rate_alerts").select("id,asset_code,direction,target,last_triggered_at").eq("user_id",user.id).eq("enabled",true),
      db.from("push_subscriptions").select("id,endpoint,p256dh,auth").eq("user_id",user.id)
    ]);
    if(alertsError)throw alertsError;if(subscriptionsError)throw subscriptionsError;
    if(!alerts?.length||!subscriptions?.length)return Response.json({ok:true,checked:alerts?.length||0,sent:0},{headers:cors});
    const marketResponse=await fetch("https://open.er-api.com/v6/latest/USD",{headers:{accept:"application/json"}});if(!marketResponse.ok)throw new Error("Источник курсов недоступен");
    const market=await marketResponse.json(),rub=Number(market.rates?.RUB);if(!(rub>0))throw new Error("Некорректные курсы");
    webpush.setVapidDetails(subject,publicKey,privateKey);let sent=0;const triggered:string[]=[],expired:number[]=[];
    for(const alert of alerts){const quote=Number(market.rates?.[alert.asset_code]),price=alert.asset_code==="RUB"?1:quote>0?rub/quote:null;if(!price)continue;const hit=alert.direction==="above"?price>=Number(alert.target):price<=Number(alert.target),recent=alert.last_triggered_at&&Date.now()-new Date(alert.last_triggered_at).getTime()<6*60*60*1000;if(!hit||recent)continue;const payload=JSON.stringify({title:`${alert.asset_code}: цель достигнута`,body:`Текущий курс ${price.toFixed(4)} ₽, условие ${alert.direction==="above"?"выше":"ниже"} ${Number(alert.target).toFixed(4)} ₽`,url:"/valutkin-site/",tag:`rate-${alert.id}`});
      await Promise.all(subscriptions.map(async subscription=>{try{await webpush.sendNotification({endpoint:subscription.endpoint,keys:{p256dh:subscription.p256dh,auth:subscription.auth}},payload);sent++}catch(error){if(error?.statusCode===404||error?.statusCode===410)expired.push(subscription.id)}}));triggered.push(alert.id);}
    if(triggered.length)await db.from("push_rate_alerts").update({last_triggered_at:new Date().toISOString(),updated_at:new Date().toISOString()}).in("id",triggered).eq("user_id",user.id);
    if(expired.length)await db.from("push_subscriptions").delete().in("id",expired);
    return Response.json({ok:true,checked:alerts.length,triggered:triggered.length,sent},{headers:cors});
  }catch(error){return Response.json({ok:false,error:error instanceof Error?error.message:"Ошибка"},{status:400,headers:cors})}
});
