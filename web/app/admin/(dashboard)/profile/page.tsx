import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { AvatarUploadForm } from "./avatar-upload-form";

type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_updated_at: string | null;
};

// Split out of Settings (client ask, 2026-08-26: "I want the profile
// section to be separate from the settings") — Settings is now
// account-security/notifications, this is "who you are."
export default async function ProfilePage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, full_name, bio, avatar_updated_at")
    .eq("id", auth.userId)
    .maybeSingle<ProfileRow>();

  const displayName = profile?.full_name || profile?.first_name || auth.email;
  const avatarUrl = profile?.avatar_updated_at
    ? `/api/site-image/avatar-${auth.userId}?v=${new Date(profile.avatar_updated_at).getTime()}`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Who you are around the dashboard — your name, photo, and a short bio.
        </p>
      </div>

      <div className="border-border rounded-2xl border p-6">
        <AvatarUploadForm displayName={displayName} currentUrl={avatarUrl} />
      </div>

      <div className="border-border rounded-2xl border p-6">
        <ProfileForm
          firstName={profile?.first_name ?? ""}
          lastName={profile?.last_name ?? ""}
          displayName={profile?.full_name ?? ""}
          bio={profile?.bio ?? ""}
        />
      </div>
    </div>
  );
}
