import { ShinePill } from "@/components/ui/shine-shape";
import { CtaLink } from "@/components/ui/cta-link";
import type { TESTIMONIALS } from "@/lib/content";
import { TestimonialCarousel } from "@/components/ui/testimonial-carousel";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: typeof TESTIMONIALS;
}) {
  return (
    // overflow-x-hidden here (not on the carousel's own tighter box) —
    // the 3D carousel deliberately lets side-facing faces extend past its
    // own width as they rotate through (that's the "see the image on the
    // side" effect), so clipping has to happen at this full-bleed section
    // instead, or it'd cut the peek effect off. Without this the page
    // itself gained a genuine ~75px horizontal scroll on mobile.
    <section className="bg-muted/50 overflow-x-hidden py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
            Testimonials
          </ShinePill>
          <h2 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
            What clients say, straight from the source.
          </h2>
        </div>

        <TestimonialCarousel
          testimonials={testimonials}
          className="mx-auto mt-16 max-w-2xl sm:max-w-4xl"
        />

        <div className="mt-10 flex justify-center">
          <CtaLink href="/testimonials">Read more testimonials</CtaLink>
        </div>
      </div>
    </section>
  );
}
