"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { notifyPendingProperty } from "@/lib/email";
import { sniffImageType } from "@/lib/image-sniff";
import { isValidSubcategory, LISTING_STATUSES, PRICE_PERIODS } from "@/lib/property-categories";

export type PropertyFormState = { error?: string; ok?: boolean; propertyId?: string } | undefined;
export type ActionResult = { error?: string; ok?: boolean };

type PropertyPhoto = { path: string; uploadedAt: string };

const EXT_FOR_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

async function loadOwnedProperty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  userId: string,
  isAdmin: boolean
) {
  const { data } = await supabase
    .from("properties")
    .select("id, submitted_by, photos")
    .eq("id", propertyId)
    .maybeSingle<{ id: string; submitted_by: string; photos: PropertyPhoto[] }>();
  if (!data) return null;
  if (!isAdmin && data.submitted_by !== userId) return null;
  return data;
}

/** Photos are their own upload step, separate from the rest of the form —
 *  client ask (2026-08-26): "they will need to upload the images
 *  themselves... be able to arrange them in that section based on
 *  whatever they want to show first." No separate approval step for
 *  photos: the property row's own draft/pending/approved status already
 *  gates public visibility (see migration 0020's comment), so a photo
 *  attached to an unapproved listing is simply never reachable from
 *  anywhere public — approving the listing is what makes both the data
 *  and its photos visible at once. */
export async function uploadPropertyPhoto(propertyId: string, formData: FormData): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const supabase = await createClient();
  const isAdmin = auth.role === "admin";
  const property = await loadOwnedProperty(supabase, propertyId, auth.userId, isAdmin);
  if (!property) return { error: "Listing not found." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image file." };
  if (file.size > 6_000_000) return { error: "Image too large (6MB max)." };

  const bytes = await file.arrayBuffer();
  const detectedType = sniffImageType(bytes);
  if (!detectedType) return { error: "That doesn't look like a supported image (JPEG, PNG, or WebP)." };

  const ext = EXT_FOR_TYPE[detectedType] ?? "jpg";
  const path = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("property-photos")
    .upload(path, bytes, { contentType: detectedType });
  if (uploadError) return { error: "Couldn't upload. Please try again." };

  const nextPhotos: PropertyPhoto[] = [...(property.photos ?? []), { path, uploadedAt: new Date().toISOString() }];
  const { error: updateError } = await supabase.from("properties").update({ photos: nextPhotos }).eq("id", propertyId);
  if (updateError) return { error: "Uploaded, but couldn't save it to the listing." };

  revalidatePath(`/admin/properties/${propertyId}/edit`);
  return { ok: true };
}

export async function removePropertyPhoto(propertyId: string, path: string): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const supabase = await createClient();
  const isAdmin = auth.role === "admin";
  const property = await loadOwnedProperty(supabase, propertyId, auth.userId, isAdmin);
  if (!property) return { error: "Listing not found." };

  const nextPhotos = (property.photos ?? []).filter((p) => p.path !== path);
  const { error: updateError } = await supabase.from("properties").update({ photos: nextPhotos }).eq("id", propertyId);
  if (updateError) return { error: "Couldn't remove. Please try again." };

  await supabase.storage.from("property-photos").remove([path]);

  revalidatePath(`/admin/properties/${propertyId}/edit`);
  return { ok: true };
}

/** Up/down reordering (same pattern as the admin sidebar's own nav
 *  reorder) rather than drag-and-drop — client ask was "arrange them...
 *  based on whatever they want to show first," which this covers with
 *  meaningfully less complexity than a full drag implementation. */
