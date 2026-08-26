import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { CrossNav } from "@/components/cross-nav";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";
import { CtaLink } from "@/components/ui/cta-link";
import { GlowCard } from "@/components/ui/glow-card";
import { PROPERTY_CATEGORIES } from "@/lib/property-categories";
import { formatListingPrice, propertyPhotoUrl, type PublicListing } from "@/lib/properties-public";

/** Generic detail page for any listing added through /admin/properties —
 *  the flagship property keeps its own much richer hand-built page at
 *  /property (photo tour, booking, reviews); this is the plain page every
 *  other listing gets instead, since none of that detail exists in the
 *  properties table's columns. */
export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "id, title, category, subcategory, status, address_line1, address_line2, city, state, zip, price, price_period, beds, baths, sqft, year_built, mls_number, description, photos"
    )
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle<PublicListing & { address_line2: string | null; zip: string | null; year_built: number | null; mls_number: string | null }>();

  if (!data) notFound();

  const price = formatListingPrice(data);
  const address = [data.address_line1, data.address_line2, [data.city, data.state, data.zip].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(", ");
  const cat = PROPERTY_CATEGORIES[data.category as keyof typeof PROPERTY_CATEGORIES];
  const catLabel = cat?.label ?? data.category;
  const subLabel = (cat?.subcategories as Record<string, string> | undefined)?.[data.subcategory] ?? data.subcategory;

  return (
    <>
      <div className="mx-auto max-w-5xl px-6 pt-32 pb-8 sm:pt-40">
        <Breadcrumbs items={getBreadcrumbTrail(`/properties/${data.category}`, data.title)} />
        <p className="text-primary font-heading text-sm font-semibold tracking-wide uppercase">
          {catLabel} · {subLabel}
        </p>
        <h1 className="font-heading mt-2 text-4xl font-bold text-balance md:text-5xl">{data.title}</h1>
        {address && <p className="text-muted-foreground mt-2">{address}</p>}
        {price && <p className="mt-3 text-xl font-semibold">{price}</p>}
      </div>

      {data.photos.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {data.photos.map((photo, i) => (
              <div key={photo.path} className={`relative aspect-4/3 overflow-hidden rounded-2xl ${i === 0 ? "sm:col-span-2" : ""}`}>
                <Image src={propertyPhotoUrl(photo.path)} alt={data.title} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl space-y-8 px-6 pb-24">
        <GlowCard className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {data.beds != null && (
              <div>
                <p className="text-muted-foreground text-xs uppercase">Beds</p>
                <p className="font-heading font-semibold">{data.beds}</p>
              </div>
            )}
            {data.baths != null && (
              <div>
                <p className="text-muted-foreground text-xs uppercase">Baths</p>
                <p className="font-heading font-semibold">{data.baths}</p>
              </div>
            )}
            {data.sqft != null && (
              <div>
                <p className="text-muted-foreground text-xs uppercase">Sq ft</p>
                <p className="font-heading font-semibold">{data.sqft.toLocaleString()}</p>
              </div>
            )}
            {data.year_built != null && (
              <div>
                <p className="text-muted-foreground text-xs uppercase">Year built</p>
                <p className="font-heading font-semibold">{data.year_built}</p>
              </div>
            )}
          </div>
        </GlowCard>

        {data.description && (
          <div>
            <h2 className="font-heading text-lg font-semibold">About this property</h2>
            <p className="text-foreground mt-3 text-sm whitespace-pre-line">{data.description}</p>
          </div>
        )}

        <div className="text-center">
          <CtaLink href="/contact?topic=property">Ask about this listing</CtaLink>
        </div>
      </section>

      <CrossNav current="properties" />
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("title").eq("id", id).maybeSingle();
  return { title: data ? `${data.title} · New Level` : "Listing · New Level" };
}
