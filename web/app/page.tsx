import { HeroSection } from "@/components/ui/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { EventCtaSection } from "@/components/sections/event-cta-section";
import { TeamSection } from "@/components/sections/team-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { SiteFooter } from "@/components/sections/site-footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <EventCtaSection />
      <TeamSection />
      <TestimonialsSection />
      <SiteFooter />
    </>
  );
}
