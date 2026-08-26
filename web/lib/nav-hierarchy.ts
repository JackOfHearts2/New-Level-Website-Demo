import { SERVICES, TEAM, BLOG_CATEGORIES } from "@/lib/content";
import type { Crumb } from "@/components/breadcrumbs";

/** The site's real navigational hierarchy — every page's parent, matching
 *  where it actually lives in the nav (About's dropdown, Properties'
 *  dropdown, etc.), not just "Home > this page." Client ask (2026-08-27):
 *  "the breadcrumbs have to actually follow an internal site logic...
 *  if someone goes through the about section and clicks on broker's
 *  corner, the breadcrumbs need to show broker's corner before that
 *  about, and before that home... if I click on about it needs to
 *  actually take me to that about screen... even though we're not on
 *  broker's corner anymore." getBreadcrumbTrail() below is the one place
 *  that walks this into an actual trail — every page calls that instead
 *  of hand-typing its own crumb array, so the trail can't drift out of
 *  sync with this map the way a per-page one eventually would. */
export type HierarchyEntry = { label: string; parent: string | null };

export const NAV_HIERARCHY: Record<string, HierarchyEntry> = {
  "/properties": { label: "Properties", parent: null },
  "/properties/residential": { label: "Residential", parent: "/properties" },
  "/properties/commercial": { label: "Commercial", parent: "/properties" },
  "/properties/rental": { label: "Rental", parent: "/properties" },
  "/portfolio": { label: "Full Portfolio", parent: "/properties" },

  "/about": { label: "About", parent: null },
  "/team": { label: "Team", parent: "/about" },
  "/brokers-corner": { label: "The Broker's Corner", parent: "/about" },
  "/content-library": { label: "Content Library", parent: "/about" },
  "/partners": { label: "Partners", parent: "/about" },
  "/careers": { label: "Careers", parent: "/about" },

  "/services": { label: "Services", parent: null },
  "/blog": { label: "Blog", parent: null },
  "/testimonials": { label: "Testimonials", parent: null },
  "/events": { label: "Events", parent: null },
  "/contact": { label: "Contact", parent: null },
  "/faq": { label: "FAQ", parent: null },
  "/saved-properties": { label: "Saved Properties", parent: null },
  "/subscribe": { label: "Subscribe", parent: null },
  "/privacy": { label: "Privacy Policy", parent: null },
  "/terms": { label: "Terms of Service", parent: null },
  "/risk-disclosure": { label: "Risk Disclosure", parent: null },
  "/fair-housing": { label: "Fair Housing", parent: null },
  "/accessibility": { label: "Accessibility", parent: null },
};

const DYNAMIC_SECTIONS = ["services", "team", "blog"] as const;
type DynamicSection = (typeof DYNAMIC_SECTIONS)[number];

// Resolves a dynamic leaf's label from the same static content array its
// own page already renders from, so it's never out of sync with the real
// page title.
function resolveDynamicLeaf(section: DynamicSection, slug: string): string | null {
  if (section === "services") return SERVICES.find((s) => s.id === slug)?.t ?? null;
  if (section === "team") return TEAM.find((m) => m.slug === slug)?.name ?? null;
  if (section === "blog") return BLOG_CATEGORIES.find((c) => c.id === slug)?.label ?? null;
  return null;
}

function walkHierarchy(path: string): Crumb[] | null {
  const chain: Crumb[] = [];
  let current: string | null = path;
  let first = true;
  while (current) {
    const entry: HierarchyEntry | undefined = NAV_HIERARCHY[current];
    if (!entry) return null;
    chain.unshift({ label: entry.label, href: first ? undefined : current });
    current = entry.parent;
    first = false;
  }
  return chain;
}

// Every trail returned by this is "the real current page" as its last,
// href-less entry — so a caller passing a *parent* path (e.g. the DB
// listing detail page, whose own title getBreadcrumbTrail can't know)
// needs that parent's own entry turned back into a link first.
function asLinkedAncestor(trail: Crumb[], href: string): Crumb[] {
  return trail.map((c, i) => (i === trail.length - 1 ? { ...c, href } : c));
}

/**
 * Builds "Home / ... / current page" for any static route in
 * NAV_HIERARCHY, or a `services|team|blog` slug route (resolved against
 * the real content arrays). Pass `leafOverride` when the real title can't
 * come from static content at all (a live DB row, e.g. a property
 * listing) — `pathname` then means "the parent section," not the current
 * page, and the override becomes the trail's actual last entry.
 * Returns `[]` for anything not in the map (an unknown route says
 * nothing rather than guessing).
 */
export function getBreadcrumbTrail(pathname: string, leafOverride?: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  let trail: Crumb[];

  if (leafOverride) {
    const parentTrail = walkHierarchy(pathname);
    if (!parentTrail) return [];
    trail = [...asLinkedAncestor(parentTrail, pathname), { label: leafOverride }];
  } else if (segments.length === 2 && (DYNAMIC_SECTIONS as readonly string[]).includes(segments[0])) {
    const sectionRoot = `/${segments[0]}`;
    const dynamicLabel = resolveDynamicLeaf(segments[0] as DynamicSection, segments[1]);
    if (!dynamicLabel) return [];
    const parentTrail = walkHierarchy(sectionRoot);
    if (!parentTrail) return [];
    trail = [...asLinkedAncestor(parentTrail, sectionRoot), { label: dynamicLabel }];
  } else {
    const direct = walkHierarchy(pathname);
    if (!direct) return [];
    trail = direct;
  }

  return [{ label: "Home", href: "/" }, ...trail];
}
