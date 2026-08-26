"use server";

import { revalidatePath } from "next/cache";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

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

  revalidatePath("/admin/reports");
  return { ok: true };
}
