import Link from "next/link";
import type { SERVICES } from "@/lib/content";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { InlineEditable } from "@/components/edit-mode/inline-editable";

export function ServicesSection({
  services,
}: {
  services: typeof SERVICES;
}) {
  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
            Services
          </ShinePill>
          <h2 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
            What we do.
          </h2>
          <p className="text-foreground mt-4 text-lg text-balance">
            Brokerage, investment, property management and events: the full
            New Level offering.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const href = service.id === "events" ? "/events" : `/services/${service.id}`;
            return (
              <GlowCard
                key={service.id}
                className="hover:-translate-y-1 flex flex-col p-6 transition-transform duration-300"
              >
                {/* Stretched-link pattern: the whole card is still
                    clickable (this covers it edge-to-edge, z-0), but the
                    title/description below sit in their own stacking
                    context (relative z-10) so InlineEditable's pencil
                    button — a real <button> — isn't nested inside this
                    <a>, which would be invalid markup and would fire a
                    navigation on every pencil click. Same nested-
                    interactive concern already documented for the Event
                    CTA button, solved differently here since almost the
                    whole card (not just one small button) needs to stay
                    editable. */}
                <Link href={href} className="absolute inset-0 z-0" aria-label={service.t} />
                <h3 className="font-heading relative z-10 text-lg font-semibold">
                  <InlineEditable name={`services.${i}.t`} value={service.t} />
                </h3>
                <div className="text-foreground relative z-10 mt-3 flex-1 text-sm">
                  <InlineEditable name={`services.${i}.d`} value={service.d} textarea />
                </div>
                <span className="text-primary font-heading relative z-10 mt-4 text-sm font-semibold">
                  Learn more →
                </span>
              </GlowCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
