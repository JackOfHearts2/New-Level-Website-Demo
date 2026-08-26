import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { GrantEditorForm, RevokeButton } from "./manage-editors-form";
import { GlowCard } from "@/components/ui/glow-card";

type StaffRole = "viewer" | "editor" | "manager" | "admin";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: StaffRole;
};

const ROLE_ORDER: StaffRole[] = ["admin", "manager", "editor", "viewer"];

export default async function EditorsPage() {
  const auth = await requireAdmin();
  if (!auth) redirect("/admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .in("role", ROLE_ORDER)
    .returns<ProfileRow[]>();

  const people = (data ?? []).sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Access</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Grant someone dashboard access at a tier — editors propose changes for your review,
          admins can edit and approve directly. Viewer and Manager are reserved tiers for later.
        </p>
      </div>

      <GrantEditorForm />

      <GlowCard className="block">
        {people.length === 0 ? (
          <p className="text-muted-foreground p-6 text-sm">No one has access yet.</p>
        ) : (
          <ul className="divide-border divide-y">
            {people.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-heading text-sm font-medium">
                    {person.full_name || person.email || "Unknown"}
                  </p>
                  <p className="text-muted-foreground text-xs capitalize">{person.role}</p>
                </div>
                {person.role !== "admin" && <RevokeButton userId={person.id} />}
              </li>
            ))}
          </ul>
        )}
      </GlowCard>
    </div>
  );
}
