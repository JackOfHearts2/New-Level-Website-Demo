import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { PAGES, SERVICES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services · New Level",
};

// The "All Services" overview — each card links into its own dedicated
// /services/[slug] landing page (see that route) rather than scrolling to
// a shared section, so every service reads as its own real page.
export default function ServicesPage() {
  const page = PAGES.services;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
      />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <GlowCard
              key={service.id}
              href={service.id === "events" ? "/events" : `/services/${service.id}`}
              className="hover:-translate-y-1 flex flex-col p-8 transition-transform duration-300"
            >
              <h2 className="font-heading text-xl font-semibold">{service.t}</h2>
              <p className="text-foreground mt-3 flex-1 text-sm text-balance">{service.d}</p>
              <span className="text-primary font-heading mt-6 text-sm font-semibold">
                Learn more →
              </span>
            </GlowCard>
          ))}
        </div>
      </section>

      <CrossNav current="services" />
    </>
  );
}