export async function reorderPropertyPhoto(propertyId: string, path: string, direction: -1 | 1): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const supabase = await createClient();
  const isAdmin = auth.role === "admin";
  const property = await loadOwnedProperty(supabase, propertyId, auth.userId, isAdmin);
  if (!property) return { error: "Listing not found." };

  const photos = [...(property.photos ?? [])];
  const index = photos.findIndex((p) => p.path === path);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= photos.length) return { ok: true };
  [photos[index], photos[target]] = [photos[target], photos[index]];

  const { error: updateError } = await supabase.from("properties").update({ photos }).eq("id", propertyId);
  if (updateError) return { error: "Couldn't reorder. Please try again." };

  revalidatePath(`/admin/properties/${propertyId}/edit`);
  return { ok: true };
}

function str(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v || null;
}

function num(formData: FormData, key: string): number | null {
  const v = String(formData.get(key) ?? "").trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildRowFromFormData(formData: FormData) {
  return {
    title: str(formData, "title") ?? "",
    category: str(formData, "category") ?? "",
    subcategory: str(formData, "subcategory") ?? "",
    address_line1: str(formData, "addressLine1"),
    address_line2: str(formData, "addressLine2"),
    city: str(formData, "city"),
    state: str(formData, "state"),
    zip: str(formData, "zip"),
    price: num(formData, "price"),
    price_period: str(formData, "pricePeriod"),
    beds: num(formData, "beds"),
    baths: num(formData, "baths"),
    sqft: num(formData, "sqft"),
    year_built: num(formData, "yearBuilt"),
    mls_number: str(formData, "mlsNumber"),
    listing_status: str(formData, "listingStatus") ?? "active",
    description: str(formData, "description"),
    source_url: str(formData, "sourceUrl"),
  };
}

/** Create or update a listing's own fields. `mode` mirrors the same
 *  draft/submit split Content & Media already uses: draft never leaves
 *  the author's own view, submit means "publish live" for an admin or
 *  "send for review" for an editor (enforced by RLS too —
 *  properties_update_own's WITH CHECK only allows a non-admin to land on
 *  draft/pending/withdrawn, never approved - see migration 0016). Photos
 *  are handled separately below (uploadPropertyPhoto etc.) since a
 *  brand-new listing has no id to attach them to until this has run once. */
export async function saveProperty(
  propertyId: string | null,
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  // Which submit button was clicked (name="mode" value="draft"|"submit"),
  // same pattern ContentForm's isResumingDraft branch already uses — one
  // form, two submit buttons, rather than binding mode statically (which
  // can't vary per-click the way .bind(null, propertyId) can for the id).
  const mode = formData.get("mode") === "draft" ? "draft" : "submit";

  const row = buildRowFromFormData(formData);
  if (!row.title) return { error: "Enter a title." };
  if (!row.category || !row.subcategory || !isValidSubcategory(row.category, row.subcategory)) {
    return { error: "Choose a valid category and type." };
  }
  if (row.price_period && !(PRICE_PERIODS as readonly string[]).includes(row.price_period)) {
    return { error: "Invalid price period." };
  }
  if (!(LISTING_STATUSES as readonly string[]).includes(row.listing_status)) {
    return { error: "Invalid listing status." };
  }

  const isAdmin = auth.role === "admin";
  const status = mode === "draft" ? "draft" : isAdmin ? "approved" : "pending";

  const supabase = await createClient();

  if (propertyId) {
    const { data: existing } = await supabase
      .from("properties")
      .select("id, submitted_by, status")
      .eq("id", propertyId)
      .maybeSingle();
    if (!existing) return { error: "Listing not found." };
    if (!isAdmin && existing.submitted_by !== auth.userId) return { error: "Not authorized." };
    if (!isAdmin && !["draft", "pending", "changes_requested"].includes(existing.status)) {
      return { error: "This listing can no longer be edited from here." };
    }

    const { error } = await supabase.from("properties").update({ ...row, status }).eq("id", propertyId);
    if (error) return { error: "Couldn't save. Please try again." };
  } else {
    const { data: inserted, error } = await supabase
      .from("properties")
      .insert({ ...row, status, submitted_by: auth.userId })
      .select("id")
      .single();
    if (error) return { error: "Couldn't save. Please try again." };
    propertyId = inserted.id;
  }

  if (status === "pending") {
    await logActivity(supabase, {
      actorId: auth.userId,
      eventType: "submission_created",
      targetTable: "properties",
      targetId: propertyId ?? undefined,
      summary: `${auth.email} submitted a new listing ("${row.title}") for approval`,
    });
    await notifyPendingProperty({ title: row.title, submitterEmail: auth.email });
  } else if (status === "approved") {
    await logActivity(supabase, {
      actorId: auth.userId,
      eventType: "content_published",
      targetTable: "properties",
      targetId: propertyId ?? undefined,
      summary: `${auth.email} published a listing ("${row.title}") live`,
    });
  }

  revalidatePath("/admin/properties");
  if (status === "approved") revalidatePath("/properties");

  return { ok: true, propertyId: propertyId ?? undefined };
}

export async function withdrawProperty(propertyId: string): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("properties")
    .select("submitted_by, status")
    .eq("id", propertyId)
    .maybeSingle();
  if (!existing) return { error: "Listing not found." };
  if (existing.submitted_by !== auth.userId) return { error: "Not authorized." };
  if (!["pending", "changes_requested"].includes(existing.status)) {
    return { error: "Only a pending submission can be withdrawn." };
  }

  const { error } = await supabase.from("properties").update({ status: "withdrawn" }).eq("id", propertyId);
  if (error) return { error: "Couldn't withdraw. Please try again." };

  revalidatePath("/admin/properties");
  return { ok: true };
}

