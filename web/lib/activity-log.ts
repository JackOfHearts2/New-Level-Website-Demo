import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityEventType =
  | "submission_created"
  | "submission_updated"
  | "submission_approved"
  | "submission_rejected"
  | "submission_changes_requested"
  | "submission_withdrawn"
  | "editor_granted"
  | "editor_revoked"
  | "report_resolved"
  | "report_reopened"
  | "content_published"
  | "content_draft_saved"
  | "code_deploy"
  | "staff_invited"
  | "inquiry_status_changed"
  | "inquiry_assigned"
  | "inquiry_note_added"
  | "staff_hierarchy_updated"
  | "onboarding_task_assigned"
  | "onboarding_task_completed"
  | "work_report_submitted";

export type ActivityTargetTable =
  | "content_change_requests"
  | "problem_reports"
  | "profiles"
  | "properties"
  | "inquiries"
  | "onboarding_tasks"
  | "work_reports";

/** Fail-soft, same philosophy as lib/email.ts — a logging failure must
 *  never block the real action it's describing. */
export async function logActivity(
  supabase: SupabaseClient,
  entry: {
    actorId: string;
    eventType: ActivityEventType;
    targetTable: ActivityTargetTable;
    targetId?: string;
    summary: string;
    metadata?: Record<string, unknown>;
  }
) {
  try {
    await supabase.from("activity_log").insert({
      actor_id: entry.actorId,
      event_type: entry.eventType,
      target_table: entry.targetTable,
      target_id: entry.targetId ?? null,
      summary: entry.summary,
      metadata: entry.metadata ?? null,
    });
  } catch (err) {
    console.error("logActivity failed:", err);
  }
}
