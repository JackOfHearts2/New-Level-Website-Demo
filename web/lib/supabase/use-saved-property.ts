"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/use-session";

// Shared save/unsave logic (saved_properties table, RLS-scoped to the
// signed-in user) — used by both the full-text Save button on the property
// page and the icon-only version on listing cards, so there's one place
// that actually talks to Supabase for this.
export function useSavedProperty(propertySlug: string) {
  const { user, loading } = useSession();
  const [saved, setSaved] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);

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
      .then(
        ({ data }) => {
          if (cancelled) return;
          setSaved(!!data);
          setLookupDone(true);
        },
        (err) => {
          if (cancelled) return;
          console.error("saved_properties lookup failed:", err);
          setLookupDone(true);
        }
      );
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
    if (!user) return "needs-auth" as const;
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
    return "ok" as const;
  }

  return { saved: effectiveSaved, checking, toggle, signedIn: !!user };
}
