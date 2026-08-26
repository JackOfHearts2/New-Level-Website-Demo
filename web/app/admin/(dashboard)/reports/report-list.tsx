"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveReport, reopenReport } from "./actions";

export type ReportItem = {
  id: string;
  issueType: string;
  details: string;
  reporterEmail: string | null;
  pageUrl: string;
  status: "open" | "resolved";
  createdAt: string;
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
          <p className="font-heading font-semibold">{report.issueType}</p>
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
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await (report.status === "open" ? resolveReport(report.id) : reopenReport(report.id));
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

export function ReportList({ reports }: { reports: ReportItem[] }) {
  const open = reports.filter((r) => r.status === "open");
  const resolved = reports.filter((r) => r.status === "resolved");

  return (
    <div className="space-y-8">
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
