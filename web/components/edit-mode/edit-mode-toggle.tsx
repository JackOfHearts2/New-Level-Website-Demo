"use client";

import { Pencil, PencilOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditMode } from "./edit-mode-context";

/** Floating admin-only toggle for inline "edit site" mode — hidden
 *  entirely for anyone who isn't an admin (editors keep using the
 *  approval-gated /admin/content dashboard instead, per the client's
 *  confirmed split). Top-right, below the nav — every other corner is
 *  already claimed (FloatingActions bottom-right, ReportProblemWidget +
 *  ScrollToTopButton bottom-left). */
export function EditModeToggle() {
  const { on, isAdmin, toggle } = useEditMode();
  if (!isAdmin) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={cn(
        "border-background fixed right-4 top-20 z-40 flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-semibold shadow-2xl transition-colors lg:right-6",
        on ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
      )}
    >
      {on ? <PencilOff className="size-4" /> : <Pencil className="size-4" />}
      {on ? "Editing live" : "Edit site"}
    </button>
  );
}
