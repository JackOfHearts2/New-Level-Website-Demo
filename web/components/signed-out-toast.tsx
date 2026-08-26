"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/** Fires the "Signed out" confirmation after the admin dashboard's logout
 *  form redirects to "/?signedOut=1" — a toast can't survive the redirect
 *  itself (the whole page it was rendered on is torn down), so the flag
 *  rides along in the URL and this (mounted once in the root layout) fires
 *  it after landing, then strips the param so a refresh/share of the link
 *  doesn't re-fire it. Reads window.location directly instead of
 *  useSearchParams to avoid requiring a Suspense boundary around the whole
 *  root layout for what's otherwise a one-off. */
export function SignedOutToast() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("signedOut") !== "1") return;
    toast.success("Signed out");
    url.searchParams.delete("signedOut");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }, []);

  return null;
}
