"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell } from "lucide-react";

const PANEL_WIDTH = 280;
const VIEWPORT_MARGIN = 16;

type NotificationRow = { href: string; label: string; count: number };

/** Surfaces the same counts already driving the sidebar's nav badges
 *  (pending approvals, open reports) as a bell — client ask (2026-08-26):
 *  "a little bell icon... with a tiny circle to show if they have
 *  notifications." Deliberately reuses this existing data rather than
 *  standing up a separate notifications table/backend — there's no
 *  distinct "unread" concept here, just "things waiting on you," which
 *  is exactly what those two counts already track. */
export function NotificationBell({ rows }: { rows: NotificationRow[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  useEffect(() => {
    if (!open) return;
    const btn = buttonRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const left = Math.min(
        Math.max(rect.right - PANEL_WIDTH, VIEWPORT_MARGIN),
        window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN
      );
      setPos({ top: rect.bottom + 8, left });
    }
    function onDocumentClick(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={`Notifications${total ? ` (${total})` : ""}`}
        className="text-muted-foreground hover:bg-muted hover:text-foreground relative flex size-8 items-center justify-center rounded-full transition-colors"
      >
        <Bell className="size-4" />
        {total > 0 && (
          <span className="bg-destructive absolute right-1 top-1 size-2 rounded-full" aria-hidden />
        )}
      </button>

      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{ position: "fixed", top: pos.top, left: pos.left, width: PANEL_WIDTH }}
            className="border-border bg-popover z-50 rounded-2xl border p-2 shadow-lg"
          >
            {rows.every((r) => r.count === 0) ? (
              <p className="text-muted-foreground p-3 text-sm">Nothing waiting on you.</p>
            ) : (
              rows
                .filter((r) => r.count > 0)
                .map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    onClick={() => setOpen(false)}
                    className="hover:bg-muted flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    {r.label}
                    <span className="bg-destructive text-destructive-foreground flex size-5 items-center justify-center rounded-full text-xs font-semibold">
                      {r.count}
                    </span>
                  </Link>
                ))
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
