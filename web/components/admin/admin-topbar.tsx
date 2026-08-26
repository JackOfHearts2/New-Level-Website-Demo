"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/admin/notification-bell";
import { AdminProfileMenu } from "@/components/admin/admin-profile-menu";

const LABELS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/analytics": "Analytics",
  "/admin/content": "Content",
  "/admin/images": "Images",
  "/admin/approvals": "Approvals",
  "/admin/reports": "Reports",
  "/admin/editors": "Access",
  "/admin/activity": "Activity",
  "/admin/profile": "Profile",
  "/admin/settings": "Settings",
};

function labelFor(pathname: string) {
  if (LABELS[pathname]) return LABELS[pathname];
  const base = "/" + pathname.split("/").slice(1, 3).join("/");
  return LABELS[base] ?? "Admin";
}

/** Same "shapes and scrolls with you" behavior as the public site's
 *  scroll-aware nav (initNavScroll's hide-on-scroll-down/reveal-on-scroll-up
 *  on styles.css's era, now components/site-header.tsx here) — client asked
 *  explicitly for admin to match. No hero to solidify over here, so this
 *  skips that half (nav--overlay/nav--solid); just the hide/reveal. */
export function AdminTopBar({
  pendingApprovals,
  openReports,
  role,
  email,
  displayName,
  avatarUrl,
}: {
  pendingApprovals: number;
  openReports: number;
  role: "editor" | "admin";
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const scrollingDown = y > lastY.current;
        setVisible(y < 40 || !scrollingDown);
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
    <div
      className={cn(
        "sticky top-0 z-20 -mx-6 mb-6 border-b border-border bg-card/90 px-6 py-3 backdrop-blur transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-heading text-sm font-semibold text-muted-foreground">
          Admin / <span className="text-foreground">{labelFor(pathname)}</span>
        </span>
        <div className="flex items-center gap-2">
          {/* Bordered pill wrappers, not the bare small icon buttons these
              components render standalone elsewhere — client feedback
              (2026-08-26): the bell and the theme toggle were "too easily
              missed... a little too small." Bigger hit target + a visible
              boundary against the top bar so they read as real chrome. */}
          <div className="border-border flex size-10 items-center justify-center rounded-full border">
            <NotificationBell
              rows={[
                { href: "/admin/approvals", label: "Pending approvals", count: pendingApprovals },
                { href: "/admin/reports", label: "Open reports", count: openReports },
              ]}
            />
          </div>
          <div className="border-border flex size-10 items-center justify-center rounded-full border">
            <ThemeToggle />
          </div>
          <AdminProfileMenu email={email} role={role} displayName={displayName} avatarUrl={avatarUrl} compact />
        </div>
      </div>
    </div>
  );
}
