import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 30;

type TargetTable = "content_change_requests" | "properties" | "problem_reports" | "profiles";

type ActivityRow = {
  id: string;
  actor_id: string | null;
  event_type: string;
  target_table: TargetTable;
  target_id: string | null;
  summary: string;
  created_at: string;
  source: "portal" | "cli";
};

// "Categorized by date and type" (client ask, 2026-08-27) — date grouping
// already existed (see formatDay below); target_table doubles as the type
// filter since every event already carries one and it maps cleanly onto
// how an admin would actually think to narrow this down ("show me just
// the properties stuff"), without needing a second, finer-grained
// event_type taxonomy on top of it.
const TYPE_FILTERS: { value: TargetTable | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "content_change_requests", label: "Content" },
  { value: "properties", label: "Properties" },
  { value: "profiles", label: "Team & access" },
  { value: "problem_reports", label: "Reports" },
];

type ProfileRow = { id: string; email: string | null; full_name: string | null };

function targetHref(row: ActivityRow): string | null {
  if (!row.target_id) return null;
  if (row.target_table === "content_change_requests") return "/admin/approvals";
  if (row.target_table === "properties") return "/admin/properties";
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
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const auth = await requireAdmin();
  if (!auth) redirect("/admin?denied=1");

  const { page: pageParam, type: typeParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const activeType = TYPE_FILTERS.some((t) => t.value === typeParam) ? (typeParam as TargetTable | "all") : "all";

  const supabase = await createClient();
  let query = supabase
    .from("activity_log")
    .select("id, actor_id, event_type, target_table, target_id, summary, created_at, source", {
      count: "exact",
    });
  if (activeType !== "all") query = query.eq("target_table", activeType);
  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<ActivityRow[]>();

  const allRows = data ?? [];
  // Deploy/CLI-triggered entries (planned, not wired yet — needs a Netlify
  // deploy webhook, a separate step) get their own section per the client's
  // explicit ask (2026-08-26): those "need to pop up on the admin's
  // account... they're gonna have their own section in activity." Until
  // that webhook exists this list is always empty and the section just
  // doesn't render, rather than showing a permanently-blank block.
  const cliRows = allRows.filter((r) => r.source === "cli");
  const rows = allRows.filter((r) => r.source !== "cli");
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

      <div role="tablist" aria-label="Filter by type" className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/admin/activity" : `/admin/activity?type=${t.value}`}
            role="tab"
            aria-selected={activeType === t.value}
            className={`font-heading rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeType === t.value
                ? "bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted border"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {cliRows.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Code changes</h2>
          <p className="text-muted-foreground text-xs">
            Deploys and changes made directly through the codebase, not the portal.
          </p>
          <div className="border-border divide-border divide-y rounded-2xl border">
            {cliRows.map((row) => (
              <div key={row.id} className="p-4">
                <p className="text-sm">{row.summary}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDay(row.created_at)} · {formatTime(row.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {rows.length === 0 && cliRows.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nothing recorded yet.</p>
      ) : rows.length === 0 ? null : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([day, dayRows]) => (
            <section key={day} className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">{day}</h2>
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
            <Link
              href={`/admin/activity?page=${page - 1}${activeType !== "all" ? `&type=${activeType}` : ""}`}
              className="font-heading font-semibold"
            >
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/admin/activity?page=${page + 1}${activeType !== "all" ? `&type=${activeType}` : ""}`}
              className="font-heading font-semibold"
            >
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
