import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 30;

type ActivityRow = {
  id: string;
  actor_id: string | null;
  event_type: string;
  target_table: "content_change_requests" | "problem_reports" | "profiles";
  target_id: string | null;
  summary: string;
  created_at: string;
};

type ProfileRow = { id: string; email: string | null; full_name: string | null };

function targetHref(row: ActivityRow): string | null {
  if (!row.target_id) return null;
  if (row.target_table === "content_change_requests") return "/admin/approvals";
  if (row.target_table === "problem_reports") return "/admin/reports";
  if (row.target_table === "profiles") return "/admin/editors";
  return null;
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { timeStyle: "short" });
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth) redirect("/admin");

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data, count } = await supabase
    .from("activity_log")
    .select("id, actor_id, event_type, target_table, target_id, summary, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<ActivityRow[]>();

  const rows = data ?? [];
  const actorIds = Array.from(new Set(rows.map((r) => r.actor_id).filter((v): v is string => !!v)));
  const { data: profileRows } = actorIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", actorIds).returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]));

  const groups = new Map<string, ActivityRow[]>();
  for (const row of rows) {
    const day = formatDay(row.created_at);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(row);
  }

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Activity</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          A running record of everything that&apos;s happened across submissions, approvals,
          and reports.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nothing recorded yet.</p>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([day, dayRows]) => (
            <section key={day} className="space-y-3">
              <h2 className="font-heading text-sm font-semibold">{day}</h2>
              <div className="border-border divide-border divide-y rounded-2xl border">
                {dayRows.map((row) => {
                  const actor = row.actor_id ? profileMap.get(row.actor_id) : null;
                  const href = targetHref(row);
                  return (
                    <div key={row.id} className="flex items-start justify-between gap-4 p-4">
                      <div>
                        <p className="text-sm">{row.summary}</p>
                        <p className="text-muted-foreground text-xs">
                          {actor?.full_name || actor?.email || "Unknown"} · {formatTime(row.created_at)}
                        </p>
                      </div>
                      {href && (
                        <Link href={href} className="text-primary font-heading text-sm font-semibold">
                          View →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={`/admin/activity?page=${page - 1}`} className="font-heading font-semibold">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/admin/activity?page=${page + 1}`} className="font-heading font-semibold">
              Older →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
