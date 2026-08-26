import Link from "next/link";
import Image from "next/image";
import { GlowCard } from "@/components/ui/glow-card";
import { formatListingPrice, listingCoverUrl, type PublicListing } from "@/lib/listing-format";

// The flagship demo property keeps its own rich detail page (photo tour,
// booking widget, reviews, neighborhood map) — none of that is captured
// in the properties table's comparatively minimal columns, and rebuilding
// it there isn't what "migrate the listing into the new system" was
// asking for (client confirmed the schema/browsing side, 2026-08-27).
// Anything else falls through to the generic listing detail page.
const FLAGSHIP_TITLE = "New Level Executive House";

export function listingHref(listing: PublicListing): string {
  return listing.title === FLAGSHIP_TITLE ? "/property" : `/properties/${listing.category}/${listing.id}`;
}

export function ListingCard({ listing, className }: { listing: PublicListing; className?: string }) {
  const cover = listingCoverUrl(listing);
  const price = formatListingPrice(listing);
  const location = [listing.city, listing.state].filter(Boolean).join(", ");

  return (
    <GlowCard href={listingHref(listing)} className={`block overflow-hidden p-0 ${className ?? ""}`}>
      <div className="bg-muted relative aspect-4/3">
        {cover ? (
          <Image src={cover} alt={listing.title} fill sizes="280px" className="object-cover" />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-xs">No photo yet</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading truncate font-semibold">{listing.title}</h3>
        <p className="text-muted-foreground mt-1 truncate text-sm">
          {location || "Location on request"}
          {listing.beds != null && ` · ${listing.beds} bd`}
          {listing.baths != null && ` · ${listing.baths} ba`}
        </p>
        {price && <p className="mt-1 text-sm font-semibold">{price}</p>}
      </div>
    </GlowCard>
  );
}

export function ListingRow({
  listings,
  viewAllHref,
}: {
  listings: PublicListing[];
  viewAllHref?: string;
}) {
  if (listings.length === 0) {
    return <p className="text-muted-foreground text-sm">Nothing here yet.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {listings.map((listing) => (
          <div key={listing.id} className="w-64 shrink-0 snap-start">
            <ListingCard listing={listing} className="w-64" />
          </div>
        ))}
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-primary font-heading text-sm font-semibold">
          View all →
        </Link>
      )}
    </div>
  );
}
