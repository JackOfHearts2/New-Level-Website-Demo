"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resolveReport, reopenReport } from "./actions";

export type ReportItem = {
  id: string;
  issueType: string;
  details: string;
  reporterEmail: string | null;
  pageUrl: string;
  status: "open" | "resolved";
  createdAt: string;
  source: "public" | "staff";
  relatedRequestId: string | null;
  diagnostic: { status?: string; createdAt?: string; reviewedAt?: string | null } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function ReportRow({ report }: { report: ReportItem }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="border-border space-y-2 rounded-2xl border p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-heading font-semibold">{report.issueType}</p>
            {report.source === "staff" && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">
                Staff
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            {formatDate(report.createdAt)} · {report.pageUrl}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
            report.status === "open"
              ? "bg-amber-100 text-amber-900"
              : "bg-[#72D35B]/20 text-[#2f6b1f]"
          }`}
        >
          {report.status}
        </span>
      </div>
      <p className="text-sm">{report.details}</p>
      {report.reporterEmail && (
        <p className="text-muted-foreground text-xs">From: {report.reporterEmail}</p>
      )}
      {report.diagnostic && (
        <div className="border-border bg-muted/40 rounded-lg border p-3 text-xs">
          <p className="font-heading font-semibold">Diagnostic snapshot (at time of report)</p>
          <p className="text-muted-foreground mt-1">
            Submission status: <span className="capitalize">{report.diagnostic.status?.replace("_", " ")}</span>
            {report.diagnostic.reviewedAt && ` · Reviewed ${formatDate(report.diagnostic.reviewedAt)}`}
          </p>
          {report.relatedRequestId && (
            <a href="/admin/approvals" className="text-primary font-semibold">
              View in Approvals →
            </a>
          )}
        </div>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await (report.status === "open" ? resolveReport(report.id) : reopenReport(report.id));
            toast.success(report.status === "open" ? "Report marked resolved" : "Report reopened");
            router.refresh();
          })
        }
        className="font-heading text-sm font-semibold text-[#2f6b1f] disabled:opacity-50"
      >
        {report.status === "open" ? "Mark resolved" : "Reopen"}
      </button>
    </div>
  );
}

type SourceFilter = "all" | "public" | "staff";

function SourceFilterChips({
  value,
  onChange,
  counts,
}: {
  value: SourceFilter;
  onChange: (v: SourceFilter) => void;
  counts: Record<SourceFilter, number>;
}) {
  const options: { value: SourceFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "public", label: "From visitors" },
    { value: "staff", label: "From staff" },
  ];
  return (
    <div role="tablist" aria-label="Filter by source" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`font-heading rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
            value === o.value ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted border"
          }`}
        >
          {o.label} {o.value !== "all" && counts[o.value] > 0 ? `(${counts[o.value]})` : ""}
        </button>
      ))}
    </div>
  );
}

export function ReportList({ reports }: { reports: ReportItem[] }) {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const counts: Record<SourceFilter, number> = {
    all: reports.length,
    public: reports.filter((r) => r.source === "public").length,
    staff: reports.filter((r) => r.source === "staff").length,
  };
  const filtered = sourceFilter === "all" ? reports : reports.filter((r) => r.source === sourceFilter);

  const open = filtered.filter((r) => r.status === "open");
  const resolved = filtered.filter((r) => r.status === "resolved");

  return (
    <div className="space-y-8">
      <SourceFilterChips value={sourceFilter} onChange={setSourceFilter} counts={counts} />

      <section className="space-y-4">
        <h2 className="font-heading font-semibold">Open {open.length > 0 && `(${open.length})`}</h2>
        {open.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing open right now.</p>
        ) : (
          <div className="space-y-4">
            {open.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
      {resolved.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading font-semibold">Resolved</h2>
          <div className="space-y-4">
            {resolved.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
