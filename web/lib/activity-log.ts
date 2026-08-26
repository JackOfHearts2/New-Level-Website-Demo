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
  | "code_deploy";

export type ActivityTargetTable = "content_change_requests" | "problem_reports" | "profiles";

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
