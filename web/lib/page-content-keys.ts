// Deliberately has NO "server-only" import, unlike site-content.ts — this
// is pure typing/constants, and lib/site-content-form.ts (imported from
// both the server-side save action AND client components like
// InlineEditable/ContentForm) needs it too. Importing it from
// site-content.ts directly would drag that file's "server-only" + real
// Netlify Blobs store into the browser bundle, the same class of build
// break the properties-public.ts/listing-format.ts split fixed earlier.
export type PageHeroContent = { eyebrow: string; heading: string; sub: string; intro: string };

// The set of landing pages whose hero copy lives in SiteContent.pages and
// is editable (client ask, 2026-08-27: every page, not just the
// homepage). "about" isn't a PAGES key in content.ts (its hero was
// hand-typed directly in about/page.tsx) — added here as its own key,
// sourced from that page's own text in site-content.ts's DEFAULTS.
export const PAGE_CONTENT_KEYS = [
  "about",
  "contact",
  "contentLibrary",
  "team",
  "testimonials",
  "faq",
  "brokersCorner",
  "services",
  "blog",
  "subscribe",
  "partners",
  "careers",
] as const;
export type PageContentKey = (typeof PAGE_CONTENT_KEYS)[number];

// Human-readable labels for the admin dashboard form's section
// headings/jump-nav — matches each page's real nav label.
export const PAGE_CONTENT_LABELS: Record<PageContentKey, string> = {
  about: "About",
  contact: "Contact",
  contentLibrary: "Content Library",
  team: "Team",
  testimonials: "Testimonials",
  faq: "FAQ",
  brokersCorner: "The Broker's Corner",
  services: "Services",
  blog: "Blog",
  subscribe: "Subscribe",
  partners: "Partners",
  careers: "Careers",
};

// Real URL for each page — most of these render statically (no per-
// request dynamic data), so a save has to explicitly revalidatePath()
// every one of them or the live site would keep serving whatever was
// baked in at the last build until the next deploy. See
// lib/revalidate-pages.ts, the single place that actually calls this.
export const PAGE_CONTENT_PATHS: Record<PageContentKey, string> = {
  about: "/about",
  contact: "/contact",
  contentLibrary: "/content-library",
  team: "/team",
  testimonials: "/testimonials",
  faq: "/faq",
  brokersCorner: "/brokers-corner",
  services: "/services",
  blog: "/blog",
  subscribe: "/subscribe",
  partners: "/partners",
  careers: "/careers",
};
