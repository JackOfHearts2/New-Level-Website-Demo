"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveRequest, rejectRequest, requestChanges } from "./actions";

type NoteFlow = "reject" | "changes" | null;

export function ReviewOutcomeButtons({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [noteFlow, setNoteFlow] = useState<NoteFlow>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveRequest(id);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleConfirmNote() {
    setError(null);
    startTransition(async () => {
      const result =
        noteFlow === "reject" ? await rejectRequest(id, note) : await requestChanges(id, note);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2 border-t pt-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleApprove}
          className="font-heading rounded-lg bg-[#72D35B] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setNoteFlow(noteFlow === "changes" ? null : "changes")}
          className="font-heading border-border rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Request changes
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setNoteFlow(noteFlow === "reject" ? null : "reject")}
          className="font-heading border-border rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {noteFlow && (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              noteFlow === "changes"
                ? "What needs to change before you'd approve this?"
                : "Optional note for the person who submitted this"
            }
            rows={2}
            className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirmNote}
            className="text-destructive font-heading text-sm font-semibold disabled:opacity-50"
          >
            {isPending
              ? "Saving…"
              : noteFlow === "changes"
                ? "Confirm request changes"
                : "Confirm reject"}
          </button>
        </div>
      )}
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
