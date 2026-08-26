"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { sniffImageType } from "@/lib/image-sniff";
import {
  getRawSiteContent,
  saveSiteContent,
  imageBlobStore,
  type SiteContent,
} from "@/lib/site-content";

export type ActionResult = { error?: string; ok?: boolean };

type ChangeRequestRow = {
  id: string;
  target_type: "content" | "image";
  image_slot: "logo" | "hero-bg" | null;
  proposed_content: SiteContent | null;
  storage_path: string | null;
  status: "pending" | "approved" | "rejected";
};

async function loadPendingRequest(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data, error } = await supabase
    .from("content_change_requests")
    .select("id, target_type, image_slot, proposed_content, storage_path, status")
    .eq("id", id)
    .single<ChangeRequestRow>();
  if (error || !data) return null;
  return data;
}

export async function approveRequest(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const row = await loadPendingRequest(supabase, id);
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
      const updatedAt = Date.now();
      const slot = row.image_slot === "logo" ? "logo" : "heroBg";
      const next: SiteContent = {
        ...current,
        images: { ...current.images, [slot]: { updatedAt } },
      };
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

  revalidatePath("/");
  revalidatePath("/admin/approvals");
  return { ok: true };
}

export async function rejectRequest(id: string, note: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const row = await loadPendingRequest(supabase, id);
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

  revalidatePath("/admin/approvals");
  return { ok: true };
}
