"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { LoginModal } from "@/components/login-modal";
import { useSession } from "@/lib/supabase/use-session";

// Opens the normal sign-in modal automatically when a page is reached via
// `?signin=1` (e.g. proxy.ts redirecting a signed-out visitor away from
// /admin) — staff and regular visitors share one login, so this is just
// "start the sign-in flow for me," not a separate staff-only form. On
// success, navigates to `?redirect=` if present (back to /admin, which by
// then has a real session and can do its own role check).
export function AutoSignInModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useSession();
  // Only real interactive state: has the visitor dismissed it this visit.
  // Whether to *show* it is derived at render time from the URL + session,
  // not tracked via an effect-driven setState.
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = !loading && !user && !dismissed && searchParams.get("signin") === "1";
  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <LoginModal
        key="auto-signin"
        initialMode="signin"
        onClose={() => setDismissed(true)}
        onSuccess={() => {
          setDismissed(true);
          const redirect = searchParams.get("redirect");
          if (redirect) router.push(redirect);
        }}
      />
    </AnimatePresence>
  );
}
