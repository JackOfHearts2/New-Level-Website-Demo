import { PageHero } from "@/components/page-hero";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { POINT_OF_CONTACT } from "@/lib/content";

// Shared layout for every legal/policy page (Privacy, Terms, Risk
// Disclosure, Fair Housing) — same PageHero + demo disclaimer + GlowCard
// section list + contact CTA treatment across all of them, so the design
// (and any future changes to it) stays consistent instead of copy-pasted
// four times.
export function LegalPage({
  eyebrow,
  heading,
  sub,
  lastUpdated,
  disclaimer,
  sections,
}: {
  eyebrow: string;
  heading: string;
  sub: string;
  lastUpdated: string;
  disclaimer: string;
  sections: { t: string; d: string }[];
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} heading={heading} sub={sub} />

      <section className="mx-auto max-w-3xl px-6 pb-8">
        <p className="text-muted-foreground text-center text-sm">
          Last updated: {lastUpdated}
        </p>
        <div className="border-border bg-muted/40 mt-6 rounded-2xl border p-5 text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground font-heading">
              This is a demo site.
            </strong>{" "}
            {disclaimer}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-6 px-6 pb-16">
        {sections.map((s) => (
          <GlowCard key={s.t} className="p-6">
            <h2 className="font-heading text-lg font-semibold">{s.t}</h2>
            <p className="text-muted-foreground mt-2 text-sm text-balance">
              {s.d}
            </p>
          </GlowCard>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <div className="border-border rounded-2xl border p-8 shadow-sm">
          <h2 className="font-heading text-xl font-semibold">
            Questions about this page?
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Reach out and we&apos;ll walk you through it — {POINT_OF_CONTACT.email}
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/contact">Contact Us</CtaLink>
          </div>
        </div>
      </section>
    </>
  );
}
