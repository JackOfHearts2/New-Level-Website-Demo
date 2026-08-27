import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { ShineListItem } from "@/components/ui/shine-shape";
import { PortfolioGrid } from "@/components/properties/portfolio-grid";
import { getPortfolioListings } from "@/lib/properties-public";
import { INVESTMENT_INFO } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

export const metadata: Metadata = {
  title: "Full Portfolio · New Level",
};

/** Client ask (2026-08-27): a place to "house" the properties New Level
 *  owns/manages/has closed even when they're not currently on the market
 *  — separate from the main Properties browsing pages (which stay scoped
 *  to active/pending only, see getApprovedListings) so the site doesn't
 *  get "too heavy" with years of history mixed into what's actually
 *  available today. Every approved listing shows here regardless of
 *  status; a sold/off-market/seeking-investors card is informational only
 *  (see PortfolioCard) rather than linking to a full detail page. */
export default async function PortfolioPage() {
  const listings = await getPortfolioListings();

  return (
    <>
      <PageHero
        eyebrow="Properties"
        heading="Full Portfolio"
        sub="Current availability and past transactions, all in one place."
        breadcrumbs={getBreadcrumbTrail("/portfolio")}
      />

      {/* The homepage search box's "Investment Properties" tab lands here
          (lib/content.ts's SEARCH_CATEGORIES comment explains why there's
          no separate database category for it) — this intro gives that
          entry point real context instead of dropping a visitor straight
          into a plain grid. */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <GlowCard className="p-8">
          <h2 className="font-heading text-lg font-semibold">Investing with New Level</h2>
          <p className="text-foreground mt-3 text-balance">{INVESTMENT_INFO.whatToExpect}</p>
        </GlowCard>
        <div className="mt-6">
          <h2 className="font-heading text-lg font-semibold">Ideal for</h2>
          <ul className="mt-4 space-y-3">
            {INVESTMENT_INFO.idealFor.map((item) => (
              <ShineListItem key={item} className="border-border rounded-xl border p-4 text-sm">
                {item}
              </ShineListItem>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <PortfolioGrid listings={listings} />
      </section>
      <CrossNav current="portfolio" />
    </>
  );
}
