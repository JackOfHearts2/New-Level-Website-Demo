import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_CATEGORIES, CURRENT_LISTING_STATUSES, type PropertyCategory } from "@/lib/property-categories";
import type { PublicListing } from "@/lib/listing-format";
import { geocodeZip, distanceMiles } from "@/lib/geocode";

export type { PublicListing };
export {
  propertyPhotoUrl,
  listingCoverUrl,
  formatListingPrice,
  groupBySubcategory,
} from "@/lib/listing-format";

const LISTING_COLUMNS =
  "id, title, category, subcategory, address_line1, city, state, zip, price, price_period, beds, baths, sqft, description, photos, listing_status, latitude, longitude";

// Real, structured filters against the live table — price/beds/baths/zip
// as actual WHERE predicates and a real ORDER BY, not the old homepage
// search box's approach (SEARCH_FILTERS' values got string-concatenated
// into a keyword blob matched against the separate static legacy content,
// never touching this table at all — see components/search-box.tsx and
// the `?category=<old-tier-id>` branch of properties/page.tsx, both still
// there but unrelated to this).
//
// `zip` alone is an exact match. `zip` + `radiusMiles` together switch to
// a real "within N miles of this zip" search (client ask, 2026-08-27) —
// free, no paid geocoding/distance-matrix API: the searched zip is
// resolved to a centroid via the free Zippopotam.us lookup (geocodeZip,
// lib/geocode.ts), then compared with Haversine (distanceMiles) against
// each listing's own stored latitude/longitude, which saveProperty
// (app/admin/(dashboard)/properties/actions.ts) populates automatically
// via the free Census geocoder whenever a listing is created/edited.
// Distance can't be expressed as a Postgres WHERE/ORDER BY without a
// stored-geometry column and PostGIS, so this fetches the
// price/beds/baths-filtered candidates first and does the distance
// filter/sort in JS — fine at this table's size, revisit with PostGIS if
// the listing count ever grows enough for that to matter.
export type ListingFilters = {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  zip?: string;
  radiusMiles?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

/** Currently-available listings only (active/pending) — the main
 *  Properties browsing pages and homepage search. Approved listings only,
 *  the same public-select policy this relies on (migration 0016) is the
 *  sole thing gating visibility beyond that. Real DB access, so this (and
 *  everything else in this file) needs to stay server-only — see
 *  lib/listing-format.ts for the pure formatting helpers that are safe to
 *  import from a Client Component. */
export async function getApprovedListings(
  category?: PropertyCategory,
  filters?: ListingFilters
): Promise<PublicListing[]> {
  const supabase = await createClient();
  const wantsRadiusSearch = Boolean(filters?.zip && filters?.radiusMiles);

  let query = supabase
    .from("properties")
    .select(LISTING_COLUMNS)
    .eq("status", "approved")
    .in("listing_status", CURRENT_LISTING_STATUSES);
  if (category) query = query.eq("category", category);
  if (filters?.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters?.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters?.minBeds != null) query = query.gte("beds", filters.minBeds);
  if (filters?.minBaths != null) query = query.gte("baths", filters.minBaths);
  // A plain zip filter can still be pushed down to SQL; a radius search
  // can't (matches may be in other zips entirely), so it's applied in JS
  // below instead, against every candidate that has coordinates.
  if (filters?.zip && !wantsRadiusSearch) query = query.eq("zip", filters.zip);
  query =
    filters?.sort === "price_asc"
      ? query.order("price", { ascending: true, nullsFirst: false })
      : filters?.sort === "price_desc"
        ? query.order("price", { ascending: false, nullsFirst: false })
        : query.order("created_at", { ascending: false });
  const { data } = await query.returns<PublicListing[]>();
  const listings = data ?? [];

  if (!wantsRadiusSearch) return listings;

  const center = await geocodeZip(filters!.zip!);
  if (!center) {
    // The typed zip didn't resolve (typo, non-US, or the free lookup is
    // briefly down) — degrade to an exact zip match rather than silently
    // returning everything or nothing.
    return listings.filter((l) => l.zip === filters!.zip);
  }

  const withDistance = listings
    .filter((l) => l.latitude != null && l.longitude != null)
    .map((l) => ({ listing: l, miles: distanceMiles(center, { lat: l.latitude!, lng: l.longitude! }) }))
    .filter((l) => l.miles <= filters!.radiusMiles!);

  // Distance is the whole point of this search, so it takes priority over
  // the general sort — unless the visitor explicitly asked for a price
  // sort, in which case respect that instead (already applied above).
  if (!filters?.sort || filters.sort === "newest") {
    withDistance.sort((a, b) => a.miles - b.miles);
  }
  return withDistance.map((l) => l.listing);
}

/** Every approved listing regardless of listing_status — the Full
 *  Portfolio page (client ask, 2026-08-27: "house" past transactions and
 *  investor-seeking properties too, tagged, without them cluttering the
 *  main browsing pages above). */
export async function getPortfolioListings(category?: PropertyCategory): Promise<PublicListing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(LISTING_COLUMNS)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data } = await query.returns<PublicListing[]>();
  return data ?? [];
}

export { PROPERTY_CATEGORIES };
