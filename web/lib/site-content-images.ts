// Deliberately has NO "server-only" import (unlike site-content.ts) — this
// pure function needs to be callable from client components too, for the
// pre-submission preview feature (resolving draft/picked-file URLs without
// ever touching Netlify Blobs).
export type SiteImageMeta = { updatedAt: number } | null;

// Team/testimonial slots are keyed by array index (team-0, team-1, ...) —
// looks the actual person up by that index for a friendlier label than a
// bare slot key, falling back to a generic label if the array shrank
// since a request referencing this slot was submitted. Shared by the
// Approvals list/revise page and the Content/Media form's upload labels.
export function imageSlotLabel(
  slot: string,
  content: { team: { name: string }[]; testimonials: { name: string }[] }
) {
  if (slot === "logo") return "Logo";
  if (slot === "hero-bg") return "Homepage background";
  const teamMatch = slot.match(/^team-(\d+)$/);
  if (teamMatch) {
    const i = Number(teamMatch[1]);
    return `Team photo — ${content.team[i]?.name ?? `member ${i + 1}`}`;
  }
  const testimonialMatch = slot.match(/^testimonial-(\d+)$/);
  if (testimonialMatch) {
    const i = Number(testimonialMatch[1]);
    return `Testimonial avatar — ${content.testimonials[i]?.name ?? `#${i + 1}`}`;
  }
  return slot;
}

export function resolveSiteImages(images: {
  logo: SiteImageMeta;
  heroBg: SiteImageMeta;
  slots?: Record<string, SiteImageMeta>;
}) {
  const logoUrl = images.logo
    ? `/api/site-image/logo?v=${images.logo.updatedAt}`
    : "/logo.png";

  const slotUrls: Record<string, string> = {};
  for (const [key, meta] of Object.entries(images.slots ?? {})) {
    if (meta) slotUrls[key] = `/api/site-image/${key}?v=${meta.updatedAt}`;
  }

  return {
    logoUrl,
    // No way to derive a dark-mode variant for an arbitrary admin upload,
    // so a custom logo just displays as-is in both themes. Only the
    // built-in default gets the real light/dark swap.
    logoUrlDark: images.logo ? logoUrl : "/logo-dark.png",
    heroBgUrl: images.heroBg
      ? `/api/site-image/hero-bg?v=${images.heroBg.updatedAt}`
      : "/photos/00.jpg",
    // Keyed overrides (team-<i>/testimonial-<i>) — getSiteContent() overlays
    // these onto the matching member's `photo` field; most callers never
    // touch this directly.
    slotUrls,
  };
}
