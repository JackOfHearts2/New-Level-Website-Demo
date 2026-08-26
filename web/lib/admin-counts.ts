import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminAuth } from "@/lib/admin-auth";

// Shared by the dashboard layout's nav badges and the dashboard home's
// tile subtitles — was previously duplicated in both files. Now that a
// row can also sit in "changes_requested" (which still needs the
// *editor's* attention, but not the admin's — the admin already acted by
// requesting the change), the two roles' counts genuinely diverge rather
// than just being "everyone's" vs. "my own," which is the actual trigger
// for factoring this out now rather than leaving it duplicated a second time.
export async function getApprovalsBadgeCount(
  supabase: SupabaseClient,
  auth: AdminAuth
): Promise<number> {
  const statuses = auth.role === "admin" ? ["pending"] : ["pending", "changes_requested"];
  const query = supabase
    .from("content_change_requests")
    .select("id", { count: "exact", head: true })
    .in("status", statuses);
  const { count } =
    auth.role === "admin" ? await query : await query.eq("submitted_by", auth.userId);
  return count ?? 0;
}

export async function getOpenReportsCount(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from("problem_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");
  return count ?? 0;
}

// Properties have their own status lifecycle (a per-row column, not a
// content_change_requests wrapper — see migration 0016), so this is a
// separate badge rather than folded into getApprovalsBadgeCount above.
// Every staff member sees the same count here (unlike approvals/properties,
// inquiries have no "my own" submitter — they all come from the public,
// and any staff member can pick one up), so this doesn't need an
// AdminAuth-based role branch the way the others above do.
export async function getNewInquiriesCount(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  return count ?? 0;
}

export async function getPendingPropertiesCount(
  supabase: SupabaseClient,
  auth: AdminAuth
): Promise<number> {
  const statuses = auth.role === "admin" ? ["pending"] : ["pending", "changes_requested"];
  const query = supabase.from("properties").select("id", { count: "exact", head: true }).in("status", statuses);
  const { count } = auth.role === "admin" ? await query : await query.eq("submitted_by", auth.userId);
  return count ?? 0;
}
