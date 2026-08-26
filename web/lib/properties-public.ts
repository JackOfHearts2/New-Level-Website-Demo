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

/** Currently-available listings only (active/pending) — the main
 *  Properties browsing pages and homepage search. Approved listings only,
 *  the same public-select policy this relies on (migration 0016) is the
 *  sole thing gating visibility beyond that. Real DB access, so this (and
 *  everything else in this file) needs to stay server-only — see
 *  lib/listing-format.ts for the pure formatting helpers that are safe to
 *  import from a Client Component. */
export async function getApprovedListings(category?: PropertyCategory): Promise<PublicListing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(LISTING_COLUMNS)
    .eq("status", "approved")
    .in("listing_status", CURRENT_LISTING_STATUSES)
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
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
