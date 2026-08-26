"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useGlowRing } from "@/components/ui/glow-card";
import { PortfolioCard } from "./portfolio-card";
import { LISTING_STATUSES, LISTING_STATUS_LABELS } from "@/lib/property-categories";
import type { PublicListing } from "@/lib/listing-format";

// Same filter-tab visual as ContentLibraryGrid/TeamRoster/etc. — filters
// by whichever statuses are actually present, not the full fixed list, so
// a portfolio with only active + sold entries doesn't show empty tabs for
// pending/off_market/seeking_investors.
function StatusFilterTab({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  const ref = useGlowRing<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "shine-shape font-heading relative rounded-full px-4 py-2 text-sm font-semibold transition-[color,background-color,transform] duration-300 hover:-translate-y-0.5",
        selected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {label}
    </button>
  );
}

export function PortfolioGrid({ listings }: { listings: PublicListing[] }) {
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const presentStatuses = useMemo(
    () => LISTING_STATUSES.filter((s) => listings.some((l) => l.listing_status === s)),
    [listings]
  );
  const filtered = activeStatus ? listings.filter((l) => l.listing_status === activeStatus) : listings;

  if (listings.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        Nothing in the portfolio yet — check back soon.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {presentStatuses.length > 1 && (
        <div role="tablist" aria-label="Filter by status" className="flex flex-wrap justify-center gap-2">
          <StatusFilterTab label="All" selected={activeStatus === null} onSelect={() => setActiveStatus(null)} />
          {presentStatuses.map((s) => (
            <StatusFilterTab
              key={s}
              label={LISTING_STATUS_LABELS[s]}
              selected={activeStatus === s}
              onSelect={() => setActiveStatus(s)}
            />
          ))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((listing) => (
          <PortfolioCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
