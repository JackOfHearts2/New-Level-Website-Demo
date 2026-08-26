import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminRole } from "@/lib/admin-auth";
import { getSettings } from "@/lib/settings";
import { ChangePasswordForm } from "./change-password-form";
import { NotificationSettingsForm } from "./notification-settings-form";
import { SignOutEverywhereButton } from "./sign-out-everywhere-button";

// Profile split out to its own page (2026-08-26) — this is now purely
// account-security/notifications, so Security + Notifications sit side
// by side instead of stacked (client feedback: the page read as "mostly
// empty" with everything in one column).
export default async function SettingsPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Account security and notification preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="font-heading font-semibold">Security</h2>
          <div className="border-border space-y-6 rounded-2xl border p-6">
            <ChangePasswordForm />
            <div className="border-border border-t pt-6">
              <h3 className="font-heading text-sm font-semibold">Signed-in devices</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                If you think your account was signed in somewhere you don&apos;t recognize, sign
                out everywhere and sign back in.
              </p>
              <div className="mt-3">
                <SignOutEverywhereButton />
              </div>
            </div>
          </div>
        </section>

        {auth.role === "admin" ? (
          <section className="space-y-4">
            <h2 className="font-heading font-semibold">Notifications</h2>
            <div className="border-border rounded-2xl border p-6">
              <NotificationSettingsForm settings={await getSettings()} />
            </div>
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="font-heading font-semibold">More</h2>
            <div className="grid gap-4">
              <Link
                href="/admin/activity"
                className="border-border block rounded-2xl border p-5 text-sm font-medium hover:bg-muted"
              >
                Activity log →
              </Link>
              <a
                href="mailto:placeholder@newlevelassociates.com"
                className="border-border block rounded-2xl border p-5 text-sm font-medium hover:bg-muted"
              >
                Need help? Contact the team →
              </a>
            </div>
          </section>
        )}
      </div>

      {auth.role === "admin" && (
        <section className="space-y-4">
          <h2 className="font-heading font-semibold">More</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/admin/activity"
              className="border-border block rounded-2xl border p-5 text-sm font-medium hover:bg-muted"
            >
              Activity log →
            </Link>
            <a
              href="mailto:placeholder@newlevelassociates.com"
              className="border-border block rounded-2xl border p-5 text-sm font-medium hover:bg-muted"
            >
              Need help? Contact the team →
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
