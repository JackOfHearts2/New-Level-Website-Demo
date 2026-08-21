import Link from "next/link";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAGES, SERVICES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services · New Level",
};

export default function ServicesPage() {
  const page = PAGES.services;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
      />

      <section className="mx-auto max-w-5xl space-y-16 px-6 pb-24">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            id={service.id}
            className="border-border scroll-mt-32 rounded-3xl border p-8 shadow-sm md:p-12"
          >
            <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
              {service.t}
            </span>
            <p className="text-foreground mt-6 max-w-2xl text-lg text-balance">
              {service.long}
            </p>

            {service.capabilities.length > 0 && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {service.capabilities.map((cap) => (
                  <div key={cap.t}>
                    <h3 className="font-heading font-semibold">{cap.t}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{cap.d}</p>
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/contact"
              className={cn(
                buttonVariants({ size: "lg" }),
                "font-heading mt-8 rounded-xl px-6 font-semibold"
              )}
            >
              Book a Consultation
            </Link>
          </div>
        ))}
      </section>

      <CrossNav current="services" />
    </>
  );
}
