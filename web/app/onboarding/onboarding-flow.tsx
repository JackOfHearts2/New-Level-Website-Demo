"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { PasswordField } from "@/components/ui/password-field";
import { createClient } from "@/lib/supabase/client";
import { requestOnboardingCode, confirmOnboardingCode, type OnboardingState } from "./actions";

const ROLE_TUTORIAL: Record<"editor" | "admin", { title: string; points: string[] }> = {
  editor: {
    title: "You're set up as an Editor",
    points: [
      "Content & Media is where you propose text and photo changes — save a section as a draft anytime, or submit it for an admin to review.",
      "Nothing you submit goes live on its own — an admin approves, requests changes, or rejects it, and you'll see the outcome in Approvals.",
      "Reports lets you resolve problems visitors flag on the live site.",
    ],
  },
  admin: {
    title: "You're set up as an Admin",
    points: [
      "Your own Content & Media saves go live immediately — the same page also shows a confirmation before anything actually publishes.",
      "Approvals is where you review what editors submit: approve, request changes with a note, or reject.",
      "Access lets you invite more staff or revoke it, and Activity keeps a full record of every change made through the portal.",
    ],
  },
};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** Three steps: set a password, confirm via an emailed code (2FA — client
 *  ask, 2026-08-26: "help them set a password and confirm it with 2FA"),
 *  then a short role-scoped welcome ("a brief tutorial for their
 *  permission level"). Password-setting itself calls
 *  supabase.auth.updateUser directly (same as /auth/reset-password) — by
 *  the time someone lands here from a real invite link, /auth/callback
 *  has already exchanged the invite code for a real session. */
export function OnboardingFlow() {
  // "done" isn't tracked as its own state — it's derived directly from
  // confirmState (the server action's own return value is already the
  // source of truth) rather than copied into a second state var updated
  // from a render-time or effect-time setState call.
  const [manualStep, setManualStep] = useState<"password" | "code">("password");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [settingPassword, startSettingPassword] = useTransition();
  const [requestingCode, startRequestingCode] = useTransition();
  const [requestError, setRequestError] = useState<string | null>(null);

  const [confirmState, confirmAction] = useActionState<OnboardingState, FormData>(
    confirmOnboardingCode,
    undefined
  );

  const confirmed = !!confirmState && !confirmState.error;
  const step = confirmed ? "done" : manualStep;
  const grantedRole = confirmed ? (confirmState.role ?? null) : null;

  function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setPasswordError("Passwords don't match.");
      return;
    }
    startSettingPassword(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setPasswordError(error.message);
        return;
      }
      setManualStep("code");
      setRequestError(null);
      startRequestingCode(async () => {
        const result = await requestOnboardingCode();
        if (result?.error) setRequestError(result.error);
      });
    });
  }

  function resendCode() {
    setRequestError(null);
    startRequestingCode(async () => {
      const result = await requestOnboardingCode();
      if (result?.error) setRequestError(result.error);
    });
  }

  if (step === "done") {
    const tutorial = grantedRole ? ROLE_TUTORIAL[grantedRole] : null;
    return (
      <div className="space-y-4 text-center">
        <h1 className="font-heading text-2xl font-bold">
          {tutorial ? tutorial.title : "You're all set"}
        </h1>
        {tutorial ? (
          <ul className="space-y-3 text-left">
            {tutorial.points.map((point) => (
              <li key={point} className="border-border rounded-xl border p-4 text-sm">
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            Your identity is confirmed. If you were expecting staff access, ask an admin to check
            Access.
          </p>
        )}
        <Link
          href="/admin"
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 mt-2 block w-full rounded-lg py-2.5 text-sm font-semibold"
        >
          Go to the dashboard
        </Link>
      </div>
    );
  }

  if (step === "code") {
    return (
      <form action={confirmAction} className="space-y-4">
        <h1 className="font-heading text-2xl font-bold">Confirm it&apos;s you</h1>
        <p className="text-muted-foreground text-sm">
          We emailed a 6-digit code to your email — enter it below.
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
            className="border-border mt-1.5 w-full rounded-lg border px-3 py-2 text-sm tracking-widest outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        {(confirmState?.error || requestError) && (
          <p className="text-destructive text-sm" role="alert">
            {confirmState?.error || requestError}
          </p>
        )}
        <SubmitButton label="Confirm" pendingLabel="Confirming…" />
        <button
          type="button"
          onClick={resendCode}
          disabled={requestingCode}
          className="font-heading text-muted-foreground hover:text-foreground w-full text-center text-sm font-semibold disabled:opacity-50"
        >
          {requestingCode ? "Sending…" : "Resend code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSetPassword} className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Welcome to New Level</h1>
      <p className="text-muted-foreground text-sm">Set a password to finish setting up your account.</p>
      <label className="block text-sm">
        <span className="font-heading font-medium">Password</span>
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          autoFocus
          className="mt-1.5"
        />
      </label>
      <label className="block text-sm">
        <span className="font-heading font-medium">Confirm password</span>
        <PasswordField
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={6}
          required
          className="mt-1.5"
        />
      </label>
      {passwordError && (
        <p className="text-destructive text-sm" role="alert">
          {passwordError}
        </p>
      )}
      <button
        type="submit"
        disabled={settingPassword}
        className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
      >
        {settingPassword ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
