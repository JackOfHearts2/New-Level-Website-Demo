"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_MENU } from "@/lib/content";

const CLOSE_DELAY_MS = 200;
const SPRING = { type: "spring" as const, stiffness: 350, damping: 32 };

export function NavMenu() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIndex(null), CLOSE_DELAY_MS);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenIndex(null);
    }
    function onDocumentClick() {
      setOpenIndex(null);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocumentClick);
    };
  }, []);

  return (
    <ul data-tour="nav" className="flex gap-5 text-sm whitespace-nowrap">
      {NAV_MENU.map((item, i) => {
        const hasChildren = "children" in item && item.children;
        return (
          <li
            key={item.href}
            className="relative"
            onMouseEnter={hasChildren ? () => (cancelClose(), setOpenIndex(i)) : undefined}
            onMouseLeave={hasChildren ? scheduleClose : undefined}
          >
            <div className="flex items-center gap-1">
              <Link
                href={item.href}
                className="text-foreground hover:text-foreground font-heading block font-medium duration-150"
              >
                {item.label}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  aria-expanded={openIndex === i}
                  aria-label={`${item.label} submenu`}
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelClose();
                    setOpenIndex(openIndex === i ? null : i);
                  }}
                  className="text-foreground hover:text-foreground"
                >
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-150",
                      openIndex === i && "rotate-180"
                    )}
                  />
                </button>
              )}
            </div>
            <AnimatePresence>
              {hasChildren && openIndex === i && (
                <motion.div
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                  initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.96 }}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                  // z-50, not the z-30 this had before: every persistent
                  // floating widget on the page (FloatingActions,
                  // ReportProblemWidget, ScrollToTopButton, and —
                  // admin-only — EditModeToggle, which sits near the TOP
                  // of the screen at top-20, unlike the others) is z-40.
                  // Client report (2026-08-27, signed in as admin): About >
                  // Team and a couple of other dropdown items appeared to
                  // do nothing and the menu just closed — root cause was
                  // EditModeToggle's fixed top-20 button sitting ABOVE
                  // this panel in stacking order at exactly the screen
                  // positions where certain dropdown items rendered,
                  // silently eating the hover/click. An open interactive
                  // dropdown should never lose to a floating corner
                  // widget, so this now clears all of them.
                  className="bg-popover border-border absolute top-full left-1/2 z-50 mt-3 w-56 -translate-x-1/2 rounded-2xl border p-2 shadow-lg"
                >
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="text-foreground hover:text-foreground hover:bg-muted block rounded-lg px-3 py-2 text-sm font-medium"
                    >
                      {child.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
