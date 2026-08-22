"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUp } from "lucide-react";
import { FOOTER_NAV, NLG_BRAND } from "@/lib/content";
import type { SOCIALS } from "@/lib/content";
import { SOCIAL_ICONS } from "@/components/social-icons";
import { ThemeToggle } from "@/components/theme-toggle";

const SOCIAL_ICON_CLASS =
  "border-border hover:border-primary/50 hover:text-primary hover:-translate-y-1 flex size-10 items-center justify-center rounded-xl border border-dotted transition-transform";

export function SiteFooter({
  tagline,
  socials,
  logoUrl,
  logoUrlDark,
}: {
  tagline: string;
  socials: typeof SOCIALS;
  logoUrl: string;
  logoUrlDark: string;
}) {
  return (
    <footer className="border-border mx-auto w-full min-w-0 border-t px-2">
      <div className="mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-0 md:flex">
        <Link href="/" className="flex items-center justify-center">
          <div className="relative h-14 w-60">
            <Image
              src={logoUrl}
              alt="New Level"
              fill
              sizes="240px"
              className="object-contain dark:hidden"
            />
            <Image
              src={logoUrlDark}
              alt="New Level"
              fill
              sizes="240px"
              className="hidden object-contain dark:block"
            />
          </div>
        </Link>
        <p className="text-muted-foreground text-center text-sm leading-5 md:text-left">
          {tagline} — a South Florida Real Estate group matching standout
          properties to the moments they&apos;re made for.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-border border-b border-dotted" />
        <div className="py-10">
          <div className="grid grid-cols-2 justify-between gap-8 sm:flex sm:flex-row">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <h3 className="font-heading text-sm font-semibold">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label} className="flow-root">
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-border border-b border-dotted" />
      </div>

      <div className="flex flex-wrap justify-center gap-y-6 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 px-6">
          {socials.map((s) => {
            const Icon = "id" in s ? SOCIAL_ICONS[s.id] : undefined;
            return (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.name}
                className={SOCIAL_ICON_CLASS}
              >
                {Icon && <Icon className="size-4.5" />}
              </a>
            );
          })}
        </div>

        <div className="flex items-center justify-center">
          <div className="border-border flex items-center gap-1 rounded-full border border-dotted p-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => window.scroll({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-full transition-colors"
            >
              <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* mb-24 on mobile: the fixed MobileDock always floats over whatever
          is at the bottom of the page, and the footer's copyright line is
          the true end of every page — without this it's permanently
          covered. */}
      <div className="mx-auto mb-24 flex flex-col justify-between text-center text-sm md:mb-10 md:max-w-7xl">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} {NLG_BRAND.name}. Demo site —
          not affiliated with any live listings.
        </p>
      </div>
    </footer>
  );
}
