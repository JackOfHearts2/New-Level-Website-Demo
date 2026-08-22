import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { MobileDock } from "@/components/mobile-dock";
import { FloatingActions } from "@/components/floating-actions";
import { PageTransition } from "@/components/page-transition";
import { getSiteContent } from "@/lib/site-content";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <>
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
    </>
  );
}
