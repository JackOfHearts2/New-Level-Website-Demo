import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { FaqList } from "@/components/faq-list";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAGES, FAQS } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQs · New Level",
};

export default function FaqPage() {
  const page = PAGES.faq;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} sub={page.sub} />

      <section className="px-6 pb-16">
        <FaqList faqs={FAQS} />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="border-border rounded-2xl border p-8 shadow-sm">
          <h2 className="font-heading text-xl font-semibold">
            Still have a question?
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            We&apos;re happy to talk it through directly.
          </p>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ size: "lg" }),
              "font-heading mt-6 rounded-xl px-6 font-semibold"
            )}
          >
            Contact Us
          </Link>
        </div>
      </section>

      <CrossNav current="faq" />
    </>
  );
}
