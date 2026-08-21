"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// One shared pointermove listener for every mounted GlowCard, rAF-throttled,
// rather than one listener per card. Each card reads its own bounding rect
// fresh on each tick and derives its own glow opacity from distance — the
// listener itself carries no per-card state.
type Tick = () => void;
const listeners = new Set<Tick>();
let pointerX = -9999;
let pointerY = -9999;
let rafId: number | null = null;
let attached = false;

function runTicks() {
  rafId = null;
  listeners.forEach((tick) => tick());
}

function scheduleTick() {
  if (rafId == null) rafId = requestAnimationFrame(runTicks);
}

function ensurePointerListener() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      scheduleTick();
    },
    { passive: true }
  );
}

// Distance (in px, beyond the card's own edge) at which the glow ring has
// fully faded out. 0 at the edge, 1 (full opacity) once the cursor is over
// the card itself.
const FIELD_RADIUS = 120;

function useGlowRing<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    ensurePointerListener();

    const tick: Tick = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const localX = pointerX - rect.left;
      const localY = pointerY - rect.top;
      const dx = Math.max(0, -localX, localX - rect.width);
      const dy = Math.max(0, -localY, localY - rect.height);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const opacity = Math.max(0, 1 - dist / FIELD_RADIUS);
      el.style.setProperty("--glow-x", `${localX}px`);
      el.style.setProperty("--glow-y", `${localY}px`);
      el.style.setProperty("--glow-opacity", opacity.toFixed(3));
    };

    listeners.add(tick);
    return () => {
      listeners.delete(tick);
    };
  }, []);

  return ref;
}

type GlowCardProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  "aria-pressed"?: boolean;
  "aria-label"?: string;
};

// Shadow lives in globals.css (.glow-card / :root.dark .glow-card / hover
// states) instead of a static Tailwind arbitrary value, since dark mode
// needs a genuinely different shadow recipe (a plain black shadow is
// invisible against an already-dark page), not just a color-token swap.
const BASE_CLASSES = "glow-card relative rounded-2xl border border-border bg-card";

export function GlowCard({
  children,
  className,
  id,
  href,
  target,
  rel,
  onClick,
  "aria-pressed": ariaPressed,
  "aria-label": ariaLabel,
}: GlowCardProps) {
  // All three hooks run unconditionally either way (Rules of Hooks) — only
  // whichever ref actually attaches to a rendered element does anything.
  const divRef = useGlowRing<HTMLDivElement>();
  const linkRef = useGlowRing<HTMLAnchorElement>();
  const buttonRef = useGlowRing<HTMLButtonElement>();

  if (href) {
    return (
      <Link
        ref={linkRef}
        id={id}
        href={href}
        target={target}
        rel={rel}
        className={cn(BASE_CLASSES, className)}
      >
        <span className="glow-card__ring" aria-hidden />
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={onClick}
        aria-pressed={ariaPressed}
        aria-label={ariaLabel}
        className={cn(BASE_CLASSES, "text-left", className)}
      >
        <span className="glow-card__ring" aria-hidden />
        {children}
      </button>
    );
  }

  return (
    <div ref={divRef} id={id} className={cn(BASE_CLASSES, className)}>
      <span className="glow-card__ring" aria-hidden />
      {children}
    </div>
  );
}
