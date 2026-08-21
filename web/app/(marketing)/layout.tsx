import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { getSiteContent } from "@/lib/site-content";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();

  return (
    <>
      <SiteHeader logoUrl={content.images.logoUrl} />
      {children}
      <SiteFooter
        tagline={content.brand.tagline}
        socials={content.socials}
        logoUrl={content.images.logoUrl}
      />
    </>
  );
}
