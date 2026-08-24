"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Real session state for client components (ProfileMenu, the Save button,
// etc.) — reads the current user once on mount, then stays in sync via
// Supabase's own auth-state listener (covers sign in/out/OAuth redirect
// without a manual refresh).
export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Defensive: an uncaught throw here (e.g. a malformed/stale auth
    // cookie left over from an interrupted sign-in elsewhere) previously
    // had no error boundary to catch it, which crashed the entire page's
    // render tree — the "blank until refresh" bug. Falling back to
    // "signed out" is a safe default either way; a real error.tsx now
    // also exists as a second line of defense.
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (err) {
      console.error("Supabase client init failed:", err);
      // Deferred rather than called synchronously in the effect body.
      const id = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(id);
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Supabase getUser failed:", err);
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}
