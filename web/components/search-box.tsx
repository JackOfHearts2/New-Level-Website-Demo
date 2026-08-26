"use client";

import { useState } from "react";
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

type Filters = Record<keyof typeof SEARCH_FILTERS, string>;
const EMPTY_FILTERS: Filters = {
  neighborhood: "",
  beds: "",
  baths: "",
  minPrice: "",
  maxPrice: "",
};

export function SearchBox() {
  const router = useRouter();
  const [activeTop, setActiveTop] = useState(SEARCH_CATEGORIES[0].id);
  const [activeChild, setActiveChild] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const activeCategory = SEARCH_CATEGORIES.find((c) => c.id === activeTop)!;
  const children = "children" in activeCategory ? activeCategory.children : undefined;
  const selectedId = children ? activeChild : activeTop;
  // Selling/Home Evaluation aren't browsable listing categories — see the
  // SEARCH_CATEGORIES comment in lib/content.ts.
  const contactTopic = "contactTopic" in activeCategory ? activeCategory.contactTopic : undefined;

  function selectTab(id: string) {
    setActiveTop(id);
    setActiveChild(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (contactTopic) {
      router.push(`/contact?topic=${contactTopic}`);
      return;
    }
    if (!selectedId) return;
    // The demo's ~8-listing dataset isn't real MLS inventory, so these can't
    // drive a real structured filter — but folding a selected filter into
    // the same keyword search (matchesKeyword() in properties/page.tsx) at
    // least makes it affect the result set instead of being decorative.
    const terms = [keyword.trim(), ...Object.values(filters).filter(Boolean)].join(" ").trim();
    const params = new URLSearchParams({ category: selectedId });
    if (terms) params.set("q", terms);
    router.push(`/properties?${params.toString()}`);
  }

  function handleReset() {
    setKeyword("");
    setActiveChild(null);
    setActiveTop(SEARCH_CATEGORIES[0].id);
    setFilters(EMPTY_FILTERS);
  }

  return (
    // No more negative-margin overlap up into the hero — that layered
    // "float over the seam" trick read as the search box being awkwardly
    // wedged into the gap between the hero and the rest of the page. Plain
    // positive spacing on every breakpoint instead, so it reads as its own
    // clearly-separated section.
    <div data-tour="search" className="relative z-10 mx-auto mt-10 max-w-5xl px-4 sm:px-6">
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

        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
          {contactTopic ? (
            <p className="text-foreground min-w-[200px] flex-1 text-sm">
              {activeCategory.label === "Selling"
                ? "Tell us about the property you're looking to sell — we'll follow up."
                : "Request a free home valuation — we'll follow up with an estimate."}
            </p>
          ) : (
            <label className="min-w-[200px] flex-1 text-sm">
              <span className="text-foreground font-heading text-sm font-medium">
                Search
              </span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Keyword, address, or neighborhood"
                className="border-border placeholder:text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
          )}

          {!contactTopic && children && (
            <label className="text-sm">
              <span className="sr-only">Rental Type</span>
              <select
                value={activeChild ?? ""}
                onChange={(e) => setActiveChild(e.target.value || null)}
                className="border-border bg-background text-foreground mt-1 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="" className="bg-background text-foreground">
                  Rental type…
                </option>
                {children.map((child) => (
                  <option
                    key={child.id}
                    value={child.id}
                    className="bg-background text-foreground"
                  >
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
          {!contactTopic &&
            (Object.keys(SEARCH_FILTERS) as (keyof typeof SEARCH_FILTERS)[]).map((key) => (
              <FilterSelect
                key={key}
                label={FILTER_LABELS[key]}
                options={SEARCH_FILTERS[key]}
                value={filters[key]}
                onChange={(v) => setFilters((f) => ({ ...f, [key]: v }))}
              />
            ))}

          <div className="ml-auto flex gap-2">
            <ResetSearchButton label="Reset" variant="ghost" onClick={handleReset} />
            <ResetSearchButton
              label={contactTopic ? "Get started" : "Search"}
              variant="primary"
              type="submit"
              disabled={!contactTopic && !selectedId}
            />
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
        selected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {label}
    </button>
  );
}

// A <select> can't host a child <span> ring element the way GlowCard's other
// wrappers do (only <option>s are valid children), so the glow ring lives on
// this label wrapper instead — same useGlowRing + glow-card__ring pattern,
// just anchored one element up.
function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useGlowRing<HTMLLabelElement>();
  return (
    <label
      ref={ref}
      className="glow-card relative rounded-lg border border-border text-sm transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className="glow-card__ring" aria-hidden />
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background text-foreground rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="" className="bg-background text-foreground">
          {label}
        </option>
        {options
          .filter((opt) => opt !== "Any")
          .map((opt) => (
            <option key={opt} value={opt} className="bg-background text-foreground">
              {opt}
            </option>
          ))}
      </select>
    </label>
  );
}

function ResetSearchButton({
  label,
  variant,
  onClick,
  type = "button",
  disabled,
}: {
  label: string;
  variant: "ghost" | "primary";
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const ref = useGlowRing<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "glow-card relative font-heading rounded-lg px-4 py-2 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/80 border-transparent px-6"
          : "text-foreground border-transparent"
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {label}
    </button>
  );
}
