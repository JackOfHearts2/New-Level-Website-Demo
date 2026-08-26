import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { OrgChart, type OrgNode } from "./org-chart";

type OrgMemberRow = {
  id: string;
  parent_id: string | null;
  linked_profile_id: string | null;
  name: string;
  title: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  avatar_updated_at: string | null;
};
type LinkedProfileRow = { id: string; email: string | null; full_name: string | null; role: string };

/** The real, editable org chart (client ask, 2026-08-27: "circles with
 *  lines that connect to each other... click on one of those circles to
 *  add an individual... click and drag it to be below another one").
 *  Nodes live in org_members (see migration 0024) rather than being driven
 *  off `profiles` directly, so a position can be sketched before there's a
 *  real hire/login behind it — see that migration's header comment. */
export default async function TeamPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const { data: memberRows } = await supabase
    .from("org_members")
    .select("id, parent_id, linked_profile_id, name, title, department, email, phone, avatar_updated_at")
    .order("sort_order")
    .returns<OrgMemberRow[]>();

  const linkedIds = Array.from(new Set((memberRows ?? []).map((m) => m.linked_profile_id).filter((id): id is string => !!id)));
  const { data: linkedProfiles } = linkedIds.length
    ? await supabase.from("profiles").select("id, email, full_name, role").in("id", linkedIds).returns<LinkedProfileRow[]>()
    : { data: [] as LinkedProfileRow[] };
  const profileById = new Map((linkedProfiles ?? []).map((p) => [p.id, p]));

  const nodes: OrgNode[] = (memberRows ?? []).map((m) => {
    const linked = m.linked_profile_id ? profileById.get(m.linked_profile_id) : undefined;
    return {
      id: m.id,
      parentId: m.parent_id,
      name: m.name,
      title: m.title,
      department: m.department,
      email: m.email,
      phone: m.phone,
      avatarUrl: m.avatar_updated_at
        ? `/api/site-image/avatar-${m.id}?v=${new Date(m.avatar_updated_at).getTime()}`
        : null,
      linkedProfileId: m.linked_profile_id,
      linkedEmail: linked?.email ?? null,
      linkedName: linked?.full_name ?? null,
      linkedRole: (linked?.role as OrgNode["linkedRole"]) ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            The org chart — click anyone&apos;s circle to edit them, drag it onto someone else to
            change who they report to, or add a new position anywhere. Positions don&apos;t need a
            real dashboard login to exist here; link one when it does to set their access.
          </p>
        </div>
        <Link
          href="/admin/onboarding"
          className="font-heading border-border hover:bg-muted shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold"
        >
          My onboarding & reports →
        </Link>
      </div>

      <OrgChart nodes={nodes} isAdmin={auth.role === "admin"} />
    </div>
  );
}
