import { PAGES, SERVICES, FAQS, TEAM, BLOG_CATEGORIES } from "@/lib/content";

export type SearchGroup = "Pages" | "Services" | "Team" | "Blog" | "FAQ";

export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  group: SearchGroup;
};

// PAGES' keys are camelCase but most of the site's routes are kebab-case —
// this is the one place that mapping needs to exist, so it's a plain
// lookup rather than a naming convention every route has to match.
const PAGE_ROUTES: Partial<Record<keyof typeof PAGES, string>> = {
  contentLibrary: "/content-library",
  blog: "/blog",
  team: "/team",
  services: "/services",
  testimonials: "/testimonials",
  events: "/events",
  contact: "/contact",
  subscribe: "/subscribe",
  brokersCorner: "/brokers-corner",
  faq: "/faq",
  partners: "/partners",
  careers: "/careers",
};

// Pages with real content worth surfacing in search but no entry in PAGES
// (About has its own NLG_BRAND-driven copy; Properties' own listing pages
// are already covered separately once real listings exist).
const EXTRA_PAGES: SearchEntry[] = [
  { title: "About New Level", description: "Our mission, story, and values.", href: "/about", group: "Pages" },
  { title: "Properties", description: "Browse residential, commercial, and rental listings.", href: "/properties", group: "Pages" },
];

/** A single client-safe, static search index built from the same content
 *  every page already renders from — no separate CMS/search service, and
 *  it stays in sync automatically since it reads the real arrays rather
 *  than a hand-maintained duplicate list. Deliberately excludes the live
 *  properties table (a client-side static index can't reflect a database
 *  that changes without a rebuild) — that's a natural follow-up once
 *  there's more than a couple of real listings to search. */
export function buildSearchIndex(): SearchEntry[] {
  const pages: SearchEntry[] = Object.entries(PAGES)
    .filter(([key]) => key in PAGE_ROUTES)
    .map(([key, page]) => ({
      title: page.heading,
      description: page.sub,
      href: PAGE_ROUTES[key as keyof typeof PAGES]!,
      group: "Pages" as const,
    }));

  const services: SearchEntry[] = SERVICES.map((s) => ({
    title: s.t,
    description: s.d,
    href: `/services/${s.id}`,
    group: "Services",
  }));

  const team: SearchEntry[] = TEAM.map((m) => ({
    title: m.name,
    description: m.role,
    href: `/team/${m.slug}`,
    group: "Team",
  }));

  const blog: SearchEntry[] = BLOG_CATEGORIES.map((c) => ({
    title: c.label,
    description: c.blurb,
    href: `/blog/${c.id}`,
    group: "Blog",
  }));

  const faq: SearchEntry[] = FAQS.map((f) => ({
    title: f.q,
    description: f.a,
    href: "/faq",
    group: "FAQ",
  }));

  return [...pages, ...EXTRA_PAGES, ...services, ...team, ...blog, ...faq];
}

export function searchIndex(index: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
    .slice(0, limit);
}
