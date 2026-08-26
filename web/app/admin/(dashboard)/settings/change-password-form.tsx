"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePassword, type ActionResult } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Updating…" : "Update password"}
    </button>
  );
}

export function ChangePasswordForm() {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    changePassword,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm">
        <span className="font-heading font-medium">Current password</span>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <label className="block text-sm">
        <span className="font-heading font-medium">New password</span>
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      {state?.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-[#2f6b1f]" role="status">
          Password updated.
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
