"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { sniffImageType } from "@/lib/image-sniff";
import { notifyPendingChangeRequest } from "@/lib/email";
import { buildContentFromFormData } from "@/lib/site-content-form";
import { logActivity } from "@/lib/activity-log";
import {
  getRawSiteContent,
  saveSiteContent,
  imageBlobStore,
  withImageSlotUpdated,
  type SiteContent,
} from "@/lib/site-content";

export type FormState =
  | { error?: string; ok?: boolean; pending?: boolean }
  | undefined;

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function saveContent(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const current = await getRawSiteContent();
  const next: SiteContent = buildContentFromFormData(current, formData);

  if (auth.role === "admin") {
    try {
      await saveSiteContent(next);
    } catch {
      return { error: "Couldn't save: storage unavailable." };
    }
    revalidatePath("/");
    revalidatePath("/admin/content");
    return { ok: true };
  }

  // Editor: nothing goes live yet — save as a pending request for an
  // admin to review.
  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("content_change_requests")
    .insert({
      submitted_by: auth.userId,
      target_type: "content",
      proposed_content: next,
      base_content: current,
    })
    .select("id")
    .single();
  if (error) {
    return { error: "Couldn't submit for review. Please try again." };
  }

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_created",
    targetTable: "content_change_requests",
    targetId: inserted?.id,
    summary: `${auth.email} submitted a content change for review`,
  });

  await notifyPendingChangeRequest({
    targetType: "content",
    submitterEmail: auth.email,
  });

  return { ok: true, pending: true };
}

// Matches content_change_requests_image_slot_check (migration 0008) — logo
// and hero-bg are the two original fixed slots, team-<i>/testimonial-<i>
// are the Content/Media unification's per-member/per-avatar overrides.
const IMAGE_KEY_PATTERN = /^(logo|hero-bg|team-\d+|testimonial-\d+)$/;

export async function saveImage(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const key = String(formData.get("key") ?? "");
  if (!IMAGE_KEY_PATTERN.test(key)) {
    return { error: "Bad image slot." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (file.size > 4_000_000) {
    return { error: "Image too large (4MB max)." };
  }

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

  if (auth.role === "admin") {
    const store = imageBlobStore();
    if (!store) return { error: "Couldn't save: storage unavailable." };

    try {
      await store.set(`image:${key}`, bytes, { metadata: { type: detectedType } });

      const current = await getRawSiteContent();
      const next: SiteContent = withImageSlotUpdated(current, key, Date.now());
      await saveSiteContent(next);
    } catch {
      return { error: "Couldn't save: storage unavailable." };
    }

    revalidatePath("/");
    revalidatePath("/admin/content");
    return { ok: true };
  }

  // Editor: upload to the private pending-uploads bucket instead of
  // writing to the live Blobs store — approval (approvals/actions.ts)
  // moves it over.
  const supabase = await createClient();
  const storagePath = `${auth.userId}/${key}-${Date.now()}`;
  const { error: uploadError } = await supabase.storage
    .from("pending-uploads")
    .upload(storagePath, bytes, { contentType: detectedType });
  if (uploadError) {
    return { error: "Couldn't upload for review. Please try again." };
  }

  const current = await getRawSiteContent();
  const { data: inserted, error: insertError } = await supabase
    .from("content_change_requests")
    .insert({
      submitted_by: auth.userId,
      target_type: "image",
      image_slot: key,
      storage_path: storagePath,
      base_content: current,
    })
    .select("id")
    .single();
  if (insertError) {
    await supabase.storage.from("pending-uploads").remove([storagePath]);
    return { error: "Couldn't submit for review. Please try again." };
  }

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_created",
    targetTable: "content_change_requests",
    targetId: inserted?.id,
    summary: `${auth.email} submitted a photo change (${key}) for review`,
  });

  await notifyPendingChangeRequest({
    targetType: "image",
    submitterEmail: auth.email,
    imageSlot: key,
  });

  return { ok: true, pending: true };
}
