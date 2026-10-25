#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMMON=(--recursive --binary-files=without-match --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.gradle --exclude='*.md' --exclude='check-secrets.sh')

if grep "${COMMON[@]}" --line-number --extended-regexp 'sb_secret_|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY' .; then
  echo "Найден возможный закрытый ключ" >&2
  exit 1
fi
if grep "${COMMON[@]}" --line-number --ignore-case --extended-regexp 'service_role[[:space:]]*[:=]' .; then
  echo "Найдено возможное присваивание service_role" >&2
  exit 1
fi

echo "Закрытые ключи в отслеживаемых файлах не обнаружены."
