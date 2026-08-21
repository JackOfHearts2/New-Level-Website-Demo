import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ShinePill } from "@/components/ui/shine-shape";
import type { EVENT_CTA } from "@/lib/content";

export function EventCtaSection({
  eventCta,
}: {
  eventCta: typeof EVENT_CTA;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="bg-foreground text-background relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl"
        />
        <ShinePill className="bg-background/10 text-background font-heading relative rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
          {eventCta.eyebrow}
        </ShinePill>
        <h2 className="font-heading relative mt-6 text-3xl font-bold text-balance md:text-4xl">
          {eventCta.heading}
        </h2>
        <p className="text-background/70 relative mx-auto mt-4 max-w-xl text-balance">
          {eventCta.sub}
        </p>
        <Link
          href="/properties?category=events"
          className={cn(
            buttonVariants({ size: "lg" }),
            "font-heading relative mt-8 rounded-xl px-6 font-semibold"
          )}
        >
          {eventCta.cta}
        </Link>
      </div>
    </section>
  );
}
