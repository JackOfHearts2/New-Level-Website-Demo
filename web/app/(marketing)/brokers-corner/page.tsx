import Image from "next/image";
import type { Metadata } from "next";
import { Play } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { ShinePill, ShineCircle } from "@/components/ui/shine-shape";
import { CtaLink } from "@/components/ui/cta-link";
import { PAGES, BROKERS_CORNER } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Broker's Corner · New Level",
};

export default function BrokersCornerPage() {
  const page = PAGES.brokersCorner;

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} sub={page.sub} />

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="border-border flex flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm sm:flex-row sm:text-left">
          <ShineCircle className="relative size-16 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/team/shelley-lozier.png"
              alt="Shelley Lozier"
              fill
              sizes="64px"
              className="object-cover"
            />
          </ShineCircle>
          <div>
            <h2 className="font-heading font-semibold">Shelley Lozier</h2>
            <p className="text-muted-foreground text-sm">Founder &amp; Principal Broker</p>
          </div>
          <div className="sm:ml-auto">
            <CtaLink href="/contact">Ask Shelley a Question</CtaLink>
          </div>
        </div>
        <p className="text-muted-foreground mt-8 text-balance">{BROKERS_CORNER.bio}</p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
          Latest Episode
        </ShinePill>
        <div className="bg-muted border-border relative mt-6 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border">
          <ShineCircle className="bg-background/80 flex size-16 items-center justify-center rounded-full shadow-sm">
            <Play className="text-primary size-6 fill-current" />
          </ShineCircle>
        </div>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Full video series coming soon.
        </p>
      </section>

      <CrossNav current="brokersCorner" />
    </>
  );
}
