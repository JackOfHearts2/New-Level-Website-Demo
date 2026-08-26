import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { FaqList } from "@/components/faq-list";
import { CtaLink } from "@/components/ui/cta-link";
import { PAGES, FAQS } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact · New Level",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const page = PAGES.contact;
  const { topic } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
        breadcrumbs={getBreadcrumbTrail("/contact")}
      />

      <section className="px-6 pb-24">
        {/* key forces a remount when ?topic= changes via client-side nav
            (e.g. the footer's "Join Our Network" link while already on this
            page) — otherwise the mounted instance keeps its stale selection. */}
        <ContactForm key={topic ?? "none"} initialTopic={topic} />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="font-heading text-center text-2xl font-bold">
          Quick answers
        </h2>
        <div className="mt-8">
          <FaqList faqs={FAQS.slice(0, 3)} />
        </div>
        <div className="mt-8 flex justify-center">
          <CtaLink href="/faq">See the full FAQ</CtaLink>
        </div>
      </section>

      <CrossNav current="contact" />
    </>
  );
}
