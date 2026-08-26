import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { getApprovedListings, groupBySubcategory, PROPERTY_CATEGORIES } from "@/lib/properties-public";
import type { PropertyCategory } from "@/lib/property-categories";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";
import { SubcategoryFilter } from "./subcategory-filter";

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
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = PROPERTY_CATEGORIES[category as PropertyCategory];
  if (!cat) notFound();

  const listings = await getApprovedListings(category as PropertyCategory);
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
        {groups.length > 0 ? (
          <SubcategoryFilter groups={groups} />
        ) : (
          <p className="text-muted-foreground text-center">No {cat.label.toLowerCase()} listings yet — check back soon.</p>
        )}
      </section>

      <CrossNav current="properties" />
    </>
  );
}
