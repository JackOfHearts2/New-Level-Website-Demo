import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { DailyViewsChart, type DailyPoint } from "@/components/admin/daily-views-chart";
import { RankedBarList } from "@/components/admin/ranked-bar-list";
import { GlowCard } from "@/components/ui/glow-card";

const DAYS = 30;

type ViewRow = { path: string; session_id: string; created_at: string };
type RequestRow = {
  submitted_by: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};
type ProfileRow = { id: string; email: string | null; full_name: string | null };

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <GlowCard className="p-5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="font-heading mt-1 text-3xl font-bold">{value}</p>
      {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
    </GlowCard>
  );
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function AnalyticsPage() {
  const auth = await requireAdmin();
  if (!auth) redirect("/admin");

  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const [{ data: viewData }, { data: requestData }] = await Promise.all([
    supabase
      .from("page_views")
      .select("path, session_id, created_at")
      .gte("created_at", since.toISOString())
      .returns<ViewRow[]>(),
    supabase
      .from("content_change_requests")
      .select("submitted_by, status, created_at, reviewed_at")
      .returns<RequestRow[]>(),
  ]);

  const views = viewData ?? [];
  const requests = requestData ?? [];

  // --- Traffic ---
  const dailyMap = new Map<string, number>();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap.set(dayKey(d), 0);
  }
  for (const v of views) {
    const key = dayKey(new Date(v.created_at));
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1);
  }
  const daily: DailyPoint[] = Array.from(dailyMap.entries()).map(([date, count]) => ({
    date,
    label: dayLabel(new Date(date)),
    count,
  }));

  const uniqueSessions = new Set(views.map((v) => v.session_id)).size;
  const pathCounts = new Map<string, number>();
  for (const v of views) pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
  const topPages = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label: label === "/" ? "/ (Home)" : label, value }));

  // --- Team activity ---
  const editorIds = Array.from(new Set(requests.map((r) => r.submitted_by)));
  const { data: profileData } = editorIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", editorIds).returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const profileMap = new Map((profileData ?? []).map((p) => [p.id, p]));

  const perEditor = new Map<string, number>();
  for (const r of requests) perEditor.set(r.submitted_by, (perEditor.get(r.submitted_by) ?? 0) + 1);
  const editorRows = Array.from(perEditor.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, value]) => {
      const p = profileMap.get(id);
      return { label: p?.full_name || p?.email || "Unknown", value };
    });

  const reviewed = requests.filter(
    (r) => r.reviewed_at && (r.status === "approved" || r.status === "rejected")
  );
  const avgTurnaroundHours = reviewed.length
    ? reviewed.reduce(
        (sum, r) =>
          sum + (new Date(r.reviewed_at!).getTime() - new Date(r.created_at).getTime()) / 3600000,
        0
      ) / reviewed.length
    : null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Visitor traffic and team activity. Traffic is first-party — no cookies, no third-party
          tracker.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-sm font-semibold">Traffic — last {DAYS} days</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Pageviews" value={String(views.length)} />
          <StatTile label="Unique sessions" value={String(uniqueSessions)} />
          <StatTile
            label="Views / day (avg)"
            value={(views.length / DAYS).toFixed(1)}
          />
        </div>
        <GlowCard className="p-5">
          <DailyViewsChart data={daily} />
        </GlowCard>
        <GlowCard className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Top pages</h3>
          <RankedBarList rows={topPages} />
        </GlowCard>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-sm font-semibold">Team activity — all time</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatTile label="Total submissions" value={String(requests.length)} />
          <StatTile
            label="Avg. review turnaround"
            value={avgTurnaroundHours === null ? "—" : `${avgTurnaroundHours.toFixed(1)}h`}
            hint={reviewed.length ? `across ${reviewed.length} reviewed submissions` : undefined}
          />
        </div>
        <GlowCard className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Submissions by editor</h3>
          <RankedBarList rows={editorRows} />
        </GlowCard>
      </section>
    </div>
  );
}
