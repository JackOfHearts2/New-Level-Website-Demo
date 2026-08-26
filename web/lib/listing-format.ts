// Deliberately has NO "server-only" import, unlike properties-public.ts —
// this is pure formatting/typing with no DB access, so it's safe to import
// from a Client Component (e.g. listing-card.tsx, reused inside the
// properties/[category] subcategory filter's "use client" tree). Splitting
// this out of properties-public.ts fixed a real build error: that file's
// "server-only" + real Supabase server client got dragged into the
// browser bundle the moment a Client Component imported anything from it,
// even just a type.
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type PublicListing = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  price: number | null;
  price_period: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  description: string | null;
  photos: { path: string; uploadedAt: string }[];
  listing_status: string;
};

// getPublicUrl doesn't need auth/RLS — it's pure string construction from
// the project URL, but the supabase-js client still wants an instance to
// call it on. A separate lightweight client (not the cookie-bound
// request-scoped one) avoids threading the request-scoped client through
// every call site just for this.
function createPublicUrlClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export function propertyPhotoUrl(path: string): string {
  return createPublicUrlClient().storage.from("property-photos").getPublicUrl(path).data.publicUrl;
}

export function listingCoverUrl(listing: PublicListing): string | null {
  const first = listing.photos?.[0];
  return first ? propertyPhotoUrl(first.path) : null;
}

export function formatListingPrice(listing: PublicListing): string | null {
  if (listing.price == null) return null;
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(listing.price);
  return listing.price_period === "sale" ? amount : `${amount}/${listing.price_period}`;
}

export function groupBySubcategory(listings: PublicListing[]) {
  const groups = new Map<string, PublicListing[]>();
  for (const listing of listings) {
    if (!groups.has(listing.subcategory)) groups.set(listing.subcategory, []);
    groups.get(listing.subcategory)!.push(listing);
  }
  return groups;
}
