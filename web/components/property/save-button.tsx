"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/use-session";
import { LoginModal } from "@/components/login-modal";

// Real account-backed save/unsave (saved_properties table, RLS-scoped to
// the signed-in user) — the property page's "Save" button the roadmap
// memory flagged as missing after the rebuild. Not signed in yet? Clicking
// opens the sign-in modal first rather than silently doing nothing.
export function SaveButton({
  propertySlug,
  className,
}: {
  propertySlug: string;
  className?: string;
}) {
  const { user, loading } = useSession();
  const [saved, setSaved] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("saved_properties")
      .select("property_slug")
      .eq("user_id", user.id)
      .eq("property_slug", propertySlug)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setSaved(!!data);
        setLookupDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, loading, propertySlug]);

  // No user → nothing to look up, and nothing can be "saved." Derived at
  // render time rather than reset via an effect, so there's no synchronous
  // setState call needed for that branch.
  const effectiveSaved = user ? saved : false;
  const checking = loading || (!!user && !lookupDone);

  async function toggle() {
    if (!user) {
      setShowLogin(true);
      return;
    }
    const supabase = createClient();
    if (effectiveSaved) {
      await supabase
        .from("saved_properties")
        .delete()
        .eq("user_id", user.id)
        .eq("property_slug", propertySlug);
      setSaved(false);
    } else {
      await supabase
        .from("saved_properties")
        .insert({ user_id: user.id, property_slug: propertySlug });
      setSaved(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={checking}
        aria-pressed={effectiveSaved}
        className={cn(
          "font-heading inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
          effectiveSaved
            ? "bg-primary text-primary-foreground border-transparent"
            : "hover:bg-muted",
          className
        )}
      >
        <Heart className={cn("size-4", effectiveSaved && "fill-current")} />
        {effectiveSaved ? "Saved" : "Save"}
      </button>

      <AnimatePresence>
        {showLogin && (
          <LoginModal key="save-login" initialMode="signin" onClose={() => setShowLogin(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
