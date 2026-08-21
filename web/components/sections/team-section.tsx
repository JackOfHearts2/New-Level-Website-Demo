import type { TEAM } from "@/lib/content";
import { TeamImageAccordion } from "@/components/team/team-image-accordion";
import { CtaLink } from "@/components/ui/cta-link";
import { ShinePill } from "@/components/ui/shine-shape";

export function TeamSection({ team }: { team: typeof TEAM }) {
  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
          Agents & Partners
        </ShinePill>
        <h2 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
          Our Team
        </h2>
      </div>

      <TeamImageAccordion team={team} />

      <div className="mt-8 flex justify-center">
        <CtaLink href="/team">Meet the full team</CtaLink>
      </div>
    </section>
  );
}
