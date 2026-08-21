import Link from "next/link";
import Image from "next/image";
import { FOOTER_NAV, NLG_BRAND } from "@/lib/content";
import type { SOCIALS } from "@/lib/content";

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
    <footer className="border-border bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="relative h-9 w-40">
              <Image
                src={logoUrl}
                alt="New Level"
                fill
                sizes="160px"
                className="object-contain object-left dark:hidden"
              />
              <Image
                src={logoUrlDark}
                alt="New Level"
                fill
                sizes="160px"
                className="hidden object-contain object-left dark:block"
              />
            </div>
            <p className="text-muted-foreground mt-4 max-w-xs text-sm">
              {tagline} — a South Florida real estate group.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="border-border text-muted-foreground hover:text-foreground hover:border-primary/50 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <h3 className="font-heading text-sm font-semibold">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
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

        <div className="border-border text-muted-foreground mt-12 flex flex-col gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {NLG_BRAND.name}. Demo site —
            not affiliated with any live listings.
          </p>
          <p>1331 NW 87th Street, Miami, FL</p>
        </div>
      </div>
    </footer>
  );
}
