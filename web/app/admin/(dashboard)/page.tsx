import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, Flag, Users, BarChart3, FileEdit, Image as MediaIcon, Settings } from "lucide-react";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getApprovalsBadgeCount, getOpenReportsCount } from "@/lib/admin-counts";
import { GlowCard } from "@/components/ui/glow-card";

type ActivityRow = {
  id: string;
  actor_id: string | null;
  summary: string;
  created_at: string;
};
type ProfileRow = { id: string; email: string | null; full_name: string | null };

function StatTile({
  href,
  label,
  value,
  Icon,
}: {
  href: string;
  label: string;
  value: string | number;
  Icon: typeof ClipboardCheck;
}) {
  return (
    <GlowCard href={href} className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="font-heading mt-1 text-2xl font-bold">{value}</p>
    </GlowCard>
  );
}

function NavTile({ href, title, description, Icon }: { href: string; title: string; description: string; Icon: typeof FileEdit }) {
  return (
    <GlowCard href={href} className="flex items-start gap-3 p-5">
      <span className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </span>
      <div>
        <h2 className="font-heading font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
      </div>
    </GlowCard>
  );
}

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

  const [pendingApprovals, openReports, staffCount, recentActivity] = await Promise.all([
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
  ]);

  const activityRows = recentActivity.data ?? [];
  const actorIds = Array.from(new Set(activityRows.map((r) => r.actor_id).filter((v): v is string => !!v)));
  const { data: profileRows } = actorIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", actorIds).returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]));

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          href="/admin/approvals"
          label={isAdmin ? "Pending approvals" : "My open submissions"}
          value={pendingApprovals}
          Icon={ClipboardCheck}
        />
        <StatTile href="/admin/reports" label="Open reports" value={openReports} Icon={Flag} />
        {isAdmin && (
          <>
            <StatTile href="/admin/editors" label="Staff with access" value={staffCount.count ?? 0} Icon={Users} />
            <StatTile href="/admin/analytics" label="Analytics" value="View →" Icon={BarChart3} />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
          <NavTile href="/admin/content" title="Content" description="Edit page text." Icon={FileEdit} />
          <NavTile href="/admin/images" title="Media" description="Swap photos and the logo." Icon={MediaIcon} />
          <NavTile href="/admin/settings" title="Settings" description="Account & preferences." Icon={Settings} />
        </div>

        {isAdmin && (
          <GlowCard className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-sm font-semibold">Recent Activity</h3>
              <Link href="/admin/activity" className="text-primary text-xs font-semibold">
                View all
              </Link>
            </div>
            {activityRows.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nothing recorded yet.</p>
            ) : (
              <ul className="space-y-3">
                {activityRows.map((row) => {
                  const actor = row.actor_id ? profileMap.get(row.actor_id) : null;
                  return (
                    <li key={row.id} className="text-sm">
                      <p className="truncate">{row.summary}</p>
                      <p className="text-muted-foreground text-xs">
                        {actor?.full_name || actor?.email || "Unknown"} · {timeAgo(row.created_at)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlowCard>
        )}
      </div>
    </div>
  );
}
