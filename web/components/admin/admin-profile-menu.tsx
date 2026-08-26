"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Monitor, LogOut, User as UserIcon } from "lucide-react";
import { ShineCircle } from "@/components/ui/shine-shape";
import { logout } from "@/app/admin/(dashboard)/actions";

/** The sidebar's bottom profile slot — an avatar button that opens a
 *  dropdown with account-relevant actions, mirroring the public site's
 *  ProfileMenu (components/profile-menu.tsx) pattern but trimmed to what's
 *  relevant inside /admin (no Saved Properties/Tour/FAQ links) and simpler
 *  positioning: this only ever renders in one place (the sidebar's bottom
 *  slot), so it doesn't need ProfileMenu's viewport-clamping/flip-up portal
 *  logic — a plain anchored dropdown is enough. Explicit client ask
 *  (2026-08-26): "the little profile icon... go back to the live site." */
export function AdminProfileMenu({
  email,
  role,
  open: sidebarOpen,
}: {
  email: string;
  role: "editor" | "admin";
  open: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDocumentClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative w-full border-t border-border pt-2">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
      >
        <ShineCircle className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <UserIcon className="text-foreground size-4" />
        </ShineCircle>
        {sidebarOpen && (
          <div className="min-w-0">
            <div className="font-heading truncate text-sm font-semibold capitalize">{role}</div>
            <div className="text-muted-foreground truncate text-xs">{email}</div>
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="glow-card absolute bottom-full left-0 z-50 mb-2 w-56 rounded-2xl border border-border bg-popover p-2 shadow-lg"
        >
          {/* Mirrors the public ProfileMenu's "Dashboard" slot, in reverse:
              from inside /admin, the equivalent way out is back to the
              live site. Deliberately doesn't repeat Settings/Content/etc.
              — those already have their own sidebar nav items; the client
              was explicit the dropdown shouldn't duplicate what's already
              on the page. */}
          <Link
            href="/"
            target="_blank"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted"
          >
            <Monitor className="size-4" />
            Live site ↗
          </Link>
          <div className="my-2 border-t border-border" />
          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
