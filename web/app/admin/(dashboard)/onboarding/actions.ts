"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type ActionResult = { error?: string; ok?: boolean };

/** Admin-only, same reasoning as the org chart's reporting-line edits —
 *  assigning onboarding work is a management action, not something staff
 *  set up for themselves. Client ask (2026-08-27): "actionable steps...
 *  that they can check off as they work." */
export async function addOnboardingTask(
  userId: string,
  fields: { title: string; description: string; dueDate: string }
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const title = fields.title.trim().slice(0, 200);
  if (!title) return { error: "Give the task a title first." };

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .maybeSingle<{ email: string | null; full_name: string | null }>();
  if (!target) return { error: "Person not found." };

  const { count } = await supabase
    .from("onboarding_tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { error } = await supabase.from("onboarding_tasks").insert({
    user_id: userId,
    title,
    description: fields.description.trim().slice(0, 2000) || null,
    due_date: fields.dueDate || null,
    created_by: auth.userId,
    sort_order: count ?? 0,
  });
  if (error) return { error: "Couldn't add that task." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "onboarding_task_assigned",
    targetTable: "onboarding_tasks",
    summary: `${auth.email} assigned ${target.full_name || target.email} a task: ${title}`,
  });

  revalidatePath("/admin/onboarding");
  return { ok: true };
}

/** Own-or-admin, matching the RLS policy — the DB guard trigger
 *  (private.guard_onboarding_task_update) is the real enforcement, this
 *  just needs the task's owner/title for a readable activity log entry. */
export async function toggleOnboardingTask(taskId: string, completed: boolean): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { data: task } = await supabase
    .from("onboarding_tasks")
    .select("title, user_id")
    .eq("id", taskId)
    .maybeSingle<{ title: string; user_id: string }>();
  if (!task) return { error: "Task not found." };

  const { error } = await supabase.from("onboarding_tasks").update({ completed }).eq("id", taskId);
  if (error) return { error: "Couldn't update that task." };

  if (completed) {
    await logActivity(supabase, {
      actorId: auth.userId,
      eventType: "onboarding_task_completed",
      targetTable: "onboarding_tasks",
      targetId: taskId,
      summary: `${auth.email} checked off: ${task.title}`,
    });
  }

  revalidatePath("/admin/onboarding");
  return { ok: true };
}

export async function deleteOnboardingTask(taskId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase.from("onboarding_tasks").delete().eq("id", taskId);
  if (error) return { error: "Couldn't remove that task." };

  revalidatePath("/admin/onboarding");
  return { ok: true };
}

/** Any staff member, for themselves only (RLS: work_reports_insert_own) —
 *  client ask: "submit reports to their senior editor... to show what kind
 *  of work they did." Defaults recipient to whoever they report to, but
 *  lets them pick anyone on staff since a small team won't always route
 *  reports strictly up the chart. */
export async function submitWorkReport(fields: {
  recipientId: string | null;
  periodLabel: string;
  body: string;
}): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const periodLabel = fields.periodLabel.trim().slice(0, 100) || "Untitled period";
  const body = fields.body.trim().slice(0, 5000);
  if (!body) return { error: "Write something first." };

  const supabase = await createClient();
  const { error } = await supabase.from("work_reports").insert({
    author_id: auth.userId,
    recipient_id: fields.recipientId || null,
    period_label: periodLabel,
    body,
  });
  if (error) return { error: "Couldn't submit your report." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "work_report_submitted",
    targetTable: "work_reports",
    summary: `${auth.email} submitted a work report (${periodLabel})`,
  });

  revalidatePath("/admin/onboarding");
  return { ok: true };
}
