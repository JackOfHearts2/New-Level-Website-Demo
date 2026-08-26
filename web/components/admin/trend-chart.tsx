"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, Minus, Download, RefreshCw } from "lucide-react";
import { computeTrend } from "@/lib/chart-data";

export type TrendPoint = { date: string; label: string; count: number };

const WIDTH = 720;
const DEFAULT_HEIGHT = 160;
const PAD_LEFT = 28;
const PAD_BOTTOM = 20;
const PAD_TOP = 10;

function TrendBadge({ direction, deltaPct }: { direction: "up" | "down" | "flat"; deltaPct: number | null }) {
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const colorClass =
    direction === "up"
      ? "bg-primary/10 text-primary"
      : direction === "down"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${colorClass}`}>
      <Icon className="size-3.5" />
      {deltaPct === null ? (direction === "up" ? "Trending up" : direction === "down" ? "Trending down" : "Flat") : `${deltaPct > 0 ? "+" : ""}${deltaPct.toFixed(0)}%`}
    </span>
  );
}

function downloadCsv(data: TrendPoint[]) {
  const rows = ["date,label,pageviews", ...data.map((d) => `${d.date},"${d.label}",${d.count}`)];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pageviews.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** Single-series magnitude-over-time chart — a smoothed line + gradient-
 *  filled area (client design references, 2026-08-27: a composed sales
 *  chart with a fading area fill and a small export/refresh toolbar — "the
 *  examples were the charts... obviously gonna go through the admin side
 *  where we have our charts"). Same one-hue-no-legend-needed rule (a
 *  single series names itself via the card heading) and the same
 *  hover-crosshair+tooltip pattern the dataviz interaction guidance calls
 *  for on line/area charts. Used for both the Dashboard's compact
 *  Pageviews card and the full Analytics page's Traffic section (client
 *  ask, 2026-08-27: "you're still using a bar graph in the full analytics
 *  while using the chart with an arrow on the dashboard" — this replaced
 *  the separate bar-chart component (DailyViewsChart, since deleted) so
 *  both views share one chart type; `height` lets Analytics render it
 *  taller than the Dashboard's compact card without duplicating the
 *  component). */
export function TrendChart({ data, height = DEFAULT_HEIGHT }: { data: TrendPoint[]; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const gradientId = useId();
  const router = useRouter();
  const max = Math.max(1, ...data.map((d) => d.count));
  const plotW = WIDTH - PAD_LEFT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;
  const mid = Math.round(max / 2);
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;
  const trend = useMemo(() => computeTrend(data.map((d) => d.count)), [data]);

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
      <div className="mb-2 flex items-center justify-end gap-2">
        <TrendBadge direction={trend.direction} deltaPct={trend.deltaPct} />
        <button
          type="button"
          onClick={() => downloadCsv(data)}
          aria-label="Export as CSV"
          title="Export as CSV"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-full transition-colors"
        >
          <Download className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => router.refresh()}
          aria-label="Refresh"
          title="Refresh"
          className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-full transition-colors"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full"
        role="img"
        aria-label="Pageviews over time"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
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
        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
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
            <text key={d.date} x={PAD_LEFT + i * stepX} y={height - 4} fontSize={9} fill="var(--muted-foreground)">
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
            top: `${(points[hover].y / height) * 100}%`,
          }}
        >
          <span className="font-heading font-semibold">{data[hover].count}</span> views · {data[hover].label}
        </div>
      )}
    </div>
  );
}
