"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { Monitor, LogOut, User as UserIcon, UserCog } from "lucide-react";
import { ShineCircle } from "@/components/ui/shine-shape";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "@/app/admin/(dashboard)/actions";

// A plain submit button gave zero feedback on click — client report
// (2026-08-27): "that initial click, nothing on the page actually
// indicates that it worked." The redirect that follows is real confirmation
// enough on its own (see SignedOutToast), but there's a network round trip
// before it lands; this covers that gap.
function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      role="menuitem"
      disabled={pending}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
    >
      <LogOut className="size-4" />
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}

// Tailwind needs static, literal class strings to scan at build time —
// `size-${size}` would silently fail to generate the CSS for whichever
// size wasn't already used elsewhere in the codebase. Explicit variants
// instead of interpolation.
function Avatar({
  displayName,
  avatarUrl,
  size = "md",
}: {
  displayName: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md";
}) {
  const initial = displayName?.trim()?.[0]?.toUpperCase();
  return (
    <ShineCircle
      className={`bg-primary/15 text-primary flex shrink-0 items-center justify-center overflow-hidden rounded-full ${size === "sm" ? "size-8" : "size-9"}`}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt={displayName ?? "Profile photo"} width={40} height={40} className="size-full object-cover" />
      ) : initial ? (
        <span className="font-heading text-sm font-bold">{initial}</span>
      ) : (
        <UserIcon className="size-4" />
      )}
    </ShineCircle>
  );
}

/** Profile menu — used in two spots (client ask, 2026-08-26: "not only a
 *  profile icon top right, but... the admin icon on the bottom left...
 *  also needs a profile section"): the sidebar's bottom slot (full,
 *  name+email visible when the sidebar's open) and AdminTopBar's
 *  top-right corner (compact, icon-only). Shows the real uploaded avatar
 *  or a first-letter initial — was hardcoded to just role+email before,
 *  which is why saving a profile name never visibly changed anything. */
export function AdminProfileMenu({
  email,
  role,
  displayName,
  avatarUrl,
  open: sidebarOpen = true,
  compact = false,
}: {
  email: string;
  role: "editor" | "admin";
  displayName: string | null;
  avatarUrl: string | null;
  open?: boolean;
  compact?: boolean;
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

  const showLabel = sidebarOpen && !compact;

  return (
    <div ref={rootRef} className={compact ? "relative" : "relative w-full border-t border-border pt-2"}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={
          compact
            ? "flex items-center rounded-full transition-colors hover:opacity-80"
            : "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
        }
      >
        <Avatar displayName={displayName} avatarUrl={avatarUrl} />
        {showLabel && (
          <div className="min-w-0">
            <div className="font-heading truncate text-sm font-semibold">{displayName || <span className="capitalize">{role}</span>}</div>
            <div className="text-muted-foreground truncate text-xs">{email}</div>
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={
            "glow-card absolute z-50 w-56 rounded-2xl border border-border bg-popover p-2 shadow-lg " +
            (compact ? "right-0 top-full mt-2" : "bottom-full left-0 mb-2")
          }
        >
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Avatar displayName={displayName} avatarUrl={avatarUrl} size="sm" />
            <div className="min-w-0">
              <div className="font-heading truncate text-sm font-semibold">{displayName || <span className="capitalize">{role}</span>}</div>
              <div className="text-muted-foreground truncate text-xs">{email}</div>
            </div>
          </div>
          <div className="my-2 border-t border-border" />
          <Link
            href="/admin/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted"
          >
            <UserCog className="size-4" />
            Profile
          </Link>
          {/* Mirrors the public ProfileMenu's "Dashboard" slot, in reverse:
              from inside /admin, the equivalent way out is back to the
              live site. */}
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
          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground">
            Theme
            <ThemeToggle />
          </div>
          <div className="my-2 border-t border-border" />
          <form action={logout}>
            <LogoutButton />
          </form>
        </div>
      )}
    </div>
  );
}
