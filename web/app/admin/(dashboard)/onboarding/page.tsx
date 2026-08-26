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
  const [{ data: staffRows }, { data: targetRow }, { data: taskRows }, { data: authoredReports }, { data: receivedReports }] =
    await Promise.all([
      supabase.from("profiles").select("id, email, full_name, role").in("role", ["editor", "admin"]).returns<ProfileRow[]>(),
      supabase
        .from("profiles")
        .select("id, email, full_name, reports_to")
        .eq("id", viewUserId)
        .maybeSingle<{ id: string; email: string | null; full_name: string | null; reports_to: string | null }>(),
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
        defaultRecipientId={targetRow.reports_to}
        tasks={tasks}
        authoredReports={(authoredReports ?? []).map(mapReport)}
        receivedReports={(receivedReports ?? []).map(mapReport)}
      />
    </div>
  );
}
