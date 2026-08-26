import { GlowCard } from "@/components/ui/glow-card";
import type { PARTNERS } from "@/lib/content";

/** Extracted out of partners/page.tsx (2026-08-27) so the admin
 *  dashboard's Content & Media preview can render the exact same markup
 *  an editor is about to publish, not an approximation. */
export function PartnersGrid({ partners }: { partners: typeof PARTNERS }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {partners.map((p, i) => (
        <GlowCard key={`${p.name}-${i}`} className="p-6">
          <p className="text-primary font-heading text-xs font-semibold tracking-wide uppercase">
            {p.category}
          </p>
          <h2 className="font-heading mt-1 text-lg font-semibold">{p.name}</h2>
          <p className="text-foreground mt-2 text-sm">{p.blurb}</p>
        </GlowCard>
      ))}
    </div>
  );
}
