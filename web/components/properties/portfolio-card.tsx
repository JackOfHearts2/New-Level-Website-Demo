import Image from "next/image";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { formatListingPrice, listingCoverUrl, type PublicListing } from "@/lib/listing-format";
import { listingHref } from "@/components/properties/listing-card";
import { CURRENT_LISTING_STATUSES, LISTING_STATUS_LABELS, type ListingStatus } from "@/lib/property-categories";

function StatusPill({ status }: { status: string }) {
  const label = LISTING_STATUS_LABELS[status as ListingStatus] ?? status;
  return (
    <ShinePill className="font-heading bg-background/90 text-foreground absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold uppercase">
      {label}
    </ShinePill>
  );
}

/** Full Portfolio's card (client ask, 2026-08-27): active/pending listings
 *  stay clickable into the real detail page, same as everywhere else —
 *  but a sold/off-market/seeking-investors entry is a record, not
 *  something to browse into ("we don't need to put all the information on
 *  there"). Deliberately plain, non-hover markup for those, same "no
 *  hover feedback on a non-actionable block" rule the old static site's
 *  .other-card placeholders followed — GlowCard's hover ring would imply
 *  an interaction that doesn't exist here. */
export function PortfolioCard({ listing }: { listing: PublicListing }) {
  const isCurrent = (CURRENT_LISTING_STATUSES as string[]).includes(listing.listing_status);
  const cover = listingCoverUrl(listing);
  const price = formatListingPrice(listing);
  const location = [listing.city, listing.state].filter(Boolean).join(", ");

  const media = (
    <div className="bg-muted relative aspect-4/3">
      {cover ? (
        <Image src={cover} alt={listing.title} fill sizes="280px" className="object-cover" />
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center text-xs">No photo</div>
      )}
      <StatusPill status={listing.listing_status} />
    </div>
  );

  const body = (
    <div className="p-4">
      <h3 className="font-heading truncate font-semibold">{listing.title}</h3>
      <p className="text-muted-foreground mt-1 truncate text-sm">{location || "Location on request"}</p>
      {isCurrent && price && <p className="mt-1 text-sm font-semibold">{price}</p>}
    </div>
  );

  if (isCurrent) {
    return (
      <GlowCard href={listingHref(listing)} className="block overflow-hidden p-0">
        {media}
        {body}
      </GlowCard>
    );
  }

  return (
    <div className="border-border overflow-hidden rounded-2xl border">
      {media}
      {body}
    </div>
  );
}
