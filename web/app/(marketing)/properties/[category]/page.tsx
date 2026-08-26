import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { ListingRow } from "@/components/properties/listing-card";
import { getApprovedListings, groupBySubcategory, PROPERTY_CATEGORIES } from "@/lib/properties-public";
import type { PropertyCategory } from "@/lib/property-categories";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

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

  return (
    <>
      <PageHero
        eyebrow="Properties"
        heading={cat.label}
        sub={`Browse ${cat.label.toLowerCase()} listings, sectioned by type.`}
        breadcrumbs={getBreadcrumbTrail(`/properties/${category}`)}
      />

      <section className="mx-auto max-w-7xl space-y-12 px-6 pb-24">
        {Object.entries(cat.subcategories).map(([subId, subLabel]) => {
          const subListings = bySubcategory.get(subId) ?? [];
          if (subListings.length === 0) return null;
          return (
            <div key={subId}>
              <h2 className="font-heading text-2xl font-bold">{subLabel}</h2>
              <div className="mt-6">
                <ListingRow listings={subListings} />
              </div>
            </div>
          );
        })}
        {listings.length === 0 && (
          <p className="text-muted-foreground text-center">No {cat.label.toLowerCase()} listings yet — check back soon.</p>
        )}
      </section>

      <CrossNav current="properties" />
    </>
  );
}
