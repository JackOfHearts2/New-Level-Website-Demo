"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, CheckSquare, Square, Send } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { addOnboardingTask, toggleOnboardingTask, deleteOnboardingTask, submitWorkReport } from "./actions";

export type StaffOption = { id: string; label: string };
export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
};
export type ReportItem = {
  id: string;
  periodLabel: string;
  body: string;
  createdAt: string;
  authorLabel: string;
  recipientLabel: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

function TaskRow({ task }: { task: TaskItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await toggleOnboardingTask(task.id, !task.completed);
      if (result.error) toast.error(result.error);
      else router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteOnboardingTask(task.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Task removed");
        router.refresh();
      }
    });
  }

  return (
    <li className="border-border flex items-start gap-3 rounded-xl border p-3">
      <button type="button" onClick={toggle} disabled={pending} className="mt-0.5 shrink-0" aria-pressed={task.completed}>
        {task.completed ? (
          <CheckSquare className="text-primary size-5" />
        ) : (
          <Square className="text-muted-foreground size-5" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${task.completed ? "text-muted-foreground line-through" : ""}`}>
          {task.title}
        </p>
        {task.description && <p className="text-muted-foreground mt-0.5 text-xs">{task.description}</p>}
        <p className="text-muted-foreground mt-1 text-xs">
          {task.dueDate && `Due ${formatDate(task.dueDate)}`}
          {task.completed && task.completedAt && ` · Completed ${formatDate(task.completedAt)}`}
        </p>
      </div>
      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label="Remove task"
        className="text-muted-foreground hover:text-destructive shrink-0"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

function AddTaskForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [open, setOpen] = useState(false);

  function handleAdd() {
    if (!title.trim()) return;
    startTransition(async () => {
      const result = await addOnboardingTask(userId, { title, description, dueDate });
      if (result.error) toast.error(result.error);
      else {
        toast.success("Task assigned");
        setTitle("");
        setDescription("");
        setDueDate("");
        setOpen(false);
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-heading border-border hover:bg-muted flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
      >
        <Plus className="size-3.5" />
        Assign a task
      </button>
    );
  }

  return (
    <div className="border-border space-y-2 rounded-xl border p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Details (optional)"
        className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border-border rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={pending || !title.trim()}
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add task"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-heading text-muted-foreground hover:text-foreground text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function ReportForm({ staff, defaultRecipientId }: { staff: StaffOption[]; defaultRecipientId: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [recipientId, setRecipientId] = useState(defaultRecipientId ?? "");
  const [periodLabel, setPeriodLabel] = useState("");
  const [body, setBody] = useState("");

  function handleSubmit() {
    if (!body.trim()) return;
    startTransition(async () => {
      const result = await submitWorkReport({ recipientId: recipientId || null, periodLabel, body });
      if (result.error) toast.error(result.error);
      else {
        toast.success("Report submitted");
        setPeriodLabel("");
        setBody("");
        router.refresh();
      }
    });
  }

  return (
    <div className="border-border space-y-2 border-t pt-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={periodLabel}
          onChange={(e) => setPeriodLabel(e.target.value)}
          placeholder="Period (e.g. Week of Aug 25)"
          className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <select
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">No specific recipient</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder="What did you work on?"
        className="border-border w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending || !body.trim()}
        className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        <Send className="size-3.5" />
        {pending ? "Submitting…" : "Submit report"}
      </button>
    </div>
  );
}

function ReportList({ reports, emptyText }: { reports: ReportItem[]; emptyText: string }) {
  if (reports.length === 0) return <p className="text-muted-foreground text-sm">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li key={r.id} className="border-border rounded-xl border p-3 text-sm">
          <p className="font-heading font-semibold">{r.periodLabel}</p>
          <p className="mt-1 whitespace-pre-wrap">{r.body}</p>
          <p className="text-muted-foreground mt-1.5 text-xs">
            {r.authorLabel}
            {r.recipientLabel && ` → ${r.recipientLabel}`} · {formatDate(r.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function OnboardingView({
  viewUserId,
  viewingSelf,
  viewingLabel,
  isAdmin,
  staff,
  allStaffForSwitch,
  defaultRecipientId,
  tasks,
  authoredReports,
  receivedReports,
}: {
  viewUserId: string;
  viewingSelf: boolean;
  viewingLabel: string;
  isAdmin: boolean;
  staff: StaffOption[];
  allStaffForSwitch: StaffOption[];
  defaultRecipientId: string | null;
  tasks: TaskItem[];
  authoredReports: ReportItem[];
  receivedReports: ReportItem[];
}) {
  const router = useRouter();
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            {viewingSelf ? "My onboarding & reports" : `${viewingLabel}'s onboarding & reports`}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {tasks.length > 0
              ? `${completedCount} of ${tasks.length} onboarding steps complete.`
              : "No onboarding steps assigned yet."}
          </p>
        </div>
        {isAdmin && allStaffForSwitch.length > 0 && (
          <select
            value={viewUserId}
            onChange={(e) => router.push(e.target.value === "" ? "/admin/onboarding" : `/admin/onboarding?user=${e.target.value}`)}
            className="border-border bg-background text-foreground rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {allStaffForSwitch.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlowCard className="min-w-0 space-y-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-base font-semibold">Onboarding checklist</h2>
            {isAdmin && <AddTaskForm userId={viewUserId} />}
          </div>
          {tasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {isAdmin ? "Assign the first step above." : "Nothing assigned yet — check back soon."}
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </GlowCard>

        <GlowCard className="min-w-0 space-y-4 p-6">
          <h2 className="font-heading text-base font-semibold">
            {viewingSelf ? "Submit a work report" : "Reports submitted"}
          </h2>
          {viewingSelf && <ReportForm staff={staff} defaultRecipientId={defaultRecipientId} />}
          <div className="border-border space-y-2 border-t pt-4">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              {viewingSelf ? "Reports you've submitted" : `Submitted by ${viewingLabel}`}
            </h3>
            <ReportList reports={authoredReports} emptyText="No reports submitted yet." />
          </div>
          {receivedReports.length > 0 && (
            <div className="border-border space-y-2 border-t pt-4">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {viewingSelf ? "Reports submitted to you" : `Submitted to ${viewingLabel}`}
              </h3>
              <ReportList reports={receivedReports} emptyText="Nothing here yet." />
            </div>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
