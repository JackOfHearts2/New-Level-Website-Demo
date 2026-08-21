import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAGES, TESTIMONIALS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Testimonials · New Level",
};

export default function TestimonialsPage() {
  const page = PAGES.testimonials;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} sub={page.sub} />

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <Carousel>
          {TESTIMONIALS.map((t) => (
            <CarouselItem key={t.name}>
              <figure className="bg-background border-border flex h-full flex-col rounded-2xl border p-6 shadow-sm">
                <blockquote className="text-foreground flex-1 text-balance">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="border-border mt-6 border-t pt-4">
                  <div className="font-heading text-sm font-semibold">{t.name}</div>
                  <div className="text-muted-foreground text-xs">{t.role}</div>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </Carousel>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="border-border rounded-2xl border p-8 shadow-sm">
          <h2 className="font-heading text-xl font-semibold">
            Curious what guests say about the property itself?
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Read verified reviews from stays at our featured Miami property.
          </p>
          <Link
            href="/property#reviews"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "font-heading mt-6 rounded-xl px-6 font-semibold"
            )}
          >
            Read guest reviews
          </Link>
        </div>
      </section>

      <CrossNav current="testimonials" />
    </>
  );
}
