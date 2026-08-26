import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import type { SiteContent } from "@/lib/site-content";
import { ApprovalList, type ChangeRequestItem } from "./approval-list";

type ChangeRequestRow = {
  id: string;
  target_type: "content" | "image";
  image_slot: string | null;
  proposed_content: SiteContent | null;
  base_content: SiteContent;
  storage_path: string | null;
  status: "draft" | "pending" | "changes_requested" | "approved" | "rejected" | "withdrawn";
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  submitted_by: string;
  reviewed_by: string | null;
};

type ProfileRow = { id: string; email: string | null; full_name: string | null };

export default async function ApprovalsPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  let query = supabase
    .from("content_change_requests")
    .select(
      "id, target_type, image_slot, proposed_content, base_content, storage_path, status, review_note, created_at, reviewed_at, submitted_by, reviewed_by"
    )
    .order("created_at", { ascending: false });
  // Drafts are invisible to admins entirely — RLS lets an admin SELECT
  // every row regardless of status (for auditability elsewhere), but
  // nobody's work-in-progress belongs in the review queue. An editor's own
  // query is already restricted to their own rows by RLS, drafts included
  // — that's exactly what they need to resume one.
  if (auth.role === "admin") query = query.neq("status", "draft");
  const { data } = await query.returns<ChangeRequestRow[]>();

  const rows = data ?? [];

  const withSignedUrls = await Promise.all(
    rows.map(async (row) => {
      if (row.target_type !== "image" || !row.storage_path) {
        return { ...row, pendingImageUrl: null as string | null };
      }
      const { data: signed } = await supabase.storage
        .from("pending-uploads")
        .createSignedUrl(row.storage_path, 60 * 10);
      return { ...row, pendingImageUrl: signed?.signedUrl ?? null };
    })
  );

  // RLS only lets an admin resolve other people's profiles — an editor
  // viewing their own submissions can still resolve their own name, but a
  // reviewer's name falls back to a generic label for them (see below).
  const profileIds = Array.from(
    new Set(rows.flatMap((r) => [r.submitted_by, r.reviewed_by]).filter((v): v is string => !!v))
  );
  const { data: profileRows } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", profileIds)
        .returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]));

  const label = (id: string | null, fallback: string) => {
    if (!id) return null;
    const profile = profileMap.get(id);
    return profile?.full_name || profile?.email || fallback;
  };

  const requests: ChangeRequestItem[] = withSignedUrls.map((row) => ({
    id: row.id,
    targetType: row.target_type,
    imageSlot: row.image_slot,
    baseContent: row.base_content,
    proposedContent: row.proposed_content,
    pendingImageUrl: row.pendingImageUrl,
    status: row.status,
    reviewNote: row.review_note,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
    submitterLabel: label(row.submitted_by, "You") ?? "You",
    reviewerLabel: label(row.reviewed_by, "An admin"),
    isOwn: row.submitted_by === auth.userId,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Approvals</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {auth.role === "admin"
            ? "Review pending content and photo changes before they go live."
            : "Track the status of what you've submitted for review."}
        </p>
      </div>
      <ApprovalList requests={requests} isAdmin={auth.role === "admin"} />
    </div>
  );
}
