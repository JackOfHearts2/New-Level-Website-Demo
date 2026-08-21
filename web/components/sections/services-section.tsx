import type { SERVICES } from "@/lib/content";
import { GlowCard } from "@/components/ui/glow-card";

export function ServicesSection({
  services,
}: {
  services: typeof SERVICES;
}) {
  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            Services
          </span>
          <h2 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
            What we do.
          </h2>
          <p className="text-muted-foreground mt-4 text-lg text-balance">
            Brokerage, investment, property management and events — the full
            New Level offering.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <GlowCard
              key={service.id}
              href={`/services#${service.id}`}
              className="hover:-translate-y-1 flex flex-col p-6 transition-transform duration-300"
            >
              <h3 className="font-heading text-lg font-semibold">
                {service.t}
              </h3>
              <p className="text-muted-foreground mt-3 flex-1 text-sm">
                {service.d}
              </p>
              <span className="text-primary font-heading mt-4 text-sm font-semibold">
                Learn more →
              </span>
            </GlowCard>
          ))}
        </div>
      </div>
    </section>
  );
}
