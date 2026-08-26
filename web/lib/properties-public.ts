import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PROPERTY_CATEGORIES, type PropertyCategory } from "@/lib/property-categories";
import type { PublicListing } from "@/lib/listing-format";

export type { PublicListing };
export {
  propertyPhotoUrl,
  listingCoverUrl,
  formatListingPrice,
  groupBySubcategory,
} from "@/lib/listing-format";

/** Approved listings only — the same public-select policy this relies on
 *  (migration 0016) is the sole thing gating visibility, no extra
 *  filtering needed here. Real DB access, so this (and only this) needs
 *  to stay server-only — see lib/listing-format.ts for the pure
 *  formatting helpers that are safe to import from a Client Component. */
export async function getApprovedListings(category?: PropertyCategory): Promise<PublicListing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(
      "id, title, category, subcategory, address_line1, city, state, price, price_period, beds, baths, sqft, description, photos"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data } = await query.returns<PublicListing[]>();
  return data ?? [];
}

export { PROPERTY_CATEGORIES };
