"use client";

import { useState } from "react";
import { User, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// The reference used a custom WebGL shader (SmokeyBackground) behind the
// card — client asked for "our gradient instead," so this is our existing
// brand-green blurred-blob glow (same recipe as the homepage hero's depth
// layer) rather than porting the shader.
function BrandGradientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-primary/40 absolute -top-1/4 -left-1/4 size-[32rem] rounded-full blur-3xl" />
      <div className="bg-primary/25 absolute -right-1/4 -bottom-1/4 size-[32rem] rounded-full blur-3xl" />
    </div>
  );
}

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "check-email" };

// Real Supabase auth (email/password + Google OAuth) — see
// lib/supabase/client.ts and app/auth/callback/route.ts. Replaces the
// earlier UI-only preview now that the client has confirmed building
// real accounts (see project_supabase_connection memory).
export function LoginForm({
  onClose,
  initialMode = "signin",
}: {
  onClose: () => void;
  initialMode?: "signin" | "signup";
}) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [loading, setLoading] = useState(false);
  const isSignIn = mode === "signin";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createClient();
    setLoading(true);
    setStatus({ kind: "idle" });

    if (isSignIn) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setStatus({ kind: "error", message: error.message });
        return;
      }
      onClose();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }
    if (!data.session) {
      // Email confirmation is on for this project — no session yet.
      setStatus({ kind: "check-email" });
      return;
    }
    onClose();
  }

  async function handleGoogle() {
    const supabase = createClient();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setLoading(false);
      setStatus({
        kind: "error",
        message:
          "Google sign-in isn't finished being set up on our end yet — try email/password for now.",
      });
    }
    // On success the browser is redirected to Google, so nothing else to do here.
  }

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
      <BrandGradientBackdrop />

      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold text-white">
          {isSignIn ? "Welcome Back" : "Create Your Account"}
        </h2>
        <p className="mt-2 text-sm text-white">
          {isSignIn ? "Sign in to continue" : "Join New Level in a few seconds"}
        </p>
      </div>

      {status.kind === "check-email" ? (
        <div className="mt-8 text-center">
          <p className="text-sm text-white">
            Check your email to confirm your account, then sign in.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 mt-6 w-full rounded-lg py-2.5 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div className="relative z-0">
            <input
              type="email"
              name="email"
              id="floating_email"
              className="peer block w-full appearance-none border-0 border-b-2 border-white/40 bg-transparent px-0 py-2.5 text-sm text-white focus:border-primary focus:ring-0 focus:outline-none"
              placeholder=" "
              required
            />
            <label
              htmlFor="floating_email"
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-primary"
            >
              <User className="mr-2 -mt-1 inline-block" size={16} />
              Email Address
            </label>
          </div>

          <div className="relative z-0">
            <input
              type="password"
              name="password"
              id="floating_password"
              className="peer block w-full appearance-none border-0 border-b-2 border-white/40 bg-transparent px-0 py-2.5 text-sm text-white focus:border-primary focus:ring-0 focus:outline-none"
              placeholder=" "
              minLength={6}
              required
            />
            <label
              htmlFor="floating_password"
              className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-white duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-primary"
            >
              <Lock className="mr-2 -mt-1 inline-block" size={16} />
              Password
            </label>
          </div>

          {status.kind === "error" && (
            <p className="text-sm text-red-200" role="alert">
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-heading group bg-primary hover:bg-primary/80 flex w-full items-center justify-center rounded-lg py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Please wait…" : isSignIn ? "Sign In" : "Create Account"}
            <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="flex items-center py-1">
            <div className="grow border-t border-white/30" />
            <span className="mx-4 shrink text-xs text-white">OR CONTINUE WITH</span>
            <div className="grow border-t border-white/30" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-white/90 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-300 hover:bg-white disabled:opacity-60"
          >
            <svg className="mr-2 size-5" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"
              />
            </svg>
            Continue with Google
          </button>
        </form>
      )}

      {status.kind !== "check-email" && (
        <p className="mt-6 text-center text-xs text-white">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(isSignIn ? "signup" : "signin");
              setStatus({ kind: "idle" });
            }}
            className="font-semibold text-primary hover:underline"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </button>
        </p>
      )}
    </div>
  );
}
