import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { TESTIMONIALS } from "@/lib/content";
import { TestimonialCarousel } from "@/components/ui/testimonial-carousel";

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: typeof TESTIMONIALS;
}) {
  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            Testimonials
          </span>
          <h2 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
            What clients say, straight from the source.
          </h2>
        </div>

        <TestimonialCarousel
          testimonials={testimonials}
          className="mx-auto mt-16 max-w-2xl"
        />

        <div className="mt-10 text-center">
          <Link
            href="/testimonials"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "font-heading rounded-xl px-6 font-semibold"
            )}
          >
            Read more testimonials
          </Link>
        </div>
      </div>
    </section>
  );
}
