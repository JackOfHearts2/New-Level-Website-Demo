"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ClipboardList, Users, Briefcase, CheckSquare } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { updateReportsTo, updateStaffProfile } from "./actions";

export type StaffPerson = {
  id: string;
  label: string;
  email: string | null;
  role: "editor" | "admin";
  reportsTo: string | null;
  title: string | null;
  department: string | null;
  avatarUrl: string | null;
  assignedInquiries: number;
};

function initials(label: string) {
  return label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// The little circles-with-avatars design language the client shared for
// this — an initial-letter fallback when there's no uploaded photo, real
// photo otherwise, same convention AdminProfileMenu already uses.
function Avatar({ person, size = 40 }: { person: StaffPerson; size?: number }) {
  return (
    <span
      className="bg-primary/10 text-primary relative flex shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold"
      style={{ width: size, height: size }}
    >
      {person.avatarUrl ? (
        <Image src={person.avatarUrl} alt={person.label} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        initials(person.label)
      )}
    </span>
  );
}

function PersonNode({
  person,
  directReports,
  people,
  isAdmin,
}: {
  person: StaffPerson;
  directReports: StaffPerson[];
  people: StaffPerson[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [titleDraft, setTitleDraft] = useState(person.title ?? "");
  const [deptDraft, setDeptDraft] = useState(person.department ?? "");
  const router = useRouter();

  function handleReportsTo(value: string) {
    startTransition(async () => {
      const result = await updateReportsTo(person.id, value || null);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Reporting line updated");
        router.refresh();
      }
    });
  }

  function handleSaveProfile() {
    startTransition(async () => {
      const result = await updateStaffProfile(person.id, { title: titleDraft, department: deptDraft });
      if (result.error) toast.error(result.error);
      else {
        toast.success("Updated");
        router.refresh();
      }
    });
  }

  const subtitle = [person.title, person.department].filter(Boolean).join(" · ") || person.role;

  return (
    <div className="space-y-2">
      <GlowCard onClick={() => setOpen((v) => !v)} aria-pressed={open} className="min-w-0 flex items-center gap-3 p-4">
        <Avatar person={person} />
        <div className="min-w-0 flex-1 text-left">
          <p className="font-heading truncate text-sm font-semibold">{person.label}</p>
          <p className="text-muted-foreground truncate text-xs capitalize">
            {subtitle}
            {person.assignedInquiries > 0 && ` · ${person.assignedInquiries} assigned inquir${person.assignedInquiries === 1 ? "y" : "ies"}`}
          </p>
        </div>
      </GlowCard>

      {open && (
        <GlowCard className="min-w-0 ml-4 space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            {person.email && (
              <a
                href={`mailto:${person.email}`}
                className="font-heading border-border hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
              >
                <Mail className="size-3.5" />
                Message
              </a>
            )}
            <Link
              href={`/admin/inquiries?assigned=${person.id}`}
              className="font-heading border-border hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            >
              <ClipboardList className="size-3.5" />
              Assigned inquiries
            </Link>
            <Link
              href={`/admin/onboarding?user=${person.id}`}
              className="font-heading border-border hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            >
              <CheckSquare className="size-3.5" />
              Onboarding & reports
            </Link>
          </div>
          {isAdmin && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs">
                  <span className="font-heading flex items-center gap-1.5 font-semibold">
                    <Briefcase className="size-3.5" />
                    Title
                  </span>
                  <input
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    placeholder="e.g. CEO"
                    className="border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </label>
                <label className="block text-xs">
                  <span className="font-heading font-semibold">Department</span>
                  <input
                    value={deptDraft}
                    onChange={(e) => setDeptDraft(e.target.value)}
                    placeholder="e.g. Marketing"
                    className="border-border bg-background mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={pending || (titleDraft === (person.title ?? "") && deptDraft === (person.department ?? ""))}
                className="font-heading border-border hover:bg-muted rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                Save title & department
              </button>
              <label className="block text-xs">
                <span className="font-heading flex items-center gap-1.5 font-semibold">
                  <Users className="size-3.5" />
                  Reports to
                </span>
                <select
                  value={person.reportsTo ?? ""}
                  disabled={pending}
                  onChange={(e) => handleReportsTo(e.target.value)}
                  className="border-border bg-background text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">No one (top of the chart)</option>
                  {people
                    .filter((p) => p.id !== person.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                </select>
              </label>
            </>
          )}
        </GlowCard>
      )}

      {directReports.length > 0 && (
        <div className="border-border ml-5 space-y-2 border-l pl-5">
          {directReports.map((child) => (
            <PersonNode
              key={child.id}
              person={child}
              people={people}
              isAdmin={isAdmin}
              directReports={people.filter((p) => p.reportsTo === child.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TeamTree({ people, isAdmin }: { people: StaffPerson[]; isAdmin: boolean; currentUserId: string }) {
  if (people.length === 0) {
    return <p className="text-muted-foreground text-sm">No staff accounts yet.</p>;
  }

  const roots = people.filter((p) => !p.reportsTo || !people.some((other) => other.id === p.reportsTo));

  return (
    <div className="space-y-2">
      {roots.map((root) => (
        <PersonNode
          key={root.id}
          person={root}
          people={people}
          isAdmin={isAdmin}
          directReports={people.filter((p) => p.reportsTo === root.id)}
        />
      ))}
    </div>
  );
}
