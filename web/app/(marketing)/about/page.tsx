import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { NLG_BRAND, VALUES, SERVICES } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us · New Level",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About New Level"
        heading="Real estate, redefined at every level."
        intro={NLG_BRAND.aboutLong}
      />

      <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <span className="font-heading text-primary text-xs font-semibold tracking-wide uppercase">
            Our Mission
          </span>
          <p className="text-foreground mt-4 text-lg text-balance">
            {NLG_BRAND.mission}
          </p>
        </div>
        <div>
          <span className="font-heading text-primary text-xs font-semibold tracking-wide uppercase">
            Our Story
          </span>
          <p className="text-muted-foreground mt-4 text-balance">
            {NLG_BRAND.story}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/photos/35.jpg"
              alt="Screened patio at 1331 NW 87th Street"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/photos/10.jpg"
              alt="Kitchen at 1331 NW 87th Street"
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <p className="text-muted-foreground/70 mt-3 text-center text-xs">
          A look inside 1331 NW 87th Street, our featured New Level property.
        </p>
      </section>

      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
              What We Stand For
            </span>
            <h2 className="font-heading mt-6 text-3xl font-bold text-balance md:text-4xl">
              Our Values
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {VALUES.map((value) => (
              <div
                key={value.t}
                className="bg-background border-border rounded-2xl border p-6 shadow-sm"
              >
                <h3 className="font-heading font-semibold">{value.t}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{value.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            What We Do
          </span>
          <h2 className="font-heading mt-6 text-3xl font-bold text-balance md:text-4xl">
            The full New Level offering.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              href={`/services#${service.id}`}
              className="bg-background border-border hover:border-primary/50 hover:-translate-y-1 flex flex-col rounded-2xl border p-6 shadow-sm transition-all duration-300"
            >
              <h3 className="font-heading text-lg font-semibold">{service.t}</h3>
              <p className="text-muted-foreground mt-3 flex-1 text-sm">
                {service.d}
              </p>
              <span className="text-primary font-heading mt-4 text-sm font-semibold">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/team"
            className="border-border hover:border-primary/50 hover:-translate-y-1 rounded-2xl border px-6 py-4 text-center shadow-sm transition-all duration-300"
          >
            <span className="font-heading block font-semibold">Meet the Team</span>
            <span className="text-muted-foreground text-sm">
              The agents and partners behind New Level
            </span>
          </Link>
          <Link
            href="/brokers-corner"
            className="border-border hover:border-primary/50 hover:-translate-y-1 rounded-2xl border px-6 py-4 text-center shadow-sm transition-all duration-300"
          >
            <span className="font-heading block font-semibold">The Broker&apos;s Corner</span>
            <span className="text-muted-foreground text-sm">
              Insights from our Principal Broker
            </span>
          </Link>
        </div>
      </section>

      <CrossNav current="about" />
    </>
  );
}
