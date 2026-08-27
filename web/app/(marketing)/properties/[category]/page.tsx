import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { ShineListItem } from "@/components/ui/shine-shape";
import { FaqList } from "@/components/faq-list";
import { getApprovedListings, groupBySubcategory, PROPERTY_CATEGORIES, type ListingFilters } from "@/lib/properties-public";
import { PROPERTY_CATEGORY_INFO } from "@/lib/content";
import type { PropertyCategory } from "@/lib/property-categories";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";
import { ListingViewToggle } from "./listing-view-toggle";
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
    radiusMiles: num(sp.radiusMiles),
    subcategory: str(sp.subcategory),
    keyword: str(sp.keyword),
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
    filters.minPrice ||
      filters.maxPrice ||
      filters.minBeds ||
      filters.minBaths ||
      filters.zip ||
      filters.subcategory ||
      filters.keyword
  );
  const listings = await getApprovedListings(category as PropertyCategory, filters);
  const bySubcategory = groupBySubcategory(listings);
  const groups = Object.entries(cat.subcategories)
    .map(([id, label]) => ({ id, label, listings: bySubcategory.get(id) ?? [] }))
    .filter((g) => g.listings.length > 0);
  const info = PROPERTY_CATEGORY_INFO[category as keyof typeof PROPERTY_CATEGORY_INFO];

  return (
    <>
      <PageHero
        eyebrow="Properties"
        heading={cat.label}
        sub={`Browse ${cat.label.toLowerCase()} listings, sectioned by type.`}
        breadcrumbs={getBreadcrumbTrail(`/properties/${category}`)}
      />

      {info && (
        <section className="mx-auto max-w-3xl px-6 pb-16">
          <GlowCard className="p-8">
            <h2 className="font-heading text-lg font-semibold">What to expect</h2>
            <p className="text-foreground mt-3 text-balance">{info.whatToExpect}</p>
          </GlowCard>
          <div className="mt-6">
            <h2 className="font-heading text-lg font-semibold">Ideal for</h2>
            <ul className="mt-4 space-y-3">
              {info.idealFor.map((item) => (
                <ShineListItem key={item} className="border-border rounded-xl border p-4 text-sm">
                  {item}
                </ShineListItem>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-24">
        {/* useSearchParams inside needs a Suspense boundary — same pattern
            as AutoSignInModal in (marketing)/layout.tsx. */}
        <Suspense fallback={<div className="mb-10 h-[86px]" />}>
          <ListingFilterBar />
        </Suspense>
        {groups.length > 0 ? (
          <ListingViewToggle groups={groups} listings={listings} />
        ) : hasActiveFilters ? (
          <p className="text-muted-foreground text-center">
            No {cat.label.toLowerCase()} listings match those filters — try widening your search.
          </p>
        ) : (
          <p className="text-muted-foreground text-center">No {cat.label.toLowerCase()} listings yet — check back soon.</p>
        )}
      </section>

      {info && info.faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="font-heading text-center text-2xl font-bold">
            Questions about {cat.label.toLowerCase()}
          </h2>
          <div className="mt-8">
            <FaqList faqs={info.faqs} />
          </div>
        </section>
      )}

      <CrossNav current="properties" />
    </>
  );
}
