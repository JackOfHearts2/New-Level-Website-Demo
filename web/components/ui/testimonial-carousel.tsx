"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
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
            <div className="text-sm text-white">{t.role}</div>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

// The reference this is built from uses 14 images around the ring, which is
// what makes it read as a genuine circular carousel — several faces visible
// at once, one entering as another exits the side. With only a handful of
// real testimonials, spacing them at (360 / count) degrees leaves too few
// faces visible to read as anything but a flat swap. Repeating the real
// set around the ring (same content, more faces) restores that density
// without inventing fake testimonials.
//
// Density is responsive, not a single constant: on the narrow (mobile)
// layout the original ~3-visible-at-once density already reads fine and
// the client confirmed it should stay as-is there — it's only the
// desktop width where 3 felt small. DESKTOP_MIN_FACES packs the ring
// denser (more faces, smaller angle step) so 5-6 read clearly at once,
// with a wider perspective so the side faces foreshorten more gently
// instead of curving out of view too quickly.
const MOBILE_MIN_FACES = 9;
const DESKTOP_MIN_FACES = 16;
const DESKTOP_BREAKPOINT = 640;

export function TestimonialCarousel({
  testimonials,
  className,
}: Readonly<{ testimonials: Testimonial[]; className?: string }>) {
  const reduceMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  // Cylinder size is derived from the container's own measured width rather
  // than a hardcoded/media-query breakpoint, so it adapts to any layout
  // this component gets dropped into without a separate mobile/desktop case
  // for sizing — only the face *count* below branches on width.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isDesktop = containerWidth >= DESKTOP_BREAKPOINT;
  const minFaces = isDesktop ? DESKTOP_MIN_FACES : MOBILE_MIN_FACES;
  const repeatCount = Math.max(1, Math.ceil(minFaces / testimonials.length));
  const faces = Array.from({ length: repeatCount }, () => testimonials).flat();
  const count = faces.length;
  const angleStep = 360 / count;

  // Smaller cards at the same density leave more of them legible within
  // the visible arc, rather than the front 1-2 dominating and the rest
  // curving out of frame almost immediately.
  const faceWidth = isDesktop
    ? Math.min(220, Math.max(150, containerWidth * 0.24))
    : Math.min(260, Math.max(180, containerWidth * 0.32));

  const cylinderWidth = faceWidth * count;
  const radius = cylinderWidth / (2 * Math.PI);

  const rotation = useMotionValue(0);
  const activeAnimation = useRef<ReturnType<typeof animate> | null>(null);

  // rotateY is bound directly to the `rotation` MotionValue via style below,
  // so animating it has to go through `animate(rotation, ...)` (the
  // standalone imperative animate, operating on that exact MotionValue) —
  // not useAnimation()'s controls.start({ rotateY: ... }), which drives its
  // own internal value under the "rotateY" key and never touches `rotation`
  // at all. That mismatch was the actual bug behind "the arrows don't do
  // anything": step() and the post-drag momentum fling were both calling
  // controls.start() and silently animating a value nothing reads from.
  function animateTo(target: number) {
    activeAnimation.current?.stop();
    activeAnimation.current = animate(rotation, target, reduceMotion ? { duration: 0 } : SPRING);
  }

  function step(direction: 1 | -1) {
    animateTo(rotation.get() - direction * angleStep);
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        ref={containerRef}
        className="relative h-[22rem] w-full sm:h-[26rem]"
        style={{ perspective: isDesktop ? "1700px" : "1200px" }}
      >
        <div
          className="flex h-full items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            // onPan (not drag="x"): `drag` always applies its own gesture
            // delta as a translateX on the element in addition to whatever
            // else is in its transform — that's what was pulling the whole
            // ring sideways off-center instead of it staying put with only
            // the cards rotating around the middle. onPan gives the same
            // pointer delta/velocity data without any automatic transform
            // of its own, leaving rotateY (bound to `rotation`) as the only
            // thing driving this element's transform.
            className="relative flex h-full origin-center w-full cursor-grab touch-pan-y justify-center active:cursor-grabbing"
            style={{
              rotateY: rotation,
              transformStyle: "preserve-3d",
            }}
            onPanStart={() => activeAnimation.current?.stop()}
            // info.offset is cumulative since the drag started, not a
            // per-frame delta — adding it into rotation on every pointermove
            // tick (the previous code) compounded every tick, so the total
            // rotation ballooned quadratically with drag distance and
            // depended on how many move events fired, not on how far the
            // mouse actually moved. info.delta is the true per-tick change,
            // which is what should accumulate into rotation.
            onPan={(_, info) => rotation.set(rotation.get() + info.delta.x * 0.3)}
            onPanEnd={(_, info) => animateTo(rotation.get() + info.velocity.x * 0.15)}
          >
            {faces.map((t, i) => (
              <TestimonialFace
                key={`${t.name}-${i}`}
                t={t}
                angle={i * angleStep}
                radius={radius}
                faceWidth={faceWidth}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-10">
        <motion.button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous testimonial"
          whileHover={reduceMotion ? undefined : { scale: 1.1, y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.85 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="border-border bg-card hover:border-primary hover:bg-primary hover:text-primary-foreground flex size-14 items-center justify-center rounded-full border shadow-sm transition-colors"
        >
          <ChevronLeft className="size-6" />
        </motion.button>
        <motion.button
          type="button"
          onClick={() => step(1)}
          aria-label="Next testimonial"
          whileHover={reduceMotion ? undefined : { scale: 1.1, y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.85 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="border-border bg-card hover:border-primary hover:bg-primary hover:text-primary-foreground flex size-14 items-center justify-center rounded-full border shadow-sm transition-colors"
        >
          <ChevronRight className="size-6" />
        </motion.button>
      </div>
    </div>
  );
}
