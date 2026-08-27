import "server-only";

export type Coordinates = { lat: number; lng: number };

// Both services below are free, public, and keyless — no account, no
// billing, no API key to configure on Netlify. Client ask (2026-08-27):
// "would any of that require payment? If it does, we can just skip it."
// It doesn't, so nothing needs to be set up beyond this file existing.

/** Precise street-level geocoding via the US Census Bureau's public
 *  Geocoding Services API (TIGER/Line address ranges) — free, no key,
 *  official US government service. US addresses only. Returns null on
 *  no-match, a malformed address, or any network failure — this is
 *  best-effort enrichment, never something a save should block on. */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    const match = data?.result?.addressMatches?.[0];
    const coords = match?.coordinates;
    if (typeof coords?.y !== "number" || typeof coords?.x !== "number") return null;
    return { lat: coords.y, lng: coords.x };
  } catch {
    return null;
  }
}

/** Coarser fallback (a zip's centroid, not a street address) via
 *  Zippopotam.us — also free and keyless. Used when a full-address
 *  geocode fails/isn't available, and it's all a "search within N miles
 *  of this zip" query needs for the OTHER side of the comparison (the
 *  visitor's typed-in zip has no street address to geocode at all). Note
 *  the API's own JSON uses space-containing keys ("place name", "post
 *  code") for the fields this doesn't need — only latitude/longitude
 *  (no spaces) are read here. */
export async function geocodeZip(zip: string): Promise<Coordinates | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const place = data?.places?.[0];
    const lat = Number(place?.latitude);
    const lng = Number(place?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

/** Great-circle distance in miles between two points (Haversine) — all
 *  the "within N miles" radius search needs; no mapping library or paid
 *  distance-matrix API involved. */
export function distanceMiles(a: Coordinates, b: Coordinates): number {
  const EARTH_RADIUS_MI = 3958.8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MI * 2 * Math.asin(Math.sqrt(h));
}
