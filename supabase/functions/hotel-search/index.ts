const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

let tokenCache: { value: string; expiresAt: number } | null = null;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json; charset=utf-8" } });

async function amadeusToken(base: string, key: string, secret: string) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value;
  const response = await fetch(`${base}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: key, client_secret: secret }),
  });
  if (!response.ok) throw new Error("AUTH_PROVIDER");
  const data = await response.json();
  tokenCache = { value: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 900) * 1000 };
  return tokenCache.value;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  const key = Deno.env.get("AMADEUS_API_KEY");
  const secret = Deno.env.get("AMADEUS_API_SECRET");
  if (!key || !secret) return json({ error: "HOTEL_API_NOT_CONFIGURED" }, 503);
  try {
    const { city } = await request.json();
    if (typeof city !== "string" || city.length < 2 || city.length > 80 || !/^[\p{L}\p{M}\s.'’()-]+$/u.test(city)) return json({ error: "INVALID_CITY" }, 400);
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&format=json`);
    const geo = (await geoResponse.json()).results?.[0];
    if (!geo) return json({ error: "CITY_NOT_FOUND" }, 404);
    const base = Deno.env.get("AMADEUS_ENV") === "production" ? "https://api.amadeus.com" : "https://test.api.amadeus.com";
    const token = await amadeusToken(base, key, secret);
    const hotelsResponse = await fetch(`${base}/v1/reference-data/locations/hotels/by-geocode?latitude=${geo.latitude}&longitude=${geo.longitude}&radius=20&radiusUnit=KM&hotelSource=ALL`, { headers: { authorization: `Bearer ${token}` } });
    if (!hotelsResponse.ok) throw new Error("HOTELS_PROVIDER");
    const hotels = (await hotelsResponse.json()).data?.slice(0, 20) || [];
    if (!hotels.length) return json({ city, checkedAt: new Date().toISOString(), offers: [] });
    const ids = hotels.map((hotel: { hotelId: string }) => hotel.hotelId).join(",");
    const offersResponse = await fetch(`${base}/v3/shopping/hotel-offers?hotelIds=${encodeURIComponent(ids)}&adults=1&roomQuantity=1&bestRateOnly=true`, { headers: { authorization: `Bearer ${token}` } });
    if (!offersResponse.ok) throw new Error("OFFERS_PROVIDER");
    const rows = (await offersResponse.json()).data || [];
    const offers = rows.slice(0, 12).flatMap((row: any) => {
      const offer = row.offers?.[0];
      if (!offer?.price?.total) return [];
      return [{ hotelId: row.hotel?.hotelId, name: String(row.hotel?.name || "Hotel").slice(0, 120), total: Number(offer.price.total), currency: String(offer.price.currency || "").slice(0, 3), checkIn: offer.checkInDate, checkOut: offer.checkOutDate }];
    });
    return json({ city, checkedAt: new Date().toISOString(), source: "Amadeus Hotel APIs", offers });
  } catch (error) {
    console.error("hotel-search", error instanceof Error ? error.message : "unknown");
    return json({ error: "HOTEL_PROVIDER_UNAVAILABLE" }, 502);
  }
});
