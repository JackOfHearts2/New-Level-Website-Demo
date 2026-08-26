import { Suspense } from "react";
import { SkipToContent } from "@/components/skip-to-content";
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
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { SiteTour } from "@/components/site-tour";
import { ReportProblemWidget } from "@/components/report-problem/report-problem-widget";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { AutoSignInModal } from "@/components/auto-signin-modal";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { EditModeProvider } from "@/components/edit-mode/edit-mode-context";
import { EditModeToggle } from "@/components/edit-mode/edit-mode-toggle";
import { getSiteContent } from "@/lib/site-content";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tour?: string }>;
}) {
  const content = await getSiteContent();
  const { tour } = await searchParams;

  return (
    <EditModeProvider initialContent={content}>
      <SkipToContent />
      <HeroSection
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
        heroBgUrl={content.images.heroBgUrl}
      />
      <div id="main-content" className="pb-24 md:pb-0">
        <SearchBox />
        <AboutSection
          aboutShort={content.brand.aboutShort}
          trustStats={content.trustStats}
        />
        <div data-tour="services">
          <ServicesSection services={content.services} />
        </div>
        <div data-tour="events">
          <EventCtaSection eventCta={content.eventCta} />
        </div>
        <TeamSection team={content.team} />
        <div data-tour="testimonials">
          <TestimonialsSection testimonials={content.testimonials} />
        </div>
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
      <ReportProblemWidget />
      <ScrollToTopButton />
      <EditModeToggle />
      <SiteTour startTour={tour === "1"} />
      <Suspense fallback={null}>
        <AutoSignInModal />
      </Suspense>
      <PageViewTracker />
      <CookieConsentBanner />
    </EditModeProvider>
  );
}
