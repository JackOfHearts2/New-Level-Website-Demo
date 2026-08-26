"use client";

import { useState, useTransition } from "react";
import { Flag, X, ChevronLeft } from "lucide-react";
import {
  getMyRecentSubmissions,
  fileStaffReport,
  type SubmissionSummary,
} from "@/app/admin/(dashboard)/troubleshoot-actions";

type Step =
  | { kind: "closed" }
  | { kind: "menu" }
  | { kind: "loadingSubmissions" }
  | { kind: "pickSubmission"; submissions: SubmissionSummary[] }
  | { kind: "guidance"; submission: SubmissionSummary }
  | { kind: "reportForm"; issueType: "Change not reflecting live" | "Dashboard bug" | "Something else"; submission?: SubmissionSummary }
  | { kind: "sent" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Real, non-AI diagnosis from the submission's own status — client ask
// (2026-08-26): "the user should be prompted to follow a series of steps
// to try and resolve the issue." Most "why isn't my change live" cases
// have a plain, non-mysterious answer already sitting in this row; only
// "approved but still not visible" is actually unexplained.
function guidanceFor(s: SubmissionSummary): { message: string; resolved: boolean } {
  switch (s.status) {
    case "draft":
      return {
        message:
          "This is still saved as a draft — it was never submitted. Go to Content & Media, open it, and click \"Submit for review\" (or \"Publish live\" if you're an admin).",
        resolved: true,
      };
    case "pending":
      return {
        message:
          "This is still waiting on an admin's review — nothing goes live until it's approved. Check its status on the Approvals page.",
        resolved: true,
      };
    case "changes_requested":
      return {
        message: `An admin asked for changes before this can go live.${s.reviewNote ? ` Their note: "${s.reviewNote}"` : ""} Revise it from Approvals and resubmit.`,
        resolved: true,
      };
    case "rejected":
      return {
        message: `This was rejected, not approved.${s.reviewNote ? ` Reviewer's note: "${s.reviewNote}"` : ""} Check Approvals for details.`,
        resolved: true,
      };
    case "withdrawn":
      return {
        message: "This was withdrawn — it was never submitted for review, so nothing should be live from it.",
        resolved: true,
      };
    case "approved":
      return {
        message:
          "This was approved. Try a hard refresh first (Ctrl/Cmd+Shift+R) — browsers and CDNs cache pages, and a normal reload sometimes isn't enough. If it's genuinely not showing after that, this looks like a real issue — you can report it below.",
        resolved: false,
      };
    default:
      return { message: "Couldn't determine its status. You can report this below.", resolved: false };
  }
}

export function TroubleshootWidget() {
  const [step, setStep] = useState<Step>({ kind: "closed" });
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() {
    setStep({ kind: "closed" });
    setDetails("");
    setError(null);
  }

  function openMenu() {
    setStep({ kind: "menu" });
    setError(null);
  }

  function pickChangeNotLive() {
    setStep({ kind: "loadingSubmissions" });
    startTransition(async () => {
      const submissions = await getMyRecentSubmissions();
      setStep({ kind: "pickSubmission", submissions });
    });
  }

  function handleSubmit() {
    if (step.kind !== "reportForm") return;
    setError(null);
    const { issueType, submission } = step;
    startTransition(async () => {
      const result = await fileStaffReport({
        issueType,
        details,
        relatedRequestId: submission?.id,
        diagnostic: submission
          ? { status: submission.status, createdAt: submission.createdAt, reviewedAt: submission.reviewedAt }
          : undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setStep({ kind: "sent" });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        aria-label="Report a problem"
        className="border-background bg-foreground text-background fixed bottom-4 left-4 z-40 flex size-11 items-center justify-center rounded-full border-2 shadow-xl transition-transform hover:scale-110 lg:bottom-6 lg:left-6 lg:size-14 lg:border-4"
      >
        <Flag className="size-4 lg:size-5" />
      </button>

      {step.kind !== "closed" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Report a problem"
            className="bg-background w-full max-w-sm rounded-2xl p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">Report a problem</h2>
              <button type="button" onClick={close} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            {step.kind === "menu" && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={pickChangeNotLive}
                  className="border-border hover:border-primary/50 hover:bg-muted w-full rounded-xl border p-3 text-left text-sm font-medium"
                >
                  A change I made isn&apos;t showing on the live site
                </button>
                <button
                  type="button"
                  onClick={() => setStep({ kind: "reportForm", issueType: "Dashboard bug" })}
                  className="border-border hover:border-primary/50 hover:bg-muted w-full rounded-xl border p-3 text-left text-sm font-medium"
                >
                  Something&apos;s broken in the dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setStep({ kind: "reportForm", issueType: "Something else" })}
                  className="border-border hover:border-primary/50 hover:bg-muted w-full rounded-xl border p-3 text-left text-sm font-medium"
                >
                  Something else
                </button>
              </div>
            )}

            {step.kind === "loadingSubmissions" && (
              <p className="text-muted-foreground text-sm">Checking your recent submissions…</p>
            )}

            {step.kind === "pickSubmission" && (
              <div className="space-y-3">
                <button type="button" onClick={openMenu} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold">
                  <ChevronLeft className="size-3.5" /> Back
                </button>
                {step.submissions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    You don&apos;t have any recent submissions. If something else seems wrong, use
                    &quot;Something else&quot; from the previous menu instead.
                  </p>
                ) : (
                  <>
                    <p className="text-muted-foreground text-sm">Which one?</p>
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {step.submissions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStep({ kind: "guidance", submission: s })}
                          className="border-border hover:border-primary/50 hover:bg-muted w-full rounded-xl border p-3 text-left text-sm"
                        >
                          <span className="font-heading block font-medium">{s.label}</span>
                          <span className="text-muted-foreground block text-xs capitalize">
                            {s.status.replace("_", " ")} · {formatDate(s.createdAt)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {step.kind === "guidance" &&
              (() => {
                const g = guidanceFor(step.submission);
                return (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={pickChangeNotLive}
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold"
                    >
                      <ChevronLeft className="size-3.5" /> Back
                    </button>
                    <p className="text-sm">{g.message}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={close}
                        className="font-heading border-border flex-1 rounded-xl border px-4 py-2 text-sm font-semibold"
                      >
                        {g.resolved ? "That explains it" : "Never mind"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setStep({ kind: "reportForm", issueType: "Change not reflecting live", submission: step.submission })
                        }
                        className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 flex-1 rounded-xl px-4 py-2 text-sm font-semibold"
                      >
                        {g.resolved ? "Still stuck — report it" : "Report it"}
                      </button>
                    </div>
                  </div>
                );
              })()}

            {step.kind === "reportForm" && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Describe what you&apos;re seeing. This goes straight to an admin — nothing gets
                  fixed automatically.
                </p>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="What did you notice?"
                  className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
                {error && (
                  <p className="text-destructive text-sm" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={pending}
                  className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {pending ? "Sending…" : "Send report"}
                </button>
              </div>
            )}

            {step.kind === "sent" && (
              <div className="space-y-4">
                <p className="text-sm">Thanks — your report was sent. An admin will take a look.</p>
                <button
                  type="button"
                  onClick={close}
                  className="font-heading border-border w-full rounded-xl border px-4 py-2.5 text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
