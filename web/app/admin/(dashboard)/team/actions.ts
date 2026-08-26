"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type ActionResult = { error?: string; ok?: boolean };

/** Admin-only, same as grant/revoke access — reporting lines are an org
 *  decision, not something an editor sets for themselves. Client ask
 *  (2026-08-27): "build the hierarchy now with placeholders" since only
 *  Shelley Lozier is a confirmed real hire today — this just needs to be
 *  reassignable later without a schema change, which reports_to already is. */
export async function updateReportsTo(userId: string, reportsTo: string | null): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };
  if (userId === reportsTo) return { error: "Someone can't report to themselves." };

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle<{ email: string | null; full_name: string | null }>();
  if (!target) return { error: "Person not found." };

  const { error } = await supabase.from("profiles").update({ reports_to: reportsTo }).eq("id", userId);
  if (error) return { error: "Couldn't update reporting line." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "staff_hierarchy_updated",
    targetTable: "profiles",
    targetId: userId,
    summary: reportsTo
      ? `${auth.email} updated ${target.full_name || target.email}'s reporting line`
      : `${auth.email} cleared ${target.full_name || target.email}'s reporting line`,
  });

  revalidatePath("/admin/team");
  return { ok: true };
}
