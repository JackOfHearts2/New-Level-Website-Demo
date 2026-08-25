import Image from "next/image";
import type { Metadata } from "next";
import { Star, MapPin, BedDouble, Bath, Users } from "lucide-react";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { ShineBox, ShineListItem, ShinePill } from "@/components/ui/shine-shape";
import { HIGHLIGHT_ICONS } from "@/components/property/highlight-icons";
import { cn } from "@/lib/utils";
import {
  PROPERTY,
  PROPERTY_SPECS,
  HIGHLIGHTS,
  FEES_POLICIES,
  NEIGHBORHOOD,
  REVIEWS,
  OTHER_PROPERTIES,
  AUDIENCE_ORDER,
  NLG_BRAND,
} from "@/lib/content";
import { PropertyBookingProvider, type AudienceId } from "@/components/property/booking-context";
import { SaveButton } from "@/components/property/save-button";
import { ShareButton } from "@/components/property/share-button";
import { PhotoTour } from "@/components/property/photo-tour";
import { PurposeSelector } from "@/components/property/purpose-selector";
import { AudienceContent } from "@/components/property/audience-content";
import { BookingWidget } from "@/components/property/booking-widget";
import { QuoteSidebar } from "@/components/property/quote-sidebar";
import { InquiryForm } from "@/components/property/inquiry-form";
import { StickyBookingBar } from "@/components/property/sticky-booking-bar";
import { NearbyList } from "@/components/property/nearby-list";

export const metadata: Metadata = {
  title: `${PROPERTY.siteName} · New Level`,
};

function isAudienceId(v: string | undefined): v is AudienceId {
  return !!v && (AUDIENCE_ORDER as readonly string[]).includes(v);
}

