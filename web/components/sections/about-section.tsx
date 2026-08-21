import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import type { TRUST_STATS } from "@/lib/content";

export function AboutSection({
  aboutShort,
  trustStats,
}: {
  aboutShort: string;
  trustStats: typeof TRUST_STATS;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div>
          <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            About New Level
          </ShinePill>
          <h2 className="font-heading mt-6 max-w-lg text-4xl font-bold text-balance md:text-5xl">
            Real estate, redefined at every level.
          </h2>
          <p className="text-muted-foreground mt-6 max-w-lg text-lg text-balance">
            {aboutShort}
          </p>
          <Link
            href="/about"
            className={cn(
              buttonVariants({ size: "lg" }),
              "font-heading mt-8 rounded-xl px-6 font-semibold"
            )}
          >
            Learn about New Level
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {trustStats.map((stat) => (
            <GlowCard key={stat.label} className="p-6">
              <div className="font-heading text-primary text-3xl font-bold md:text-4xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-2 text-sm">
                {stat.label}
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground/70 mt-4 text-right text-xs">
        Figures shown are illustrative placeholders for this demo.
      </p>
    </section>
  );
}
