import type { SiteContent } from "@/lib/site-content";

// Deliberately no "use server"/"server-only" — this is plain data mapping
// (FormData -> SiteContent), reused both by the real saveContent Server
// Action and by the client-side pre-submission preview, which needs to
// build the exact same shape a submission would produce without ever
// hitting the server. Keeping this in one place means the two can't drift.

/** Text input length caps — keeps a mistaken paste from bloating the blob. */
const SHORT = 120;
const MEDIUM = 400;
const LONG = 2000;

function field(formData: FormData, name: string, max: number) {
  const value = String(formData.get(name) ?? "").trim();
  return value.slice(0, max);
}

/** Only accept http(s) links — rejects javascript:/data: URLs before they can
 *  ever be rendered as a footer <a href>. Falls back to the current value. */
function urlField(formData: FormData, name: string, max: number, fallback: string) {
  const value = field(formData, name, max);
  return /^https?:\/\//i.test(value) ? value : fallback;
}

export function buildContentFromFormData(current: SiteContent, formData: FormData): SiteContent {
  return {
    ...current,
    schemaVersion: 1,
    brand: {
      tagline: field(formData, "brand.tagline", SHORT),
      aboutShort: field(formData, "brand.aboutShort", LONG),
    },
    eventCta: {
      eyebrow: field(formData, "eventCta.eyebrow", SHORT),
      heading: field(formData, "eventCta.heading", MEDIUM),
      sub: field(formData, "eventCta.sub", LONG),
      cta: field(formData, "eventCta.cta", SHORT),
    },
    trustStats: current.trustStats.map((stat, i) => ({
      value: field(formData, `trustStats.${i}.value`, SHORT),
      label: field(formData, `trustStats.${i}.label`, MEDIUM),
    })),
    services: current.services.map((service, i) => ({
      ...service,
      t: field(formData, `services.${i}.t`, SHORT),
      d: field(formData, `services.${i}.d`, LONG),
    })),
    testimonials: current.testimonials.map((testimonial, i) => ({
      ...testimonial,
      name: field(formData, `testimonials.${i}.name`, SHORT),
      role: field(formData, `testimonials.${i}.role`, SHORT),
      text: field(formData, `testimonials.${i}.text`, LONG),
    })),
    team: current.team.map((member, i) => ({
      ...member,
      name: field(formData, `team.${i}.name`, SHORT),
      role: field(formData, `team.${i}.role`, SHORT),
      motto: field(formData, `team.${i}.motto`, MEDIUM),
      placeholder: member.placeholder,
    })),
    socials: current.socials.map((social, i) => ({
      ...social,
      href: urlField(formData, `socials.${i}.href`, MEDIUM, social.href),
    })),
  };
}
