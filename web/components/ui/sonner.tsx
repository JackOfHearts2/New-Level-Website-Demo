"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useIsDark } from "@/components/theme-toggle";

/** Site-wide toast host — mounted once in app/layout.tsx. Tracks the same
 *  manual `dark` class toggle as ThemeToggle (no next-themes in this
 *  project) so a toast's own colors match whichever theme is active
 *  instead of defaulting to light. Client ask (2026-08-27): actions across
 *  both the public site and the admin dashboard (save, publish, sign in/
 *  out, upload) need a real confirmation the user can't miss — a single
 *  shared toast host is the one place that wires up. */
export function Toaster(props: ToasterProps) {
  const isDark = useIsDark();

  return (
    <Sonner
      theme={isDark ? "dark" : "light"}
      // top-right, not bottom — the bottom corners of this site are
      // already crowded with fixed chrome (FloatingActions' dial,
      // .contact-float, MobileDock, the property page's StickyBookingBar,
      // the report-problem widget) documented throughout this codebase; a
      // bottom toast would stack on top of one of those on most pages.
      position="top-right"
      richColors
      closeButton
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
