/** Trims leading zero-count days off a daily time series so a chart's
 *  visible window starts where real activity actually begins, instead of
 *  padding out to the full rolling window with a long flat baseline
 *  followed by a sudden rise the moment real traffic starts (client ask,
 *  2026-08-27: the Pageviews graph "starts from August thirteenth, and
 *  it's just flat and then a sharp rise on August twenty fifth... looks
 *  weird"). Self-adjusting rather than a hardcoded start date — it always
 *  trims to wherever the real data currently begins, so this doesn't need
 *  revisiting as more days of real traffic accumulate.
 *
 *  `minKeep` stops the trim early rather than ever collapsing the chart to
 *  a single point (or nothing, if every day is still zero) — it keeps
 *  trimming only while at least that many days would remain afterward. */
export function trimLeadingZeroDays<T extends { count: number }>(points: T[], minKeep = 3): T[] {
  let start = 0;
  while (start < points.length - minKeep && points[start].count === 0) start++;
  return points.slice(start);
}

export type Trend = { direction: "up" | "down" | "flat"; deltaPct: number | null };

/** Compares the average of the first half of a series against the second
 *  half to give a simple up/down/flat read — client ask (2026-08-27):
 *  "it could be like an arrow that shows the trend as well, if it's
 *  trending up, trending down." Deliberately coarse (two-bucket average,
 *  not a regression) — this is a glance-able indicator next to a chart
 *  that already shows the real shape, not a standalone stat. */
export function computeTrend(counts: number[]): Trend {
  if (counts.length < 2) return { direction: "flat", deltaPct: null };
  const mid = Math.floor(counts.length / 2);
  const avg = (arr: number[]) => arr.reduce((sum, n) => sum + n, 0) / arr.length;
  const before = avg(counts.slice(0, mid));
  const after = avg(counts.slice(mid));
  if (before === 0) {
    if (after === 0) return { direction: "flat", deltaPct: null };
    return { direction: "up", deltaPct: null }; // can't express a % change off a zero base
  }
  const deltaPct = ((after - before) / before) * 100;
  if (Math.abs(deltaPct) < 5) return { direction: "flat", deltaPct };
  return { direction: deltaPct > 0 ? "up" : "down", deltaPct };
}
