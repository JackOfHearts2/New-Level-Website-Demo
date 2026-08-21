import Link from "next/link";
import type { Metadata } from "next";
import { Star, MapPin } from "lucide-react";
import { CrossNav } from "@/components/cross-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PROPERTY,
  HIGHLIGHTS,
  FEES_POLICIES,
  NEIGHBORHOOD,
  REVIEWS,
  OTHER_PROPERTIES,
  AUDIENCE_ORDER,
  NLG_BRAND,
} from "@/lib/content";
import { PropertyBookingProvider, type AudienceId } from "@/components/property/booking-context";
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
          <span className="bg-white/10 font-heading inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase backdrop-blur-sm">
            {PROPERTY.address}
          </span>
          <h1 className="font-heading mt-4 max-w-2xl text-4xl font-bold text-balance md:text-5xl">
            {PROPERTY.siteName}
          </h1>
          <p className="mt-3 max-w-xl text-balance text-white/80">
            Presented by New Level — a South Florida real estate group matching standout homes to
            the moments they&apos;re made for.
          </p>
        </PhotoTour>
      </div>

      <PurposeSelector />
      <AudienceContent />

      {/* Highlights */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-heading text-2xl font-bold">Highlights</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {HIGHLIGHTS.map((h) => (
            <li key={h} className="border-border rounded-xl border p-4 text-sm">
              {h}
            </li>
          ))}
        </ul>
      </section>

      {/* Booking + quote */}
      <section id="booking" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold">Availability &amp; quote</h2>
          <p className="text-muted-foreground mt-1 text-sm">
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
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{NEIGHBORHOOD.blurb}</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="border-border overflow-hidden rounded-2xl border">
              <iframe
                title="Map"
                className="h-80 w-full"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(NEIGHBORHOOD.mapQuery)}&output=embed`}
              />
            </div>
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
            <span className="text-muted-foreground text-sm">({REVIEWS.count} reviews)</span>
          </div>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">{REVIEWS.howItWorks}</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {REVIEWS.items.map((r) => (
            <figure key={r.name} className="border-border rounded-2xl border p-6 shadow-sm">
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
              <figcaption className="text-muted-foreground mt-4 text-xs">
                {r.name} · {r.use} · {r.when}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Fees & policies */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-heading text-2xl font-bold">Fees &amp; policies</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-heading text-sm font-semibold">Included in your rate</h3>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
                {FEES_POLICIES.included.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold">Add-ons &amp; extras</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {FEES_POLICIES.extra.map((i) => (
                  <li key={i.t} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{i.t}</span>
                    <span className="text-right font-medium">{i.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10">
            <h3 className="font-heading text-sm font-semibold">House rules</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {FEES_POLICIES.houseRules.map((r) => (
                <div key={r.t}>
                  <div className="text-sm font-semibold">{r.t}</div>
                  <div className="text-muted-foreground text-sm">{r.d}</div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground/80 mt-4 text-xs">{FEES_POLICIES.rulesNote}</p>
          </div>
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-heading text-sm font-semibold">Cancellation</h3>
            <p className="text-muted-foreground mt-2 text-sm">{FEES_POLICIES.cancellation}</p>
          </div>
        </div>
      </section>

      {/* Inquiry */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-heading text-2xl font-bold">Send an inquiry</h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Submitting sends us your details — no payment is collected and nothing is auto-confirmed.
        </p>
        <div className="mt-8">
          <InquiryForm />
        </div>
      </section>

      {/* About New Level */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-heading text-xl font-bold">About {NLG_BRAND.name}</h2>
          <p className="text-muted-foreground mt-3 text-sm">{NLG_BRAND.aboutShort}</p>
          <Link
            href="/about"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "font-heading mt-6 rounded-xl px-6 font-semibold")}
          >
            More about New Level
          </Link>
        </div>
      </section>

      {/* Other properties */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-heading text-2xl font-bold">More New Level homes</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OTHER_PROPERTIES.map((p) => (
            <div key={p.title} className="border-border overflow-hidden rounded-2xl border shadow-sm">
              <div className="bg-muted flex aspect-[4/3] items-center justify-center">
                <span className="text-muted-foreground text-sm">Coming soon</span>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold">{p.title}</h3>
                <p className="text-muted-foreground text-sm">{p.meta}</p>
                <p className="text-muted-foreground mt-1 text-xs">{p.rate}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CrossNav current="property" />
      <StickyBookingBar />
    </PropertyBookingProvider>
  );
}
