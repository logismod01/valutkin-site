# Публикация расширенных функций Валюткина

Этот файл описывает действия, которые нельзя безопасно выполнить из клиентского JavaScript.

## 1. Supabase

1. Откройте Supabase → SQL Editor.
2. Выполните актуальный `supabase-setup.sql` целиком.
3. Не добавляйте `service_role`, пароль базы или закрытые ключи в репозиторий.

## 2. Web Push

Автоматический мастер генерирует ключи локально, сохраняет закрытые значения напрямую в Supabase Secrets, разворачивает три Edge Functions и при доступном GitHub CLI создаёт Actions Secret:

```bash
chmod +x scripts/setup-push.sh
./scripts/setup-push.sh
```

Мастер не записывает VAPID private key или исходный scheduler secret в репозиторий. После запуска нужно выполнить созданный временный SQL-файл с SHA-256-хэшем секрета.

Разворачиваемые функции:

- `push-notify` — тестовые и клубные уведомления;
- `check-price-alerts` — проверка условий текущего пользователя;
- `scheduled-price-alerts` — фоновая проверка каждые 15 минут.

## 3. Android

1. Создайте release keystore в Android Studio.
2. Добавьте четыре секрета, перечисленные в `android-twa/README.md`, в Environment `android-release`.
3. Запустите Actions → Android TWA → Run workflow → `release=true`.
4. Скачайте `app-release.aab` и `assetlinks.json`.
5. Опубликуйте `assetlinks.json` как `.well-known/assetlinks.json`.
6. Только после этого загружайте AAB в Google Play Console.

## 4. Проверка

На сайте откройте боковое меню → Офлайн-центр → Проверить настройку. Все строки, кроме статуса аккаунта гостя, должны стать зелёными.

## Что нельзя публиковать

- release keystore;
- пароль keystore;
- VAPID private key;
- scheduler secret;
- `service_role`;
- пароль базы данных;
- GitHub token.
