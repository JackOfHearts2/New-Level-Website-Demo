"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AskBrokerModal } from "@/components/ask-broker-modal";

export function AskBrokerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
      >
        Ask Shelley a Question
      </button>
      <AnimatePresence>
        {open && <AskBrokerModal key="ask-broker" onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
