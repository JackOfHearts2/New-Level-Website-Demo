"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminRole, type AdminAuth } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { sniffImageType } from "@/lib/image-sniff";
import { notifyPendingChangeRequest } from "@/lib/email";
import { buildContentFromFormData, contentToFormData } from "@/lib/site-content-form";
import { logActivity } from "@/lib/activity-log";
import {
  getRawSiteContent,
  saveSiteContent,
  imageBlobStore,
  withImageSlotUpdated,
  type SiteContent,
} from "@/lib/site-content";

export type FormState =
  | { error?: string; ok?: boolean; pending?: boolean; draft?: boolean }
  | undefined;

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Sidebar nav reorder — client ask (2026-08-26): "put the stuff they
 *  wanna see before the other stuff they might not necessarily wanna
 *  see." Stores the user's preferred href order for the sidebar's main
 *  nav group; anything not in the array (a new nav item added later)
 *  just falls back to its default position — see AdminSidebar. */
export async function saveSidebarOrder(order: string[]) {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ sidebar_order: order }).eq("id", auth.userId);
  if (error) return { error: "Couldn't save your sidebar order." };

  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Dashboard home view toggle (Overview stat-tiles vs. a denser Compact
 *  list) — client landed here after discussing full drag-resize vs. a
 *  simpler preset toggle. */
export async function saveDashboardView(view: "overview" | "compact") {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ dashboard_view: view }).eq("id", auth.userId);
  if (error) return { error: "Couldn't save your dashboard view." };

  revalidatePath("/admin");
  return { ok: true };
}

/** Shared by saveContent and saveContentSection — admin saves go live
 *  immediately, editor saves become a pending request. Factored out so
 *  the whole-page save and the per-section save (client ask, 2026-08-26:
 *  "each section needs to have their own save as draft or save and
 *  submit area") can't drift out of sync with each other. */
async function persistContent(auth: AdminAuth, current: SiteContent, next: SiteContent): Promise<FormState> {
  if (auth.role === "admin") {
    try {
      await saveSiteContent(next);
    } catch {
      return { error: "Couldn't save: storage unavailable." };
    }

    // Client ask (2026-08-26): "that change needs to reflect under the
    // activity section. That goes for any admin, any editor" — an admin's
    // own instant publish used to be silent (only editor submissions were
    // logged). Fire-and-forget: logActivity is already fail-soft and a
    // logging hiccup shouldn't block a save that already succeeded.
    const supabase = await createClient();
    await logActivity(supabase, {
      actorId: auth.userId,
      eventType: "content_published",
      targetTable: "content_change_requests",
      summary: `${auth.email} published a content change live`,
    });

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

export async function saveContent(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const current = await getRawSiteContent();
  const next: SiteContent = buildContentFromFormData(current, formData);
  return persistContent(auth, current, next);
}

/** Per-section save (queue item 1) — takes just the fields belonging to
 *  ONE fieldset (e.g. only `eventCta.*`) rather than the whole form.
 *  Safe because it starts from a COMPLETE snapshot of the current content
 *  (contentToFormData) and only overrides the touched fields before
 *  handing off to buildContentFromFormData, which has no partial-merge
 *  behavior of its own — the same pattern InlineEditable already uses
 *  for a single field, generalized to a batch. Submitting a bare partial
 *  FormData here would blank every other field on the site. */
export async function saveContentSection(fieldValues: Record<string, string>): Promise<FormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const current = await getRawSiteContent();
  const fd = contentToFormData(current);
  for (const [name, value] of Object.entries(fieldValues)) fd.set(name, value);
  const next: SiteContent = buildContentFromFormData(current, fd);
  return persistContent(auth, current, next);
}

export type DraftFormState =
  | { error?: string; ok?: boolean; draftId?: string }
  | undefined;

/** Shared by saveContentDraft and saveContentSectionDraft. Editor-only
 *  "save it but don't submit it yet" — client ask (2026-08-26). No
 *  activity-log entry and no admin notification email here: a draft is
 *  invisible to admins entirely (filtered out of the Approvals list/badge
 *  count at the query level, see approvals/page.tsx), so there's nothing
 *  for them to be told about until it's actually submitted. */
async function persistDraft(auth: AdminAuth, current: SiteContent, next: SiteContent): Promise<DraftFormState> {
  const supabase = await createClient();
  const { data: inserted, error } = await supabase
    .from("content_change_requests")
    .insert({
      submitted_by: auth.userId,
      target_type: "content",
      proposed_content: next,
      base_content: current,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) return { error: "Couldn't save draft. Please try again." };

  // Client ask (2026-08-26): every save — draft or live, editor or admin —
  // shows up in Activity.
  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "content_draft_saved",
    targetTable: "content_change_requests",
    targetId: inserted?.id,
    summary: `${auth.email} saved a content draft`,
  });

  return { ok: true, draftId: inserted.id };
}

/** Drafts are for anyone staff — client clarified (2026-08-26): an admin
 *  wants "save as draft" too, to update a section but hold off on
 *  publishing it. The only role-specific behavior left is what a *live*
 *  save means: an editor's isn't final (an admin still reviews it via
 *  Approvals), an admin's publishes immediately — see persistContent, and
 *  the client-side confirm() before that call in content-form.tsx. */
export async function saveContentDraft(
  _prevState: DraftFormState,
  formData: FormData
): Promise<DraftFormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const current = await getRawSiteContent();
  const next: SiteContent = buildContentFromFormData(current, formData);
  return persistDraft(auth, current, next);
}

/** Per-section draft save — same field-override safety as
 *  saveContentSection above, but writes a draft instead of going live/
 *  into the review queue. */
export async function saveContentSectionDraft(fieldValues: Record<string, string>): Promise<DraftFormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const current = await getRawSiteContent();
  const fd = contentToFormData(current);
  for (const [name, value] of Object.entries(fieldValues)) fd.set(name, value);
  const next: SiteContent = buildContentFromFormData(current, fd);
  return persistDraft(auth, current, next);
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
