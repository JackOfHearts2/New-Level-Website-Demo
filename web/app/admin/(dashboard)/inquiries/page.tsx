import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { GlowCard } from "@/components/ui/glow-card";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  INQUIRY_SOURCE_LABELS,
  type InquiryStatus,
  type InquirySource,
} from "@/lib/inquiries";

type InquiryRow = {
  id: string;
  source: InquirySource;
  status: InquiryStatus;
  name: string;
  email: string;
  created_at: string;
  assigned_to: string | null;
};
type ProfileRow = { id: string; email: string | null; full_name: string | null };

const STATUS_BADGE_CLASS: Record<InquiryStatus, string> = {
  new: "bg-blue-100 text-blue-900",
  contacted: "bg-amber-100 text-amber-900",
  qualified: "bg-[#72D35B]/20 text-[#2f6b1f]",
  converted: "bg-[#72D35B]/30 text-[#2f6b1f]",
  lost: "bg-muted text-muted-foreground",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** A lightweight leads pipeline, not a full CRM (client ask, 2026-08-27):
 *  every public inquiry form (property, contact, ask-the-broker, careers)
 *  now really writes here instead of confirming into nowhere — see
 *  app/actions/inquiries.ts. Status filter chips mirror the pattern
 *  already used on the Activity page's type filter. */
export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; assigned?: string }>;
}) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const { status: statusParam, assigned: assignedParam } = await searchParams;
  const activeStatus = INQUIRY_STATUSES.includes(statusParam as InquiryStatus)
    ? (statusParam as InquiryStatus)
    : null;

  const supabase = await createClient();
  let query = supabase
    .from("inquiries")
    .select("id, source, status, name, email, created_at, assigned_to")
    .order("created_at", { ascending: false });
  if (activeStatus) query = query.eq("status", activeStatus);
  if (assignedParam) query = query.eq("assigned_to", assignedParam);
  const { data } = await query.returns<InquiryRow[]>();
  const inquiries = data ?? [];

  const assignedIds = Array.from(new Set(inquiries.map((i) => i.assigned_to).filter((v): v is string => !!v)));
  const { data: profileData } = assignedIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", assignedIds).returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const profileMap = new Map((profileData ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Inquiries</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Every message from the property, contact, and careers forms lands here — qualify it,
          respond, and hand it off from one place.
        </p>
      </div>

      <div role="tablist" aria-label="Filter by status" className="flex flex-wrap gap-2">
        <Link
          href="/admin/inquiries"
          role="tab"
          aria-selected={!activeStatus}
          className={`font-heading rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
            !activeStatus ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted border"
          }`}
        >
          All
        </Link>
        {INQUIRY_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/inquiries?status=${s}`}
            role="tab"
            aria-selected={activeStatus === s}
            className={`font-heading rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
              activeStatus === s ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted border"
            }`}
          >
            {INQUIRY_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nothing here yet.</p>
      ) : (
        <GlowCard className="block divide-y divide-border p-0">
          {inquiries.map((inquiry) => {
            const assignee = inquiry.assigned_to ? profileMap.get(inquiry.assigned_to) : null;
            return (
              <Link
                key={inquiry.id}
                href={`/admin/inquiries/${inquiry.id}`}
                className="hover:bg-muted flex flex-wrap items-center justify-between gap-3 p-4 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-heading truncate text-sm font-semibold">{inquiry.name}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {inquiry.email} · {INQUIRY_SOURCE_LABELS[inquiry.source]} · {formatDate(inquiry.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-muted-foreground text-xs">
                    {assignee ? assignee.full_name || assignee.email : "Unassigned"}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASS[inquiry.status]}`}
                  >
                    {INQUIRY_STATUS_LABELS[inquiry.status]}
                  </span>
                </div>
              </Link>
            );
          })}
        </GlowCard>
      )}
    </div>
  );
}
