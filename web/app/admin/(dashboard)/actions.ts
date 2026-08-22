"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteSession, verifySession } from "@/lib/auth";
import {
  getRawSiteContent,
  saveSiteContent,
  imageBlobStore,
  type SiteContent,
} from "@/lib/site-content";

export type FormState = { error?: string; ok?: boolean } | undefined;

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

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

/** Confirms actual file bytes match a supported image format (JPEG/PNG/WebP)
 *  rather than trusting the client-declared File.type. Returns the correct
 *  content-type for the detected format, or null if unrecognized. */
function sniffImageType(bytes: ArrayBuffer): string | null {
  const b = new Uint8Array(bytes.slice(0, 12));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
    b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
  ) {
    return "image/png";
  }
  const ascii = String.fromCharCode(...b);
  if (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function saveContent(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!(await verifySession())) return { error: "Not logged in." };

  const current = await getRawSiteContent();

  const next: SiteContent = {
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

  try {
    await saveSiteContent(next);
  } catch {
    return { error: "Couldn't save: storage unavailable." };
  }

  revalidatePath("/");
  return { ok: true };
}

const IMAGE_KEYS = ["logo", "hero-bg"] as const;
type ImageKey = (typeof IMAGE_KEYS)[number];

export async function saveImage(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!(await verifySession())) return { error: "Not logged in." };

  const key = String(formData.get("key") ?? "");
  if (!IMAGE_KEYS.includes(key as ImageKey)) {
    return { error: "Bad image slot." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (file.size > 4_000_000) {
    return { error: "Image too large (4MB max)." };
  }

  const store = imageBlobStore();
  if (!store) return { error: "Couldn't save: storage unavailable." };

  try {
    const bytes = await file.arrayBuffer();

    // Server Actions are directly POST-reachable regardless of what the
    // browser's upload UI sent, so re-verify the actual bytes here rather
    // than trusting the client-declared File.type — in particular this
    // rejects SVG (which can carry a <script>) even if someone renames one
    // to claim an image/* type.
    const detectedType = sniffImageType(bytes);
    if (!detectedType) {
      return { error: "That doesn't look like a supported image (JPEG, PNG, or WebP)." };
    }

    await store.set(`image:${key}`, bytes, { metadata: { type: detectedType } });

    const current = await getRawSiteContent();
    const updatedAt = Date.now();
    const slot = key === "logo" ? "logo" : "heroBg";
    const next: SiteContent = {
      ...current,
      images: { ...current.images, [slot]: { updatedAt } },
    };
    await saveSiteContent(next);
  } catch {
    return { error: "Couldn't save: storage unavailable." };
  }

  revalidatePath("/");
  return { ok: true };
}
