"use client";

import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { useGlowRing } from "@/components/ui/glow-card";
import { ContactIntakeModal } from "@/components/contact-intake-modal";
import { AiChatWidget } from "@/components/ai-chat-widget";

function FloatingButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const ref = useGlowRing<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`shine-shape relative flex size-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 ${className}`}
    >
      <span className="glow-card__ring" aria-hidden />
      {children}
    </button>
  );
}

// bottom-24 on mobile clears the fixed MobileDock (and property's
// StickyBookingBar) at bottom-4; lg:bottom-6 once neither of those is
// competing for the same corner.
export function FloatingActions() {
  const [open, setOpen] = useState<"contact" | "chat" | null>(null);

  return (
    <>
      <div className="fixed right-4 bottom-24 z-40 flex flex-col gap-3 sm:right-6 lg:bottom-6">
        <FloatingButton
          label="Chat with New Level"
          onClick={() => setOpen(open === "chat" ? null : "chat")}
          className="bg-foreground text-background"
        >
          <Sparkles className="size-5" />
        </FloatingButton>
        <FloatingButton
          label="Contact New Level"
          onClick={() => setOpen(open === "contact" ? null : "contact")}
          className="bg-primary text-primary-foreground"
        >
          <MessageCircle className="size-5" />
        </FloatingButton>
      </div>

      {open === "contact" && <ContactIntakeModal onClose={() => setOpen(null)} />}
      {open === "chat" && <AiChatWidget onClose={() => setOpen(null)} />}
    </>
  );
}
