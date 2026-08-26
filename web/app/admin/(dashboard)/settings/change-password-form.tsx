"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { PasswordField } from "@/components/ui/password-field";
import {
  requestPasswordChangeCode,
  confirmPasswordChange,
  type PasswordChangeState,
} from "./actions";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Two-factor password change (client ask, 2026-08-26) — step 1 verifies
 *  the current password and emails a 6-digit code; step 2 requires that
 *  code before the password actually changes. The new password never
 *  leaves this form as anything but a value the user typed — it's
 *  resubmitted (not stored server-side) alongside the code in step 2. */
export function ChangePasswordForm() {
  const [step1State, step1Action] = useActionState<PasswordChangeState, FormData>(
    requestPasswordChangeCode,
    undefined
  );
  const [step2State, step2Action] = useActionState<PasswordChangeState, FormData>(
    confirmPasswordChange,
    undefined
  );
  const [newPassword, setNewPassword] = useState("");
  // "Start over" needs to force back to step 1 even though step1State's
  // last result still says codeSent — cleared again the moment step 1 is
  // resubmitted, so a fresh code request naturally shows step 2 again.
  const [forcePasswordView, setForcePasswordView] = useState(false);

  if (step2State?.done) {
    return (
      <p className="text-sm text-[#2f6b1f]" role="status">
        Password updated.
      </p>
    );
  }

  if (!forcePasswordView && step1State?.codeSent) {
    return (
      <form action={step2Action} className="space-y-4">
        <input type="hidden" name="newPassword" value={newPassword} />
        <p className="text-muted-foreground text-sm">
          We emailed a 6-digit code to your account email — enter it below to finish
          changing your password.
        </p>
        <label className="block text-sm">
          <span className="font-heading font-medium">Verification code</span>
          <input
            name="code"
            type="text"
            inputMode="numeric"
            required
            autoFocus
            maxLength={6}
            className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm tracking-widest outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        {step2State?.error && (
          <p className="text-destructive text-sm" role="alert">
            {step2State.error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <SubmitButton label="Confirm change" pendingLabel="Confirming…" />
          <button
            type="button"
            onClick={() => setForcePasswordView(true)}
            className="font-heading text-muted-foreground hover:text-foreground text-sm font-semibold"
          >
            Start over
          </button>
        </div>
      </form>
    );
  }

  return (
    <form action={step1Action} onSubmit={() => setForcePasswordView(false)} className="space-y-4">
      <label className="block text-sm">
        <span className="font-heading font-medium">Current password</span>
        <PasswordField
          name="currentPassword"
          required
          autoComplete="current-password"
          className="mt-1"
        />
      </label>
      <label className="block text-sm">
        <span className="font-heading font-medium">New password</span>
        <PasswordField
          name="newPassword"
          required
          minLength={6}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1"
        />
      </label>
      <p className="text-muted-foreground text-xs">
        For security, we&apos;ll email a verification code to confirm this change.
      </p>
      {step1State?.error && (
        <p className="text-destructive text-sm" role="alert">
          {step1State.error}
        </p>
      )}
      <SubmitButton label="Send verification code" pendingLabel="Sending…" />
    </form>
  );
}
