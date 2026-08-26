import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { PortfolioGrid } from "@/components/properties/portfolio-grid";
import { getPortfolioListings } from "@/lib/properties-public";
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
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <PortfolioGrid listings={listings} />
      </section>
      <CrossNav current="portfolio" />
    </>
  );
}
