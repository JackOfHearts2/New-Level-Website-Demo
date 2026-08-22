import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { CtaLink } from "@/components/ui/cta-link";
import { PAGES, SERVICES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services · New Level",
};

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

      <section className="mx-auto max-w-5xl space-y-16 px-6 pb-24">
        {SERVICES.map((service) => (
          <GlowCard
            key={service.id}
            id={service.id}
            className="scroll-mt-32 rounded-3xl p-8 md:p-12"
          >
            <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
              {service.t}
            </ShinePill>
            <p className="text-foreground mt-6 max-w-2xl text-lg text-balance">
              {service.long}
            </p>

            {service.capabilities.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {service.capabilities.map((cap) => (
                  <div key={cap.t}>
                    <h3 className="font-heading font-semibold">{cap.t}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{cap.d}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              {service.id === "events" ? (
                <CtaLink href="/events">See our upcoming events</CtaLink>
              ) : (
                <CtaLink href="/contact">Book a Consultation</CtaLink>
              )}
            </div>
          </GlowCard>
        ))}
      </section>

      <CrossNav current="services" />
    </>
  );
}
