import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { ReportList, type ReportItem } from "./report-list";

type ReportRow = {
  id: string;
  issue_type: string;
  details: string;
  reporter_email: string | null;
  page_url: string;
  status: "open" | "resolved";
  created_at: string;
  source: "public" | "staff";
  related_request_id: string | null;
  diagnostic: { status?: string; createdAt?: string; reviewedAt?: string | null } | null;
};

export default async function ReportsPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("problem_reports")
    .select(
      "id, issue_type, details, reporter_email, page_url, status, created_at, source, related_request_id, diagnostic"
    )
    .order("created_at", { ascending: false })
    .returns<ReportRow[]>();

  const reports: ReportItem[] = (data ?? []).map((row) => ({
    id: row.id,
    issueType: row.issue_type,
    details: row.details,
    reporterEmail: row.reporter_email,
    pageUrl: row.page_url,
    status: row.status,
    createdAt: row.created_at,
    source: row.source,
    relatedRequestId: row.related_request_id,
    diagnostic: row.diagnostic,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Problems visitors have flagged from the site&apos;s &quot;Report a problem&quot;
          button, plus anything staff have flagged from the same button in the dashboard.
        </p>
      </div>
      <ReportList reports={reports} />
    </div>
  );
}
