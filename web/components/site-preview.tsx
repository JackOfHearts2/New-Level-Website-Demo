"use client";

import { X } from "lucide-react";
import { HeroSection } from "@/components/ui/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { EventCtaSection } from "@/components/sections/event-cta-section";
import { TeamSection } from "@/components/sections/team-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { SiteFooter } from "@/components/sections/site-footer";
import type { SiteContent } from "@/lib/site-content";

type ResolvedImages = { logoUrl: string; logoUrlDark: string; heroBgUrl: string };

/** Renders the same homepage content section tree app/page.tsx does, from
 *  a passed-in content object rather than a live fetch — used both for
 *  previewing a submitted/changes-requested request (with real data) and
 *  for a draft preview before anything's ever been submitted. Deliberately
 *  omits the interactive chrome (search box, mobile dock, floating
 *  actions, report widget, scroll-to-top, site tour) since none of that is
 *  content-driven and including it risks hitting real endpoints from
 *  inside a preview. HeroSection bundles its own nav (menu/profile/theme
 *  toggle) rather than a plain banner — that's expected here, it's what
 *  makes this read as "the real page," not a bug. */
export function SitePreview({
  content,
  onClose,
}: {
  content: Omit<SiteContent, "images"> & { images: ResolvedImages };
  onClose: () => void;
}) {
  return (
    <div className="bg-background fixed inset-0 z-50 overflow-y-auto">
      <div className="bg-foreground text-background sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3">
        <p className="font-heading text-sm font-semibold">
          Preview only — not visible to visitors
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="hover:bg-background/20 flex size-8 items-center justify-center rounded-full"
        >
          <X className="size-4" />
        </button>
      </div>

      <HeroSection
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
        heroBgUrl={content.images.heroBgUrl}
      />
      <AboutSection aboutShort={content.brand.aboutShort} trustStats={content.trustStats} />
      <ServicesSection services={content.services} />
      <EventCtaSection eventCta={content.eventCta} />
      <TeamSection team={content.team} />
      <TestimonialsSection testimonials={content.testimonials} />
      <SiteFooter
        tagline={content.brand.tagline}
        socials={content.socials}
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
      />
    </div>
  );
}
