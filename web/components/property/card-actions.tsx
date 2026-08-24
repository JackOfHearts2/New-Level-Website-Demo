"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedProperty } from "@/lib/supabase/use-saved-property";
import { useShare } from "@/lib/use-share";
import { LoginModal } from "@/components/login-modal";

const ICON_BTN =
  "flex size-9 items-center justify-center rounded-full bg-white/90 text-black shadow-sm transition-colors hover:bg-white";

// Compact save + share cluster for a listing card's photo, seamlessly
// tucked into the corner rather than the property page's full-text Save
// button. Sits as a sibling of the card's <Link> (see how it's used in
// properties/page.tsx), not nested inside it, so clicking these never
// double-fires the card's own navigation.
export function CardActions({
  propertySlug,
  href,
  shareTitle,
  className,
}: {
  propertySlug: string;
  href: string;
  shareTitle: string;
  className?: string;
}) {
  const { saved, checking, toggle } = useSavedProperty(propertySlug);
  // Absolute URL computed at share-time (client-only) rather than passed
  // in from the server, so this works the same on any environment/domain
  // this ends up deployed to without hardcoding one.
  const { share, copied } = useShare(
    typeof window !== "undefined" ? `${window.location.origin}${href}` : href,
    shareTitle
  );
  const [showLogin, setShowLogin] = useState(false);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = await toggle();
    if (result === "needs-auth") setShowLogin(true);
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    share();
  }

  return (
    <div
      className={cn("absolute top-3 right-3 z-10 flex items-center gap-2", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share this property"
          className={ICON_BTN}
        >
          {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
        </button>
        {copied && (
          <span className="font-heading absolute top-full right-0 mt-1.5 rounded-md bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white">
            Link copied
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={checking}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved properties" : "Save this property"}
        className={cn(ICON_BTN, "disabled:opacity-60", saved && "bg-primary text-primary-foreground")}
      >
        <Heart className={cn("size-4", saved && "fill-current")} />
      </button>

      <AnimatePresence>
        {showLogin && (
          <LoginModal key="card-save-login" initialMode="signin" onClose={() => setShowLogin(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
