import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { TestimonialRoster } from "@/components/ui/testimonial-roster";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { PAGES, TESTIMONIALS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Testimonials · New Level",
};

export default function TestimonialsPage() {
  const page = PAGES.testimonials;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} sub={page.sub} />

      <section className="px-6 pb-16">
        <TestimonialRoster testimonials={TESTIMONIALS} />
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <GlowCard className="p-8">
          <h2 className="font-heading text-xl font-semibold">
            Curious what guests say about the property itself?
          </h2>
          <p className="text-foreground mt-2 text-sm">
            Read verified reviews from stays at our featured Miami property.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/property#reviews">Read guest reviews</CtaLink>
          </div>
        </GlowCard>
      </section>

      <CrossNav current="testimonials" />
    </>
  );
}
