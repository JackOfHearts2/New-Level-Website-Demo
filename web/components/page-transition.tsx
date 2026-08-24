"use client";

import { useState } from "react";
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

  // A guaranteed-unique key per navigation, not just `pathname` itself.
  // Confirmed root cause of the real "blank page" bug: AnimatePresence
  // keys its children by this value, and if a second navigation to the
  // same route fires (e.g. an impatient double-click) while the first
  // instance's enter/exit animation for that same key is still in
  // flight, framer-motion's presence bookkeeping collides on the reused
  // key — the earlier instance gets orphaned mid-animation (frozen at
  // its exit style, `opacity: 0`) instead of being cleaned up, while a
  // second, correctly-rendered instance mounts alongside it. Both are
  // plain block-level elements, so the invisible orphaned one (full page
  // height) still occupies layout space and shoves the real, visible
  // page thousands of pixels down off-screen — confirmed directly by
  // inspecting the live DOM after reproducing it. Deriving the key from
  // a counter that only advances when the pathname actually changes
  // means every real navigation gets a fresh key, so this collision
  // can't happen no matter how the navigation was triggered.
  const [lastPathname, setLastPathname] = useState(pathname);
  const [navId, setNavId] = useState(0);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setNavId((n) => n + 1);
  }

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={navId}
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
