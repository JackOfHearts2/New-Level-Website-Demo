import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { ChangePasswordForm } from "./change-password-form";
import { NotificationSettingsForm } from "./notification-settings-form";
import { ProfileForm } from "./profile-form";

type ProfileRow = { first_name: string | null; last_name: string | null; full_name: string | null; bio: string | null };

export default async function SettingsPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, full_name, bio")
    .eq("id", auth.userId)
    .maybeSingle<ProfileRow>();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Profile, account, and notification preferences.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold">Profile</h2>
        <div className="border-border max-w-md rounded-2xl border p-6">
          <ProfileForm
            firstName={profile?.first_name ?? ""}
            lastName={profile?.last_name ?? ""}
            displayName={profile?.full_name ?? ""}
            bio={profile?.bio ?? ""}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading font-semibold">Security</h2>
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
    </div>
  );
}
