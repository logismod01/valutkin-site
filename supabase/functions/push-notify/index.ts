import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async request=>{
  if(request.method==="OPTIONS")return new Response("ok",{headers:cors});
  try{
    const authorization=request.headers.get("Authorization");
    if(!authorization)throw new Error("Требуется авторизация");
    const url=Deno.env.get("SUPABASE_URL"),anon=Deno.env.get("SUPABASE_ANON_KEY");
    const subject=Deno.env.get("VAPID_SUBJECT"),publicKey=Deno.env.get("VAPID_PUBLIC_KEY"),privateKey=Deno.env.get("VAPID_PRIVATE_KEY");
    if(!url||!anon||!subject||!publicKey||!privateKey)throw new Error("VAPID Secrets не настроены");
    const db=createClient(url,anon,{global:{headers:{Authorization:authorization}}});
    const {data:{user},error:userError}=await db.auth.getUser();
    if(userError||!user)throw new Error("Сессия недействительна");
    const {title="Валюткин",body="Новое уведомление",url:target="/valutkin-site/"}=await request.json().catch(()=>({}));
    const safeTitle=String(title).slice(0,80),safeBody=String(body).slice(0,240),safeUrl=String(target).startsWith("/")||String(target).startsWith("https://logismod01.github.io/")?String(target):"/valutkin-site/";
    const {data:subscriptions,error}=await db.from("push_subscriptions").select("id,endpoint,p256dh,auth").eq("user_id",user.id);
    if(error)throw error;
    webpush.setVapidDetails(subject,publicKey,privateKey);
    let sent=0;const expired:number[]=[];
    await Promise.all((subscriptions||[]).map(async subscription=>{try{await webpush.sendNotification({endpoint:subscription.endpoint,keys:{p256dh:subscription.p256dh,auth:subscription.auth}},JSON.stringify({title:safeTitle,body:safeBody,url:safeUrl,tag:"valutkin-test"}));sent++}catch(error){if(error?.statusCode===404||error?.statusCode===410)expired.push(subscription.id);else console.error("Push delivery",error)}}));
    if(expired.length)await db.from("push_subscriptions").delete().in("id",expired);
    return Response.json({ok:true,sent,expired:expired.length},{headers:cors});
  }catch(error){return Response.json({ok:false,error:error instanceof Error?error.message:"Ошибка"},{status:400,headers:cors})}
});
