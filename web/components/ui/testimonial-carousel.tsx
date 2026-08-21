"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimation,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/glow-card";

type Testimonial = { name: string; role: string; text: string; photo: string };

const SPRING = { type: "spring" as const, stiffness: 100, damping: 30, mass: 0.1 };

function TestimonialFace({
  t,
  angle,
  radius,
  faceWidth,
}: Readonly<{ t: Testimonial; angle: number; radius: number; faceWidth: number }>) {
  return (
    <div
      // backfaceVisibility hidden: unlike the reference demo's plain photos
      // (which look roughly the same mirrored), our cards have real text —
      // without this, a card rotated past 90° shows its mirrored/backwards
      // content instead of just disappearing.
      className="absolute top-0 left-1/2 flex h-full items-center justify-center [backface-visibility:hidden]"
      style={{
        width: faceWidth,
        marginLeft: -faceWidth / 2,
        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
      }}
    >
      <GlowCard className="relative aspect-3/4 w-[92%] overflow-hidden p-0">
        <Image src={t.photo} alt="" fill sizes="300px" className="pointer-events-none object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white">
          <blockquote className="text-sm text-balance">&ldquo;{t.text}&rdquo;</blockquote>
          <div className="mt-3 border-t border-white/20 pt-3">
            <div className="font-heading text-sm font-semibold">{t.name}</div>
            <div className="text-xs text-white/70">{t.role}</div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

export function TestimonialCarousel({
  testimonials,
  className,
}: Readonly<{ testimonials: Testimonial[]; className?: string }>) {
  const count = testimonials.length;
  const angleStep = 360 / count;
  const reduceMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const [faceWidth, setFaceWidth] = useState(260);

  // Cylinder size is derived from the container's own measured width rather
  // than a hardcoded/media-query breakpoint, so it adapts to any layout
  // this component gets dropped into without a separate mobile/desktop case.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      setFaceWidth(Math.min(300, Math.max(220, w * 0.42)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cylinderWidth = faceWidth * count;
  const radius = cylinderWidth / (2 * Math.PI);

  const rotation = useMotionValue(0);
  const transform = useTransform(rotation, (v) => `rotate3d(0, 1, 0, ${v}deg)`);
  const controls = useAnimation();

  function step(direction: 1 | -1) {
    controls.stop();
    controls.start({
      rotateY: rotation.get() - direction * angleStep,
      transition: reduceMotion ? { duration: 0 } : SPRING,
    });
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        ref={containerRef}
        className="relative h-[22rem] w-full sm:h-[26rem]"
        style={{ perspective: "1200px" }}
      >
        <div
          className="flex h-full items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            drag="x"
            dragElastic={0.06}
            className="relative flex h-full origin-center w-full cursor-grab justify-center active:cursor-grabbing"
            style={{
              transform,
              rotateY: rotation,
              transformStyle: "preserve-3d",
            }}
            onDrag={(_, info) => rotation.set(rotation.get() + info.offset.x * 0.05)}
            onDragEnd={(_, info) => {
              controls.start({
                rotateY: rotation.get() + info.velocity.x * 0.05,
                transition: reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 100, damping: 30, mass: 0.1 },
              });
            }}
            animate={controls}
          >
            {testimonials.map((t, i) => (
              <TestimonialFace
                key={t.name}
                t={t}
                angle={i * angleStep}
                radius={radius}
                faceWidth={faceWidth}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous testimonial"
          className="border-border hover:border-primary/50 hover:text-primary flex size-10 items-center justify-center rounded-full border transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next testimonial"
          className="border-border hover:border-primary/50 hover:text-primary flex size-10 items-center justify-center rounded-full border transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
