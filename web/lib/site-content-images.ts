// Deliberately has NO "server-only" import (unlike site-content.ts) — this
// pure function needs to be callable from client components too, for the
// pre-submission preview feature (resolving draft/picked-file URLs without
// ever touching Netlify Blobs).
export type SiteImageMeta = { updatedAt: number } | null;

export function resolveSiteImages(images: { logo: SiteImageMeta; heroBg: SiteImageMeta }) {
  const logoUrl = images.logo
    ? `/api/site-image/logo?v=${images.logo.updatedAt}`
    : "/logo.png";
  return {
    logoUrl,
    // No way to derive a dark-mode variant for an arbitrary admin upload,
    // so a custom logo just displays as-is in both themes. Only the
    // built-in default gets the real light/dark swap.
    logoUrlDark: images.logo ? logoUrl : "/logo-dark.png",
    heroBgUrl: images.heroBg
      ? `/api/site-image/hero-bg?v=${images.heroBg.updatedAt}`
      : "/photos/00.jpg",
  };
}
