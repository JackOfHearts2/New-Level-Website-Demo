"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const BEDS_BATHS_OPTIONS = ["1", "2", "3", "4", "5"];
const RADIUS_OPTIONS = ["5", "10", "15", "25", "50"];
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const fieldClass =
  "border-border bg-background text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Real filters against the live `properties` table (see
// getApprovedListings in lib/properties-public.ts) — unlike the homepage
// search box's decorative SEARCH_FILTERS, submitting this actually
// narrows/sorts the query, via a plain URL search-param round trip so
// results stay a real server fetch (bookmarkable/shareable too, for
// free). Read from useSearchParams so a reload or a shared link restores
// the same filters, not just the fields' own uncontrolled defaults.
export function ListingFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [minBeds, setMinBeds] = useState(searchParams.get("minBeds") ?? "");
  const [minBaths, setMinBaths] = useState(searchParams.get("minBaths") ?? "");
  const [zip, setZip] = useState(searchParams.get("zip") ?? "");
  const [radiusMiles, setRadiusMiles] = useState(searchParams.get("radiusMiles") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");

  const hasActiveFilters = Boolean(
    searchParams.get("minPrice") ||
      searchParams.get("maxPrice") ||
      searchParams.get("minBeds") ||
      searchParams.get("minBaths") ||
      searchParams.get("zip") ||
      (searchParams.get("sort") && searchParams.get("sort") !== "newest")
  );

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minBeds) params.set("minBeds", minBeds);
    if (minBaths) params.set("minBaths", minBaths);
    if (zip.trim()) params.set("zip", zip.trim());
    // A radius only means anything alongside a zip to measure it from.
    if (zip.trim() && radiusMiles) params.set("radiusMiles", radiusMiles);
    if (sort !== "newest") params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function reset() {
    setMinPrice("");
    setMaxPrice("");
    setMinBeds("");
    setMinBaths("");
    setZip("");
    setRadiusMiles("");
    setSort("newest");
    router.push(pathname);
  }

  return (
    <form
      onSubmit={apply}
      className="border-border bg-card mb-10 flex flex-wrap items-end gap-4 rounded-2xl border p-5"
    >
      <label className="text-sm">
        <span className="font-heading text-sm font-medium">Min price</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="No min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className={cn(fieldClass, "w-28")}
        />
      </label>
      <label className="text-sm">
        <span className="font-heading text-sm font-medium">Max price</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="No max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={cn(fieldClass, "w-28")}
        />
      </label>
      <label className="text-sm">
        <span className="font-heading text-sm font-medium">Beds</span>
        <select value={minBeds} onChange={(e) => setMinBeds(e.target.value)} className={cn(fieldClass, "w-24")}>
          <option value="">Any</option>
          {BEDS_BATHS_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="font-heading text-sm font-medium">Baths</span>
        <select value={minBaths} onChange={(e) => setMinBaths(e.target.value)} className={cn(fieldClass, "w-24")}>
          <option value="">Any</option>
          {BEDS_BATHS_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}+
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="font-heading text-sm font-medium">Zip code</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={10}
          placeholder="Any"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          className={cn(fieldClass, "w-28")}
        />
      </label>
      <label className="text-sm">
        <span className="font-heading text-sm font-medium">Within</span>
        <select
          value={radiusMiles}
          onChange={(e) => setRadiusMiles(e.target.value)}
          disabled={!zip.trim()}
          className={cn(fieldClass, "w-32 disabled:opacity-50")}
        >
          <option value="">Exact zip only</option>
          {RADIUS_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n} miles
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="font-heading text-sm font-medium">Sort</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={cn(fieldClass, "w-44")}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className="ml-auto flex gap-2">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={reset}
            className="font-heading text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-semibold"
          >
            Reset
          </button>
        )}
        <button
          type="submit"
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-5 py-2 text-sm font-semibold"
        >
          Apply filters
        </button>
      </div>
    </form>
  );
}
