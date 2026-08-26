import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { CtaLink } from "@/components/ui/cta-link";
import { FaqList } from "@/components/faq-list";
import { SERVICES } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

// Only brokerage/management/investment get their own dedicated page —
// "events" deliberately isn't in the Services nav dropdown (it lives under
// Properties → Private Events and the standalone Events page instead), so
// it's excluded here rather than getting a thin placeholder route.
const ROUTABLE_IDS = ["brokerage", "management", "investment"] as const;

function getService(slug: string) {
  if (!ROUTABLE_IDS.includes(slug as (typeof ROUTABLE_IDS)[number])) return undefined;
  return SERVICES.find((s) => s.id === slug);
}

export function generateStaticParams() {
  return ROUTABLE_IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  return { title: service ? `${service.t} · New Level` : "Services · New Level" };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const otherServices = SERVICES.filter((s) => s.id !== service.id && s.id !== "events");

  return (
    <>
      <PageHero
        eyebrow="Services"
        heading={service.t}
        sub={service.d}
        breadcrumbs={getBreadcrumbTrail(`/services/${slug}`)}
      />

      <section className="mx-auto max-w-4xl px-6 pb-16">
        <p className="text-foreground text-lg text-balance">{service.long}</p>
      </section>

      {service.capabilities.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="font-heading text-2xl font-bold">What this covers</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {service.capabilities.map((cap) => (
              <GlowCard key={cap.t} className="p-6">
                <h3 className="font-heading font-semibold">{cap.t}</h3>
                <p className="text-foreground mt-2 text-sm">{cap.d}</p>
              </GlowCard>
            ))}
          </div>
        </section>
      )}

      {"howItWorks" in service && service.howItWorks.length > 0 && (
        <section className="bg-muted/50 py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="font-heading text-2xl font-bold">How it works</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {service.howItWorks.map((step, i) => (
                <GlowCard key={step.t} className="p-6">
                  <ShinePill className="bg-accent text-accent-foreground font-heading flex size-8 items-center justify-center rounded-full text-sm font-bold">
                    {i + 1}
                  </ShinePill>
                  <h3 className="font-heading mt-4 font-semibold">{step.t}</h3>
                  <p className="text-foreground mt-2 text-sm">{step.d}</p>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {"faqs" in service && service.faqs.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-heading text-center text-2xl font-bold">
            Questions about {service.t.toLowerCase()}
          </h2>
          <div className="mt-8">
            <FaqList faqs={service.faqs} />
          </div>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <GlowCard className="p-8">
          <h2 className="font-heading text-xl font-semibold">Ready to talk it through?</h2>
          <p className="text-foreground mt-2 text-sm">
            The first conversation is free, no obligation to move forward.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/contact">Book a Consultation</CtaLink>
          </div>
        </GlowCard>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="font-heading text-center text-lg font-semibold">Other services</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {otherServices.map((s) => (
            <GlowCard key={s.id} href={`/services/${s.id}`} className="px-5 py-2.5">
              <span className="font-heading text-sm font-semibold">{s.t}</span>
            </GlowCard>
          ))}
        </div>
      </section>

      <CrossNav current="services" />
    </>
  );
}
