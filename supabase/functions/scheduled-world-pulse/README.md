# scheduled-world-pulse

Hourly cron endpoint for opt-in market digests and material FX changes. It uses the same VAPID and `PUSH_CRON_SECRET` secrets as existing scheduled push functions.

1. Apply `supabase-setup.sql`.
2. Add scheduler hash without exposing the secret:
   `insert into push_scheduler_config(id,secret_hash) values ('world-pulse',encode(extensions.digest('YOUR_CRON_SECRET','sha256'),'hex')) on conflict(id) do update set secret_hash=excluded.secret_hash;`
3. Deploy this function and call it hourly with POST + `x-cron-secret`.

Never put the cron secret or VAPID private key in browser code.
