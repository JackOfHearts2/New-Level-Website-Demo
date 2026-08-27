"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGlowRing } from "@/components/ui/glow-card";
import { LeafletMap } from "@/components/properties/leaflet-map";
import { listingHref } from "@/components/properties/listing-card";
import { formatListingPrice, type PublicListing } from "@/lib/listing-format";
import { SubcategoryFilter, type SubcategoryGroup } from "./subcategory-filter";

// Client ask (2026-08-27): "the map view, can it not be like the little
// map we have [on /property]?" — same LeafletMap component, plotting
// every listing in this category that has coordinates (populated
// automatically by saveProperty's geocoding, see
// app/admin/(dashboard)/properties/actions.ts). List mode is unchanged
// (SubcategoryFilter's existing tab-per-subcategory rows).
export function ListingViewToggle({
  groups,
  listings,
}: {
  groups: SubcategoryGroup[];
  listings: PublicListing[];
}) {
  const [view, setView] = useState<"list" | "map">("list");
  const mappable = listings.filter(
    (l): l is PublicListing & { latitude: number; longitude: number } => l.latitude != null && l.longitude != null
  );

  return (
    <div>
      <div role="tablist" aria-label="View" className="mb-8 flex justify-center gap-2">
        <ViewTab label="List" selected={view === "list"} onSelect={() => setView("list")} />
        <ViewTab
          label={`Map${mappable.length ? ` (${mappable.length})` : ""}`}
          selected={view === "map"}
          onSelect={() => setView("map")}
        />
      </div>
      {view === "list" ? (
        <SubcategoryFilter groups={groups} />
      ) : (
        <LeafletMap
          height={480}
          points={mappable.map((l) => ({
            id: l.id,
            lat: l.latitude,
            lng: l.longitude,
            label: l.title,
            sublabel: formatListingPrice(l) ?? undefined,
            href: listingHref(l),
          }))}
        />
      )}
    </div>
  );
}

function ViewTab({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
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
