"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlowRing } from "@/components/ui/glow-card";
import { AiChatWidget } from "@/components/ai-chat-widget";

const DIAL_ITEMS = [
  { id: "chat" as const, label: "Chat with us", icon: Sparkles, className: "bg-foreground text-background" },
  { id: "contact" as const, label: "Contact us", icon: MessageCircle, className: "bg-primary text-primary-foreground" },
];

function DialButton({
  label,
  icon: Icon,
  onClick,
  className,
  index,
}: {
  label: string;
  icon: typeof MessageCircle;
  onClick: () => void;
  className: string;
  index: number;
}) {
  const ref = useGlowRing<HTMLButtonElement>();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.4 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.4 }}
      transition={{ type: "spring", stiffness: 420, damping: 22, delay: index * 0.07 }}
      className="flex items-center justify-end gap-3"
    >
      <span className="bg-foreground text-background font-heading rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg">
        {label}
      </span>
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`shine-shape border-background relative flex size-14 items-center justify-center rounded-full border-4 shadow-xl transition-transform hover:scale-110 ${className}`}
      >
        <span className="glow-card__ring" aria-hidden />
        <Icon className="size-6" />
      </button>
    </motion.div>
  );
}

// On mobile/tablet the trigger now sits at the same bottom-4 height as the
// MobileDock, sized down to match its size-11 icons (rather than floating
// above it at its own larger size) — per client feedback. lg:bottom-6 +
// lg:size-16 once the dock is gone (MobileDock hides at lg: too, matching
// the breakpoint SiteHeader actually switches to the desktop nav at) and
// it can be its own larger, independently-placed element again.
export function FloatingActions() {
  const router = useRouter();
  const [dialOpen, setDialOpen] = useState(false);
  const [modal, setModal] = useState<"chat" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // /property has its own edge-to-edge StickyBookingBar at this same
  // bottom-4 spot (replacing the MobileDock there) — bump up to clear it
  // instead of sitting on top of it.
  const onPropertyPage = usePathname() === "/property";

  useEffect(() => {
    if (!dialOpen) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setDialOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDialOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [dialOpen]);

  return (
    <>
      <div
        ref={rootRef}
        data-tour="contact"
        className={cn(
          "fixed right-4 z-40 flex flex-col items-end gap-4 lg:right-6 lg:bottom-6",
          onPropertyPage ? "bottom-24 lg:bottom-6" : "bottom-4"
        )}
      >
        <AnimatePresence>
          {dialOpen &&
            DIAL_ITEMS.map((item, i) => (
              <DialButton
                key={item.id}
                label={item.label}
                icon={item.icon}
                className={item.className}
                index={i}
                onClick={() => {
                  setDialOpen(false);
                  // "Contact us" goes straight to the real /contact page —
                  // it has the full point-of-contact info (phone included)
                  // and topic selector; the standalone quick-contact modal
                  // this used to open was a thinner duplicate of it.
                  if (item.id === "contact") {
                    router.push("/contact");
                  } else {
                    setModal(item.id);
                  }
                }}
              />
            ))}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setDialOpen((v) => !v)}
          aria-label={dialOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={dialOpen}
          animate={dialOpen ? { rotate: 135 } : { rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-primary text-primary-foreground border-background animate-fab-pulse relative flex size-11 items-center justify-center rounded-full border-2 shadow-2xl lg:size-16 lg:border-4"
        >
          <Plus className="size-4 lg:size-7" strokeWidth={2.5} />
        </motion.button>
      </div>

      <AnimatePresence>
        {modal === "chat" && <AiChatWidget key="chat" onClose={() => setModal(null)} />}
      </AnimatePresence>
    </>
  );
}
