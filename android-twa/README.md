# Валюткин для Android (TWA)

Проект открывает опубликованную PWA `https://logismod01.github.io/valutkin-site/` как Trusted Web Activity.

## Сборка

1. Установите Android Studio с Android SDK 35 и JDK 17.
2. Откройте папку `android-twa`.
3. Дождитесь синхронизации Gradle.
4. Создайте собственный release keystore: **Build → Generate Signed Bundle / APK**.
5. Получите SHA-256 отпечаток release-сертификата.
6. Скопируйте `.well-known/assetlinks.template.json` в `.well-known/assetlinks.json`, заменив `RELEASE_SHA256_FINGERPRINT`.
7. Опубликуйте сайт, проверьте `https://logismod01.github.io/valutkin-site/.well-known/assetlinks.json` и соберите AAB.

Release keystore, пароли и закрытые ключи нельзя добавлять в Git. Публикация в Google Play требует отдельной учётной записи разработчика.

## Автоматическая сборка GitHub Actions

Workflow `.github/workflows/android.yml` проверяет Android-проект и собирает debug APK при изменениях.

Для ручной release-сборки создайте GitHub Environment `android-release` и добавьте secrets:

- `ANDROID_KEYSTORE_BASE64` — release keystore в Base64;
- `ANDROID_KEYSTORE_PASSWORD`;
- `ANDROID_KEY_ALIAS`;
- `ANDROID_KEY_PASSWORD`.

Затем откройте **Actions → Android TWA → Run workflow**, включите `Собрать подписанный AAB`. Keystore создаётся только на время job, удаляется после сборки и не попадает в artifact.
