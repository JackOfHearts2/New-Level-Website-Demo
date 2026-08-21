"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const ROTATION_STEP = 6;
const MAX_ROTATION = 18;
const ARC_STEP = 14;
const MAX_ARC = 42;

type Slot = { rotate: number; y: number; z: number; overlap: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// A continuous function of (index, count) rather than a lookup table, so an
// arbitrary number of cards still reads as one coherent fan — center-most
// card sits highest/flattest, others arc down and rotate out symmetrically.
function slotFor(index: number, count: number): Slot {
  const center = (count - 1) / 2;
  const d = index - center;
  return {
    rotate: clamp(d * ROTATION_STEP, -MAX_ROTATION, MAX_ROTATION),
    y: Math.min(Math.abs(d) * ARC_STEP, MAX_ARC),
    z: Math.round((center - Math.abs(d)) * 10),
    // Shallow enough that a stacked neighbor's edge never covers a card's
    // own padded text content, unlike Hero10's plain-photo fan where deep
    // overlap doesn't matter because there's no text near the edges.
    overlap: count > 5 ? 12 : 18,
  };
}

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

  const item: Variants = {
    hidden: (slot: Slot) =>
      reduceMotion
        ? { opacity: 1, y: slot.y, filter: "blur(0px)" }
        : { opacity: 0, y: slot.y + 40, filter: "blur(8px)" },
    visible: (slot: Slot) => ({
      opacity: 1,
      y: slot.y,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      // A single row that scrolls horizontally rather than wraps — wrapping
      // would break the overlap/rotation math, which assumes one row.
      className={cn("flex overflow-x-auto px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {items.map((child, i) => {
        const slot = slotFor(i, count);
        return (
          <div
            key={i}
            className="relative"
            style={{ zIndex: slot.z, marginLeft: i === 0 ? 0 : -slot.overlap }}
          >
            {/* rotate is static resting geometry, applied via style and never
                animated — only opacity/y/blur animate on reveal, via variants */}
            <motion.div style={{ rotate: slot.rotate }} custom={slot} variants={item}>
              {child}
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
}
