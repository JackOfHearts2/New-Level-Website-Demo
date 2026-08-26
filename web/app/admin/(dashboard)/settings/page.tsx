import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { getSettings } from "@/lib/settings";
import { ChangePasswordForm } from "./change-password-form";
import { NotificationSettingsForm } from "./notification-settings-form";

export default async function SettingsPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Account and notification preferences.</p>
      </div>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold">Account</h2>
        <div className="border-border max-w-md rounded-2xl border p-6">
          <ChangePasswordForm />
        </div>
      </section>

      {auth.role === "admin" && (
        <section className="space-y-4">
          <h2 className="font-heading font-semibold">Notifications</h2>
          <div className="border-border max-w-md rounded-2xl border p-6">
            <NotificationSettingsForm settings={await getSettings()} />
          </div>
        </section>
      )}
    </div>
  );
}
