"use client";

import { useGlowRing } from "@/components/ui/glow-card";
import { cn } from "@/lib/utils";

// Reuses GlowCard's shared cursor-proximity ring (see glow-card.tsx /
// .glow-card__ring in globals.css — border-radius:inherit makes it work on
// any shape, not just cards) for small text-in-shape elements — eyebrow
// pills, avatar/icon circles — that were reading as flat everywhere except
// the homepage. Client asked explicitly, more than once, for every such
// shape sitewide to get some reactive hover treatment.
//
// `lift` is opt-in: only pass it for shapes that are themselves part of a
// real click target (a chip/button). Plain decorative or label shapes (an
// eyebrow pill, an initials avatar) get the glow only, no translateY, so
// hover doesn't imply an interaction that isn't there — see the hover
// convention documented in the project's CLAUDE.md.

export function ShinePill({
  children,
  className,
  lift = false,
}: {
  children: React.ReactNode;
  className?: string;
  lift?: boolean;
}) {
  const ref = useGlowRing<HTMLSpanElement>();
  return (
    <span
      ref={ref}
      className={cn(
        "shine-shape relative inline-block",
        lift && "transition-transform duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {children}
    </span>
  );
}

export function ShineCircle({
  children,
  className,
  lift = false,
}: {
  children: React.ReactNode;
  className?: string;
  lift?: boolean;
}) {
  const ref = useGlowRing<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        "shine-shape relative",
        lift && "transition-transform duration-300 hover:-translate-y-0.5",
        className
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {children}
    </div>
  );
}
