#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="cnypuxlljlmqaltpugzm"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL_OUTPUT="${TMPDIR:-/tmp}/valutkin-push-scheduler.sql"
cd "$ROOT"

for command in node npx openssl python3; do
  command -v "$command" >/dev/null || { echo "Не найдена команда: $command" >&2; exit 1; }
done

printf 'Email для VAPID subject (не пароль): '
read -r CONTACT_EMAIL
[[ "$CONTACT_EMAIL" == *@* ]] || { echo "Введите корректный email" >&2; exit 1; }

echo "Создаём VAPID-ключи локально…"
VAPID_JSON="$(npx --yes web-push generate-vapid-keys --json)"
VAPID_PUBLIC_KEY="$(printf '%s' "$VAPID_JSON" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).publicKey))')"
VAPID_PRIVATE_KEY="$(printf '%s' "$VAPID_JSON" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).privateKey))')"
CRON_SECRET="$(openssl rand -hex 32)"
CRON_HASH="$(printf '%s' "$CRON_SECRET" | openssl dgst -sha256 -r | awk '{print $1}')"

[[ -n "$VAPID_PUBLIC_KEY" && -n "$VAPID_PRIVATE_KEY" && -n "$CRON_SECRET" ]] || { echo "Не удалось создать ключи" >&2; exit 1; }

echo "Записываем только публичный VAPID-ключ в клиентскую конфигурацию…"
VAPID_PUBLIC_KEY="$VAPID_PUBLIC_KEY" python3 - <<'PY'
import os
from pathlib import Path
path=Path("supabase-config.js")
text=path.read_text()
start='vapidPublicKey: "'
pos=text.find(start)
if pos < 0: raise SystemExit("Поле vapidPublicKey не найдено")
value_start=pos+len(start)
value_end=text.find('"',value_start)
text=text[:value_start]+os.environ["VAPID_PUBLIC_KEY"]+text[value_end:]
path.write_text(text)
PY

cat > "$SQL_OUTPUT" <<SQL
-- Выполните после supabase-setup.sql в Supabase SQL Editor.
insert into public.push_scheduler_config(id,secret_hash)
values('price-alerts','$CRON_HASH')
on conflict(id) do update set secret_hash=excluded.secret_hash,updated_at=now();
SQL
chmod 600 "$SQL_OUTPUT"

echo "Сохраняем закрытые ключи непосредственно в Supabase Secrets…"
npx --yes supabase secrets set \
  --project-ref "$PROJECT_REF" \
  "VAPID_SUBJECT=mailto:$CONTACT_EMAIL" \
  "VAPID_PUBLIC_KEY=$VAPID_PUBLIC_KEY" \
  "VAPID_PRIVATE_KEY=$VAPID_PRIVATE_KEY" \
  "PUSH_CRON_SECRET=$CRON_SECRET"

echo "Разворачиваем Edge Functions…"
for function_name in push-notify check-price-alerts; do
  npx --yes supabase functions deploy "$function_name" --project-ref "$PROJECT_REF"
done
npx --yes supabase functions deploy scheduled-price-alerts --no-verify-jwt --project-ref "$PROJECT_REF"

if command -v gh >/dev/null && gh auth status >/dev/null 2>&1; then
  echo "Сохраняем секрет планировщика в GitHub Actions…"
  printf '%s' "$CRON_SECRET" | gh secret set PUSH_CRON_SECRET --repo logismod01/valutkin-site
else
  echo "GitHub CLI не авторизован: добавьте PUSH_CRON_SECRET в GitHub Actions вручную." >&2
  echo "Значение не выводится из соображений безопасности; перезапустите этот мастер после входа в gh." >&2
fi

unset VAPID_PRIVATE_KEY CRON_SECRET VAPID_JSON

echo
echo "Готово без сохранения закрытых ключей в репозитории."
echo "1. Выполните основной supabase-setup.sql в SQL Editor."
echo "2. Затем выполните SQL-файл с хэшем: $SQL_OUTPUT"
echo "3. Опубликуйте обновлённый supabase-config.js (в нём только публичный ключ)."
echo "4. Запустите диагностику в Офлайн-центре сайта."
