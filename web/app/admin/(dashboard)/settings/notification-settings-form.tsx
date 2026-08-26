"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AdminSettings } from "@/lib/settings";
import { saveNotificationSettings, type ActionResult } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function NotificationSettingsForm({ settings }: { settings: AdminSettings }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    saveNotificationSettings,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="notifyOnSubmission"
          defaultChecked={settings.notifyOnSubmission}
          className="size-4"
        />
        Email me when an editor submits a change for review
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="notifyOnReport"
          defaultChecked={settings.notifyOnReport}
          className="size-4"
        />
        Email me when a visitor reports a problem
      </label>
      {state?.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-[#2f6b1f]" role="status">
          Saved.
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
