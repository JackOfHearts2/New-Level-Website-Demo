"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitProblemReport, type ReportResult } from "./actions";

const inputClass =
  "border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Sending…" : "Send report"}
    </button>
  );
}

function ReportForm({ onSent }: { onSent: () => void }) {
  const [state, formAction] = useActionState<ReportResult | undefined, FormData>(
    async (prev, formData) => {
      const result = await submitProblemReport(prev, formData);
      if (result?.ok) onSent();
      return result;
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="pageUrl" value={typeof window !== "undefined" ? window.location.href : ""} />
      <label className="block text-sm">
        <span className="font-heading font-medium">What&apos;s the issue?</span>
        <select name="issueType" defaultValue="Incorrect info" className={inputClass}>
          <option>Incorrect info</option>
          <option>Bug or broken feature</option>
          <option>Something else</option>
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-heading font-medium">Details</span>
        <textarea
          name="details"
          rows={4}
          required
          placeholder="What did you notice?"
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        <span className="font-heading font-medium">
          Your email <span className="text-muted-foreground">(optional)</span>
        </span>
        <input name="email" type="email" placeholder="you@example.com" className={inputClass} />
      </label>
      {state?.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}

/** Persistent, sitewide "report a problem" entry point — a small floating
 *  icon reachable from any page (not a page you navigate to, per the
 *  client's explicit ask), opening a lightweight in-place form. Visual/UX
 *  idea borrowed from the old static site's .report-modal (issue-type
 *  dropdown, details textarea, optional email) but rebuilt with this
 *  project's own components. Placed bottom-left, mirroring
 *  FloatingActions' bottom-right dial on the opposite corner, and bumped
 *  up on /property to clear its edge-to-edge StickyBookingBar the same
 *  way FloatingActions does. */
export function ReportProblemWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const onPropertyPage = usePathname() === "/property";

  function close() {
    setOpen(false);
    setSent(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report a problem"
        className={cn(
          "border-background bg-foreground text-background fixed left-4 z-40 flex size-11 items-center justify-center rounded-full border-2 shadow-xl transition-transform hover:scale-110 lg:left-6 lg:size-14 lg:border-4",
          onPropertyPage ? "bottom-24 lg:bottom-6" : "bottom-4 lg:bottom-6"
        )}
      >
        <Flag className="size-4 lg:size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="bg-background w-full max-w-sm rounded-2xl p-6 shadow-xl"
              role="dialog"
              aria-modal="true"
              aria-label="Report a problem"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold">Report a problem</h2>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>
              {sent ? (
                <div className="space-y-4">
                  <p className="text-sm">Thanks — your report was sent. We&apos;ll take a look.</p>
                  <button
                    type="button"
                    onClick={close}
                    className="font-heading border-border w-full rounded-xl border px-4 py-2.5 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4 text-sm">
                    See something off — wrong info, a bug, or anything else? Tell us and
                    we&apos;ll take a look.
                  </p>
                  <ReportForm onSent={() => setSent(true)} />
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
