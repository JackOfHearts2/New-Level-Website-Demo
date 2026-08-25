import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { CtaLink } from "@/components/ui/cta-link";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Page not found · New Level",
};

// Site audit finding: an unmatched URL (a typo, an old bookmark, a broken
// link) was falling through to Next.js's completely generic, unstyled
// default 404 - no branding, no nav, no way back into the site, and it
// doesn't inherit (marketing)/layout.tsx's header/footer since this file
// sits outside that route group. Rebuilt with the same SiteHeader/
// SiteFooter a real page gets, so a lost visitor lands somewhere that
// still looks like this site and has an obvious way forward.
export default async function NotFound() {
  const content = await getSiteContent();

  return (
    <>
      <SiteHeader
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
      />
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
        <span className="font-heading text-primary text-sm font-semibold tracking-wide uppercase">
          404
        </span>
        <h1 className="font-heading mt-4 text-4xl font-bold text-balance md:text-5xl">
          This page didn&apos;t make it.
        </h1>
        <p className="text-foreground mt-4 max-w-md text-balance">
          The page you&apos;re looking for doesn&apos;t exist — it may have moved, or the link
          might have a typo. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <CtaLink href="/">Back to home</CtaLink>
          <CtaLink href="/properties" variant="light">
            View properties
          </CtaLink>
        </div>
      </main>
      <SiteFooter
        tagline={content.brand.tagline}
        socials={content.socials}
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
      />
    </>
  );
}
