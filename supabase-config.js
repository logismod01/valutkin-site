// Эти параметры являются публичными и предназначены для клиентского приложения.
// Никогда не добавляйте сюда service_role или secret key.
window.VALUTKIN_SUPABASE = {
  url: "https://cnypuxlljlmqaltpugzm.supabase.co",
  publishableKey: "sb_publishable_BbvpDTfdRXCcoqnefn-11Q_yCQ9UK3R",
  // Публичный VAPID-ключ безопасно хранить в клиенте. Закрытый ключ хранится только в Supabase Secrets.
  vapidPublicKey: ""
};

window.getSupabase = function () {
  if (!window.supabase?.createClient) throw new Error("Библиотека Supabase не загрузилась");
  if (!window.__valutkinSupabase) {
    window.__valutkinSupabase = window.supabase.createClient(
      window.VALUTKIN_SUPABASE.url,
      window.VALUTKIN_SUPABASE.publishableKey,
      { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
    );
  }
  return window.__valutkinSupabase;
};
