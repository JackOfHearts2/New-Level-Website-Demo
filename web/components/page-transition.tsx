"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { usePathname } from "next/navigation";

// Tracks whether a PageTransition instance has already mounted once in
// this browser session - see the note on `isFirstEver` below for why this
// lives at module scope instead of in state.
let hasMountedOnce = false;

// Several distinctly different, deliberately large-motion presets — picked
// per-route (not randomly every load) so the same page always transitions
// the same way, but different pages don't all feel like one repeated
// effect. Kept subtle-free on purpose: real travel distance, not a small
// nudge, per explicit "be bold, no tiny nudges" direction. Entrance-only
// (no `exit`) — see the note below on why.
//
// Deliberately opacity + translate ONLY here - no `scale`, no `clip-path`.
// Real, reported bug: the property page (by far the tallest/heaviest page
// on the site - ~8500px, dozens of images still loading in on mount)
// looked "janky, jagged, like something lagging" on entrance. `scale`
// (its original preset) and `clip-path` (another preset) both force the
// browser to rasterize/repaint their content on every frame; on a plain
// `translate`/`opacity` animation the browser can composite the layer on
// the GPU without touching its painted content at all, regardless of how
// tall or image-heavy that layer is. `x`/`y` alone still reads as real,
// bold travel distance - it's specifically `scale`/`clip-path` that were
// expensive, not motion in general.
const PRESETS: Variants[] = [
  // Launches up from below.
  {
    initial: { opacity: 0, y: 90 },
    animate: { opacity: 1, y: 0 },
  },
  // Drops in from above.
  {
    initial: { opacity: 0, y: -90 },
    animate: { opacity: 1, y: 0 },
  },
  // Slides in from the right.
  {
    initial: { opacity: 0, x: 120 },
    animate: { opacity: 1, x: 0 },
  },
  // Slides in from the left.
  {
    initial: { opacity: 0, x: -120 },
    animate: { opacity: 1, x: 0 },
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
  // Skip the enter animation on the very first paint of a real page load.
  // Real, reported complaint: the homepage would render its background,
  // pause, pop in an image, pause again, then finally show the headline
  // text - an unpleasant multi-stage reveal. Framer Motion bakes a
  // component's `initial` variant into server-rendered HTML too, so an
  // unconditional `initial="initial"` here meant every fresh page load
  // was ALSO invisible (opacity: 0) until JS hydrated and ran this
  // animation - stacking an extra, avoidable delay in front of whatever
  // the page's own content was already doing (the homepage hero's own
  // staggered reveal, tightened separately for the same complaint).
  // `initial={false}` skips straight to the `animate` state instead - but
  // only the first instance mounted per page load should get that; a
  // later client-side navigation (a new key, hence a new instance) should
  // still play the bold per-page transition as designed. A lazy `useState`
  // initializer is the React-sanctioned place to run this kind of
  // once-per-instance check: it's guaranteed to run exactly once per
  // mounted instance, so the very first PageTransition in the session
  // reads `hasMountedOnce` as false (matching on both server and client,
  // so no hydration mismatch) and every instance after it reads true.
  const [isFirstEver] = useState(() => {
    const first = !hasMountedOnce;
    hasMountedOnce = true;
    return first;
  });

  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial={isFirstEver ? false : "initial"}
      animate="animate"
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