export async function approveProperty(propertyId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("properties")
    .select("title, status")
    .eq("id", propertyId)
    .maybeSingle();
  if (!existing) return { error: "Listing not found." };
  if (existing.status !== "pending") return { error: "This listing was already reviewed." };

  const { error } = await supabase
    .from("properties")
    .update({ status: "approved", reviewed_by: auth.userId, reviewed_at: new Date().toISOString() })
    .eq("id", propertyId);
  if (error) return { error: "Couldn't approve. Please try again." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_approved",
    targetTable: "properties",
    targetId: propertyId,
    summary: `${auth.email} approved a listing ("${existing.title}")`,
  });

  revalidatePath("/admin/properties");
  revalidatePath("/properties");
  return { ok: true };
}

export async function rejectProperty(propertyId: string, note: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("properties")
    .select("title, status")
    .eq("id", propertyId)
    .maybeSingle();
  if (!existing) return { error: "Listing not found." };
  if (existing.status !== "pending") return { error: "This listing was already reviewed." };

  const { error } = await supabase
    .from("properties")
    .update({
      status: "rejected",
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
      review_note: note.trim().slice(0, 1000) || null,
    })
    .eq("id", propertyId);
  if (error) return { error: "Couldn't reject. Please try again." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_rejected",
    targetTable: "properties",
    targetId: propertyId,
    summary: `${auth.email} rejected a listing ("${existing.title}")`,
  });

  revalidatePath("/admin/properties");
  return { ok: true };
}

export async function requestPropertyChanges(propertyId: string, note: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };
  if (!note.trim()) return { error: "Add a note explaining what needs to change." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("properties")
    .select("title, status")
    .eq("id", propertyId)
    .maybeSingle();
  if (!existing) return { error: "Listing not found." };
  if (existing.status !== "pending") return { error: "This listing was already reviewed." };

  const { error } = await supabase
    .from("properties")
    .update({
      status: "changes_requested",
      reviewed_by: auth.userId,
      reviewed_at: new Date().toISOString(),
      review_note: note.trim().slice(0, 1000),
    })
    .eq("id", propertyId);
  if (error) return { error: "Couldn't send. Please try again." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "submission_changes_requested",
    targetTable: "properties",
    targetId: propertyId,
    summary: `${auth.email} requested changes on a listing ("${existing.title}")`,
  });

  revalidatePath("/admin/properties");
  return { ok: true };
}
