"use client";

import { useState } from "react";

export type DailyPoint = { date: string; label: string; count: number };

const WIDTH = 720;
const HEIGHT = 160;
const PAD_LEFT = 28;
const PAD_BOTTOM = 20;
const PAD_TOP = 10;

/** Single-series magnitude bar chart (daily pageviews) — one hue, thin
 *  bars, 4px rounded data-ends anchored to the baseline, a muted
 *  baseline/gridline, and a per-bar hover tooltip. No legend needed for a
 *  single series — the section heading already names it. */
export function DailyViewsChart({ data }: { data: DailyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const plotW = WIDTH - PAD_LEFT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const barGap = 2;
  const barW = Math.max(2, plotW / data.length - barGap);
  const mid = Math.round(max / 2);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Daily pageviews over the last 30 days"
      >
        {[0, mid, max].map((v, i) => {
          const y = PAD_TOP + plotH - (v / max) * plotH;
          return (
            <g key={i}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
              />
              <text x={0} y={y + 3} fontSize={9} fill="var(--muted-foreground)">
                {v}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = PAD_LEFT + i * (plotW / data.length) + barGap / 2;
          const h = (d.count / max) * plotH;
          const y = PAD_TOP + plotH - h;
          const isHover = hover === i;
          return (
            <rect
              key={d.date}
              x={x}
              y={h === 0 ? y - 1 : y}
              width={barW}
              height={Math.max(h, 1)}
              rx={4}
              fill={isHover ? "var(--foreground)" : "var(--primary)"}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
        {data.map((d, i) =>
          i % 5 === 0 ? (
            <text
              key={d.date}
              x={PAD_LEFT + i * (plotW / data.length)}
              y={HEIGHT - 4}
              fontSize={9}
              fill="var(--muted-foreground)"
            >
              {d.label}
            </text>
          ) : null
        )}
      </svg>
      {hover !== null && (
        <div
          className="border-border bg-background pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border px-2 py-1 text-xs whitespace-nowrap shadow-md"
          style={{
            left: `${((PAD_LEFT + hover * (plotW / data.length) + barW / 2) / WIDTH) * 100}%`,
            top: `${((PAD_TOP + plotH - (data[hover].count / max) * plotH) / HEIGHT) * 100}%`,
          }}
        >
          <span className="font-heading font-semibold">{data[hover].count}</span> views ·{" "}
          {data[hover].label}
        </div>
      )}
    </div>
  );
}
