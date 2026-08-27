import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_CATEGORIES, CURRENT_LISTING_STATUSES, type PropertyCategory } from "@/lib/property-categories";
import type { PublicListing } from "@/lib/listing-format";

export type { PublicListing };
export {
  propertyPhotoUrl,
  listingCoverUrl,
  formatListingPrice,
  groupBySubcategory,
} from "@/lib/listing-format";

const LISTING_COLUMNS =
  "id, title, category, subcategory, address_line1, city, state, price, price_period, beds, baths, sqft, description, photos, listing_status";

// Real, structured filters against the live table — price/beds/baths/zip
// as actual WHERE predicates and a real ORDER BY, not the old homepage
// search box's approach (SEARCH_FILTERS' values got string-concatenated
// into a keyword blob matched against the separate static legacy content,
// never touching this table at all — see components/search-box.tsx and
// the `?category=<old-tier-id>` branch of properties/page.tsx, both still
// there but unrelated to this). `zip` is an exact match, not a radius —
// true "distance from a zip code" needs geocoded coordinates + a
// distance calculation (or a paid geocoding/places API), which is a real
// scoping decision, not something to guess into this pass.
export type ListingFilters = {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  zip?: string;
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
  if (filters?.zip) query = query.eq("zip", filters.zip);
  query =
    filters?.sort === "price_asc"
      ? query.order("price", { ascending: true, nullsFirst: false })
      : filters?.sort === "price_desc"
        ? query.order("price", { ascending: false, nullsFirst: false })
        : query.order("created_at", { ascending: false });
  const { data } = await query.returns<PublicListing[]>();
  return data ?? [];
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
