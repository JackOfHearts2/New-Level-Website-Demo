import "server-only";
import { getStore } from "@netlify/blobs";
import {
  NLG_BRAND,
  EVENT_CTA,
  TRUST_STATS,
  SERVICES,
  TESTIMONIALS,
  TEAM,
  SOCIALS,
} from "./content";

const STORE_NAME = "site-admin";
const CONTENT_KEY = "content";
const SCHEMA_VERSION = 1;

type ImageSlotMeta = { updatedAt: number } | null;

export type SiteContent = {
  schemaVersion: 1;
  brand: { tagline: string; aboutShort: string };
  eventCta: typeof EVENT_CTA;
  trustStats: typeof TRUST_STATS;
  services: typeof SERVICES;
  testimonials: typeof TESTIMONIALS;
  team: typeof TEAM;
  socials: typeof SOCIALS;
  images: { logo: ImageSlotMeta; heroBg: ImageSlotMeta };
};

const DEFAULTS: SiteContent = {
  schemaVersion: SCHEMA_VERSION,
  brand: { tagline: NLG_BRAND.tagline, aboutShort: NLG_BRAND.aboutShort },
  eventCta: EVENT_CTA,
  trustStats: TRUST_STATS,
  services: SERVICES,
  testimonials: TESTIMONIALS,
  team: TEAM,
  socials: SOCIALS,
  images: { logo: null, heroBg: null },
};

function safeStore() {
  try {
    return getStore(STORE_NAME);
  } catch {
    return null;
  }
}

export async function getRawSiteContent(): Promise<SiteContent> {
  const store = safeStore();
  if (!store) return DEFAULTS;
  try {
    const stored = await store.get(CONTENT_KEY, { type: "json" });
    if (stored && (stored as SiteContent).schemaVersion === SCHEMA_VERSION) {
      return stored as SiteContent;
    }
  } catch {
    // Blobs unreachable (local dev, or a real outage) — fall back silently
  }
  return DEFAULTS;
}

export async function saveSiteContent(content: SiteContent) {
  const store = safeStore();
  if (!store) throw new Error("Storage unavailable");
  await store.setJSON(CONTENT_KEY, content);
}

/** Resolved view used by pages — turns image metadata into fetchable URLs. */
export async function getSiteContent() {
  const raw = await getRawSiteContent();
  const logoUrl = raw.images.logo
    ? `/api/site-image/logo?v=${raw.images.logo.updatedAt}`
    : "/logo.png";
  return {
    ...raw,
    images: {
      logoUrl,
      // No way to derive a dark-mode variant for an arbitrary admin
      // upload, so a custom logo just displays as-is in both themes.
      // Only the built-in default gets the real light/dark swap.
      logoUrlDark: raw.images.logo ? logoUrl : "/logo-dark.png",
      heroBgUrl: raw.images.heroBg
        ? `/api/site-image/hero-bg?v=${raw.images.heroBg.updatedAt}`
        : "/photos/00.jpg",
    },
  };
}

export function siteContentDefaults() {
  return DEFAULTS;
}

export function imageBlobStore() {
  return safeStore();
}

export const SITE_CONTENT_STORE = STORE_NAME;
