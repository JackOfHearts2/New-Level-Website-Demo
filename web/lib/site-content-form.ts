import type { SiteContent } from "@/lib/site-content";
import { PAGE_CONTENT_KEYS } from "@/lib/page-content-keys";

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

/** Inverse of buildContentFromFormData — builds a FormData with every field
 *  ContentForm's inputs would submit, populated from the current content.
 *  Needed because buildContentFromFormData has NO partial-merge behavior:
 *  a field missing from the submitted FormData is treated as an explicit
 *  blank, not "leave unchanged" (see `field()` above — it defaults to
 *  ""). Inline-edit (a single field, saved from the live page rather than
 *  the full dashboard form) has to submit a COMPLETE FormData with just
 *  its one field overridden, or every other field on the site would get
 *  wiped to empty on save. Keep this in exact sync with
 *  buildContentFromFormData's field-name scheme. Typed as a structural
 *  subset (not the full SiteContent) so callers holding either the raw
 *  or the images-resolved content shape can both pass their object
 *  straight through — this never reads `.images`. */
export function contentToFormData(
  content: Pick<
    SiteContent,
    | "brand"
    | "eventCta"
    | "trustStats"
    | "services"
    | "testimonials"
    | "team"
    | "socials"
    | "pages"
    | "values"
    | "faqs"
    | "partners"
    | "brokersCorner"
  >
): FormData {
  const fd = new FormData();
  fd.set("brand.tagline", content.brand.tagline);
  fd.set("brand.aboutShort", content.brand.aboutShort);
  fd.set("brand.mission", content.brand.mission);
  fd.set("brand.story", content.brand.story);
  fd.set("brokersCorner.tagline", content.brokersCorner.tagline);
  fd.set("brokersCorner.intro", content.brokersCorner.intro);
  fd.set("brokersCorner.bio", content.brokersCorner.bio);
  content.values.forEach((v, i) => {
    fd.set(`values.${i}.t`, v.t);
    fd.set(`values.${i}.d`, v.d);
  });
  content.faqs.forEach((f, i) => {
    fd.set(`faqs.${i}.q`, f.q);
    fd.set(`faqs.${i}.a`, f.a);
  });
  content.partners.forEach((p, i) => {
    fd.set(`partners.${i}.name`, p.name);
    fd.set(`partners.${i}.category`, p.category);
    fd.set(`partners.${i}.blurb`, p.blurb);
  });
  PAGE_CONTENT_KEYS.forEach((key) => {
    const page = content.pages[key];
    fd.set(`pages.${key}.eyebrow`, page.eyebrow);
    fd.set(`pages.${key}.heading`, page.heading);
    fd.set(`pages.${key}.sub`, page.sub);
    fd.set(`pages.${key}.intro`, page.intro);
  });
  fd.set("eventCta.eyebrow", content.eventCta.eyebrow);
  fd.set("eventCta.heading", content.eventCta.heading);
  fd.set("eventCta.sub", content.eventCta.sub);
  fd.set("eventCta.cta", content.eventCta.cta);
  content.trustStats.forEach((stat, i) => {
    fd.set(`trustStats.${i}.value`, stat.value);
    fd.set(`trustStats.${i}.label`, stat.label);
  });
  content.services.forEach((service, i) => {
    fd.set(`services.${i}.t`, service.t);
    fd.set(`services.${i}.d`, service.d);
  });
  content.testimonials.forEach((testimonial, i) => {
    fd.set(`testimonials.${i}.name`, testimonial.name);
    fd.set(`testimonials.${i}.role`, testimonial.role);
    fd.set(`testimonials.${i}.text`, testimonial.text);
  });
  content.team.forEach((member, i) => {
    fd.set(`team.${i}.name`, member.name);
    fd.set(`team.${i}.role`, member.role);
    fd.set(`team.${i}.motto`, member.motto);
  });
  content.socials.forEach((social, i) => {
    fd.set(`socials.${i}.href`, social.href);
  });
  return fd;
}

export function buildContentFromFormData(current: SiteContent, formData: FormData): SiteContent {
  return {
    ...current,
    schemaVersion: 1,
    brand: {
      tagline: field(formData, "brand.tagline", SHORT),
      aboutShort: field(formData, "brand.aboutShort", LONG),
      mission: field(formData, "brand.mission", LONG),
      story: field(formData, "brand.story", LONG),
    },
    brokersCorner: {
      tagline: field(formData, "brokersCorner.tagline", SHORT),
      intro: field(formData, "brokersCorner.intro", LONG),
      bio: field(formData, "brokersCorner.bio", LONG),
    },
    values: current.values.map((v, i) => ({
      t: field(formData, `values.${i}.t`, SHORT),
      d: field(formData, `values.${i}.d`, MEDIUM),
    })),
    faqs: current.faqs.map((f, i) => ({
      q: field(formData, `faqs.${i}.q`, MEDIUM),
      a: field(formData, `faqs.${i}.a`, LONG),
    })),
    partners: current.partners.map((p, i) => ({
      name: field(formData, `partners.${i}.name`, SHORT),
      category: field(formData, `partners.${i}.category`, SHORT),
      blurb: field(formData, `partners.${i}.blurb`, MEDIUM),
    })),
    pages: Object.fromEntries(
      PAGE_CONTENT_KEYS.map((key) => [
        key,
        {
          eyebrow: field(formData, `pages.${key}.eyebrow`, SHORT),
          heading: field(formData, `pages.${key}.heading`, MEDIUM),
          sub: field(formData, `pages.${key}.sub`, LONG),
          intro: field(formData, `pages.${key}.intro`, LONG),
        },
      ])
    ) as SiteContent["pages"],
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
