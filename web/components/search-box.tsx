"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { GlowCard, useGlowRing } from "@/components/ui/glow-card";
import { SEARCH_CATEGORIES, SEARCH_FILTERS } from "@/lib/content";

const FILTER_LABELS: Record<keyof typeof SEARCH_FILTERS, string> = {
  neighborhood: "Neighborhood",
  beds: "Min Beds",
  baths: "Min Baths",
  minPrice: "Min Price",
  maxPrice: "Max Price",
};

export function SearchBox() {
  const router = useRouter();
  const [activeTop, setActiveTop] = useState(SEARCH_CATEGORIES[0].id);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const activeCategory = SEARCH_CATEGORIES.find((c) => c.id === activeTop)!;
  const children = "children" in activeCategory ? activeCategory.children : undefined;
  const selectedId = children ? activeChild : activeTop;

  function selectTab(id: string) {
    setActiveTop(id);
    setActiveChild(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    const params = new URLSearchParams({ category: selectedId });
    if (keyword.trim()) params.set("q", keyword.trim());
    router.push(`/properties?${params.toString()}`);
  }

  function handleReset() {
    setKeyword("");
    setActiveChild(null);
    setActiveTop(SEARCH_CATEGORIES[0].id);
    // The 5 filter dropdowns below are uncontrolled (decorative — see their
    // comment in lib/content.ts) so a native form reset is enough for them.
    formRef.current?.reset();
  }

  return (
    // No more negative-margin overlap up into the hero — that layered
    // "float over the seam" trick read as the search box being awkwardly
    // wedged into the gap between the hero and the rest of the page. Plain
    // positive spacing on every breakpoint instead, so it reads as its own
    // clearly-separated section.
    <div className="relative z-10 mx-auto mt-10 max-w-5xl px-4 sm:px-6">
      <GlowCard className="bg-background/95 rounded-3xl p-4 backdrop-blur-xl sm:p-6">
        <div role="tablist" className="flex flex-wrap gap-2">
          {SEARCH_CATEGORIES.map((cat) => (
            <SearchTab
              key={cat.id}
              label={cat.label}
              selected={activeTop === cat.id}
              onSelect={() => selectTab(cat.id)}
            />
          ))}
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <label className="min-w-[200px] flex-1 text-sm">
            <span className="text-muted-foreground font-heading text-sm font-medium">
              Search
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Keyword, address, or neighborhood"
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>

          {children && (
            <label className="text-sm">
              <span className="sr-only">Rental Type</span>
              <select
                value={activeChild ?? ""}
                onChange={(e) => setActiveChild(e.target.value || null)}
                className="border-border mt-1 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Rental type…</option>
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* The field name lives inside the select itself (as a disabled
              default option) instead of a separate label sitting right next
              to it — that pairing used to read as cramped/clipped,
              especially once several of these sat side by side. Matches the
              "Rental type…" select above, which already worked this way. */}
          {(Object.keys(SEARCH_FILTERS) as (keyof typeof SEARCH_FILTERS)[]).map((key) => (
            <label key={key} className="text-sm">
              <span className="sr-only">{FILTER_LABELS[key]}</span>
              <select
                defaultValue=""
                className="border-border mt-1 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" disabled>
                  {FILTER_LABELS[key]}
                </option>
                {SEARCH_FILTERS[key].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="font-heading text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-semibold"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={!selectedId}
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-6 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Search
            </button>
          </div>
        </form>
      </GlowCard>
    </div>
  );
}

function SearchTab({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
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
        selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {label}
    </button>
  );
}
