import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { CardActions } from "@/components/property/card-actions";
import { PROPERTY, AUDIENCES, AUDIENCE_ORDER } from "@/lib/content";
import { ListingRow } from "@/components/properties/listing-card";
import { getApprovedListings } from "@/lib/properties-public";
import { PROPERTY_CATEGORIES as DB_PROPERTY_CATEGORIES } from "@/lib/property-categories";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

export const metadata: Metadata = {
  title: "Properties · New Level",
};

function RealPropertyCard({ href }: { href: string }) {
  return (
    <div className="relative">
      <GlowCard
        href={href}
        className="group hover:-translate-y-1 block overflow-hidden p-0 transition-transform duration-300"
      >
        <div className="relative aspect-[4/3]">
          <Image
            src="/photos/00.jpg"
            alt={PROPERTY.siteName}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="font-heading font-semibold">{PROPERTY.siteName}</h3>
          <p className="text-foreground text-sm">{PROPERTY.address}</p>
        </div>
      </GlowCard>
      <CardActions propertySlug="nw-87th-street" href={href} shareTitle={PROPERTY.siteName} />
    </div>
  );
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  const { a } = await searchParams;

  // ?a=<audienceId> — purpose-filtered single-listing view
  if (a && (AUDIENCE_ORDER as readonly string[]).includes(a)) {
    const audience = AUDIENCES[a as (typeof AUDIENCE_ORDER)[number]];
    return (
      <>
        <PageHero
          eyebrow="Properties"
          heading={audience.cardLabel}
          sub={`Showing the property that fits: ${audience.cardMeta}`}
        />
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <RealPropertyCard href={`/property?a=${a}`} />
          </div>
        </section>
        <CrossNav current="properties" />
      </>
    );
  }

  // Default ("All Properties" in the nav) — client-dictated structure,
  // 2026-08-27: sectioned by the database taxonomy (Residential/Commercial/
  // Rental), each section a horizontal row with a "View all" into that
  // category's own page (/properties/[category]), which in turn sections
  // by subcategory the same way. This used to be one of two competing
  // systems (a `?category=<id>` branch here rendered an entirely separate
  // static grid) — removed 2026-08-27 so there's exactly one set of real
  // results, not two (see components/search-box.tsx and
  // lib/content.ts's PROPERTY_CATEGORY_INFO for where that branch's real
  // marketing copy went instead of being deleted outright).
  const allListings = await getApprovedListings();
  const byCategory = new Map<string, typeof allListings>();
  for (const listing of allListings) {
    if (!byCategory.has(listing.category)) byCategory.set(listing.category, []);
    byCategory.get(listing.category)!.push(listing);
  }

  return (
    <>
      <PageHero
        eyebrow="Properties"
        heading="Explore the New Level portfolio."
        sub="Residential, commercial, and rental — sectioned by how you're planning to use the space."
        breadcrumbs={getBreadcrumbTrail("/properties")}
      />
      <section className="mx-auto max-w-7xl space-y-16 px-6 pb-24">
        {Object.entries(DB_PROPERTY_CATEGORIES).map(([id, cat]) => {
          const listings = byCategory.get(id) ?? [];
          if (listings.length === 0) return null;
          return (
            <div key={id}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-heading text-2xl font-bold">{cat.label}</h2>
              </div>
              <div className="mt-6">
                <ListingRow listings={listings} viewAllHref={`/properties/${id}`} />
              </div>
            </div>
          );
        })}
        {allListings.length === 0 && (
          <p className="text-muted-foreground text-center">
            No listings yet — check back soon, or explore by category below.
          </p>
        )}
      </section>
      <section className="mx-auto max-w-3xl px-6 pb-16 text-center">
        <GlowCard className="p-8">
          <h2 className="font-heading text-xl font-semibold">Looking for our full track record?</h2>
          <p className="text-foreground mt-2 text-sm">
            See everything we&apos;ve managed or closed, including properties that aren&apos;t
            currently on the market.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/portfolio">View Full Portfolio</CtaLink>
          </div>
        </GlowCard>
      </section>
      <CrossNav current="properties" />
    </>
  );
}
