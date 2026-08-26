"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { sniffImageType } from "@/lib/image-sniff";
import { imageBlobStore } from "@/lib/site-content";

export type ActionResult = { error?: string; ok?: boolean };
export type AddResult = ActionResult & { id?: string };

export type OrgMemberFields = {
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
};

function cleanFields(fields: OrgMemberFields) {
  return {
    name: fields.name.trim().slice(0, 150),
    title: fields.title.trim().slice(0, 150) || null,
    department: fields.department.trim().slice(0, 150) || null,
    email: fields.email.trim().slice(0, 200) || null,
    phone: fields.phone.trim().slice(0, 50) || null,
  };
}

/** parentId null = a new top-of-chart box. Admin-only — everyone on staff
 *  can view the chart (see the migration's RLS), only an admin edits it,
 *  same as the reporting-line/access-tier changes this superseded. */
export async function addOrgMember(parentId: string | null, fields: OrgMemberFields): Promise<AddResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const clean = cleanFields(fields);
  if (!clean.name) return { error: "Give them a name first." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_members")
    .insert({ parent_id: parentId, ...clean })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) return { error: "Couldn't add that person." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "org_member_added",
    targetTable: "org_members",
    summary: `${auth.email} added ${clean.name} to the org chart`,
  });

  revalidatePath("/admin/team");
  return { ok: true, id: data.id };
}

export async function updateOrgMember(id: string, fields: OrgMemberFields): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const clean = cleanFields(fields);
  if (!clean.name) return { error: "Give them a name first." };

  const supabase = await createClient();
  const { error } = await supabase.from("org_members").update(clean).eq("id", id);
  if (error) return { error: "Couldn't save changes." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "org_member_updated",
    targetTable: "org_members",
    targetId: id,
    summary: `${auth.email} updated ${clean.name}'s org chart entry`,
  });

  revalidatePath("/admin/team");
  return { ok: true };
}

type MemberRow = { id: string; parent_id: string | null; name: string };

/** Drag-a-circle-onto-another-circle reparenting (client ask, 2026-08-27:
 *  "click on Marsha's little bubble, drag it, and set it beneath
 *  Michelle's bubble... it needs to automatically register that"), plus
 *  the edit panel's parent dropdown as a non-drag fallback — both call
 *  this. Cycle prevention has to live here, not just client-side: walks
 *  every ancestor of the proposed new parent, and refuses if `id` itself
 *  shows up (that would make someone their own report's report). */
export async function moveOrgMember(id: string, newParentId: string | null): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };
  if (id === newParentId) return { error: "Someone can't report to themselves." };

  const supabase = await createClient();
  const { data: all } = await supabase.from("org_members").select("id, parent_id, name").returns<MemberRow[]>();
  if (!all) return { error: "Couldn't load the chart." };

  const byId = new Map(all.map((m) => [m.id, m]));
  const moving = byId.get(id);
  if (!moving) return { error: "Not found." };

  if (newParentId) {
    if (!byId.has(newParentId)) return { error: "That person wasn't found." };
    let cursor: string | null = newParentId;
    const seen = new Set<string>();
    while (cursor) {
      if (cursor === id) return { error: `${moving.name} can't report to one of their own reports.` };
      if (seen.has(cursor)) break;
      seen.add(cursor);
      cursor = byId.get(cursor)?.parent_id ?? null;
    }
  }

  const { error } = await supabase.from("org_members").update({ parent_id: newParentId }).eq("id", id);
  if (error) return { error: "Couldn't move them." };

  const newParentName = newParentId ? byId.get(newParentId)?.name : null;
  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "org_member_moved",
    targetTable: "org_members",
    targetId: id,
    summary: newParentName
      ? `${auth.email} moved ${moving.name} to report to ${newParentName}`
      : `${auth.email} moved ${moving.name} to the top of the chart`,
  });

  revalidatePath("/admin/team");
  return { ok: true };
}

/** Their direct reports move up a level rather than vanishing along with
 *  them — losing a whole branch because a manager's box got deleted would
 *  be a nasty surprise. */
export async function deleteOrgMember(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("org_members")
    .select("id, name, parent_id")
    .eq("id", id)
    .maybeSingle<MemberRow>();
  if (!existing) return { error: "Not found." };

  await supabase.from("org_members").update({ parent_id: existing.parent_id }).eq("parent_id", id);

  const { error } = await supabase.from("org_members").delete().eq("id", id);
  if (error) return { error: "Couldn't remove them." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "org_member_removed",
    targetTable: "org_members",
    summary: `${auth.email} removed ${existing.name} from the org chart`,
  });

  revalidatePath("/admin/team");
  return { ok: true };
}

