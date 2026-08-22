import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { CtaLink } from "@/components/ui/cta-link";
import { Timeline } from "@/components/ui/timeline";
import { NLG_BRAND, VALUES, SERVICES, BROKERS_CORNER } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us · New Level",
};

// Real milestones only — the founding year is confirmed content (migrated
// from the live site, see NLG_BRAND.story), but no specific in-between
// dates exist yet, so those entries stay era-labeled rather than inventing
// fake years/numbers to fill the gap.
const TIMELINE = [
  {
    title: "2003",
    content: (
      <p className="text-foreground text-sm md:text-base">
        {NLG_BRAND.story}
      </p>
    ),
  },
  {
    title: "Growing the Team",
    content: (
      <p className="text-foreground text-sm md:text-base">
        {BROKERS_CORNER.bio}
      </p>
    ),
  },
  {
    title: "Today",
    content: (
      <div>
        <p className="text-foreground text-sm md:text-base">
          {NLG_BRAND.aboutLong}
        </p>
        <div className="mt-6">
          <CtaLink href="/content-library">See our latest posts & videos</CtaLink>
        </div>
      </div>
    ),
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About New Level"
        heading="Real Estate, Redefined at every level."
        intro={NLG_BRAND.aboutLong}
      />

      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <span className="font-heading text-primary text-sm font-semibold tracking-wide uppercase">
            Our Mission
          </span>
          <p className="text-foreground mt-4 text-lg text-balance">
            {NLG_BRAND.mission}
          </p>
        </div>
        <div>
          <span className="font-heading text-primary text-sm font-semibold tracking-wide uppercase">
            Our Story
          </span>
          <p className="text-foreground mt-4 text-balance">
            {NLG_BRAND.story}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mx-auto max-w-2xl text-center">
          <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
            Our History
          </ShinePill>
          <h2 className="font-heading mt-6 text-3xl font-bold text-balance md:text-4xl">
            From one ambitious brokerage to New Level today.
          </h2>
        </div>
        <Timeline data={TIMELINE} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/photos/35.jpg"
              alt="Screened patio at 1331 NW 87th Street"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/photos/10.jpg"
              alt="Kitchen at 1331 NW 87th Street"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <p className="text-foreground mt-3 text-center text-sm">
          A look inside 1331 NW 87th Street, our featured New Level property.
        </p>
      </section>

      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
              What We Stand For
            </ShinePill>
            <h2 className="font-heading mt-6 text-3xl font-bold text-balance md:text-4xl">
              Our Values
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((value) => (
              <GlowCard key={value.t} className="p-6">
                <h3 className="font-heading font-semibold">{value.t}</h3>
                <p className="text-foreground mt-2 text-sm">{value.d}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
            What We Do
          </ShinePill>
          <h2 className="font-heading mt-6 text-3xl font-bold text-balance md:text-4xl">
            The full New Level offering.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <GlowCard
              key={service.id}
              href={`/services#${service.id}`}
              className="hover:-translate-y-1 flex flex-col p-6 transition-transform duration-300"
            >
              <h3 className="font-heading text-lg font-semibold">{service.t}</h3>
              <p className="text-foreground mt-3 flex-1 text-sm">
                {service.d}
              </p>
              <span className="text-primary font-heading mt-4 text-sm font-semibold">
                Learn more →
              </span>
            </GlowCard>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <GlowCard
            href="/team"
            className="hover:-translate-y-1 px-6 py-4 text-center transition-transform duration-300"
          >
            <span className="font-heading block font-semibold">Meet the Team</span>
            <span className="text-foreground text-sm">
              The agents and partners behind New Level
            </span>
          </GlowCard>
          <GlowCard
            href="/brokers-corner"
            className="hover:-translate-y-1 px-6 py-4 text-center transition-transform duration-300"
          >
            <span className="font-heading block font-semibold">The Broker&apos;s Corner</span>
            <span className="text-foreground text-sm">
              Insights from our Principal Broker
            </span>
          </GlowCard>
        </div>
      </section>

      <CrossNav current="about" />
    </>
  );
}
