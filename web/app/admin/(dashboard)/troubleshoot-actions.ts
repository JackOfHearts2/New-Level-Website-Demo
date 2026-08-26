"use server";

import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { notifyProblemReport } from "@/lib/email";

export type SubmissionSummary = {
  id: string;
  label: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
};

type RequestRow = {
  id: string;
  target_type: "content" | "image";
  image_slot: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
};

/** Step 1 of the "a change I made isn't showing live" guided flow — real
 *  diagnostics, not AI: this just reads the submitter's own recent
 *  content_change_requests so the checklist can tell them exactly why
 *  (still a draft, still pending, changes were requested, rejected) before
 *  ever suggesting it might be a real bug. Only "approved but still not
 *  live" is actually unexplained by this data. */
export async function getMyRecentSubmissions(): Promise<SubmissionSummary[]> {
  const auth = await requireAdminRole();
  if (!auth) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("content_change_requests")
    .select("id, target_type, image_slot, status, created_at, reviewed_at, review_note")
    .eq("submitted_by", auth.userId)
    .order("created_at", { ascending: false })
    .limit(10)
    .returns<RequestRow[]>();

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.target_type === "image" ? `Photo update (${row.image_slot})` : "Content update",
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    reviewNote: row.review_note,
  }));
}

export type StaffReportResult = { error?: string; ok?: boolean };

/** Client ask (2026-08-26): "a reporting system for bugs on the management
 *  side just like the little flag on the client side." Staff-role-gated
 *  (unlike the public submitProblemReport) so `reported_by`/`source` can
 *  be set honestly — reuses the same problem_reports table/Reports page/
 *  notification path rather than a parallel system. `diagnostic` carries
 *  whatever the guided checklist already found (the related request's
 *  status/timestamps) so whoever reviews this has real context attached,
 *  not just a raw complaint. */
export async function fileStaffReport(input: {
  issueType: "Change not reflecting live" | "Dashboard bug" | "Something else";
  details: string;
  relatedRequestId?: string;
  diagnostic?: Record<string, unknown>;
}): Promise<StaffReportResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not logged in." };

  const details = input.details.trim().slice(0, 2000);
  if (!details) return { error: "Describe what you're seeing." };

  const supabase = await createClient();
  const { error } = await supabase.from("problem_reports").insert({
    issue_type: input.issueType,
    details,
    reporter_email: auth.email,
    page_url: "Admin dashboard",
    source: "staff",
    reported_by: auth.userId,
    related_request_id: input.relatedRequestId ?? null,
    diagnostic: input.diagnostic ?? null,
  });
  if (error) return { error: "Couldn't send that — please try again." };

  await notifyProblemReport({
    issueType: input.issueType,
    details: `From ${auth.email} (staff): ${details}`,
    pageUrl: "Admin dashboard",
  });

  return { ok: true };
}
