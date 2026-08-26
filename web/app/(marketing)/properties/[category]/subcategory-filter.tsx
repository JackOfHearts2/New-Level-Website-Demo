"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGlowRing } from "@/components/ui/glow-card";
import { ListingRow } from "@/components/properties/listing-card";
import type { PublicListing } from "@/lib/listing-format";

export type SubcategoryGroup = { id: string; label: string; listings: PublicListing[] };

// Same filter-tab pattern as ContentLibraryGrid — client ask (2026-08-27):
// filters belong "on every page where we have multiple things," not just
// admin lists. This category already has real sectioning (subcategory
// rows), so the chips just let a visitor jump straight to one instead of
// scrolling past the others.
export function SubcategoryFilter({ groups }: { groups: SubcategoryGroup[] }) {
  const [active, setActive] = useState("all");
  const visible = active === "all" ? groups : groups.filter((g) => g.id === active);

  if (groups.length <= 1) {
    // One (or zero) non-empty subcategory — a filter with nothing to
    // narrow would just be decoration, so skip straight to the rows.
    return (
      <div className="space-y-12">
        {groups.map((g) => (
          <SubcategorySection key={g.id} group={g} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div role="tablist" aria-label="Filter by type" className="flex flex-wrap justify-center gap-2">
        <FilterTab label="All" selected={active === "all"} onSelect={() => setActive("all")} />
        {groups.map((g) => (
          <FilterTab key={g.id} label={g.label} selected={active === g.id} onSelect={() => setActive(g.id)} />
        ))}
      </div>
      {visible.map((g) => (
        <SubcategorySection key={g.id} group={g} />
      ))}
    </div>
  );
}

function SubcategorySection({ group }: { group: SubcategoryGroup }) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold">{group.label}</h2>
      <div className="mt-6">
        <ListingRow listings={group.listings} />
      </div>
    </div>
  );
}

function FilterTab({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
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
