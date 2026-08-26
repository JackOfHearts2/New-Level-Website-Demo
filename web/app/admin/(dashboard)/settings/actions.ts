"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { saveSettings, type AdminSettings } from "@/lib/settings";

export type ActionResult = { error?: string; ok?: boolean };

export async function changePassword(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
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
  // Re-verify the current password before allowing the change — defense
  // in depth for a sensitive action, same idea as re-sniffing image bytes
  // on approval rather than trusting them once.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: auth.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "Current password is incorrect." };

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) return { error: "Couldn't update your password. Please try again." };

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
