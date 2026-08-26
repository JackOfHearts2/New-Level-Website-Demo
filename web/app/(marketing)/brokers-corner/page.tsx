import Image from "next/image";
import type { Metadata } from "next";
import { Play } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { ShinePill, ShineCircle, ShineBox } from "@/components/ui/shine-shape";
import { GlowCard } from "@/components/ui/glow-card";
import { AskBrokerButton } from "@/components/ask-broker-button";
import { BrokersCornerIntroSection } from "@/components/sections/brokers-corner-intro-section";
import { getSiteContent } from "@/lib/site-content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

export const metadata: Metadata = {
  title: "The Broker's Corner · New Level",
};

export default async function BrokersCornerPage() {
  const content = await getSiteContent();
  const page = content.pages.brokersCorner;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        breadcrumbs={getBreadcrumbTrail("/brokers-corner")}
        editKey="brokersCorner"
      />

      <BrokersCornerIntroSection
        tagline={content.brokersCorner.tagline}
        intro={content.brokersCorner.intro}
        bio={content.brokersCorner.bio}
      />

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <GlowCard className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
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
            <p className="text-foreground text-sm">Founder &amp; Principal Broker</p>
          </div>
          <div className="sm:ml-auto">
            <AskBrokerButton />
          </div>
        </GlowCard>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
          Latest Episode
        </ShinePill>
        <ShineBox className="bg-muted border-border relative mt-6 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border">
          <ShineCircle className="bg-background/80 flex size-16 items-center justify-center rounded-full shadow-sm">
            <Play className="text-primary size-6 fill-current" />
          </ShineCircle>
        </ShineBox>
        <p className="text-foreground mt-4 text-center text-sm">
          Full video series coming soon.
        </p>
      </section>

      <CrossNav current="brokersCorner" />
    </>
  );
}
