# Плановая проверка ценовых Push

Функция запускается GitHub Actions каждые 15 минут и работает без `service_role`. Доступ защищён отдельным случайным секретом, в базе хранится только его SHA-256.

1. Сгенерируйте секрет локально: `openssl rand -hex 32`.
2. Сохраните его в Supabase: `supabase secrets set PUSH_CRON_SECRET=...`.
3. В SQL Editor запишите хэш (подставьте тот же секрет):
   ```sql
   insert into public.push_scheduler_config(id,secret_hash)
   values('price-alerts',encode(extensions.digest('ВАШ_СЕКРЕТ','sha256'),'hex'))
   on conflict(id) do update set secret_hash=excluded.secret_hash,updated_at=now();
   ```
4. Deploy: `supabase functions deploy scheduled-price-alerts --no-verify-jwt`.
5. Добавьте тот же секрет в GitHub Actions Secret `PUSH_CRON_SECRET`.

Не публикуйте исходный секрет и не добавляйте его в Git.
