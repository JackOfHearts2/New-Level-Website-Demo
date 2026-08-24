"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";

// Several distinctly different, deliberately large-motion presets — picked
// per-route (not randomly every load) so the same page always transitions
// the same way, but different pages don't all feel like one repeated
// effect. Kept subtle-free on purpose: real travel distance / scale delta,
// not a small nudge, per explicit "be bold, no tiny nudges" direction.
const PRESETS: Variants[] = [
  // Big vertical launch, slight overshoot on the way in.
  {
    initial: { opacity: 0, y: 90, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -60, scale: 0.98 },
  },
  // Punchy zoom — starts oversized and snaps down to size.
  {
    initial: { opacity: 0, scale: 1.14 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  // Horizontal slide-through, like the next page is entering from off-screen.
  {
    initial: { opacity: 0, x: 120 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -120 },
  },
  // Vertical wipe reveal via clip-path — the page "unrolls" into view.
  {
    initial: { opacity: 1, clipPath: "inset(0% 0% 100% 0%)" },
    animate: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
    exit: { opacity: 0, clipPath: "inset(0% 0% 0% 0%)" },
  },
];

function pickPreset(pathname: string) {
  let hash = 0;
  for (let i = 0; i < pathname.length; i++) {
    hash = (hash * 31 + pathname.charCodeAt(i)) | 0;
  }
  return PRESETS[Math.abs(hash) % PRESETS.length];
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const variants = pickPreset(pathname);

  return (
    // mode="wait" previously held the incoming page unmounted until the
    // outgoing page's exit animation fully resolved. On heavier routes
    // (the property page especially - booking widget, Supabase session
    // hooks, photo lightbox all mounting at once) that handoff could get
    // interrupted, leaving the new page's motion.div stuck at its
    // `initial` (opacity: 0) state forever - a real, reproduced bug: the
    // page would flash and then go permanently blank until a hard
    // refresh. Default (sync) mode lets the new page mount and animate in
    // immediately alongside the old page's exit, which avoids that stuck
    // handoff entirely.
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
