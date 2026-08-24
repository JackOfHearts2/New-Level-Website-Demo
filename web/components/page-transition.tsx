"use client";

import { motion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";

// Several distinctly different, deliberately large-motion presets — picked
// per-route (not randomly every load) so the same page always transitions
// the same way, but different pages don't all feel like one repeated
// effect. Kept subtle-free on purpose: real travel distance / scale delta,
// not a small nudge, per explicit "be bold, no tiny nudges" direction.
// Entrance-only (no `exit`) — see the note below on why.
const PRESETS: Variants[] = [
  // Big vertical launch, slight overshoot on the way in.
  {
    initial: { opacity: 0, y: 90, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
  },
  // Punchy zoom — starts oversized and snaps down to size.
  {
    initial: { opacity: 0, scale: 1.14 },
    animate: { opacity: 1, scale: 1 },
  },
  // Horizontal slide-through, like the next page is entering from off-screen.
  {
    initial: { opacity: 0, x: 120 },
    animate: { opacity: 1, x: 0 },
  },
  // Vertical wipe reveal via clip-path — the page "unrolls" into view.
  {
    initial: { opacity: 1, clipPath: "inset(0% 0% 100% 0%)" },
    animate: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
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

  // Deliberately NOT using AnimatePresence/exit here. Confirmed root cause
  // of a real, reproduced bug: two rapid navigations to the same route
  // (an impatient double-click on a link, which is completely ordinary
  // real-visitor behavior) could leave AnimatePresence with two DOM nodes
  // for the same page at once - one visible, one an invisible orphaned
  // "ghost" still frozen mid-exit-animation and still taking up full
  // page height in the layout. On a short page that's just harmless
  // extra scroll space below the fold; on the property page (by far the
  // tallest page on the site) that ghost landed *above* the real content
  // and pushed it thousands of pixels down, off-screen - reproduced
  // directly, and confirmed via computed-style inspection of the live
  // DOM. Giving the wrapper a guaranteed-unique key per navigation did
  // NOT fix it (reproduced again after that fix, and again on a
  // different, simpler page), because AnimatePresence's exit lifecycle
  // is what keeps a "removed" child mounted in the DOM at all - that
  // lingering-on-purpose window is exactly what gave the race a chance
  // to leave a visible duplicate behind. Without `exit` (and without
  // AnimatePresence, which is only needed to animate elements *out*),
  // React tears down the old page's DOM synchronously the instant the
  // key changes, the same way it would for any other keyed element - so
  // there's no window in which a duplicate can be left behind, no matter
  // how the navigation was triggered. This keeps a real per-page
  // entrance animation; it just doesn't get an exit choreography anymore.
  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
