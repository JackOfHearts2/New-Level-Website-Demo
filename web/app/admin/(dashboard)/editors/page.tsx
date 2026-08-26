import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { GrantEditorForm, RevokeButton } from "./manage-editors-form";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "client" | "editor" | "admin";
};

export default async function EditorsPage() {
  const auth = await requireAdmin();
  if (!auth) redirect("/admin");

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .in("role", ["editor", "admin"])
    .order("role")
    .returns<ProfileRow[]>();

  const people = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Editors</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Grant someone editor access so they can propose content/photo changes for your
          review, without giving them full admin control.
        </p>
      </div>

      <GrantEditorForm />

      <div className="border-border rounded-2xl border">
        {people.length === 0 ? (
          <p className="text-muted-foreground p-6 text-sm">No editors or admins yet.</p>
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
                {person.role === "editor" && <RevokeButton userId={person.id} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
