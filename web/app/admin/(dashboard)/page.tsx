import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getApprovalsBadgeCount, getOpenReportsCount } from "@/lib/admin-counts";
import { DashboardView, type StatItem, type NavTileItem, type ActivityItem } from "@/components/admin/dashboard-view";
import { TrendChart, type TrendPoint } from "@/components/admin/trend-chart";
import { RankedBarList } from "@/components/admin/ranked-bar-list";
import { DonutChart, type DonutSlice } from "@/components/admin/donut-chart";
import { RadialProgress } from "@/components/admin/radial-progress";
import { GlowCard } from "@/components/ui/glow-card";

type ActivityRow = {
  id: string;
  actor_id: string | null;
  summary: string;
  created_at: string;
};
type ProfileRow = { id: string; email: string | null; full_name: string | null };
type DraftRow = { id: string; created_at: string };
type ViewRow = { path: string; created_at: string };
type RequestStatusRow = { status: string };

const OVERVIEW_DAYS = 14;

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
  const since = new Date();
  since.setDate(since.getDate() - OVERVIEW_DAYS);

  const [
    pendingApprovals,
    openReports,
    staffCount,
    recentActivity,
    { data: profile },
    { data: draftData },
    { data: overviewViews },
    { data: overviewStatuses },
  ] = await Promise.all([
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
    // Both roles can have drafts now (client ask, 2026-08-26: an admin
    // wants "save as draft" too, to hold a section back from publishing).
    // Image drafts don't exist — saveImage always creates a pending
    // request instead, see web/app/admin/(dashboard)/actions.ts.
    supabase
      .from("content_change_requests")
      .select("id, created_at")
      .eq("submitted_by", auth.userId)
      .eq("status", "draft")
      .eq("target_type", "content")
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<DraftRow[]>(),
    isAdmin
      ? supabase
          .from("page_views")
          .select("path, created_at")
          .gte("created_at", since.toISOString())
          .returns<ViewRow[]>()
      : Promise.resolve({ data: null }),
    isAdmin
      ? supabase.from("content_change_requests").select("status").returns<RequestStatusRow[]>()
      : Promise.resolve({ data: null }),
  ]);

  const drafts = draftData ?? [];

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

  // --- Business overview (admin only): a chart-driven at-a-glance summary,
  // so the dashboard reads as a real overview before clicking into
  // Analytics/Approvals for the full detail. Client ask (2026-08-26):
  // "I wanted to look cool like an actual dashboard that gives you an
  // overview of the business before you have to click on anything."
  let overviewDaily: TrendPoint[] | null = null;
  let overviewTopPages: { label: string; value: number }[] | null = null;
  let statusSlices: DonutSlice[] | null = null;
  let approvalRate: number | null = null;
  let approvalRateSublabel: string | undefined;

  if (isAdmin) {
    const views = overviewViews ?? [];
    const dailyMap = new Map<string, number>();
    for (let i = OVERVIEW_DAYS - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap.set(dayKey(d), 0);
    }
    for (const v of views) {
      const key = dayKey(new Date(v.created_at));
      if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
    }
    overviewDaily = Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      label: dayLabel(new Date(date)),
      count,
    }));

    const pathCounts = new Map<string, number>();
    for (const v of views) pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
    overviewTopPages = Array.from(pathCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label: label === "/" ? "/ (Home)" : label, value }));

    const statuses = overviewStatuses ?? [];
    const bucket = { approved: 0, pendingReview: 0, draft: 0, rejected: 0, withdrawn: 0 };
    for (const r of statuses) {
      if (r.status === "approved") bucket.approved++;
      else if (r.status === "pending" || r.status === "changes_requested") bucket.pendingReview++;
      else if (r.status === "draft") bucket.draft++;
      else if (r.status === "withdrawn") bucket.withdrawn++;
      else bucket.rejected++;
    }
    statusSlices = [
      { label: "Approved", value: bucket.approved, color: "var(--primary)" },
      { label: "Pending review", value: bucket.pendingReview, color: "#f5a524" },
      { label: "Draft", value: bucket.draft, color: "var(--muted-foreground)" },
      { label: "Rejected", value: bucket.rejected, color: "var(--destructive)" },
    ];

    // A distinct third chart form (radial, not time-series or categorical) —
    // client ask (2026-08-26): "a couple different other types of graphs...
    // to illustrate other aspects of the website." Withdrawn rows are the
    // editor's own choice to pull back, not an admin verdict, so they're
    // excluded from the rate rather than counted as a rejection.
    const reviewed = bucket.approved + bucket.rejected;
    approvalRate = reviewed > 0 ? (bucket.approved / reviewed) * 100 : null;
    approvalRateSublabel = reviewed > 0 ? `${bucket.approved} of ${reviewed} reviewed` : "No reviewed submissions yet";
  }

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

      {isAdmin && overviewDaily && statusSlices && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">
              Business overview — last {OVERVIEW_DAYS} days
            </h2>
            <Link href="/admin/analytics" className="text-primary text-xs font-semibold">
              Full analytics →
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <GlowCard className="p-5 lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold">Pageviews</h3>
              <TrendChart data={overviewDaily} />
            </GlowCard>
            <GlowCard className="flex items-center justify-center p-5">
              <RadialProgress value={approvalRate} label="Approval rate" sublabel={approvalRateSublabel} />
            </GlowCard>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <GlowCard className="p-5">
              <h3 className="mb-3 text-sm font-semibold">Submissions by status</h3>
              <DonutChart slices={statusSlices} title="Content submissions by status, all time" />
            </GlowCard>
            {overviewTopPages && overviewTopPages.length > 0 && (
              <GlowCard className="p-5">
                <h3 className="mb-3 text-sm font-semibold">Top pages</h3>
                <RankedBarList rows={overviewTopPages} />
              </GlowCard>
            )}
          </div>
        </section>
      )}

      {drafts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-sm font-semibold">
            Your drafts ({drafts.length})
          </h2>
          <GlowCard className="block divide-y divide-border p-0">
            {drafts.slice(0, 5).map((d) => (
              <Link
                key={d.id}
                href={`/admin/approvals/${d.id}/revise`}
                className="hover:bg-muted flex items-center gap-3 p-4 transition-colors"
              >
                <span className="flex-1 text-sm font-medium">
                  Draft saved {timeAgo(d.created_at)}
                </span>
                <span className="text-primary text-xs font-semibold">Resume →</span>
              </Link>
            ))}
          </GlowCard>
          {drafts.length > 5 && (
            <p className="text-muted-foreground text-xs">
              +{drafts.length - 5} more —{" "}
              <Link href="/admin/approvals" className="text-primary font-semibold">
                see all in Approvals
              </Link>
              .
            </p>
          )}
        </section>
      )}

      <DashboardView
        initialView={profile?.dashboard_view ?? "overview"}
        stats={stats}
        navTiles={navTiles}
        activity={activity}
      />
    </div>
  );
}
