import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { MobileDock } from "@/components/mobile-dock";
import { FloatingActions } from "@/components/floating-actions";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { PageTransition } from "@/components/page-transition";
import { ReportProblemWidget } from "@/components/report-problem/report-problem-widget";
import { AutoSignInModal } from "@/components/auto-signin-modal";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { EditModeProvider } from "@/components/edit-mode/edit-mode-context";
import { EditModeToggle } from "@/components/edit-mode/edit-mode-toggle";
import { getSiteContent } from "@/lib/site-content";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <EditModeProvider initialContent={content}>
      <SiteHeader
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
      />
      <div className="pb-24 md:pb-0">
        <PageTransition>{children}</PageTransition>
      </div>
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
      <Suspense fallback={null}>
        <AutoSignInModal />
      </Suspense>
      <PageViewTracker />
    </EditModeProvider>
  );
}
