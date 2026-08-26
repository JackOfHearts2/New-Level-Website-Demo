"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 400;

/** Same behavior as the public site's ScrollToTopButton (only shows while
 *  actively scrolling back up past a threshold), but positioned bottom-right
 *  instead of bottom-left — the public component's left position would
 *  collide with AdminSidebar's own bottom controls (profile menu, collapse
 *  toggle), which now permanently occupy that corner in /admin. */
export function AdminScrollToTop() {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const scrollingUp = y < lastY.current;
        setVisible(y > SHOW_AFTER_PX && scrollingUp);
        lastY.current = y;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-2xl transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp className="size-5" strokeWidth={2.5} />
    </button>
  );
}
