import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EVENT_CTA } from "@/lib/content";

export function EventCtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="bg-foreground text-background relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16">
        <div
          aria-hidden
          className="bg-primary/20 pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl"
        />
        <span className="bg-background/10 text-background font-heading relative inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
          {EVENT_CTA.eyebrow}
        </span>
        <h2 className="font-heading relative mt-6 text-3xl font-bold text-balance md:text-4xl">
          {EVENT_CTA.heading}
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-balance text-white/70">
          {EVENT_CTA.sub}
        </p>
        <Link
          href="/properties?category=events"
          className={cn(
            buttonVariants({ size: "lg" }),
            "font-heading relative mt-8 rounded-xl px-6 font-semibold"
          )}
        >
          {EVENT_CTA.cta}
        </Link>
      </div>
    </section>
  );
}
