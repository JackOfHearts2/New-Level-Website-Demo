"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, LogIn, UserPlus, Heart, HelpCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

// This is a UI-only preview of an account menu — there's no real
// sign-in/accounts system behind this site yet (see CLAUDE.md's "Migration
// in progress" notes), so "Sign In"/"Create Account" are inert for now,
// same convention already used for the homepage search bar's decorative
// filter dropdowns. The other three items route to real existing pages
// rather than invent destinations that don't exist.
export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDocumentClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-full transition-colors"
      >
        <User className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="bg-popover border-border absolute top-full right-0 z-30 mt-3 w-56 rounded-2xl border p-2 shadow-lg"
        >
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="bg-muted flex size-9 items-center justify-center rounded-full">
              <User className="text-muted-foreground size-4" />
            </span>
            <div>
              <div className="font-heading text-sm font-semibold">Guest</div>
              <div className="text-muted-foreground text-xs">Not signed in</div>
            </div>
          </div>

          <div className="border-border my-2 border-t" />

          <button
            type="button"
            role="menuitem"
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <LogIn className="text-muted-foreground size-4" />
            Sign In
          </button>
          <button
            type="button"
            role="menuitem"
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <UserPlus className="text-muted-foreground size-4" />
            Create Account
          </button>

          <div className="border-border my-2 border-t" />

          <Link
            href="/properties"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
            )}
          >
            <Heart className="text-muted-foreground size-4" />
            Saved Properties
          </Link>
          <Link
            href="/faq"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <HelpCircle className="text-muted-foreground size-4" />
            Help Center
          </Link>
          <Link
            href="/contact"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <Mail className="text-muted-foreground size-4" />
            Contact Us
          </Link>
        </div>
      )}
    </div>
  );
}
