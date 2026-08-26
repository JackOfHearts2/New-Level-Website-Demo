"use server";

import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type ActionResult = { error?: string; ok?: boolean };

export async function resolveReport(id: string): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("problem_reports")
    .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: auth.userId })
    .eq("id", id);
  if (error) return { error: "Couldn't update that report." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "report_resolved",
    targetTable: "problem_reports",
    targetId: id,
    summary: `${auth.email} marked a report resolved`,
  });

  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function reopenReport(id: string): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("problem_reports")
    .update({ status: "open", resolved_at: null, resolved_by: null })
    .eq("id", id);
  if (error) return { error: "Couldn't update that report." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "report_reopened",
    targetTable: "problem_reports",
    targetId: id,
    summary: `${auth.email} reopened a report`,
  });

  revalidatePath("/admin/reports");
  return { ok: true };
}