/** Ties a chart box to a real dashboard login by email — same lookup-by-
 *  email UX as /admin/editors' grantAccess, deliberately not a dropdown
 *  of every profile: this project also has public site accounts (saved
 *  properties, reservations), and dumping all of those into a picker here
 *  would be both a bad list and a mild privacy overreach for a page whose
 *  job is the org chart, not account browsing. A box doesn't need a
 *  linked account at all (client ask: sketch roles that aren't filled
 *  yet) — linking one is what makes "set their permissions" possible for
 *  that box (see setOrgMemberAccessTier below). */
export type LinkResult = ActionResult & {
  profileId?: string;
  label?: string;
  role?: string;
};

export async function linkOrgMemberAccount(orgMemberId: string, email: string): Promise<LinkResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { error: "Enter an email address." };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("email", trimmed)
    .maybeSingle<{ id: string; email: string | null; full_name: string | null; role: string }>();
  if (!profile) {
    return { error: "No account found with that email. They need to create an account on the site first." };
  }

  const { error } = await supabase
    .from("org_members")
    .update({ linked_profile_id: profile.id })
    .eq("id", orgMemberId);
  if (error) {
    if (error.code === "23505") return { error: "That account is already linked to another chart position." };
    return { error: "Couldn't link that account." };
  }

  revalidatePath("/admin/team");
  return { ok: true, profileId: profile.id, label: profile.full_name || profile.email || trimmed, role: profile.role };
}

export async function unlinkOrgMemberAccount(orgMemberId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase.from("org_members").update({ linked_profile_id: null }).eq("id", orgMemberId);
  if (error) return { error: "Couldn't unlink." };

  revalidatePath("/admin/team");
  return { ok: true };
}

// Same four tiers as /admin/editors' grantAccess — reused here rather than
// re-derived, so "set their permissions" from the chart and the existing
// Access page can never drift into two different ideas of what a tier
// means. 'viewer'/'manager' are still placeholders with no real
// permissions behind them yet (see that page's own comment).
const ACCESS_TIERS = ["viewer", "editor", "manager", "admin"] as const;
export type OrgAccessTier = (typeof ACCESS_TIERS)[number];

export async function setOrgMemberAccessTier(
  profileId: string,
  role: OrgAccessTier
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };
  if (!ACCESS_TIERS.includes(role)) return { error: "Choose an access tier." };

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", profileId)
    .maybeSingle<{ email: string | null; full_name: string | null }>();
  if (!target) return { error: "Account not found." };

  const { error } = await supabase.from("profiles").update({ role }).eq("id", profileId);
  if (error) return { error: "Couldn't update their access." };

  await logActivity(supabase, {
    actorId: auth.userId,
    eventType: "editor_granted",
    targetTable: "profiles",
    targetId: profileId,
    summary: `${auth.email} set ${target.full_name || target.email}'s access to ${role} from the org chart`,
  });

  revalidatePath("/admin/team");
  revalidatePath("/admin/editors");
  return { ok: true };
}

/** Same storage mechanism as the profile-page avatar upload (Netlify
 *  Blobs, keyed `avatar-<uuid>`, served back through the existing
 *  /api/site-image/[key] route) — org_members.id is a uuid too, so it
 *  fits that route's key pattern without any change there. */
export async function saveOrgMemberAvatar(orgMemberId: string, formData: FormData): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth) return { error: "Not authorized." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose an image file." };
  if (file.size > 4_000_000) return { error: "Image too large (4MB max)." };

  const bytes = await file.arrayBuffer();
  const detectedType = sniffImageType(bytes);
  if (!detectedType) {
    return { error: "That doesn't look like a supported image (JPEG, PNG, or WebP)." };
  }

  const store = imageBlobStore();
  if (!store) return { error: "Couldn't save: storage unavailable." };

  try {
    await store.set(`image:avatar-${orgMemberId}`, bytes, { metadata: { type: detectedType } });
  } catch {
    return { error: "Couldn't save: storage unavailable." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("org_members")
    .update({ avatar_updated_at: new Date().toISOString() })
    .eq("id", orgMemberId);
  if (error) return { error: "Couldn't save. Please try again." };

  revalidatePath("/admin/team");
  return { ok: true };
}
