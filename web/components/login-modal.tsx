"use client";

import { motion } from "framer-motion";
import { LoginForm } from "@/components/ui/login-form";

// Overlay shell for LoginForm, same click-outside/spring-entrance mechanics
// as ContactIntakeModal — kept as a separate wrapper so LoginForm itself
// stays a plain, portable card component.
export function LoginModal({
  onClose,
  onSuccess,
  initialMode = "signin",
}: {
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: "signin" | "signup";
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <LoginForm onClose={onClose} onSuccess={onSuccess} initialMode={initialMode} />
      </motion.div>
    </motion.div>
  );
}
