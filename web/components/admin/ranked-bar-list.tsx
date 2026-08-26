/** Ranked magnitude list (top pages, per-editor submission counts) — one
 *  hue, direct-labeled, no legend needed since each row already names its
 *  own entity. Bar width is relative to the top row, not an absolute
 *  scale, since these lists are always "top N of a larger set." */
export function RankedBarList({
  rows,
}: {
  rows: { label: string; value: number; sublabel?: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">No data yet.</p>;
  }

  return (
    <ul className="space-y-1">
      {rows.map((r) => (
        <li key={r.label} className="group hover:bg-muted/60 -mx-2 rounded-lg px-2 py-1.5 transition-colors">
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">
              {r.label}
              {r.sublabel && <span className="text-muted-foreground ml-1.5 font-normal">{r.sublabel}</span>}
            </span>
            <span className="font-heading shrink-0 font-semibold">{r.value}</span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div
              className="bg-primary group-hover:bg-foreground h-full rounded-full transition-colors"
              style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
