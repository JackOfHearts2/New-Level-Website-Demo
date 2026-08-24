import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill, ShineListItem } from "@/components/ui/shine-shape";
import { CtaLink } from "@/components/ui/cta-link";
import { FaqList } from "@/components/faq-list";
import { CATEGORY_ICONS } from "@/components/property-category-icons";
import {
  PROPERTY_CATEGORIES,
  OTHER_PROPERTIES,
  PROPERTY,
  AUDIENCES,
  AUDIENCE_ORDER,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Properties · New Level",
};

type ListingDescriptor =
  | { kind: "real"; href: string }
  | { kind: "other"; data: (typeof OTHER_PROPERTIES)[number] };

function listingsForCategory(categoryId: string): ListingDescriptor[] {
  const items: ListingDescriptor[] = [];
  if (PROPERTY.categories.includes(categoryId)) {
    items.push({ kind: "real", href: "/property" });
  }
  OTHER_PROPERTIES.filter((p) => p.categories.includes(categoryId)).forEach((data) => {
    items.push({ kind: "other", data });
  });
  return items;
}

function matchesKeyword(item: ListingDescriptor, q: string) {
  const text =
    item.kind === "real"
      ? `${PROPERTY.siteName} ${PROPERTY.address}`
      : `${item.data.title} ${item.data.meta}`;
  return text.toLowerCase().includes(q.toLowerCase());
}

function RealPropertyCard({ href }: { href: string }) {
  return (
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
  );
}

function OtherPropertyCard({ p }: { p: (typeof OTHER_PROPERTIES)[number] }) {
  return (
    <GlowCard className="overflow-hidden p-0">
      <div className="relative aspect-[4/3]">
        <Image
          src={`/photos/${p.photo}.jpg`}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <ShinePill className="font-heading bg-background/90 text-foreground absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold uppercase">
          Coming soon
        </ShinePill>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-semibold">{p.title}</h3>
        <p className="text-foreground text-sm">{p.meta}</p>
        <p className="text-foreground mt-1 text-sm">{p.rate}</p>
      </div>
    </GlowCard>
  );
}

function ListingCard({ item }: { item: ListingDescriptor }) {
  return item.kind === "real" ? (
    <RealPropertyCard href={item.href} />
  ) : (
    <OtherPropertyCard p={item.data} />
  );
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; a?: string }>;
}) {
  const { category, q, a } = await searchParams;

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

  // ?category=<id>[&q=<keyword>] — a real per-category landing page, not
  // just a filtered grid with a swapped headline: what to expect, who it's
  // for, and category-specific FAQs, alongside the matching listings.
  if (category) {
    const cat = PROPERTY_CATEGORIES.find((c) => c.id === category);
    const all = cat ? listingsForCategory(cat.id) : [];
    const filtered = q ? all.filter((item) => matchesKeyword(item, q)) : all;
    const showingFallback = !!q && filtered.length === 0 && all.length > 0;
    const results = showingFallback ? all : filtered;
    const Icon = cat ? CATEGORY_ICONS[cat.icon] : undefined;
    const ctaHref = cat?.id === "events" ? "/events" : "/contact";
    const ctaLabel = cat?.id === "events" ? "See our upcoming events" : "Talk to us about this";

    return (
      <>
        <PageHero eyebrow="Properties" heading={cat?.label ?? "Properties"} sub={cat?.blurb} />

        {cat && Icon && (
          <div className="mx-auto -mt-8 mb-8 flex justify-center">
            <div className="bg-accent text-accent-foreground flex size-14 items-center justify-center rounded-2xl">
              <Icon className="size-7" />
            </div>
          </div>
        )}

        {cat && (
          <section className="mx-auto max-w-3xl px-6 pb-16">
            <GlowCard className="p-8">
              <h2 className="font-heading text-lg font-semibold">What to expect</h2>
              <p className="text-foreground mt-3 text-balance">{cat.whatToExpect}</p>
            </GlowCard>
            <div className="mt-6">
              <h2 className="font-heading text-lg font-semibold">Ideal for</h2>
              <ul className="mt-4 space-y-3">
                {cat.idealFor.map((item) => (
                  <ShineListItem key={item} className="border-border rounded-xl border p-4 text-sm">
                    {item}
                  </ShineListItem>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <h2 className="font-heading mb-6 text-2xl font-bold">Available listings</h2>
          {showingFallback && (
            <p className="text-foreground mb-6 text-sm">
              No exact matches for &ldquo;{q}&rdquo;. Showing all {cat?.label} listings instead.
            </p>
          )}
          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((item, i) => (
                <ListingCard key={i} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-foreground text-center">
              No listings in this category yet.
            </p>
          )}
        </section>

        {cat && cat.faqs.length > 0 && (
          <section className="mx-auto max-w-3xl px-6 pb-16">
            <h2 className="font-heading text-center text-2xl font-bold">
              Questions about {cat.label.toLowerCase()}
            </h2>
            <div className="mt-8">
              <FaqList faqs={cat.faqs} />
            </div>
          </section>
        )}

        <section className="mx-auto max-w-3xl px-6 pb-16 text-center">
          <GlowCard className="p-8">
            <h2 className="font-heading text-xl font-semibold">Not seeing what you need?</h2>
            <p className="text-foreground mt-2 text-sm">
              Tell us what you&apos;re looking for and we&apos;ll help you find it.
            </p>
            <div className="mt-6 flex justify-center">
              <CtaLink href={ctaHref}>{ctaLabel}</CtaLink>
            </div>
          </GlowCard>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="font-heading text-center text-lg font-semibold">Other categories</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {PROPERTY_CATEGORIES.filter((c) => c.id !== cat?.id).map((c) => (
              <GlowCard key={c.id} href={`/properties?category=${c.id}`} className="px-5 py-2.5">
                <span className="font-heading text-sm font-semibold">{c.label}</span>
              </GlowCard>
            ))}
          </div>
        </section>

        <CrossNav current="properties" />
      </>
    );
  }

  // Default — every category with at least one matching listing
  return (
    <>
      <PageHero
        eyebrow="Properties"
        heading="Explore the New Level portfolio."
        sub="Categorized by how you're planning to use the space."
      />
      <section className="mx-auto max-w-7xl space-y-16 px-6 pb-24">
        {PROPERTY_CATEGORIES.map((cat) => {
          const items = listingsForCategory(cat.id);
          if (items.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-heading text-2xl font-bold">{cat.label}</h2>
                <span className="text-foreground text-sm">{cat.blurb}</span>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item, i) => (
                  <ListingCard key={i} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
      <CrossNav current="properties" />
    </>
  );
}
