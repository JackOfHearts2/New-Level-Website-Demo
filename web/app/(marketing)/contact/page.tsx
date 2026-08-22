import Image from "next/image";
import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { FaqList } from "@/components/faq-list";
import { buttonVariants } from "@/components/ui/button";
import { CtaLink } from "@/components/ui/cta-link";
import { GlowCard } from "@/components/ui/glow-card";
import { ShineCircle } from "@/components/ui/shine-shape";
import { cn } from "@/lib/utils";
import { PAGES, FAQS, POINT_OF_CONTACT } from "@/lib/content";
import { ContactTopics } from "./contact-topics";

export const metadata: Metadata = {
  title: "Contact · New Level",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const page = PAGES.contact;
  const { topic } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
      />

      <section className="px-6 pb-16">
        {/* key forces a remount when ?topic= changes via client-side nav
            (e.g. the footer's "Join Our Network" link while already on this
            page) — otherwise the mounted instance keeps its stale selection. */}
        <ContactTopics key={topic ?? "none"} initialTopic={topic} />
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-24">
        <GlowCard className="flex flex-col items-center gap-4 p-8 text-center">
          <ShineCircle className="relative size-16 overflow-hidden rounded-full">
            <Image
              src="/team/shelley-lozier.png"
              alt={POINT_OF_CONTACT.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </ShineCircle>
          <div>
            <h2 className="font-heading font-semibold">{POINT_OF_CONTACT.name}</h2>
            <p className="text-foreground text-sm">{POINT_OF_CONTACT.role}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${POINT_OF_CONTACT.phone}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "font-heading")}
            >
              <Phone />
              {POINT_OF_CONTACT.phone}
            </a>
            <a
              href={`mailto:${POINT_OF_CONTACT.email}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "font-heading")}
            >
              <Mail />
              Email
            </a>
            <a
              href={`https://wa.me/${POINT_OF_CONTACT.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm" }), "font-heading")}
            >
              WhatsApp
            </a>
          </div>
        </GlowCard>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <h2 className="font-heading text-center text-2xl font-bold">
          Quick answers
        </h2>
        <div className="mt-8">
          <FaqList faqs={FAQS.slice(0, 3)} />
        </div>
        <div className="mt-8 flex justify-center">
          <CtaLink href="/faq">See the full FAQ</CtaLink>
        </div>
      </section>

      <CrossNav current="contact" />
    </>
  );
}
