"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type ActionResult = { error?: string; ok?: boolean };

export async function grantEditorAccess(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Enter an email address." };

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (error || !profile) {
    return {
      error: "No account found with that email. Ask them to create an account on the site first, then grant access.",
    };
  }
  if (profile.role === "admin") {
    return { error: "That account is already an admin." };
  }
  if (profile.role === "editor") {
    return { error: "That account already has editor access." };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "editor" })
    .eq("id", profile.id);
  if (updateError) return { error: "Couldn't grant access. Please try again." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "editor_granted",
    targetTable: "profiles",
    targetId: profile.id,
    summary: `${auth.email} granted editor access to ${email}`,
  });

  revalidatePath("/admin/editors");
  return { ok: true };
}

export async function revokeAccess(userId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  if (userId === auth.userId) {
    return { error: "You can't revoke your own admin access here." };
  }

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  const { error } = await supabase
    .from("profiles")
    .update({ role: "client" })
    .eq("id", userId);
  if (error) return { error: "Couldn't revoke access. Please try again." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "editor_revoked",
    targetTable: "profiles",
    targetId: userId,
    summary: `${auth.email} revoked editor access from ${target?.email ?? userId}`,
  });

  revalidatePath("/admin/editors");
  return { ok: true };
}
