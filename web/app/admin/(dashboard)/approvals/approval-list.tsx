import type { SiteContent } from "@/lib/site-content";
import { diffSiteContent } from "./content-diff";
import { ApproveRejectButtons } from "./approve-reject-buttons";

export type ChangeRequestItem = {
  id: string;
  targetType: "content" | "image";
  imageSlot: "logo" | "hero-bg" | null;
  baseContent: SiteContent;
  proposedContent: SiteContent | null;
  pendingImageUrl: string | null;
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  submitterLabel: string;
  reviewerLabel: string | null;
  isOwn: boolean;
};

function currentImageUrl(base: SiteContent, slot: "logo" | "hero-bg") {
  const meta = slot === "logo" ? base.images.logo : base.images.heroBg;
  if (!meta) return null;
  return `/api/site-image/${slot}?v=${meta.updatedAt}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: ChangeRequestItem["status"] }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    approved: "bg-[#72D35B]/20 text-[#2f6b1f]",
    rejected: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function RequestCard({ request, isAdmin }: { request: ChangeRequestItem; isAdmin: boolean }) {
  const diff =
    request.targetType === "content" && request.proposedContent
      ? diffSiteContent(request.baseContent, request.proposedContent)
      : [];

  return (
    <div className="border-border space-y-4 rounded-2xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-heading font-semibold">
            {request.targetType === "content"
              ? "Content change"
              : `Photo change — ${request.imageSlot === "logo" ? "Logo" : "Homepage background"}`}
          </p>
          <p className="text-muted-foreground text-xs">
            Submitted by {request.submitterLabel} · {formatDate(request.createdAt)}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {request.targetType === "content" ? (
        diff.length === 0 ? (
          <p className="text-muted-foreground text-sm">No text changes detected.</p>
        ) : (
          <div className="space-y-3">
            {diff.map((entry) => (
              <div key={entry.label} className="text-sm">
                <p className="font-heading font-medium">{entry.label}</p>
                <p className="text-destructive/80 line-through">{entry.before || "(empty)"}</p>
                <p className="text-[#2f6b1f]">{entry.after || "(empty)"}</p>
              </div>
            ))}
          </div>
        )
      ) : request.imageSlot ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">Current</p>
            {currentImageUrl(request.baseContent, request.imageSlot) ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-only comparison view
              <img
                src={currentImageUrl(request.baseContent, request.imageSlot)!}
                alt="Current"
                className="border-border bg-muted h-32 w-full rounded-lg border object-contain p-2"
              />
            ) : (
              <p className="text-muted-foreground text-sm">Using the built-in default.</p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs font-medium">Proposed</p>
            {request.pendingImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin-only comparison view
              <img
                src={request.pendingImageUrl}
                alt="Proposed"
                className="border-border bg-muted h-32 w-full rounded-lg border object-contain p-2"
              />
            ) : (
              <p className="text-destructive text-sm">Couldn&apos;t load the pending image.</p>
            )}
          </div>
        </div>
      ) : null}

      {request.status === "pending" && isAdmin && (
        <ApproveRejectButtons id={request.id} />
      )}
      {request.status === "rejected" && request.reviewNote && (
        <p className="text-sm">
          <span className="font-heading font-medium">Reviewer note: </span>
          {request.reviewNote}
        </p>
      )}
      {request.status !== "pending" && request.reviewedAt && (
        <p className="text-muted-foreground text-xs">
          Reviewed by {request.reviewerLabel ?? "An admin"} · {formatDate(request.reviewedAt)}
        </p>
      )}
    </div>
  );
}

export function ApprovalList({
  requests,
  isAdmin,
}: {
  requests: ChangeRequestItem[];
  isAdmin: boolean;
}) {
  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-heading font-semibold">
          Pending {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing waiting on review.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((request) => (
              <RequestCard key={request.id} request={request} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading font-semibold">Reviewed</h2>
          <div className="space-y-4">
            {reviewed.map((request) => (
              <RequestCard key={request.id} request={request} isAdmin={isAdmin} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
