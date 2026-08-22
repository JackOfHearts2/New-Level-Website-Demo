"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { User, LogIn, UserPlus, Heart, HelpCircle, Mail } from "lucide-react";
import { ShineCircle } from "@/components/ui/shine-shape";

const PANEL_WIDTH = 224; // w-56
const PANEL_HEIGHT = 284; // approx rendered height, used for flip-up decisions
const VIEWPORT_MARGIN = 16;

// This is a UI-only preview of an account menu — there's no real
// sign-in/accounts system behind this site yet (see CLAUDE.md's "Migration
// in progress" notes), so "Sign In"/"Create Account" are inert for now,
// same convention already used for the homepage search bar's decorative
// filter dropdowns. The other three items route to real existing pages
// rather than invent destinations that don't exist.
export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // The button shows up in three very different contexts (desktop nav at
  // the screen's right edge, the mobile hamburger panel, the mobile dock)
  // — a fixed `right-0`/`left-0` CSS anchor is only ever correct in one of
  // those. Measuring the actual button position and clamping against the
  // viewport keeps the panel on-screen regardless of where it's rendered.
  function place() {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.right - PANEL_WIDTH, VIEWPORT_MARGIN),
      window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN
    );
    // Open upward instead of down when there isn't room below the button
    // (e.g. the mobile dock, which sits at the bottom of the viewport) —
    // opening downward there would push most of the panel off-screen.
    const fitsBelow = rect.bottom + 8 + PANEL_HEIGHT <= window.innerHeight - VIEWPORT_MARGIN;
    const top = fitsBelow ? rect.bottom + 8 : rect.top - 8 - PANEL_HEIGHT;
    setPos({ top: Math.max(top, VIEWPORT_MARGIN), left });
  }

  useEffect(() => {
    if (!open) return;
    place();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDocumentClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onDocumentClick);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="text-foreground hover:text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-full transition-colors"
      >
        <User className="size-4" />
      </button>

      {open &&
        pos &&
        createPortal(
          // Portaled to <body> rather than rendered in place: the mobile
          // dock's backdrop-blur (a backdrop-filter) makes it a containing
          // block for position:fixed descendants per spec, same as
          // transform/filter would — a fixed-position panel rendered
          // inside it is positioned relative to the dock, not the real
          // viewport, which silently pushed it off-screen. Portaling
          // escapes that regardless of which container ProfileMenu ends
          // up nested in.
          <div
            role="menu"
            style={{ position: "fixed", top: pos.top, left: pos.left, width: PANEL_WIDTH }}
            className="bg-popover border-border z-50 rounded-2xl border p-2 shadow-lg"
          >
          <div className="flex items-center gap-3 px-3 py-2">
            <ShineCircle className="bg-muted flex size-9 items-center justify-center rounded-full">
              <User className="text-foreground size-4" />
            </ShineCircle>
            <div>
              <div className="font-heading text-sm font-semibold">Guest</div>
              <div className="text-foreground text-sm">Not signed in</div>
            </div>
          </div>

          <div className="border-border my-2 border-t" />

          <button
            type="button"
            role="menuitem"
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <LogIn className="text-foreground size-4" />
            Sign In
          </button>
          <button
            type="button"
            role="menuitem"
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <UserPlus className="text-foreground size-4" />
            Create Account
          </button>

          <div className="border-border my-2 border-t" />

          <Link
            href="/properties"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <Heart className="text-foreground size-4" />
            Saved Properties
          </Link>
          <Link
            href="/faq"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <HelpCircle className="text-foreground size-4" />
            Help Center
          </Link>
          <Link
            href="/contact"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium"
          >
            <Mail className="text-foreground size-4" />
            Contact Us
          </Link>
          </div>,
          document.body
        )}
    </div>
  );
}
