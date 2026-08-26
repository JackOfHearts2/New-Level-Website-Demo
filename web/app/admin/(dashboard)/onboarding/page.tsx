import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { OnboardingView, type StaffOption, type TaskItem, type ReportItem } from "./onboarding-view";

type ProfileRow = { id: string; email: string | null; full_name: string | null; role: "editor" | "admin" };
type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
};
type ReportRow = {
  id: string;
  author_id: string;
  recipient_id: string | null;
  period_label: string;
  body: string;
  created_at: string;
};
type OrgMemberLite = { id: string; parent_id: string | null; linked_profile_id: string | null };

/** Framework-first pass at onboarding (client ask, 2026-08-27): a checklist
 *  an admin assigns per person, plus append-only periodic work reports to
 *  whoever they report to. Deliberately NOT per-department differentiated
 *  dashboards — see the migration's header comment for why that's scoped
 *  out of this round. `?user=<id>` lets an admin view/manage anyone's
 *  onboarding from their Team card; editors only ever see their own. */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const { user: userParam } = await searchParams;
  const isAdmin = auth.role === "admin";
  const viewUserId = isAdmin && userParam ? userParam : auth.userId;
  const viewingSelf = viewUserId === auth.userId;

  const supabase = await createClient();
  const [{ data: staffRows }, { data: targetRow }, { data: orgRows }, { data: taskRows }, { data: authoredReports }, { data: receivedReports }] =
    await Promise.all([
      supabase.from("profiles").select("id, email, full_name, role").in("role", ["editor", "admin"]).returns<ProfileRow[]>(),
      supabase
        .from("profiles")
        .select("id, email, full_name")
        .eq("id", viewUserId)
        .maybeSingle<{ id: string; email: string | null; full_name: string | null }>(),
      supabase.from("org_members").select("id, parent_id, linked_profile_id").returns<OrgMemberLite[]>(),
      supabase
        .from("onboarding_tasks")
        .select("id, title, description, due_date, completed, completed_at, sort_order")
        .eq("user_id", viewUserId)
        .order("sort_order")
        .returns<TaskRow[]>(),
      supabase
        .from("work_reports")
        .select("id, author_id, recipient_id, period_label, body, created_at")
        .eq("author_id", viewUserId)
        .order("created_at", { ascending: false })
        .returns<ReportRow[]>(),
      supabase
        .from("work_reports")
        .select("id, author_id, recipient_id, period_label, body, created_at")
        .eq("recipient_id", viewUserId)
        .order("created_at", { ascending: false })
        .returns<ReportRow[]>(),
    ]);

  if (!targetRow) redirect("/admin/team");

  // Default work-report recipient = whoever this person's org chart box
  // reports to, IF that box is itself linked to a real account — the org
  // chart (org_members, migration 0024) is the one source of truth for
  // reporting lines now, superseding profiles.reports_to from 0023.
  const selfMember = orgRows?.find((m) => m.linked_profile_id === viewUserId);
  const parentMember = selfMember?.parent_id ? orgRows?.find((m) => m.id === selfMember.parent_id) : null;
  const defaultRecipientId = parentMember?.linked_profile_id ?? null;

  const labelOf = (id: string) => {
    const p = staffRows?.find((s) => s.id === id);
    return p?.full_name || p?.email || "Unknown";
  };

  const allStaff: StaffOption[] = (staffRows ?? []).map((s) => ({
    id: s.id,
    label: s.full_name || s.email || "Unknown",
  }));
  const staff: StaffOption[] = allStaff.filter((s) => s.id !== viewUserId);

  const tasks: TaskItem[] = (taskRows ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dueDate: t.due_date,
    completed: t.completed,
    completedAt: t.completed_at,
  }));

  const mapReport = (r: ReportRow): ReportItem => ({
    id: r.id,
    periodLabel: r.period_label,
    body: r.body,
    createdAt: r.created_at,
    authorLabel: labelOf(r.author_id),
    recipientLabel: r.recipient_id ? labelOf(r.recipient_id) : null,
  });

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Team", href: "/admin/team" }, { label: "Onboarding & reports" }]} />
      <OnboardingView
        viewUserId={viewUserId}
        viewingSelf={viewingSelf}
        viewingLabel={targetRow.full_name || targetRow.email || "Unknown"}
        isAdmin={isAdmin}
        staff={staff}
        allStaffForSwitch={isAdmin ? allStaff : []}
        defaultRecipientId={defaultRecipientId}
        tasks={tasks}
        authoredReports={(authoredReports ?? []).map(mapReport)}
        receivedReports={(receivedReports ?? []).map(mapReport)}
      />
    </div>
  );
}
