"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Mail, Phone } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { updateInquiryStatus, assignInquiry, addInquiryNote } from "../actions";
import {
  INQUIRY_STATUSES,
  INQUIRY_STATUS_LABELS,
  INQUIRY_SOURCE_LABELS,
  type InquiryStatus,
  type InquirySource,
} from "@/lib/inquiries";

export type StaffOption = { id: string; label: string };
export type NoteItem = { id: string; body: string; emailed: boolean; createdAt: string; authorLabel: string };

type InquiryData = {
  id: string;
  source: InquirySource;
  status: InquiryStatus;
  name: string;
  email: string;
  phone: string | null;
  contactMethod: string | null;
  message: string | null;
  metadata: Record<string, unknown>;
  assignedTo: string | null;
  createdAt: string;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Turns metadata's varying per-source shape into readable "Label: value"
// rows without needing a hardcoded field list per source — camelCase key
// becomes "Camel Case", null/empty/false values are skipped so the panel
// only shows what's actually there.
function metadataRows(metadata: Record<string, unknown>): { label: string; value: string }[] {
  return Object.entries(metadata)
    .filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== false)
    .map(([key, v]) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
      value: Array.isArray(v) ? v.join(", ") : String(v),
    }));
}

function buildExportText(inquiry: InquiryData) {
  const lines = [
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    inquiry.phone && `Phone: ${inquiry.phone}`,
    inquiry.contactMethod && `Preferred contact: ${inquiry.contactMethod}`,
    `Source: ${INQUIRY_SOURCE_LABELS[inquiry.source]}`,
    `Status: ${INQUIRY_STATUS_LABELS[inquiry.status]}`,
    `Received: ${formatDateTime(inquiry.createdAt)}`,
    inquiry.message && `Message: ${inquiry.message}`,
    ...metadataRows(inquiry.metadata).map((r) => `${r.label}: ${r.value}`),
  ].filter(Boolean);
  return lines.join("\n");
}

export function InquiryDetail({
  inquiry,
  staff,
  notes,
}: {
  inquiry: InquiryData;
  staff: StaffOption[];
  notes: NoteItem[];
}) {
  const router = useRouter();
  const [statusPending, startStatus] = useTransition();
  const [assignPending, startAssign] = useTransition();
  const [notePending, startNote] = useTransition();
  const [noteBody, setNoteBody] = useState("");
  const [alsoEmail, setAlsoEmail] = useState(false);

  function handleStatusChange(status: InquiryStatus) {
    startStatus(async () => {
      const result = await updateInquiryStatus(inquiry.id, status);
      if (result.error) toast.error(result.error);
      else {
        toast.success(`Marked ${INQUIRY_STATUS_LABELS[status]}`);
        router.refresh();
      }
    });
  }

  function handleAssign(userId: string) {
    startAssign(async () => {
      const result = await assignInquiry(inquiry.id, userId || null);
      if (result.error) toast.error(result.error);
      else {
        toast.success(userId ? "Assigned" : "Unassigned");
        router.refresh();
      }
    });
  }

  function handleAddNote() {
    if (!noteBody.trim()) return;
    startNote(async () => {
      const result = await addInquiryNote(inquiry.id, noteBody, alsoEmail);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (alsoEmail && !result.emailSent) {
        toast.error("Note saved, but the email didn't send — check Resend setup.");
      } else {
        toast.success(alsoEmail ? "Note saved and emailed" : "Note saved");
      }
      setNoteBody("");
      setAlsoEmail(false);
      router.refresh();
    });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildExportText(inquiry));
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access.");
    }
  }

  const rows = metadataRows(inquiry.metadata);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Inquiries", href: "/admin/inquiries" }, { label: inquiry.name }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">{inquiry.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {INQUIRY_SOURCE_LABELS[inquiry.source]} · Received {formatDateTime(inquiry.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="font-heading border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          <Copy className="size-3.5" />
          Copy for handoff
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <GlowCard className="min-w-0 space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <a href={`mailto:${inquiry.email}`} className="text-primary flex items-center gap-1.5 font-semibold">
                <Mail className="size-3.5" />
                {inquiry.email}
              </a>
              {inquiry.phone && (
                <a href={`tel:${inquiry.phone}`} className="text-primary flex items-center gap-1.5 font-semibold">
                  <Phone className="size-3.5" />
                  {inquiry.phone}
                </a>
              )}
              {inquiry.contactMethod && (
                <span className="text-muted-foreground">Prefers {inquiry.contactMethod}</span>
              )}
            </div>
            {inquiry.message && <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>}
            {rows.length > 0 && (
              <dl className="border-border grid gap-2 border-t pt-4 text-sm sm:grid-cols-2">
                {rows.map((r) => (
                  <div key={r.label} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{r.label}</dt>
                    <dd className="text-right font-medium">{r.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </GlowCard>

          <GlowCard className="min-w-0 space-y-4 p-6">
            <h2 className="font-heading text-base font-semibold">Notes &amp; responses</h2>
            {notes.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Nothing yet — the first note you add here counts as the initial response.
              </p>
            ) : (
              <ul className="space-y-3">
                {notes.map((n) => (
                  <li key={n.id} className="border-border min-w-0 rounded-xl border p-3 text-sm">
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    <p className="text-muted-foreground mt-1.5 text-xs">
                      {n.authorLabel} · {formatDateTime(n.createdAt)}
                      {n.emailed && " · Emailed to inquirer"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-border space-y-2 border-t pt-4">
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                rows={3}
                placeholder="Write a note or reply…"
                className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={alsoEmail}
                    onChange={(e) => setAlsoEmail(e.target.checked)}
                    className="size-4"
                  />
                  Also email this to {inquiry.email}
                </label>
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={notePending || !noteBody.trim()}
                  className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {notePending ? "Sending…" : "Add note"}
                </button>
              </div>
            </div>
          </GlowCard>
        </div>

        <div className="min-w-0 space-y-6">
          <GlowCard className="min-w-0 space-y-3 p-5">
            <h2 className="font-heading text-sm font-semibold">Status</h2>
            <div className="flex flex-wrap gap-2">
              {INQUIRY_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={statusPending}
                  onClick={() => handleStatusChange(s)}
                  aria-pressed={inquiry.status === s}
                  className={`font-heading rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    inquiry.status === s
                      ? "bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted border"
                  }`}
                >
                  {INQUIRY_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </GlowCard>

          <GlowCard className="min-w-0 space-y-3 p-5">
            <h2 className="font-heading text-sm font-semibold">Assigned to</h2>
            <select
              value={inquiry.assignedTo ?? ""}
              disabled={assignPending}
              onChange={(e) => handleAssign(e.target.value)}
              className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="text-muted-foreground text-xs">
              Assigning sends the staff member a notification — see Team for reporting lines if
              this needs escalating further up.
            </p>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
