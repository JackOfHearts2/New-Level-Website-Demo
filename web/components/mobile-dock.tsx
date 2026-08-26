"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Building2, Mail, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileMenu } from "@/components/profile-menu";

const ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/properties", icon: Building2, label: "Properties" },
  { href: "/contact", icon: Mail, label: "Contact" },
];

const SHOW_ARROW_AFTER_PX = 400;
// How close to the true bottom of the page (in px) before the dock hides
// itself — needs to clear the footer's social-icon row and copyright line,
// not just the copyright line alone.
const NEAR_BOTTOM_PX = 220;

// Fixed bottom quick-access bar, mobile/tablet only (lg:hidden, matching
// the breakpoint SiteHeader actually switches to the desktop nav at) — a
// supplement to the hamburger menu, not a replacement: the hamburger still
// covers full site navigation, this covers the handful of things worth one
// tap away. Was previously md:hidden (768px), which hid the dock a full
// 256px before the desktop nav appeared at lg (1024px) — a dead zone where
// a tablet-portrait visitor got neither the dock nor a desktop-style nav
// bar, just the bare hamburger toggle with no quick-access row.
//
// Two behaviors layered on top of the original static bar:
// - It hides itself (fades + slides down, non-interactive) once the page
//   is scrolled within NEAR_BOTTOM_PX of the true bottom — being fixed,
//   it would otherwise permanently sit on top of the footer's social
//   icons and copyright line, which real client feedback flagged as a bug.
// - A "back to top" arrow grows in next to the profile icon while
//   actively scrolling up (mirroring ScrollToTopButton's own threshold/
//   direction logic), and shrinks away again on scrolling down. This is
//   the mobile equivalent of the standalone ScrollToTopButton, which is
//   hidden on mobile everywhere except /property (where this dock is
//   suppressed in favor of the StickyBookingBar) specifically so the two
//   "back to top" affordances don't compete for the same corner.
export function MobileDock() {
  const pathname = usePathname();
  const [showArrow, setShowArrow] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const scrollingUp = y < lastY.current;
        setShowArrow(y > SHOW_ARROW_AFTER_PX && scrollingUp);
        const distanceFromBottom =
          document.documentElement.scrollHeight - window.innerHeight - y;
        setNearBottom(distanceFromBottom < NEAR_BOTTOM_PX);
        lastY.current = y;
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // /property already has its own fixed-bottom StickyBookingBar at the
  // same inset-x-0 bottom-4 position — rendering both would stack two
  // competing fixed bars on top of each other on mobile.
  if (pathname === "/property") return null;

  return (
    <nav
      aria-label="Quick navigation"
      className={cn(
        "fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 transition-all duration-300 lg:hidden",
        nearBottom
          ? "pointer-events-none translate-y-4 opacity-0"
          : "translate-y-0 opacity-100"
      )}
    >
      <div className="bg-background/80 border-border flex items-center gap-1 rounded-full border p-1.5 shadow-lg backdrop-blur-xl">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex size-11 items-center justify-center rounded-full transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-5" />
            </Link>
          );
        })}
        <div className="border-border mx-0.5 h-6 border-l" />
        <div className="flex size-11 items-center justify-center">
          <ProfileMenu />
        </div>
        <AnimatePresence initial={false}>
          {showArrow && (
            <motion.button
              key="scroll-top"
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 44, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="text-foreground hover:bg-muted hover:text-foreground flex h-11 shrink-0 items-center justify-center overflow-hidden rounded-full"
            >
              <ArrowUp className="size-5 shrink-0" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
