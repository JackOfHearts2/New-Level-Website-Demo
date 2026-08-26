"use client";

import { useState } from "react";

export type DonutSlice = { label: string; value: number; color: string };

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;
// Surface-color gap between adjacent segments, same spacer idea as the 2px
// gap between stacked bar segments — keeps slices visually separated
// instead of reading as one solid ring.
const GAP = 3;

/** Categorical proportion chart (submissions by status) — one hue per
 *  category, direct-labeled legend (never color-alone identity), a
 *  per-segment hover highlight synced between the ring and the legend row.
 *  Colors are passed in by the caller (status-reserved colors, not a
 *  generated/cycled palette) so this component stays generic. */
export function DonutChart({ slices, title }: { slices: DonutSlice[]; title: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const visible = slices.filter((s) => s.value > 0);
  const total = visible.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <p className="text-muted-foreground text-sm">No data yet.</p>;
  }

  const segments = visible.reduce<Array<DonutSlice & { dash: number; offset: number; share: number }>>(
    (acc, s) => {
      const cursor = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].share * CIRC : 0;
      const share = s.value / total;
      const full = share * CIRC;
      acc.push({ ...s, dash: Math.max(0, full - GAP), offset: cursor, share });
      return acc;
    },
    []
  );

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={title}
        className="-rotate-90 shrink-0"
      >
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        {segments.map((s, i) => (
          <circle
            key={s.label}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={s.color}
            strokeWidth={hover === i ? STROKE + 4 : STROKE}
            strokeDasharray={`${s.dash} ${CIRC - s.dash}`}
            strokeDashoffset={-s.offset}
            className="cursor-default transition-[stroke-width]"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <ul className="min-w-0 space-y-1.5 text-sm">
        {segments.map((s, i) => (
          <li
            key={s.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center gap-2 ${hover === i ? "text-foreground font-semibold" : ""}`}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
            <span className="truncate">{s.label}</span>
            <span className="text-muted-foreground ml-auto shrink-0">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
