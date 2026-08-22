import { ShinePill } from "@/components/ui/shine-shape";
import { CtaLink } from "@/components/ui/cta-link";
import type { EVENT_CTA } from "@/lib/content";

export function EventCtaSection({
  eventCta,
}: {
  eventCta: typeof EVENT_CTA;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="group border-background/15 bg-foreground text-background relative overflow-hidden rounded-3xl border px-8 py-16 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:px-16">
        {/* The banner itself used to have no border and didn't respond to
            anything beyond an internal decorative blob — the shape itself
            needed its own tactile response, same as every other card
            sitewide (border + hover lift/shadow), not just the glow inside
            it. border-background/15 (not border-border) since this sits on
            a near-black/near-white bg-foreground fill in both themes — a
            token border tuned for the page's usual bg/card surfaces would
            barely show here; a faint background-tinted line reads in both.
            Was a flat, near-white wash (bg-primary/20 at blur-3xl reads as
            pale/gray, not green, against this dark banner) and didn't move
            at all — bumped saturation, added a continuous breathing pulse
            (animate-event-glow) so it's a real presence rather than
            background noise, plus a hover boost so the shape itself
            responds when a visitor's cursor is over the banner. */}
        <div
          aria-hidden
          className="animate-event-glow bg-primary/45 pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-2xl transition-[opacity,transform] duration-500 group-hover:scale-125 group-hover:opacity-90"
        />
        <ShinePill className="bg-background/10 text-background font-heading relative rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
          {eventCta.eyebrow}
        </ShinePill>
        <h2 className="font-heading relative mt-6 text-3xl font-bold text-balance md:text-4xl">
          {eventCta.heading}
        </h2>
        <p className="text-background relative mx-auto mt-4 max-w-xl text-balance">
          {eventCta.sub}
        </p>
        <div className="relative mt-8 flex justify-center">
          <CtaLink href="/properties?category=events" variant="light">
            {eventCta.cta}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
