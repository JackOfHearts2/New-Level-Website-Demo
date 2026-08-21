import Link from "next/link";

const SITE_PAGES = [
  { key: "home", label: "Home", href: "/" },
  { key: "properties", label: "Properties", href: "/properties" },
  { key: "property", label: "1331 NW 87th Street", href: "/property" },
  { key: "about", label: "About", href: "/about" },
  { key: "team", label: "Team", href: "/team" },
  { key: "services", label: "Services", href: "/services" },
  { key: "testimonials", label: "Testimonials", href: "/testimonials" },
  { key: "events", label: "Events", href: "/events" },
  { key: "contact", label: "Contact", href: "/contact" },
  { key: "brokersCorner", label: "The Broker's Corner", href: "/brokers-corner" },
  { key: "faq", label: "FAQs", href: "/faq" },
] as const;

export type SitePageKey = (typeof SITE_PAGES)[number]["key"];

export function CrossNav({ current }: { current: SitePageKey }) {
  const links = SITE_PAGES.filter((p) => p.key !== current);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <p className="font-heading text-muted-foreground text-center text-xs font-semibold tracking-wide uppercase">
        Keep exploring
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {links.map((p) => (
          <Link
            key={p.key}
            href={p.href}
            className="border-border text-muted-foreground hover:text-foreground hover:border-primary/50 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
