"use server";

import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { notifyInquiryAssigned, sendInquiryReply } from "@/lib/email";
import { INQUIRY_STATUS_LABELS, type InquiryStatus } from "@/lib/inquiries";

export type ActionResult = { error?: string; ok?: boolean };

async function loadInquiry(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data } = await supabase
    .from("inquiries")
    .select("id, name, email, status, assigned_to")
    .eq("id", id)
    .maybeSingle<{ id: string; name: string; email: string; status: InquiryStatus; assigned_to: string | null }>();
  return data;
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const row = await loadInquiry(supabase, id);
  if (!row) return { error: "Inquiry not found." };

  const { error } = await supabase.from("inquiries").update({ status }).eq("id", id);
  if (error) return { error: "Couldn't update status. Please try again." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "inquiry_status_changed",
    targetTable: "inquiries",
    targetId: id,
    summary: `${auth.email} marked ${row.name}'s inquiry as ${INQUIRY_STATUS_LABELS[status]}`,
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
  return { ok: true };
}

export async function assignInquiry(id: string, userId: string | null): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const row = await loadInquiry(supabase, id);
  if (!row) return { error: "Inquiry not found." };

  const { error } = await supabase.from("inquiries").update({ assigned_to: userId }).eq("id", id);
  if (error) return { error: "Couldn't assign. Please try again." };

  let assigneeLabel = "Unassigned";
  if (userId) {
    const { data: assignee } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle<{ email: string | null; full_name: string | null }>();
    assigneeLabel = assignee?.full_name || assignee?.email || "someone";
    if (assignee?.email) {
      // Fire-and-forget-ish: doesn't block the assignment on delivery, but
      // does await so a real send failure gets logged server-side. See
      // notifyInquiryAssigned's sandbox-sender limitation note.
      await notifyInquiryAssigned({ email: assignee.email, inquiryName: row.name, inquiryId: id });
    }
  }

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "inquiry_assigned",
    targetTable: "inquiries",
    targetId: id,
    summary: userId
      ? `${auth.email} assigned ${row.name}'s inquiry to ${assigneeLabel}`
      : `${auth.email} unassigned ${row.name}'s inquiry`,
  });

  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
  return { ok: true };
}

/** Doubles as both "log the initial response" and "leave a note on the
 *  thread" (client ask covered both with the same language) — a staff
 *  member can optionally also send it as a real email to the inquirer.
 *  A first note on a still-"new" inquiry auto-advances it to "contacted",
 *  since that's what sending an initial response actually means. */
export async function addInquiryNote(
  id: string,
  body: string,
  alsoEmail: boolean
): Promise<ActionResult & { emailSent?: boolean }> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const trimmed = body.trim().slice(0, 4000);
  if (!trimmed) return { error: "Write something first." };

  const supabase = await createClient();
  const row = await loadInquiry(supabase, id);
  if (!row) return { error: "Inquiry not found." };

  let emailSent = false;
  if (alsoEmail) {
    const result = await sendInquiryReply(row.email, trimmed);
    emailSent = result.ok;
  }

  const { error } = await supabase.from("inquiry_notes").insert({
    inquiry_id: id,
    author_id: auth.userId,
    body: trimmed,
    emailed: emailSent,
  });
  if (error) return { error: "Couldn't save your note. Please try again." };

  if (row.status === "new") {
    await supabase.from("inquiries").update({ status: "contacted" }).eq("id", id);
  }

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "inquiry_note_added",
    targetTable: "inquiries",
    targetId: id,
    summary: alsoEmail
      ? `${auth.email} replied to ${row.name}'s inquiry${emailSent ? " (emailed)" : " (email failed to send)"}`
      : `${auth.email} left a note on ${row.name}'s inquiry`,
  });

  revalidatePath(`/admin/inquiries/${id}`);
  return { ok: true, emailSent };
}
