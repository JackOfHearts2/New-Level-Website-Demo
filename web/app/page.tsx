import { HeroSection } from "@/components/ui/hero-section";
import { SearchBox } from "@/components/search-box";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { EventCtaSection } from "@/components/sections/event-cta-section";
import { TeamSection } from "@/components/sections/team-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CtaWithTextMarquee } from "@/components/ui/cta-with-text-marquee";
import { SiteFooter } from "@/components/sections/site-footer";
import { MobileDock } from "@/components/mobile-dock";
import { FloatingActions } from "@/components/floating-actions";
import { getSiteContent } from "@/lib/site-content";

export default async function Home() {
  const content = await getSiteContent();

  return (
    <>
      <HeroSection
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
        heroBgUrl={content.images.heroBgUrl}
      />
      <div className="pb-24 md:pb-0">
        <SearchBox />
        <AboutSection
          aboutShort={content.brand.aboutShort}
          trustStats={content.trustStats}
        />
        <ServicesSection services={content.services} />
        <EventCtaSection eventCta={content.eventCta} />
        <TeamSection team={content.team} />
        <TestimonialsSection testimonials={content.testimonials} />
      </div>
      <CtaWithTextMarquee />
      <SiteFooter
        tagline={content.brand.tagline}
        socials={content.socials}
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
      />
      <MobileDock />
      <FloatingActions />
    </>
  );
}
