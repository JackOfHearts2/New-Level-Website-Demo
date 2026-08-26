import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { CtaLink } from "@/components/ui/cta-link";
import { InlineEditable } from "@/components/edit-mode/inline-editable";
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
          <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
            About New Level
          </ShinePill>
          <h2 className="font-heading mt-6 max-w-lg text-4xl font-bold text-balance md:text-5xl">
            Real Estate, Redefined at every level.
          </h2>
          <InlineEditable
            name="brand.aboutShort"
            value={aboutShort}
            textarea
            tag="p"
            className="text-foreground mt-6 max-w-lg text-lg text-balance"
          />
          <div className="mt-8">
            <CtaLink href="/about">Learn about New Level</CtaLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {trustStats.map((stat, i) => (
            <GlowCard key={stat.label} className="p-6">
              <InlineEditable
                name={`trustStats.${i}.value`}
                value={stat.value}
                tag="div"
                className="font-heading text-primary text-3xl font-bold md:text-4xl"
              />
              <InlineEditable
                name={`trustStats.${i}.label`}
                value={stat.label}
                tag="div"
                className="text-foreground mt-2 text-sm"
              />
            </GlowCard>
          ))}
        </div>
      </div>
      <p className="text-foreground mt-4 text-right text-sm">
        Figures shown are illustrative placeholders for this demo.
      </p>
    </section>
  );
}