export default async function PropertyPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  const { a } = await searchParams;
  const initialAudience = isAudienceId(a) ? a : null;

  return (
    <PropertyBookingProvider initialAudience={initialAudience}>
      <div id="propertyHero">
        <PhotoTour>
          <span className="bg-white/10 font-heading inline-block w-fit rounded-full px-3 py-1 text-sm font-semibold uppercase backdrop-blur-sm">
            {PROPERTY.address}
          </span>
          <h1 className="font-heading mt-4 max-w-2xl text-4xl font-bold text-balance md:text-5xl">
            {PROPERTY.siteName}
          </h1>
          <p className="mt-3 max-w-xl text-balance text-white">
            Presented by New Level, a South Florida Real Estate group matching standout homes to
            the moments they&apos;re made for.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <SaveButton
              propertySlug="nw-87th-street"
              className="border-white/40 text-white hover:bg-white/10"
            />
            <ShareButton
              href="/property"
              title={PROPERTY.siteName}
              className="border-white/40 text-white hover:bg-white/10"
            />
          </div>
        </PhotoTour>
      </div>

      <PurposeSelector />
      <AudienceContent />

      {/* Highlights — client feedback: too small/easy to miss for the
          property's headline facts, but a solid bg-primary band ("burn
          your iris") was too far the other way. bg-accent is the site's
          existing soft green-tint token (used for eyebrow pills
          elsewhere) — a full-bleed band of it reads as clearly its own
          section without the glare of the full-saturation brand green. */}
      <section className="bg-accent py-16">
        <div className="mx-auto max-w-5xl px-6">
          <ShinePill className="bg-primary text-primary-foreground font-heading rounded-full px-4 py-1.5 text-sm font-bold tracking-wide uppercase">
            Highlights
          </ShinePill>
          <h2 className="font-heading mt-4 text-3xl font-bold text-balance md:text-4xl">
            Why this house works
          </h2>

          {/* Real specs from the property's own listing, not placeholder
              numbers — see PROPERTY_SPECS in lib/content.ts. */}
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <BedDouble className="text-primary size-6" />
              <span className="font-heading text-lg font-semibold">
                {PROPERTY_SPECS.bedrooms} bedrooms · {PROPERTY_SPECS.beds} beds
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="text-primary size-6" />
              <span className="font-heading text-lg font-semibold">
                {PROPERTY_SPECS.bathrooms} bathrooms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-primary size-6" />
              <span className="font-heading text-lg font-semibold">
                Sleeps up to {PROPERTY_SPECS.maxGuests}
              </span>
            </div>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map((h) => {
              const Icon = HIGHLIGHT_ICONS[h.icon];
              return (
                <li
                  key={h.text}
                  className="border-border bg-background flex items-start gap-3 rounded-2xl border p-5"
                >
                  {Icon && <Icon className="text-primary mt-0.5 size-6 shrink-0" />}
                  <span className="text-base font-medium text-balance">{h.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Where you'll sleep */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-heading text-2xl font-bold">Where you&apos;ll sleep</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROPERTY_SPECS.bedBreakdown.map((b) => (
            <GlowCard key={b.room} className="overflow-hidden p-0">
              <div className="relative aspect-4/3">
                <Image
                  src={`/photos/${b.photo}.jpg`}
                  alt={b.room}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="font-heading font-semibold">{b.room}</div>
                <div className="text-foreground mt-1 text-sm">{b.bed}</div>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* Booking + quote */}
      <section id="booking" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold">Availability &amp; quote</h2>
          <p className="text-foreground mt-1 text-sm">
            Availability shown is illustrative for this demo, not a live calendar.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <BookingWidget />
          <QuoteSidebar />
        </div>
      </section>

      {/* Neighborhood */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-heading text-2xl font-bold">Neighborhood</h2>
          <p className="text-foreground mt-2 max-w-2xl text-sm">{NEIGHBORHOOD.blurb}</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <ShineBox className="border-border overflow-hidden rounded-2xl border">
              <iframe
                title="Map"
                className="h-80 w-full"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(NEIGHBORHOOD.mapQuery)}&output=embed`}
              />
            </ShineBox>
            <div>
              <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
                <MapPin className="text-primary size-4" />
                Close to this stay
              </h3>
              <NearbyList />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-heading text-2xl font-bold">Guest reviews</h2>
          <div className="flex items-center gap-2">
            <Star className="fill-primary text-primary size-4" />
            <span className="font-heading font-semibold">{REVIEWS.rating}</span>
            <span className="text-foreground text-sm">({REVIEWS.count} reviews)</span>
          </div>
        </div>
        <p className="text-foreground mt-2 max-w-2xl text-sm">{REVIEWS.howItWorks}</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {REVIEWS.items.map((r) => (
            <GlowCard key={r.name} className="p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-3.5",
                      i < r.stars ? "fill-primary text-primary" : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <blockquote className="mt-3 text-sm text-balance">&ldquo;{r.text}&rdquo;</blockquote>
              <div className="text-foreground mt-4 text-sm">
                {r.name} · {r.use} · {r.when}
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* Fees & policies */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-heading text-2xl font-bold">Fees &amp; policies</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <GlowCard className="p-6">
              <h3 className="font-heading text-lg font-bold">Included in your rate</h3>
              <ul className="text-foreground mt-3 space-y-2 text-sm">
                {FEES_POLICIES.included.map((i) => (
                  <ShineListItem key={i}>{i}</ShineListItem>
                ))}
              </ul>
            </GlowCard>
            <GlowCard className="p-6">
              <h3 className="font-heading text-lg font-bold">Add-ons &amp; extras</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {FEES_POLICIES.extra.map((i) => (
                  <ShineListItem key={i.t} className="flex justify-between gap-4">
                    <span className="text-foreground">{i.t}</span>
                    <span className="text-right font-medium">{i.v}</span>
                  </ShineListItem>
                ))}
              </ul>
            </GlowCard>
          </div>
          <div className="mt-6">
            <h3 className="font-heading text-lg font-bold">House rules</h3>
            {/* Client feedback: too small, and the rule titles (Occupancy,
                Smoking & vaping, etc.) needed to be bigger/unmistakable —
                matched to the p-6/text-lg treatment used just above for
                Included/Add-ons instead of a smaller p-4/text-sm card. */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {FEES_POLICIES.houseRules.map((r) => (
                <GlowCard key={r.t} className="p-6">
                  <div className="font-heading text-base font-bold">{r.t}</div>
                  <div className="text-foreground mt-1 text-sm">{r.d}</div>
                </GlowCard>
              ))}
            </div>
            <p className="text-foreground mt-4 text-sm">{FEES_POLICIES.rulesNote}</p>
          </div>
          <GlowCard className="mt-6 p-6">
            <h3 className="font-heading text-lg font-bold">Cancellation</h3>
            <p className="text-foreground mt-2 text-sm">{FEES_POLICIES.cancellation}</p>
          </GlowCard>
        </div>
      </section>

      {/* Inquiry */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-heading text-2xl font-bold">Send an inquiry</h2>
        <p className="text-foreground mt-1 max-w-2xl text-sm">
          Submitting sends us your details; no payment is collected and nothing is auto-confirmed.
        </p>
        <div className="mt-8">
          <InquiryForm />
        </div>
      </section>

      {/* About New Level */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading text-xl font-bold">About {NLG_BRAND.name}</h2>
          <p className="text-foreground mt-3 text-sm">{NLG_BRAND.aboutShort}</p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/about">More about New Level</CtaLink>
          </div>
        </div>
      </section>

      {/* Other properties */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-heading text-2xl font-bold">More New Level homes</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OTHER_PROPERTIES.map((p) => (
            <GlowCard key={p.title} className="overflow-hidden p-0">
              <div className="relative aspect-[4/3]">
                <Image
                  src={`/photos/${p.photo}.jpg`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="font-heading bg-background/90 text-foreground absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold uppercase">
                  Coming soon
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold">{p.title}</h3>
                <p className="text-foreground text-sm">{p.meta}</p>
                <p className="text-foreground mt-1 text-sm">{p.rate}</p>
              </div>
            </GlowCard>
          ))}
        </div>
      </section>

      <CrossNav current="property" />
      <StickyBookingBar />
    </PropertyBookingProvider>
  );
}
