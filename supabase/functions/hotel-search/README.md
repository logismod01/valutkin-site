# Hotel search Edge Function

Secure server-side adapter for Amadeus Hotel APIs. The browser never receives the provider secret.

## Before enabling

An adult account owner should review and accept the current Amadeus for Developers terms, age requirements, quotas and production conditions. Do not place either secret in frontend files or chat.

Set secrets directly in the Supabase dashboard or authenticated CLI:

```bash
supabase secrets set AMADEUS_API_KEY=... AMADEUS_API_SECRET=... AMADEUS_ENV=test
supabase functions deploy hotel-search
```

Use `AMADEUS_ENV=production` only after the provider has approved production access. The function returns HTTP 503 with `HOTEL_API_NOT_CONFIGURED` until both secrets exist.

The endpoint accepts only a city name, geocodes it through Open-Meteo, requests nearby hotels and returns a reduced offer payload. Prices are still subject to taxes, availability and provider terms and must be confirmed before booking.
