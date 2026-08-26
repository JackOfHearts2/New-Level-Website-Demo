import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { TrendChart, type TrendPoint } from "@/components/admin/trend-chart";
import { RankedBarList } from "@/components/admin/ranked-bar-list";
import { GlowCard } from "@/components/ui/glow-card";
import { trimLeadingZeroDays } from "@/lib/chart-data";
import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS, INQUIRY_SOURCE_LABELS, type InquiryStatus, type InquirySource } from "@/lib/inquiries";

const DAYS = 30;
const SUBMISSION_WEEKS = 12;

type ViewRow = { path: string; session_id: string; referrer: string | null; created_at: string };
type RequestRow = {
  submitted_by: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};
type ProfileRow = { id: string; email: string | null; full_name: string | null };
type InquiryRow = { source: InquirySource; status: InquiryStatus; assigned_to: string | null; created_at: string };

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

// Monday-anchored week bucket for the submissions trend — coarser than
// the daily traffic chart on purpose, since submissions are a much lower-
// frequency event and a 12-week view shows a real trend where 12 days of
// mostly-zero counts wouldn't.
function weekKey(d: Date) {
  const monday = new Date(d);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function weekLabel(key: string) {
  return `Wk of ${new Date(key).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export default async function AnalyticsPage() {
  const auth = await requireAdmin();
  if (!auth) redirect("/admin?denied=1");

  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - DAYS);

  const [{ data: viewData }, { data: requestData }, { data: inquiryData }] = await Promise.all([
    supabase
      .from("page_views")
      .select("path, session_id, referrer, created_at")
      .gte("created_at", since.toISOString())
      .returns<ViewRow[]>(),
    supabase
      .from("content_change_requests")
      .select("submitted_by, status, created_at, reviewed_at")
      .returns<RequestRow[]>(),
    supabase.from("inquiries").select("source, status, assigned_to, created_at").returns<InquiryRow[]>(),
  ]);

  const views = viewData ?? [];
  const requests = requestData ?? [];
  const inquiries = inquiryData ?? [];

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
  const daily: TrendPoint[] = trimLeadingZeroDays(
    Array.from(dailyMap.entries()).map(([date, count]) => ({
      date,
      label: dayLabel(new Date(date)),
      count,
    }))
  );

  const uniqueSessions = new Set(views.map((v) => v.session_id)).size;
  const pathCounts = new Map<string, number>();
  for (const v of views) pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
  const topPages = Array.from(pathCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label: label === "/" ? "/ (Home)" : label, value }));

  const referrerCounts = new Map<string, number>();
  for (const v of views) {
    let label = "Direct / unknown";
    if (v.referrer) {
      try {
        label = new URL(v.referrer).hostname.replace(/^www\./, "");
      } catch {
        label = v.referrer;
      }
    }
    referrerCounts.set(label, (referrerCounts.get(label) ?? 0) + 1);
  }
  const topReferrers = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }));

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

  const needsRevision = requests.filter((r) => r.status === "rejected" || r.status === "changes_requested");
  const revisionRate = requests.length ? (needsRevision.length / requests.length) * 100 : null;

  const weeklyMap = new Map<string, number>();
  for (let i = SUBMISSION_WEEKS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    weeklyMap.set(weekKey(d), 0);
  }
  for (const r of requests) {
    const key = weekKey(new Date(r.created_at));
    if (weeklyMap.has(key)) weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + 1);
  }
  const submissionsWeekly: TrendPoint[] = trimLeadingZeroDays(
    Array.from(weeklyMap.entries()).map(([date, count]) => ({ date, label: weekLabel(date), count }))
  );

  // --- Inquiries ---
  const unassignedInquiries = inquiries.filter((i) => !i.assigned_to).length;
  const statusFunnel = INQUIRY_STATUSES.map((s) => ({
    label: INQUIRY_STATUS_LABELS[s],
    value: inquiries.filter((i) => i.status === s).length,
  }));
  const sourceCounts = new Map<InquirySource, number>();
  for (const i of inquiries) sourceCounts.set(i.source, (sourceCounts.get(i.source) ?? 0) + 1);
  const bySource = Array.from(sourceCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([source, value]) => ({ label: INQUIRY_SOURCE_LABELS[source], value }));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Visitor traffic, team activity, and inquiries — more detail than the Dashboard&apos;s
          overview, not a bigger copy of it. Traffic is first-party — no cookies, no third-party
          tracker.
        </p>
      </div>

      {/* scroll-mt-24 clears AdminTopBar's sticky height, same as the
          jump-nav targets in content-form.tsx's Section wrapper — the
          dashboard's overview cards link straight into these two ids
          (client ask, 2026-08-27: "the dashboard icons also need to take
          you to that particular part in the analytics page"). */}
      <section id="analytics-traffic" className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-lg font-semibold">Traffic — last {DAYS} days</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Pageviews" value={String(views.length)} />
          <StatTile label="Unique sessions" value={String(uniqueSessions)} />
          <StatTile
            label="Views / day (avg)"
            value={(views.length / DAYS).toFixed(1)}
          />
        </div>
        <GlowCard className="p-5">
          {/* Taller than the Dashboard's compact version of this same chart
              (its default height) — client ask (2026-08-27): "the height
              has to extend" for the full Analytics page. */}
          <TrendChart data={daily} height={280} />
        </GlowCard>
        <div className="grid gap-4 lg:grid-cols-2">
          <GlowCard className="p-5">
            <h3 className="font-heading mb-3 text-base font-semibold">Top pages</h3>
            <RankedBarList rows={topPages} />
          </GlowCard>
          <GlowCard className="p-5">
            <h3 className="font-heading mb-3 text-base font-semibold">Where visitors come from</h3>
            <RankedBarList rows={topReferrers} />
          </GlowCard>
        </div>
      </section>

      <section id="analytics-team-activity" className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-lg font-semibold">Team activity — all time</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Total submissions" value={String(requests.length)} />
          <StatTile
            label="Avg. review turnaround"
            value={avgTurnaroundHours === null ? "—" : `${avgTurnaroundHours.toFixed(1)}h`}
            hint={reviewed.length ? `across ${reviewed.length} reviewed submissions` : undefined}
          />
          <StatTile
            label="Sent back for revision"
            value={revisionRate === null ? "—" : `${revisionRate.toFixed(0)}%`}
            hint={requests.length ? "rejected or changes requested" : undefined}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <GlowCard className="p-5">
            <h3 className="font-heading mb-3 text-base font-semibold">Submissions by editor</h3>
            <RankedBarList rows={editorRows} />
          </GlowCard>
          <GlowCard className="p-5">
            <h3 className="font-heading mb-3 text-base font-semibold">Submissions per week</h3>
            <TrendChart data={submissionsWeekly} seriesLabel="Submissions" />
          </GlowCard>
        </div>
      </section>

      <section id="analytics-inquiries" className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-lg font-semibold">Inquiries — all time</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatTile label="Total inquiries" value={String(inquiries.length)} />
          <StatTile
            label="Unassigned"
            value={String(unassignedInquiries)}
            hint={unassignedInquiries > 0 ? "need a staff owner" : "all inquiries are assigned"}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <GlowCard className="p-5">
            <h3 className="font-heading mb-3 text-base font-semibold">By stage</h3>
            <RankedBarList rows={statusFunnel} />
          </GlowCard>
          <GlowCard className="p-5">
            <h3 className="font-heading mb-3 text-base font-semibold">By source</h3>
            <RankedBarList rows={bySource} />
          </GlowCard>
        </div>
      </section>
    </div>
  );
}
