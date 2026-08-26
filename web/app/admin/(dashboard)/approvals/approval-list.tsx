import Link from "next/link";
import type { SiteContent } from "@/lib/site-content";
import { imageSlotLabel } from "@/lib/site-content-images";
import { diffSiteContent } from "./content-diff";
import { ReviewOutcomeButtons } from "./review-outcome-buttons";
import { EditWithdrawButtons } from "./edit-withdraw-buttons";

export type ChangeRequestStatus =
  | "draft"
  | "pending"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "withdrawn";

export type ChangeRequestItem = {
  id: string;
  targetType: "content" | "image";
  imageSlot: string | null;
  baseContent: SiteContent;
  proposedContent: SiteContent | null;
  pendingImageUrl: string | null;
  status: ChangeRequestStatus;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  submitterLabel: string;
  reviewerLabel: string | null;
  isOwn: boolean;
};

function currentImageUrl(base: SiteContent, slot: string) {
  const meta =
    slot === "logo" ? base.images.logo : slot === "hero-bg" ? base.images.heroBg : base.images.slots?.[slot];
  if (!meta) return null;
  return `/api/site-image/${slot}?v=${meta.updatedAt}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_LABELS: Record<ChangeRequestStatus, string> = {
  draft: "draft — not submitted",
  pending: "pending",
  changes_requested: "changes requested",
  approved: "approved",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

function StatusBadge({ status }: { status: ChangeRequestStatus }) {
  const styles: Record<ChangeRequestStatus, string> = {
    draft: "bg-blue-100 text-blue-900",
    pending: "bg-amber-100 text-amber-900",
    changes_requested: "bg-amber-100 text-amber-900",
    approved: "bg-[#72D35B]/20 text-[#2f6b1f]",
    rejected: "bg-destructive/15 text-destructive",
    withdrawn: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function RequestCard({ request, isAdmin }: { request: ChangeRequestItem; isAdmin: boolean }) {
  const diff =
    request.targetType === "content" && request.proposedContent
      ? diffSiteContent(request.baseContent, request.proposedContent)
      : [];
  const isActionable =
    request.status === "pending" || request.status === "changes_requested" || request.status === "draft";

  return (
    <div className="border-border space-y-4 rounded-2xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-heading font-semibold">
            {request.targetType === "content"
              ? "Content change"
              : `Photo change — ${request.imageSlot ? imageSlotLabel(request.imageSlot, request.baseContent) : "unknown"}`}
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

      {isActionable && (
        <Link
          href={`/admin/preview/${request.id}`}
          className="font-heading text-primary text-sm font-semibold"
        >
          Preview →
        </Link>
      )}

      {request.status === "pending" && isAdmin && <ReviewOutcomeButtons id={request.id} />}
      {isActionable && request.isOwn && !isAdmin && <EditWithdrawButtons id={request.id} />}

      {(request.status === "rejected" || request.status === "changes_requested") &&
        request.reviewNote && (
          <p className="text-sm">
            <span className="font-heading font-medium">Reviewer note: </span>
            {request.reviewNote}
          </p>
        )}
      {!isActionable && request.reviewedAt && (
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
  const actionable = requests.filter(
    (r) => r.status === "pending" || r.status === "changes_requested"
  );
  const history = requests.filter((r) => r.status !== "pending" && r.status !== "changes_requested");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-heading font-semibold">
          Pending {actionable.length > 0 && `(${actionable.length})`}
        </h2>
        {actionable.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing waiting on review.</p>
        ) : (
          <div className="space-y-4">
            {actionable.map((request) => (
              <RequestCard key={request.id} request={request} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading font-semibold">Reviewed</h2>
          <div className="space-y-4">
            {history.map((request) => (
              <RequestCard key={request.id} request={request} isAdmin={isAdmin} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
