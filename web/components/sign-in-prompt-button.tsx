"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { LoginModal } from "@/components/login-modal";

export function SignInPromptButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold"
      >
        Sign In
      </button>
      <AnimatePresence>
        {open && <LoginModal key="saved-signin" initialMode="signin" onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
