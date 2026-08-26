import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminRole = "editor" | "admin";

export type AdminAuth = {
  userId: string;
  email: string;
  role: AdminRole;
};

/** Real per-request check: is there a signed-in Supabase user whose
 *  profiles.role is 'editor' or 'admin'? Every admin Server Action and
 *  Server Component calls this directly rather than trusting proxy.ts's
 *  optimistic session-only gate (Server Actions are directly POST-reachable
 *  regardless of what the browser was shown). */
export async function getAdminAuth(): Promise<AdminAuth | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "editor" && profile.role !== "admin")) {
    return null;
  }

  return { userId: user.id, email: user.email ?? "", role: profile.role };
}

/** Allows either editor or admin. */
export async function requireAdminRole(): Promise<AdminAuth | null> {
  return getAdminAuth();
}

/** Allows admin only — for approve/reject and managing editors. */
export async function requireAdmin(): Promise<AdminAuth | null> {
  const auth = await getAdminAuth();
  if (!auth || auth.role !== "admin") return null;
  return auth;
}
