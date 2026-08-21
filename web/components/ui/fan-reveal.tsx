"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const ROTATION_STEP = 8;
const MAX_ROTATION = 24;
const ARC_STEP = 16;
const MAX_ARC = 48;
// How far (px) each unit of distance-from-focus pulls a card horizontally.
// This single constant is *also* the resting overlap between adjacent
// cards (their relative shift is always exactly 1 * X_STEP, regardless of
// focus) — kept at the same tightness validated last round to avoid
// covering card text, rather than tuned for a bigger slide. The "recenter"
// feel comes mainly from ROTATION_STEP/ARC_STEP instead, which don't carry
// that same clipping risk since they don't pull neighbor cards over text.
const X_STEP = 20;

type Slot = { rotate: number; x: number; y: number; z: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// A continuous function of (index, focusIndex) rather than a lookup table,
// so an arbitrary number of cards still reads as one coherent fan, and
// re-centers smoothly on whichever card currently has focus.
function slotFor(index: number, focusIndex: number): Slot {
  const d = index - focusIndex;
  return {
    rotate: clamp(d * ROTATION_STEP, -MAX_ROTATION, MAX_ROTATION),
    x: -d * X_STEP,
    y: Math.min(Math.abs(d) * ARC_STEP, MAX_ARC),
    z: Math.round(100 - Math.abs(d) * 10),
  };
}

const SPRING = { type: "spring" as const, stiffness: 220, damping: 28 };

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

export function FanReveal({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  const reduceMotion = useReducedMotion();
  const items = React.Children.toArray(children);
  const count = items.length;
  const defaultFocus = (count - 1) / 2;
  const [focusIndex, setFocusIndex] = React.useState(defaultFocus);

  // x/rotate are excluded from the "hidden" -> "visible" delta (identical in
  // both) so only opacity/y/blur animate on the initial scroll-reveal; once
  // "visible" is resolved, a focus change still re-targets x/y/rotate and
  // framer-motion smoothly interpolates to the new target from wherever the
  // card currently sits — that's what produces the hover-recenter slide.
  const item: Variants = {
    hidden: (slot: Slot) =>
      reduceMotion
        ? { opacity: 1, x: slot.x, y: slot.y, rotate: slot.rotate, filter: "blur(0px)" }
        : { opacity: 0, x: slot.x, y: slot.y + 40, rotate: slot.rotate, filter: "blur(8px)" },
    visible: (slot: Slot) => ({
      opacity: 1,
      x: slot.x,
      y: slot.y,
      rotate: slot.rotate,
      filter: "blur(0px)",
      transition: reduceMotion ? { duration: 0 } : SPRING,
    }),
  };

  return (
    <motion.div
      // Generous horizontal padding is a safety buffer so a card's
      // hover-recenter x-shift never gets clipped by overflow-x-auto — the
      // padding is included in the scrollable content box even though it's
      // empty at rest, unlike a transform-only shift which isn't.
      className={cn(
        "flex justify-center overflow-x-auto px-12 py-4 [scrollbar-width:none] sm:px-16 [&::-webkit-scrollbar]:hidden",
        className
      )}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      onMouseLeave={() => setFocusIndex(defaultFocus)}
    >
      {items.map((child, i) => {
        const slot = slotFor(i, focusIndex);
        return (
          <motion.div
            key={i}
            tabIndex={0}
            className="shrink-0 outline-none"
            style={{ zIndex: slot.z }}
            custom={slot}
            variants={item}
            onMouseEnter={() => setFocusIndex(i)}
            onFocus={() => setFocusIndex(i)}
            onClick={() => setFocusIndex(i)}
          >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
