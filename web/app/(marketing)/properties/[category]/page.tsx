import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { getApprovedListings, groupBySubcategory, PROPERTY_CATEGORIES, type ListingFilters } from "@/lib/properties-public";
import type { PropertyCategory } from "@/lib/property-categories";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";
import { SubcategoryFilter } from "./subcategory-filter";
import { ListingFilterBar } from "./listing-filters";

function parseFilters(sp: Record<string, string | string[] | undefined>): ListingFilters {
  const num = (v: string | string[] | undefined) => {
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  const sortRaw = str(sp.sort);
  return {
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    minBeds: num(sp.minBeds),
    minBaths: num(sp.minBaths),
    zip: str(sp.zip),
    sort: sortRaw === "price_asc" || sortRaw === "price_desc" ? sortRaw : "newest",
  };
}

// Deliberately no generateStaticParams here, unlike this site's other
// [slug] routes (services/team/blog) — those are static content baked
// into content.ts; this reads live from the properties table (admins add
// listings through /admin/properties at any time), so it needs to render
// per-request, not get frozen as a build-time snapshot.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = PROPERTY_CATEGORIES[category as PropertyCategory];
  return { title: cat ? `${cat.label} Properties · New Level` : "Properties · New Level" };
}

export default async function PropertyCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  const cat = PROPERTY_CATEGORIES[category as PropertyCategory];
  if (!cat) notFound();

  const filters = parseFilters(await searchParams);
  const hasActiveFilters = Boolean(
    filters.minPrice || filters.maxPrice || filters.minBeds || filters.minBaths || filters.zip
  );
  const listings = await getApprovedListings(category as PropertyCategory, filters);
  const bySubcategory = groupBySubcategory(listings);
  const groups = Object.entries(cat.subcategories)
    .map(([id, label]) => ({ id, label, listings: bySubcategory.get(id) ?? [] }))
    .filter((g) => g.listings.length > 0);

  return (
    <>
      <PageHero
        eyebrow="Properties"
        heading={cat.label}
        sub={`Browse ${cat.label.toLowerCase()} listings, sectioned by type.`}
        breadcrumbs={getBreadcrumbTrail(`/properties/${category}`)}
      />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {/* useSearchParams inside needs a Suspense boundary — same pattern
            as AutoSignInModal in (marketing)/layout.tsx. */}
        <Suspense fallback={<div className="mb-10 h-[86px]" />}>
          <ListingFilterBar />
        </Suspense>
        {groups.length > 0 ? (
          <SubcategoryFilter groups={groups} />
        ) : hasActiveFilters ? (
          <p className="text-muted-foreground text-center">
            No {cat.label.toLowerCase()} listings match those filters — try widening your search.
          </p>
        ) : (
          <p className="text-muted-foreground text-center">No {cat.label.toLowerCase()} listings yet — check back soon.</p>
        )}
      </section>

      <CrossNav current="properties" />
    </>
  );
}
