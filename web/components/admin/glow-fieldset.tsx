"use client";

import { Eye } from "lucide-react";
import { useGlowRing } from "@/components/ui/glow-card";
import { cn } from "@/lib/utils";

/** Same visual/interaction language as the public site's GlowCard
 *  (components/ui/glow-card.tsx) — the shared cursor-tracking ring +
 *  resting/hover shadow recipe already defined in globals.css's .glow-card
 *  rules — adapted to a <fieldset>/<legend> shape for admin forms, since
 *  GlowCard itself only renders div/Link/button. Per the client's explicit
 *  "I do want everything of that on this side as well" (2026-08-26), admin
 *  cards get the same reactive treatment as public-site cards, not a
 *  toned-down version — see [[feedback_everything_should_react]]. */
export function GlowFieldset({
  legend,
  children,
  className,
  onPreview,
}: {
  legend: string;
  children: React.ReactNode;
  className?: string;
  /** Shows an eye-icon button beside the legend — click to preview just
   *  this section as it'll render live, before saving. Client ask
   *  (2026-08-26): editors need to see how a section looks before
   *  submitting, not just after. */
  onPreview?: () => void;
}) {
  const ref = useGlowRing<HTMLDivElement>();
  const headingId = `section-${legend.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;

  return (
    // A real <fieldset>/<legend> pair used to render this — client report
    // (2026-08-27): "the border design... doesn't actually line up around
    // the borders" and "the first portion... is too big." Root cause:
    // <legend> has special browser-defined layout that makes it straddle
    // the fieldset's own border-top rather than sit inside it like normal
    // flowed content — there's no clean way to fully override that via
    // CSS while keeping a real <legend>, and it directly fights a rounded
    // custom border design like this one. A plain div + heading (with
    // role="group"/aria-labelledby standing in for the semantics a real
    // fieldset/legend would have given screen readers) sidesteps the
    // browser quirk entirely instead of fighting it.
    <div
      ref={ref}
      role="group"
      aria-labelledby={headingId}
      className={cn("glow-card relative space-y-4 rounded-2xl border border-border bg-card p-6", className)}
    >
      <span className="glow-card__ring" aria-hidden />
      <div id={headingId} className="font-heading flex items-center gap-2 text-base font-semibold">
        {legend}
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            aria-label={`Preview ${legend} section`}
            title={`Preview ${legend} section`}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-6 items-center justify-center rounded-full transition-colors"
          >
            <Eye className="size-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
