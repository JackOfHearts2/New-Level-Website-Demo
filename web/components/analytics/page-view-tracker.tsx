"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

const SESSION_KEY = "nl_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    // Private-browsing / storage-blocked fallback — still counts the
    // pageview, just can't be deduped into a session.
    return "unknown";
  }
}

/** Sitewide first-party pageview beacon — mounted once per route change.
 *  Needs to be rendered in both (marketing)/layout.tsx and app/page.tsx
 *  since the homepage isn't nested under the marketing layout (see the
 *  "sitewide floating component" gotcha in CLAUDE.md). Deliberately not
 *  mounted anywhere under /admin — that's staff traffic, not visitor
 *  traffic. */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname, document.referrer || null, getSessionId());
  }, [pathname]);

  return null;
}
