import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getApprovalsBadgeCount, getOpenReportsCount } from "@/lib/admin-counts";
import { DashboardView, type StatItem, type NavTileItem, type ActivityItem } from "@/components/admin/dashboard-view";

type ActivityRow = {
  id: string;
  actor_id: string | null;
  summary: string;
  created_at: string;
};
type ProfileRow = { id: string; email: string | null; full_name: string | null };

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");
  const { denied } = await searchParams;

  const supabase = await createClient();
  const isAdmin = auth.role === "admin";

  const [pendingApprovals, openReports, staffCount, recentActivity, { data: profile }] = await Promise.all([
    getApprovalsBadgeCount(supabase, auth),
    getOpenReportsCount(supabase),
    isAdmin
      ? supabase.from("profiles").select("id", { count: "exact", head: true }).in("role", ["editor", "admin"])
      : Promise.resolve({ count: null }),
    isAdmin
      ? supabase
          .from("activity_log")
          .select("id, actor_id, summary, created_at")
          .order("created_at", { ascending: false })
          .limit(6)
          .returns<ActivityRow[]>()
      : Promise.resolve({ data: null }),
    supabase.from("profiles").select("dashboard_view").eq("id", auth.userId).maybeSingle<{
      dashboard_view: "overview" | "compact";
    }>(),
  ]);

  const activityRows = recentActivity.data ?? [];
  const actorIds = Array.from(new Set(activityRows.map((r) => r.actor_id).filter((v): v is string => !!v)));
  const { data: profileRows } = actorIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", actorIds).returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]));

  const stats: StatItem[] = [
    {
      href: "/admin/approvals",
      label: isAdmin ? "Pending approvals" : "My open submissions",
      value: pendingApprovals,
      icon: "approvals",
    },
    { href: "/admin/reports", label: "Open reports", value: openReports, icon: "reports" },
    ...(isAdmin
      ? [
          { href: "/admin/editors", label: "Staff with access", value: staffCount.count ?? 0, icon: "staff" as const },
          { href: "/admin/analytics", label: "Analytics", value: "View →", icon: "analytics" as const },
        ]
      : []),
  ];

  const navTiles: NavTileItem[] = [
    {
      href: "/admin/content",
      title: "Content & Media",
      description: "Edit page text and photos, section by section.",
      icon: "content",
    },
    { href: "/admin/settings", title: "Settings", description: "Account & preferences.", icon: "settings" },
  ];

  const activity: ActivityItem[] | null = isAdmin
    ? activityRows.map((row) => {
        const actor = row.actor_id ? profileMap.get(row.actor_id) : null;
        return {
          id: row.id,
          summary: row.summary,
          actorLabel: actor?.full_name || actor?.email || "Unknown",
          timeAgo: timeAgo(row.created_at),
        };
      })
    : null;

  return (
    <div className="space-y-8">
      {denied && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-2xl border p-4 text-sm font-medium"
        >
          You don&apos;t have permission to view that page — it&apos;s restricted to admins.
        </div>
      )}
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isAdmin
            ? "Edit what visitors see, or review changes submitted by editors."
            : "Propose content and photo changes — an admin reviews them before they go live."}
        </p>
      </div>

      <DashboardView
        initialView={profile?.dashboard_view ?? "overview"}
        stats={stats}
        navTiles={navTiles}
        activity={activity}
      />
    </div>
  );
}
