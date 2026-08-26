import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { TeamTree, type StaffPerson } from "./team-tree";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "editor" | "admin";
  reports_to: string | null;
  title: string | null;
  department: string | null;
  avatar_updated_at: string | null;
};
type InquiryAssignRow = { assigned_to: string };

/** Internal staff reporting hierarchy (client ask, 2026-08-27: "a team
 *  member section that shows... who reports to who... when they click on
 *  it, message them, escalate to them, add them to a task"). Scoped to
 *  real dashboard accounts (editor/admin profiles), not the public
 *  marketing team roster in content.ts — that roster is still placeholder
 *  bios for everyone except Shelley Lozier, and isn't who can actually be
 *  assigned/messaged/escalated to here. "Add as a participant" is the
 *  existing inquiry assign-to picker (see /admin/inquiries/[id]) rather
 *  than a second, separate mechanism — this page cross-links to each
 *  person's assigned inquiries instead of duplicating that. */
export default async function TeamPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const [{ data: profileRows }, { data: assignRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, role, reports_to, title, department, avatar_updated_at")
      .in("role", ["editor", "admin"])
      .returns<ProfileRow[]>(),
    supabase.from("inquiries").select("assigned_to").not("assigned_to", "is", null).returns<InquiryAssignRow[]>(),
  ]);

  const assignedCounts = new Map<string, number>();
  for (const row of assignRows ?? []) {
    assignedCounts.set(row.assigned_to, (assignedCounts.get(row.assigned_to) ?? 0) + 1);
  }

  const people: StaffPerson[] = (profileRows ?? []).map((p) => ({
    id: p.id,
    label: p.full_name || p.email || "Unknown",
    email: p.email,
    role: p.role,
    reportsTo: p.reports_to,
    title: p.title,
    department: p.department,
    avatarUrl: p.avatar_updated_at
      ? `/api/site-image/avatar-${p.id}?v=${new Date(p.avatar_updated_at).getTime()}`
      : null,
    assignedInquiries: assignedCounts.get(p.id) ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Who reports to who on staff. Click anyone to message them, see what&apos;s assigned to
            them, or (admin only) update their title, department, and reporting line —
            placeholders are fine until the real org structure is set.
          </p>
        </div>
        <Link
          href="/admin/onboarding"
          className="font-heading border-border hover:bg-muted shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold"
        >
          My onboarding & reports →
        </Link>
      </div>

      <TeamTree people={people} isAdmin={auth.role === "admin"} currentUserId={auth.userId} />
    </div>
  );
}
