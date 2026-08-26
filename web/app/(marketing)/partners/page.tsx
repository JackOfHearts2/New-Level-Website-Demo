import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { PAGES, PARTNERS } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

export const metadata: Metadata = {
  title: "Partners · New Level",
};

export default function PartnersPage() {
  const page = PAGES.partners;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
        breadcrumbs={getBreadcrumbTrail("/partners")}
      />

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNERS.map((p) => (
            <GlowCard key={p.name} className="p-6">
              <p className="text-primary font-heading text-xs font-semibold tracking-wide uppercase">
                {p.category}
              </p>
              <h2 className="font-heading mt-1 text-lg font-semibold">{p.name}</h2>
              <p className="text-foreground mt-2 text-sm">{p.blurb}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <GlowCard className="p-8">
          <h2 className="font-heading text-xl font-semibold">Want to be one of our partners?</h2>
          <p className="text-foreground mt-2 text-sm">
            If your business serves the same clients we do, we&apos;d like to talk.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/contact?topic=general">Get in touch</CtaLink>
          </div>
        </GlowCard>
      </section>

      <CrossNav current="partners" />
    </>
  );
}
