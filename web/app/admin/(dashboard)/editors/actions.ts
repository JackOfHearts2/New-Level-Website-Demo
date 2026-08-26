"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity-log";

export type ActionResult = { error?: string; ok?: boolean };

// Invite is deliberately narrower than grantAccess's GRANTABLE_ROLES —
// 'viewer'/'manager' are reserved placeholder tiers with no real
// permissions behind them yet (private.is_staff/is_admin don't recognize
// them), so inviting someone "as" one of those wouldn't actually grant
// them anything once they complete onboarding. Only offer roles that mean
// something today.
const INVITABLE_ROLES = ["editor", "admin"] as const;
type InvitableRole = (typeof INVITABLE_ROLES)[number];

/** Client ask (2026-08-26): "New Level Group has sent you an invitation to
 *  join them as a 'X'... help them set a password and confirm it with
 *  2FA." grantAccess (below) only works for an email that already has an
 *  account — this covers a brand-new email. Creates the auth.users row via
 *  Supabase's own invite-by-email flow (sends the actual email; there's no
 *  separate send step) and stashes the intended role in that user's
 *  metadata. The role itself isn't applied to profiles yet — nothing is
 *  granted until the invitee actually completes onboarding at /onboarding
 *  (sets a password, confirms via emailed code) — see
 *  app/onboarding/actions.ts's applyInvitedRole for that step, and
 *  migration 0017 for why it needs the service-role client too. */
export async function inviteStaff(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  if (!email) return { error: "Enter an email address." };
  if (!INVITABLE_ROLES.includes(role as InvitableRole)) return { error: "Choose a role." };

  const adminClient = createAdminClient();
  if (!adminClient) {
    return {
      error:
        "Invites aren't set up yet — SUPABASE_SERVICE_ROLE_KEY needs to be added to this site's environment variables first.",
    };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) {
    return { error: "That email already has an account — use \"Grant access\" below instead." };
  }

  const siteUrl = process.env.URL || "http://localhost:3000";
  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { invited_role: role },
    redirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
  });
  if (inviteError) {
    return { error: `Couldn't send the invite: ${inviteError.message}` };
  }

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "staff_invited",
    targetTable: "profiles",
    summary: `${auth.email} invited ${email} to join as ${role}`,
  });

  revalidatePath("/admin/editors");
  return { ok: true };
}

// Widened 2026-08-26 from a hardcoded 'editor' grant to a real tier picker
// — see supabase/migrations/0007_access_tier_placeholders.sql. Only
// 'editor'/'admin' carry real permissions today; 'viewer'/'manager' are
// selectable placeholders (private.is_staff/is_admin don't recognize them).
const GRANTABLE_ROLES = ["viewer", "editor", "manager", "admin"] as const;
type GrantableRole = (typeof GRANTABLE_ROLES)[number];

export async function grantAccess(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  if (!email) return { error: "Enter an email address." };
  if (!GRANTABLE_ROLES.includes(role as GrantableRole)) return { error: "Choose an access tier." };

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
  if (profile.role === role) {
    return { error: `That account already has ${role} access.` };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", profile.id);
  if (updateError) return { error: "Couldn't grant access. Please try again." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "editor_granted",
    targetTable: "profiles",
    targetId: profile.id,
    summary: `${auth.email} granted ${role} access to ${email}`,
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
    summary: `${auth.email} revoked access from ${target?.email ?? userId}`,
  });

  revalidatePath("/admin/editors");
  return { ok: true };
}
