import { HeroSection } from "@/components/ui/hero-section";
import { SearchBox } from "@/components/search-box";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { EventCtaSection } from "@/components/sections/event-cta-section";
import { TeamSection } from "@/components/sections/team-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { SiteFooter } from "@/components/sections/site-footer";
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
      <SearchBox />
      <AboutSection
        aboutShort={content.brand.aboutShort}
        trustStats={content.trustStats}
      />
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
    </>
  );
}
