# Web Push Edge Function

Функция отправляет тестовое уведомление **только текущему авторизованному пользователю**. Она использует пользовательский JWT и RLS, а не `service_role`.

## 1. Создайте VAPID-ключи локально

```bash
npx web-push generate-vapid-keys
```

Никогда не добавляйте private key в Git или клиентский JavaScript.

## 2. Настройте Supabase Secrets

```bash
supabase secrets set VAPID_SUBJECT=mailto:your-email@example.com
supabase secrets set VAPID_PUBLIC_KEY=PUBLIC_KEY
supabase secrets set VAPID_PRIVATE_KEY=PRIVATE_KEY
```

## 3. Публичный ключ

Вставьте только `PUBLIC_KEY` в `window.VALUTKIN_SUPABASE.vapidPublicKey` файла `supabase-config.js`.

## 4. Deploy

```bash
supabase functions deploy push-notify
```

Перед этим выполните обновлённый `supabase-setup.sql`.

## Уведомления клуба

При создании предложения коллективной сделки игра вызывает эту же Edge Function с `proposalId`. SQL-функция `club_push_targets` возвращает подписки других участников только если вызывающий пользователь является автором свежего предложения. `service_role` не используется, а произвольный пользователь не может запросить Push-адреса чужого клуба.
