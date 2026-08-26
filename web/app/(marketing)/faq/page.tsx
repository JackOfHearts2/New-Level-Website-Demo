import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { FaqList } from "@/components/faq-list";
import { CtaLink } from "@/components/ui/cta-link";
import { GlowCard } from "@/components/ui/glow-card";
import { PAGES, FAQS } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

export const metadata: Metadata = {
  title: "FAQs · New Level",
};

export default function FaqPage() {
  const page = PAGES.faq;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        breadcrumbs={getBreadcrumbTrail("/faq")}
      />

      <section className="px-6 pb-16">
        <FaqList faqs={FAQS} />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <GlowCard className="p-8">
          <h2 className="font-heading text-xl font-semibold">
            Still have a question?
          </h2>
          <p className="text-foreground mt-2 text-sm">
            We&apos;re happy to talk it through directly.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/contact">Contact Us</CtaLink>
          </div>
        </GlowCard>
      </section>

      <CrossNav current="faq" />
    </>
  );
}
