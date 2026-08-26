"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { sniffImageType } from "@/lib/image-sniff";
import { buildContentFromFormData } from "@/lib/site-content-form";
import { logActivity } from "@/lib/activity-log";
import { diffSiteContent, describeContentChanges } from "@/lib/activity-diff";
import {
  getRawSiteContent,
  saveSiteContent,
  imageBlobStore,
  withImageSlotUpdated,
  type SiteContent,
} from "@/lib/site-content";
import type { FormState } from "../actions";

export type ActionResult = { error?: string; ok?: boolean };

type ChangeRequestRow = {
  id: string;
  submitted_by: string;
  target_type: "content" | "image";
  image_slot: string | null;
  proposed_content: SiteContent | null;
  base_content: SiteContent | null;
  storage_path: string | null;
  status: "draft" | "pending" | "changes_requested" | "approved" | "rejected" | "withdrawn";
};

async function loadRequest(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data, error } = await supabase
    .from("content_change_requests")
    .select("id, submitted_by, target_type, image_slot, proposed_content, base_content, storage_path, status")
    .eq("id", id)
    .single<ChangeRequestRow>();
  if (error || !data) return null;
  return data;
}

/** Same "pinpoint the area, and whether it was added/removed/updated" ask
 *  as persistContent/persistDraft in ../actions.ts, applied to a request
 *  row instead of two SiteContent params directly — an image-slot request
 *  has no base/proposed content to diff, so this just names the slot. */
function describeRequestChange(row: ChangeRequestRow): string | null {
  if (row.target_type === "image") {
    return row.image_slot ? `Photo (${row.image_slot})` : null;
  }
  if (!row.base_content || !row.proposed_content) return null;
  return describeContentChanges(diffSiteContent(row.base_content, row.proposed_content));
}

export async function approveRequest(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const row = await loadRequest(supabase, id);
  if (!row) return { error: "Request not found." };
  if (row.status !== "pending") return { error: "This request was already reviewed." };

  if (row.target_type === "content") {
    if (!row.proposed_content) return { error: "This request is missing its proposed content." };
    try {
      await saveSiteContent(row.proposed_content);
    } catch {
      return { error: "Couldn't save: storage unavailable." };
    }
  } else {
    if (!row.storage_path || !row.image_slot) {
      return { error: "This request is missing its uploaded image." };
    }
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pending-uploads")
      .download(row.storage_path);
    if (downloadError || !fileData) {
      return { error: "Couldn't retrieve the pending image." };
    }
    const bytes = await fileData.arrayBuffer();

    // Never trust stored bytes just because they passed the sniff once at
    // upload time — re-verify here too.
    const detectedType = sniffImageType(bytes);
    if (!detectedType) {
      return { error: "The pending image no longer looks like a valid image file." };
    }

    const store = imageBlobStore();
    if (!store) return { error: "Couldn't save: storage unavailable." };

    try {
      await store.set(`image:${row.image_slot}`, bytes, {
        metadata: { type: detectedType },
      });
      const current = await getRawSiteContent();
      const next: SiteContent = withImageSlotUpdated(current, row.image_slot, Date.now());
      await saveSiteContent(next);
    } catch {
      return { error: "Couldn't save: storage unavailable." };
    }

    await supabase.storage.from("pending-uploads").remove([row.storage_path]);
  }

  const { error: updateError } = await supabase
    .from("content_change_requests")
    .update({
      status: "approved",
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateError) return { error: "Saved, but couldn't update the request's status." };

  const changeDescription = describeRequestChange(row);
  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_approved",
    targetTable: "content_change_requests",
    targetId: id,
    summary: changeDescription
      ? `${auth.email} approved a ${row.target_type} change — ${changeDescription}`
      : `${auth.email} approved a ${row.target_type} change`,
  });

  revalidatePath("/");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function rejectRequest(id: string, note: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const row = await loadRequest(supabase, id);
  if (!row) return { error: "Request not found." };
  if (row.status !== "pending") return { error: "This request was already reviewed." };

  if (row.target_type === "image" && row.storage_path) {
    await supabase.storage.from("pending-uploads").remove([row.storage_path]);
  }

  const { error: updateError } = await supabase
    .from("content_change_requests")
    .update({
      status: "rejected",
      review_note: note.trim().slice(0, 500) || null,
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateError) return { error: "Couldn't reject the request." };

  const changeDescription = describeRequestChange(row);
  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_rejected",
    targetTable: "content_change_requests",
    targetId: id,
    summary: changeDescription
      ? `${auth.email} rejected a ${row.target_type} change — ${changeDescription}`
      : `${auth.email} rejected a ${row.target_type} change`,
  });

  revalidatePath("/admin/approvals");
  return { ok: true };
}

/** The third outcome: sends the submission back to the editor with a note
 *  instead of starting over. Deliberately does NOT delete the pending
 *  image's Storage object (unlike reject) — the editor may just replace it. */
export async function requestChanges(id: string, note: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const row = await loadRequest(supabase, id);
  if (!row) return { error: "Request not found." };
  if (row.status !== "pending") return { error: "This request was already reviewed." };

  const { error: updateError } = await supabase
    .from("content_change_requests")
    .update({
      status: "changes_requested",
      review_note: note.trim().slice(0, 500) || null,
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateError) return { error: "Couldn't request changes." };

  const changeDescription = describeRequestChange(row);
  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_changes_requested",
    targetTable: "content_change_requests",
    targetId: id,
    summary: changeDescription
      ? `${auth.email} requested changes on a ${row.target_type} submission — ${changeDescription}`
      : `${auth.email} requested changes on a ${row.target_type} submission`,
  });

  revalidatePath("/admin/approvals");
  return { ok: true };
}

