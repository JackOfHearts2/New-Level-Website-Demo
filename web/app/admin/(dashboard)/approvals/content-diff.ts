import type { SiteContent } from "@/lib/site-content";

export type DiffEntry = { label: string; before: string; after: string };

/** Field-by-field before/after for a pending content request. SiteContent's
 *  shape is fixed and shallow enough that a targeted diff (rather than a
 *  generic deep-diff library) is simpler and shows friendlier labels. */
export function diffSiteContent(base: SiteContent, proposed: SiteContent): DiffEntry[] {
  const entries: DiffEntry[] = [];
  const push = (label: string, before: string, after: string) => {
    if (before !== after) entries.push({ label, before, after });
  };

  push("Tagline", base.brand.tagline, proposed.brand.tagline);
  push("About blurb", base.brand.aboutShort, proposed.brand.aboutShort);

  push("Event CTA eyebrow", base.eventCta.eyebrow, proposed.eventCta.eyebrow);
  push("Event CTA heading", base.eventCta.heading, proposed.eventCta.heading);
  push("Event CTA subtext", base.eventCta.sub, proposed.eventCta.sub);
  push("Event CTA button", base.eventCta.cta, proposed.eventCta.cta);

  base.trustStats.forEach((stat, i) => {
    const next = proposed.trustStats[i];
    if (!next) return;
    push(`Trust stat ${i + 1} value`, stat.value, next.value);
    push(`Trust stat ${i + 1} label`, stat.label, next.label);
  });

  base.services.forEach((service, i) => {
    const next = proposed.services[i];
    if (!next) return;
    push(`Service ${i + 1} title`, service.t, next.t);
    push(`Service ${i + 1} description`, service.d, next.d);
  });

  base.testimonials.forEach((testimonial, i) => {
    const next = proposed.testimonials[i];
    if (!next) return;
    push(`Testimonial ${i + 1} name`, testimonial.name, next.name);
    push(`Testimonial ${i + 1} role`, testimonial.role, next.role);
    push(`Testimonial ${i + 1} quote`, testimonial.text, next.text);
  });

  base.team.forEach((member, i) => {
    const next = proposed.team[i];
    if (!next) return;
    push(`Team ${i + 1} name`, member.name, next.name);
    push(`Team ${i + 1} role`, member.role, next.role);
    push(`Team ${i + 1} motto`, member.motto, next.motto);
  });

  base.socials.forEach((social, i) => {
    const next = proposed.socials[i];
    if (!next) return;
    push(`${social.name} link`, social.href, next.href);
  });

  return entries;
}
