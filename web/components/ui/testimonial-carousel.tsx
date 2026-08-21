"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/glow-card";

type Testimonial = { name: string; role: string; text: string; photo: string };

const SPRING = { type: "spring" as const, stiffness: 220, damping: 28 };

function TestimonialCard({
  t,
  d,
  expanded,
  isFocus,
  count,
  reduceMotion,
}: Readonly<{
  t: Testimonial;
  d: number;
  expanded: boolean;
  isFocus: boolean;
  count: number;
  reduceMotion: boolean | null;
}>) {
  // Wide enough apart when expanded that each card's own bottom-text zone
  // never overlaps a neighbor's — unlike the idle stack (pure z-order, no
  // text needs to be legible on the buried cards), every expanded card
  // needs to be independently readable.
  const x = expanded ? d * 190 : d * 14;
  const y = expanded ? Math.abs(d) * 14 : Math.abs(d) * 4;
  const rotate = expanded ? d * 10 : d * 3;
  const scale = expanded && isFocus ? 1.05 : 1;
  const z = Math.round(count - Math.abs(d));

  return (
    // Two layers: the outer div does the static (non-animated) centering
    // via a plain CSS -translate-x-1/2, which adapts automatically to the
    // card's responsive width. Framer-motion's own animate={{x,y,rotate}}
    // fully owns the transform on the inner element, so the two never
    // fight over the same `transform` property.
    <div className="absolute top-0 left-1/2 w-56 -translate-x-1/2 sm:w-64" style={{ zIndex: z }}>
      <motion.div
        animate={{ x, y, rotate, scale }}
        transition={reduceMotion ? { duration: 0 } : SPRING}
      >
        {/* Non-focus cards stay fully opaque (never see-through) — every
            card sits at its own z-index and must fully cover whatever's
            behind it, or overlapping text garbles together. De-emphasis
            comes from a darker scrim instead of opacity. */}
        <GlowCard className="relative aspect-3/4 w-full overflow-hidden p-0">
          <Image
            src={t.photo}
            alt=""
            fill
            sizes="256px"
            className="object-cover"
          />
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent transition-opacity duration-300",
              expanded && !isFocus && "from-black/95 via-black/40"
            )}
          />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <blockquote className="text-sm text-balance">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <div className="mt-3 border-t border-white/20 pt-3">
              <div className="font-heading text-sm font-semibold">{t.name}</div>
              <div className="text-xs text-white/70">{t.role}</div>
            </div>
          </div>
        </GlowCard>
      </motion.div>
    </div>
  );
}

export function TestimonialCarousel({
  testimonials,
  className,
}: Readonly<{ testimonials: Testimonial[]; className?: string }>) {
  const [expanded, setExpanded] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const count = testimonials.length;

  function go(direction: 1 | -1) {
    setFocusIndex((i) => (i + direction + count) % count);
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        role="group"
        aria-label="Testimonials — hover or tap to see them all"
        className="relative h-[22rem] w-full sm:h-[26rem]"
        // No separate onClick: touch devices already fire a synthetic
        // mouseenter before the click on tap, so a click handler here would
        // immediately toggle the deck straight back closed on every tap —
        // onMouseEnter alone covers hover (desktop) and tap (touch) both.
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {testimonials.map((t, i) => (
          <TestimonialCard
            key={t.name}
            t={t}
            d={i - focusIndex}
            expanded={expanded}
            isFocus={i === focusIndex}
            count={count}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous testimonial"
          className="border-border hover:border-primary/50 hover:text-primary flex size-10 items-center justify-center rounded-full border transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next testimonial"
          className="border-border hover:border-primary/50 hover:text-primary flex size-10 items-center justify-center rounded-full border transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