export async function withdrawRequest(id: string): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const row = await loadRequest(supabase, id);
  if (!row) return { error: "Request not found." };
  if (row.submitted_by !== auth.userId) return { error: "Not authorized." };
  if (row.status !== "pending" && row.status !== "changes_requested" && row.status !== "draft") {
    return { error: "This request can no longer be withdrawn." };
  }

  const { error: updateError } = await supabase
    .from("content_change_requests")
    .update({ status: "withdrawn" })
    .eq("id", id);
  if (updateError) return { error: "Couldn't withdraw. Please try again." };

  if (row.target_type === "image" && row.storage_path) {
    await supabase.storage.from("pending-uploads").remove([row.storage_path]);
  }

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_withdrawn",
    targetTable: "content_change_requests",
    targetId: id,
    summary: `${auth.email} withdrew a ${row.target_type} submission`,
  });

  revalidatePath("/admin/approvals");
  return { ok: true };
}

/** Revises a still-open content request in place (does not create a new
 *  row), so an admin who requested changes doesn't have to re-review a
 *  brand-new submission from scratch. Bound via .bind(null, id) for
 *  useActionState, per Next's documented pattern for extra Server Action
 *  arguments. */
export async function updateOwnContentRequest(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const supabase = await createClient();
  const row = await loadRequest(supabase, id);
  if (!row) return { error: "Request not found." };
  if (row.submitted_by !== auth.userId) return { error: "Not authorized." };
  if (row.status !== "pending" && row.status !== "changes_requested" && row.status !== "draft") {
    return { error: "This request can no longer be revised." };
  }
  if (row.target_type !== "content") return { error: "Wrong request type." };

  // A draft resume can choose to stay a draft (formData "mode" = "draft")
  // or submit for review — anything already submitted (pending/
  // changes_requested) always resubmits as pending, unchanged behavior.
  const keepAsDraft = row.status === "draft" && String(formData.get("mode") ?? "") === "draft";
  const nextStatus = keepAsDraft ? "draft" : "pending";

  // Rebuild against current *live* content, not the request's own stale
  // base_content — so the diff always reflects what's actually live if
  // something else was approved while this was pending.
  const current = await getRawSiteContent();
  const next: SiteContent = buildContentFromFormData(current, formData);

  const { error: updateError } = await supabase
    .from("content_change_requests")
    .update({ proposed_content: next, base_content: current, status: nextStatus })
    .eq("id", id);
  if (updateError) return { error: "Couldn't save. Please try again." };

  // A draft staying a draft still gets logged (client ask, 2026-08-26:
  // every save — draft or live, editor or admin — shows up in Activity) but
  // skips the admin notification email: nothing needs an admin's attention
  // yet, since drafts stay invisible to them until submitted.
  if (keepAsDraft) {
    const draftChangeDescription = row.proposed_content
      ? describeContentChanges(diffSiteContent(row.proposed_content, next))
      : null;
    await logActivity(supabase, {
      actorId: auth.userId,
      eventType: "content_draft_saved",
      targetTable: "content_change_requests",
      targetId: id,
      summary: draftChangeDescription
        ? `${auth.email} updated a content draft — ${draftChangeDescription}`
        : `${auth.email} updated a content draft`,
    });
    return { ok: true, draft: true };
  }

  // Diffed against the request's OWN previous proposed content (what an
  // admin last reviewed), not the live site — that's what actually changed
  // in this revision, which is the thing worth pinpointing here.
  const revisionChangeDescription = row.proposed_content
    ? describeContentChanges(diffSiteContent(row.proposed_content, next))
    : null;
  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_updated",
    targetTable: "content_change_requests",
    targetId: id,
    summary: revisionChangeDescription
      ? `${auth.email} revised and resubmitted a content change — ${revisionChangeDescription}`
      : `${auth.email} revised and resubmitted a content change`,
  });

  revalidatePath("/admin/approvals");
  return { ok: true, pending: true };
}

export async function updateOwnImageRequest(id: string, formData: FormData): Promise<FormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const supabase = await createClient();
  const row = await loadRequest(supabase, id);
  if (!row) return { error: "Request not found." };
  if (row.submitted_by !== auth.userId) return { error: "Not authorized." };
  if (row.status !== "pending" && row.status !== "changes_requested") {
    return { error: "This request can no longer be revised." };
  }
  if (row.target_type !== "image" || !row.image_slot) return { error: "Wrong request type." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image file." };
  if (file.size > 4_000_000) return { error: "Image too large (4MB max)." };

  const bytes = await file.arrayBuffer();
  const detectedType = sniffImageType(bytes);
  if (!detectedType) {
    return { error: "That doesn't look like a supported image (JPEG, PNG, or WebP)." };
  }

  // Upload the replacement first, then swap the row over, then clean up
  // the old object — this ordering means a failure never leaves the row
  // pointing at nothing.
  const newPath = `${auth.userId}/${row.image_slot}-${Date.now()}`;
  const { error: uploadError } = await supabase.storage
    .from("pending-uploads")
    .upload(newPath, bytes, { contentType: detectedType });
  if (uploadError) return { error: "Couldn't upload for review. Please try again." };

  const oldPath = row.storage_path;
  const { error: updateError } = await supabase
    .from("content_change_requests")
    .update({ storage_path: newPath, status: "pending" })
    .eq("id", id);
  if (updateError) {
    await supabase.storage.from("pending-uploads").remove([newPath]);
    return { error: "Couldn't resubmit. Please try again." };
  }
  if (oldPath) {
    await supabase.storage.from("pending-uploads").remove([oldPath]);
  }

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_updated",
    targetTable: "content_change_requests",
    targetId: id,
    summary: `${auth.email} revised and resubmitted a photo change (${row.image_slot})`,
  });

  revalidatePath("/admin/approvals");
  return { ok: true, pending: true };
}
