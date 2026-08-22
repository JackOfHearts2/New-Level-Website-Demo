"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Plus, Sparkles } from "lucide-react";
import { useGlowRing } from "@/components/ui/glow-card";
import { ContactIntakeModal } from "@/components/contact-intake-modal";
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
      <span className="bg-foreground text-background font-heading rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg">
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

// bottom-24 on mobile clears the fixed MobileDock (and property's
// StickyBookingBar) at bottom-4; lg:bottom-6 once neither of those is
// competing for the same corner. Collapsed to a single trigger instead of
// two icons permanently camped in the corner — per client feedback that two
// always-visible circles looked awkward, especially on mobile.
export function FloatingActions() {
  const [dialOpen, setDialOpen] = useState(false);
  const [modal, setModal] = useState<"contact" | "chat" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

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
        className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-4 sm:right-6 lg:bottom-6"
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
                  setModal(item.id);
                  setDialOpen(false);
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
          className="bg-primary text-primary-foreground border-background animate-fab-pulse relative flex size-16 items-center justify-center rounded-full border-4 shadow-2xl"
        >
          <Plus className="size-7" strokeWidth={2.5} />
        </motion.button>
      </div>

      <AnimatePresence>
        {modal === "contact" && (
          <ContactIntakeModal key="contact" onClose={() => setModal(null)} />
        )}
        {modal === "chat" && <AiChatWidget key="chat" onClose={() => setModal(null)} />}
      </AnimatePresence>
    </>
  );
}
