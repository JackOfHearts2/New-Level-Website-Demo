import { redirect, notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { InquiryDetail, type NoteItem, type StaffOption } from "./inquiry-detail";
import type { InquiryStatus, InquirySource } from "@/lib/inquiries";

type InquiryRow = {
  id: string;
  source: InquirySource;
  status: InquiryStatus;
  name: string;
  email: string;
  phone: string | null;
  contact_method: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
  assigned_to: string | null;
  created_at: string;
};
type NoteRow = { id: string; body: string; emailed: boolean; created_at: string; author_id: string };
type ProfileRow = { id: string; email: string | null; full_name: string | null };

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: inquiry }, { data: noteRows }, { data: staffRows }] = await Promise.all([
    supabase
      .from("inquiries")
      .select("id, source, status, name, email, phone, contact_method, message, metadata, assigned_to, created_at")
      .eq("id", id)
      .maybeSingle<InquiryRow>(),
    supabase
      .from("inquiry_notes")
      .select("id, body, emailed, created_at, author_id")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: true })
      .returns<NoteRow[]>(),
    supabase.from("profiles").select("id, email, full_name").in("role", ["editor", "admin"]).returns<ProfileRow[]>(),
  ]);

  if (!inquiry) notFound();

  const authorIds = Array.from(new Set((noteRows ?? []).map((n) => n.author_id)));
  const { data: authorRows } = authorIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", authorIds).returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const authorMap = new Map((authorRows ?? []).map((p) => [p.id, p]));

  const notes: NoteItem[] = (noteRows ?? []).map((n) => {
    const author = authorMap.get(n.author_id);
    return {
      id: n.id,
      body: n.body,
      emailed: n.emailed,
      createdAt: n.created_at,
      authorLabel: author?.full_name || author?.email || "Unknown",
    };
  });

  const staff: StaffOption[] = (staffRows ?? []).map((p) => ({
    id: p.id,
    label: p.full_name || p.email || "Unknown",
  }));

  return (
    <InquiryDetail
      inquiry={{
        id: inquiry.id,
        source: inquiry.source,
        status: inquiry.status,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        contactMethod: inquiry.contact_method,
        message: inquiry.message,
        metadata: inquiry.metadata ?? {},
        assignedTo: inquiry.assigned_to,
        createdAt: inquiry.created_at,
      }}
      staff={staff}
      notes={notes}
    />
  );
}
