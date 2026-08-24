"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedProperty } from "@/lib/supabase/use-saved-property";
import { LoginModal } from "@/components/login-modal";

// Real account-backed save/unsave (see lib/supabase/use-saved-property.ts)
// — the property page's "Save" button the roadmap memory flagged as
// missing after the rebuild. Not signed in yet? Clicking opens the
// sign-in modal first rather than silently doing nothing.
export function SaveButton({
  propertySlug,
  className,
}: {
  propertySlug: string;
  className?: string;
}) {
  const { saved, checking, toggle } = useSavedProperty(propertySlug);
  const [showLogin, setShowLogin] = useState(false);

  async function handleClick() {
    const result = await toggle();
    if (result === "needs-auth") setShowLogin(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={checking}
        aria-pressed={saved}
        className={cn(
          "font-heading inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
          saved ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-muted",
          className
        )}
      >
        <Heart className={cn("size-4", saved && "fill-current")} />
        {saved ? "Saved" : "Save"}
      </button>

      <AnimatePresence>
        {showLogin && (
          <LoginModal key="save-login" initialMode="signin" onClose={() => setShowLogin(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
