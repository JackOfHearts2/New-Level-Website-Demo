"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, ClipboardList, Users } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { updateReportsTo } from "./actions";

export type StaffPerson = {
  id: string;
  label: string;
  email: string | null;
  role: "editor" | "admin";
  reportsTo: string | null;
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

  return (
    <div className="space-y-2">
      <GlowCard onClick={() => setOpen((v) => !v)} aria-pressed={open} className="min-w-0 flex items-center gap-3 p-4">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {initials(person.label)}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-heading truncate text-sm font-semibold">{person.label}</p>
          <p className="text-muted-foreground truncate text-xs capitalize">
            {person.role}
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
          </div>
          {isAdmin && (
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
