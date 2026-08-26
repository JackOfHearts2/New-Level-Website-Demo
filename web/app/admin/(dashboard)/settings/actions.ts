"use server";

import { createHash, randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { saveSettings, type AdminSettings } from "@/lib/settings";
import { sendSecurityCode } from "@/lib/email";

export type ActionResult = { error?: string; ok?: boolean };
export type PasswordChangeState = { error?: string; codeSent?: boolean; done?: boolean } | undefined;

const CODE_TTL_MS = 10 * 60 * 1000;

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

/** Step 1 of the two-factor password change (client ask, 2026-08-26:
 *  "any password change has to be two factored"). Re-verifies the
 *  current password (the original defense-in-depth check), then emails a
 *  6-digit code the user must enter to actually complete the change —
 *  see confirmPasswordChange below. Deliberately never persists the new
 *  password itself; the browser resubmits it alongside the code. */
export async function requestPasswordChangeCode(
  _prevState: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  if (!currentPassword || !newPassword) {
    return { error: "Enter your current and new password." };
  }
  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: auth.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "Current password is incorrect." };

  const code = String(randomInt(100000, 1000000));
  const { error: insertError } = await supabase.from("password_change_codes").insert({
    user_id: auth.userId,
    code_hash: hashCode(code),
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (insertError) return { error: "Couldn't start the security check. Please try again." };

  const sent = await sendSecurityCode(auth.email, code);
  if (!sent.ok) {
    return {
      error:
        "Couldn't send the verification code email. If this keeps happening, the account's email delivery may need attention.",
    };
  }

  return { codeSent: true };
}

/** Step 2 — verifies the emailed code, then actually changes the
 *  password. The code row is marked used immediately on a correct match
 *  so it can't be replayed. */
export async function confirmPasswordChange(
  _prevState: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const newPassword = String(formData.get("newPassword") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  if (!newPassword || !code) return { error: "Enter the code we emailed you." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("password_change_codes")
    .select("id, code_hash, expires_at, used_at")
    .eq("user_id", auth.userId)
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row || row.code_hash !== hashCode(code) || new Date(row.expires_at) < new Date()) {
    return { error: "That code is incorrect or has expired. Request a new one." };
  }

  await supabase.from("password_change_codes").update({ used_at: new Date().toISOString() }).eq("id", row.id);

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { error: "Couldn't update your password. Please try again." };

  return { done: true };
}

/** Profile fields (client ask, 2026-08-26): first/last name, a display
 *  name ("how it shows up" — reuses the existing full_name column, which
 *  is already what every other part of the app reads), and a short bio.
 *  Explicitly does NOT touch `role` — profiles_guard_self_update
 *  (migration 0010) would reject that anyway for a non-admin, but this
 *  action never sends it in the first place. */
export async function updateProfile(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAdminRole();
  if (!auth) return { error: "Not authorized." };

  const firstName = String(formData.get("firstName") ?? "").trim().slice(0, 80);
  const lastName = String(formData.get("lastName") ?? "").trim().slice(0, 80);
  const displayName = String(formData.get("displayName") ?? "").trim().slice(0, 120);
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 500);

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      full_name: displayName || null,
      bio: bio || null,
    })
    .eq("id", auth.userId);
  if (error) return { error: "Couldn't save your profile. Please try again." };

  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function saveNotificationSettings(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const settings: AdminSettings = {
    notifyOnSubmission: formData.get("notifyOnSubmission") === "on",
    notifyOnReport: formData.get("notifyOnReport") === "on",
  };

  try {
    await saveSettings(settings);
  } catch {
    return { error: "Couldn't save: storage unavailable." };
  }

  revalidatePath("/admin/settings");
  return { ok: true };
}
