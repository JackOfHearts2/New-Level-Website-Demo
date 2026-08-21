"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/glow-card";

type Testimonial = { name: string; role: string; text: string };

export function TestimonialCarousel({
  testimonials,
  className,
}: Readonly<{ testimonials: Testimonial[]; className?: string }>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = testimonials[activeIndex];

  function go(direction: 1 | -1) {
    setActiveIndex((i) => (i + direction + testimonials.length) % testimonials.length);
  }

  return (
    <GlowCard className={cn("p-8", className)}>
      <div
        role="tablist"
        aria-label="Testimonials"
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {testimonials.map((t, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={t.name}
              id={`testimonial-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="testimonial-panel"
              onClick={() => setActiveIndex(i)}
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              className={cn(
                "font-heading flex size-14 items-center justify-center rounded-full text-lg font-bold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {t.name
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </button>
          );
        })}
      </div>

      <motion.div
        layout
        id="testimonial-panel"
        role="tabpanel"
        aria-live="polite"
        aria-labelledby={`testimonial-tab-${activeIndex}`}
        className="mt-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
          >
            <blockquote className="text-foreground text-balance text-center text-lg">
              &ldquo;{active.text}&rdquo;
            </blockquote>
            <div className="mt-4 text-center">
              <div className="font-heading text-sm font-semibold">{active.name}</div>
              <div className="text-muted-foreground text-xs">{active.role}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

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
    </GlowCard>
  );
}
