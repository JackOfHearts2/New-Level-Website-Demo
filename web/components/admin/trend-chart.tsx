"use client";

import { useMemo, useState } from "react";

export type TrendPoint = { date: string; label: string; count: number };

const WIDTH = 720;
const HEIGHT = 160;
const PAD_LEFT = 28;
const PAD_BOTTOM = 20;
const PAD_TOP = 10;

/** Single-series magnitude-over-time chart — a smoothed line + filled area,
 *  distinct from DailyViewsChart's bars (client ask, 2026-08-26: "we use a
 *  couple different other types of graphs," not just the bar chart
 *  everywhere). Same one-hue-no-legend-needed rule (a single series names
 *  itself via the card heading) and the same hover-crosshair+tooltip
 *  pattern the dataviz interaction guidance calls for on line/area charts. */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const plotW = WIDTH - PAD_LEFT;
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const mid = Math.round(max / 2);
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        x: PAD_LEFT + i * stepX,
        y: PAD_TOP + plotH - (d.count / max) * plotH,
      })),
    [data, max, plotH, stepX]
  );

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + plotH} L ${points[0].x} ${PAD_TOP + plotH} Z`
      : "";

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHover(nearest);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Pageviews over time"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {[0, mid, max].map((v, i) => {
          const y = PAD_TOP + plotH - (v / max) * plotH;
          return (
            <g key={i}>
              <line x1={PAD_LEFT} x2={WIDTH} y1={y} y2={y} stroke="var(--border)" strokeWidth={1} />
              <text x={0} y={y + 3} fontSize={9} fill="var(--muted-foreground)">
                {v}
              </text>
            </g>
          );
        })}
        {areaPath && <path d={areaPath} fill="var(--primary)" opacity={0.12} />}
        {linePath && <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
        {hover !== null && (
          <line
            x1={points[hover].x}
            x2={points[hover].x}
            y1={PAD_TOP}
            y2={PAD_TOP + plotH}
            stroke="var(--muted-foreground)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
        {points.map((p, i) =>
          i === hover ? (
            <circle key={data[i].date} cx={p.x} cy={p.y} r={4} fill="var(--primary)" stroke="var(--card)" strokeWidth={2} />
          ) : null
        )}
        {data.map((d, i) =>
          i % Math.ceil(data.length / 6) === 0 ? (
            <text key={d.date} x={PAD_LEFT + i * stepX} y={HEIGHT - 4} fontSize={9} fill="var(--muted-foreground)">
              {d.label}
            </text>
          ) : null
        )}
      </svg>
      {hover !== null && (
        <div
          className="border-border bg-background pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border px-2 py-1 text-xs whitespace-nowrap shadow-md"
          style={{
            left: `${(points[hover].x / WIDTH) * 100}%`,
            top: `${(points[hover].y / HEIGHT) * 100}%`,
          }}
        >
          <span className="font-heading font-semibold">{data[hover].count}</span> views · {data[hover].label}
        </div>
      )}
    </div>
  );
}
