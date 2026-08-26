"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { GlowCard } from "@/components/ui/glow-card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-consent-ack";

// No 'storage'-event subscription needed — this tab's own accept click is
// handled by the separate `dismissed` state below, and other tabs writing
// the same key isn't a case worth re-rendering for.
function subscribe() {
  return () => {};
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

/** Simple accept-only cookie notice — this site's actual cookie footprint
 *  is minimal (a dark/light preference in localStorage, an admin session
 *  cookie; see /privacy), so there's no reject-vs-accept choice to offer,
 *  just an acknowledgment.
 *
 *  Uses useSyncExternalStore rather than a lazy useState initializer:
 *  localStorage doesn't exist during SSR, so a naive `useState(() =>
 *  !localStorage.getItem(...))` would compute a different value on the
 *  server (nothing to read, defaults false/hidden) than on the client's
 *  very first render (localStorage IS available there) — a real hydration
 *  mismatch, not just a lint nag. useSyncExternalStore is built for
 *  exactly this: getServerSnapshot always returns false, so SSR and the
 *  client's hydration pass agree, and the true client value is applied in
 *  a safe post-hydration update instead. */
export function CookieConsentBanner() {
  const storedVisible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  function accept() {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing to persist to — the banner will just reappear next visit,
      // which is an acceptable fallback, not worth surfacing an error for.
    }
  }

  if (!storedVisible || dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4">
      <GlowCard className="mx-auto flex max-w-3xl flex-col items-center gap-3 p-4 text-center sm:flex-row sm:text-left">
        <p className="text-foreground flex-1 text-sm">
          This site uses your browser&apos;s local storage to remember your light/dark mode
          preference. See our{" "}
          <Link href="/privacy" className="text-primary font-medium underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <Button type="button" onClick={accept} className="shrink-0">
          Got it
        </Button>
      </GlowCard>
    </div>
  );
}
