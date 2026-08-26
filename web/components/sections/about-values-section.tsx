import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import type { VALUES } from "@/lib/content";

/** Extracted out of about/page.tsx (2026-08-27) so the admin dashboard's
 *  Content & Media preview can render the exact same markup an editor is
 *  about to publish, not an approximation. */
export function AboutValuesSection({ values }: { values: typeof VALUES }) {
  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
            What We Stand For
          </ShinePill>
          <h2 className="font-heading mt-6 text-3xl font-bold text-balance md:text-4xl">
            Our Values
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((value) => (
            <GlowCard key={value.t} className="p-6">
              <h3 className="font-heading font-semibold">{value.t}</h3>
              <p className="text-foreground mt-2 text-sm">{value.d}</p>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
