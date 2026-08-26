const SIZE = 140;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

/** Single-value progress ring — a third, distinct chart form alongside the
 *  time-series trend and the categorical donut (client ask, 2026-08-26:
 *  "a couple different other types of graphs... to illustrate other
 *  aspects"). For a lone value there's nothing to compare against another
 *  hue, so this stays single-color rather than reaching for a legend. */
export function RadialProgress({
  value,
  label,
  sublabel,
}: {
  /** 0-100, or null when there's not enough data yet. */
  value: number | null;
  label: string;
  sublabel?: string;
}) {
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * CIRC;

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label={`${label}: ${value === null ? "no data" : `${Math.round(pct)}%`}`}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={STROKE} />
        {value !== null && (
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${CIRC - dash}`}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        )}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={26} fontWeight={700} fill="var(--foreground)">
          {value === null ? "—" : `${Math.round(pct)}%`}
        </text>
      </svg>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {sublabel && <p className="text-muted-foreground text-xs">{sublabel}</p>}
      </div>
    </div>
  );
}
