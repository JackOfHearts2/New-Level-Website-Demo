"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { notifyPendingProperty } from "@/lib/email";
import { isValidSubcategory, LISTING_STATUSES, PRICE_PERIODS } from "@/lib/property-categories";

export type PropertyFormState = { error?: string; ok?: boolean; propertyId?: string } | undefined;
export type ActionResult = { error?: string; ok?: boolean };

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

/** Create or update a listing. `mode` mirrors the same draft/submit split
 *  Content & Media already uses: draft never leaves the author's own view,
 *  submit means "publish live" for an admin or "send for review" for an
 *  editor (enforced by RLS too — properties_update_own's WITH CHECK only
 *  allows a non-admin to land on draft/pending/withdrawn, never approved -
 *  see migration 0016). No photo handling here yet — that's a separate,
 *  not-yet-built increment (a public bucket + an upload action reusing
 *  saveImage's magic-byte-sniff pattern). */
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
