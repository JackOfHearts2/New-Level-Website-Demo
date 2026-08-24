"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const SHOW_AFTER_PX = 400;

// Bottom-left is the one corner nothing else on the page claims: the
// FloatingActions FAB sits bottom-right, MobileDock and the property
// page's StickyBookingBar both sit bottom-center. Only shows while
// actively scrolling back up past SHOW_AFTER_PX — not just "past some
// point," so it doesn't sit there competing for attention while someone
// is still scrolling down into the page.
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const lastY = useRef(0);
  // /property's StickyBookingBar spans edge-to-edge at this same bottom-4
  // spot below lg (it's `inset-x-0`, not inset from the sides, so max-w-md
  // only caps it once the viewport is wider than that) — bump up to clear
  // it, same fix FloatingActions already needed for the same reason.
  const onPropertyPage = usePathname() === "/property";

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
        "fixed left-4 z-40 flex size-11 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-2xl transition-all duration-300 lg:bottom-6 lg:left-6 lg:size-14 lg:border-4",
        onPropertyPage ? "bottom-24 lg:bottom-6" : "bottom-4",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp className="size-4 lg:size-6" strokeWidth={2.5} />
    </button>
  );
}
