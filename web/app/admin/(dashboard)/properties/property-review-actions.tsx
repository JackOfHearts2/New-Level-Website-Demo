"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveProperty, rejectProperty, requestPropertyChanges } from "./actions";

/** Admin-only three-way review, same shape as the existing content-request
 *  review (approve / request changes with a note / reject with a note). */
export function PropertyReviewActions({ propertyId }: { propertyId: string }) {
  const [noteMode, setNoteMode] = useState<"reject" | "changes" | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function approve() {
    startTransition(async () => {
      const result = await approveProperty(propertyId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function submitNote() {
    setError(null);
    startTransition(async () => {
      const result =
        noteMode === "reject" ? await rejectProperty(propertyId, note) : await requestPropertyChanges(propertyId, note);
      if (result.error) {
        setError(result.error);
        return;
      }
      setNoteMode(null);
      setNote("");
      router.refresh();
    });
  }

  if (noteMode) {
    return (
      <div className="w-full space-y-2 sm:w-64">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={noteMode === "reject" ? "Why is this rejected?" : "What needs to change?"}
          rows={2}
          className="border-border w-full rounded-lg border px-2 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {error && <p className="text-destructive text-xs">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setNoteMode(null)}
            className="font-heading text-muted-foreground text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitNote}
            disabled={pending}
            className="font-heading text-destructive text-xs font-semibold disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={approve}
          disabled={pending}
          className="font-heading text-sm font-semibold text-[#2f6b1f] disabled:opacity-50"
        >
          {pending ? "…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => setNoteMode("changes")}
          className="font-heading text-sm font-semibold text-amber-700"
        >
          Request changes
        </button>
        <button type="button" onClick={() => setNoteMode("reject")} className="font-heading text-destructive text-sm font-semibold">
          Reject
        </button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
