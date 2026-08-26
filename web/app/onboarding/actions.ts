"use server";

import { createHash, randomInt } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSecurityCode } from "@/lib/email";
import { logActivity } from "@/lib/activity-log";

export type OnboardingState =
  | { error?: string; codeSent?: boolean; role?: "editor" | "admin" | null }
  | undefined;

const CODE_TTL_MS = 10 * 60 * 1000;

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

/** Step 2 of onboarding, after the invitee sets a password: the same
 *  emailed-6-digit-code second factor requestPasswordChangeCode/
 *  confirmPasswordChange use in Settings, reusing the same
 *  password_change_codes table — its RLS (`user_id = auth.uid()`) already
 *  works for any signed-in user, not just staff, so no gating change
 *  needed there. Not staff-role-gated (requireAdminRole) since the
 *  invitee isn't staff yet — just needs a real session, which only exists
 *  because they clicked a real invite link. */
export async function requestOnboardingCode(): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Your invite link may have expired — ask for a new one." };

  const code = String(randomInt(100000, 1000000));
  const { error: insertError } = await supabase.from("password_change_codes").insert({
    user_id: user.id,
    code_hash: hashCode(code),
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (insertError) return { error: "Couldn't start the security check. Please try again." };

  const sent = await sendSecurityCode(user.email, code);
  if (!sent.ok) {
    return { error: "Couldn't send the verification code email. Please try again shortly." };
  }
  return { codeSent: true };
}

/** Step 3 — verifies the code, then applies whatever role the admin who
 *  sent the invite picked (stashed in this user's own auth metadata at
 *  invite time — see inviteStaff). Uses the service-role client
 *  specifically for this one write: guard_profile_self_update would
 *  otherwise reject a brand-new user updating their own `role`, correctly
 *  so for anyone who reached this page without a real invite (nothing to
 *  apply — invited_role is just absent, so this is a no-op for them, not
 *  an error) — see migration 0017 for the narrow service_role exception
 *  this relies on. */
export async function confirmOnboardingCode(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter the code we emailed you." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session expired — sign in again." };

  const { data: row } = await supabase
    .from("password_change_codes")
    .select("id, code_hash, expires_at, used_at")
    .eq("user_id", user.id)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row || row.code_hash !== hashCode(code) || new Date(row.expires_at) < new Date()) {
    return { error: "That code is incorrect or has expired. Request a new one." };
  }
  await supabase.from("password_change_codes").update({ used_at: new Date().toISOString() }).eq("id", row.id);

  const invitedRole = user.user_metadata?.invited_role;
  if (invitedRole !== "editor" && invitedRole !== "admin") {
    // Reached /onboarding without a real staff invite (e.g. a regular
    // visitor signup) — 2FA is confirmed, but there's no role to apply.
    return { role: null };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return {
      error:
        "Your identity is confirmed, but access couldn't be finished setting up — ask an admin to grant it manually from Access.",
    };
  }

  const { error: roleError } = await adminClient.from("profiles").update({ role: invitedRole }).eq("id", user.id);
  if (roleError) {
    return {
      error:
        "Your identity is confirmed, but access couldn't be finished setting up — ask an admin to grant it manually from Access.",
    };
  }

  await logActivity(supabase, {
    actorId: user.id,
    eventType: "editor_granted",
    targetTable: "profiles",
    targetId: user.id,
    summary: `${user.email} completed onboarding and was granted ${invitedRole} access`,
  });

  return { role: invitedRole };
}
