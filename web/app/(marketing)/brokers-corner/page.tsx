import Link from "next/link";
import type { Metadata } from "next";
import { Play } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
          <div className="bg-primary text-primary-foreground font-heading flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-bold">
            SL
          </div>
          <div>
            <h2 className="font-heading font-semibold">Shelley Lozier</h2>
            <p className="text-muted-foreground text-sm">Founder &amp; Principal Broker</p>
          </div>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "font-heading sm:ml-auto"
            )}
          >
            Ask Shelley a Question
          </Link>
        </div>
        <p className="text-muted-foreground mt-8 text-balance">{BROKERS_CORNER.bio}</p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
          Latest Episode
        </span>
        <div className="bg-muted border-border relative mt-6 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border">
          <div className="bg-background/80 flex size-16 items-center justify-center rounded-full shadow-sm">
            <Play className="text-primary size-6 fill-current" />
          </div>
        </div>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Full video series coming soon.
        </p>
      </section>

      <CrossNav current="brokersCorner" />
    </>
  );
}
