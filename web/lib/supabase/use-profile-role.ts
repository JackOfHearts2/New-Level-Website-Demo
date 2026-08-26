"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/use-session";

export type ProfileRole = "client" | "editor" | "admin";

// Client-side lookup of the signed-in user's own role, for UI that needs
// to show/hide staff-only affordances (e.g. ProfileMenu's "Dashboard"
// link) — reuses the profiles_select_own RLS policy that already lets a
// user read their own row, no new policy needed.
export function useProfileRole() {
  const { user, loading: sessionLoading } = useSession();
  const [fetchedRole, setFetchedRole] = useState<ProfileRole | null>(null);

  useEffect(() => {
    if (sessionLoading || !user) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setFetchedRole((data?.role as ProfileRole) ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, sessionLoading]);

  if (!user) return { role: null, loading: sessionLoading };
  return { role: fetchedRole, loading: fetchedRole === null };
}
