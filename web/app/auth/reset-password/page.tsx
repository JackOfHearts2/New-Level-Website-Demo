"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/ui/password-field";
import { createClient } from "@/lib/supabase/client";

// Landing page for a Supabase password-recovery email link. The link goes
// through /auth/callback?next=/auth/reset-password first (see login-form.tsx's
// forgot-password flow), which exchanges the recovery code for a real
// session — by the time a visitor lands here, updateUser({password}) just
// works against that session, no token handling needed on this page.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "error" | "done"; message?: string }>({
    kind: "idle",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setStatus({ kind: "error", message: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirm) {
      setStatus({ kind: "error", message: "Passwords don't match." });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }
    setStatus({ kind: "done" });
    setTimeout(() => router.push("/"), 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="border-border w-full max-w-sm rounded-2xl border p-8 shadow-lg">
        <h1 className="font-heading text-2xl font-bold">Set a new password</h1>
        {status.kind === "done" ? (
          <p className="text-primary mt-4 text-sm">Password updated — redirecting you home…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm">
              <span className="font-heading font-medium">New password</span>
              <PasswordField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
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
            {status.kind === "error" && (
              <p className="text-destructive text-sm" role="alert">
                {status.message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
