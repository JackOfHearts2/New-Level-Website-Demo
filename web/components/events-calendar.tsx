"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard, useGlowRing } from "@/components/ui/glow-card";
import type { EVENTS_CALENDAR } from "@/lib/content";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function NavButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const ref = useGlowRing<HTMLButtonElement>();
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous month" : "Next month"}
      className="glow-card border-border text-foreground hover:bg-muted relative flex size-8 items-center justify-center rounded-full border transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span className="glow-card__ring" aria-hidden />
      <Icon className="size-4" />
    </button>
  );
}

export function EventsCalendar({
  events,
  initialYear,
  initialMonth,
}: {
  events: typeof EVENTS_CALENDAR;
  initialYear: number;
  initialMonth: number;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [pickerOpen, setPickerOpen] = useState(false);

  const eventsByDate = new Map(events.map((e) => [e.date, e]));
  const cells = buildMonthGrid(year, month);
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function navMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  const yearOptions = Array.from({ length: 6 }, (_, i) => initialYear - 1 + i);

  return (
    <GlowCard className="h-fit p-6">
      <div className="flex items-center justify-between gap-2">
        <NavButton direction="prev" onClick={() => navMonth(-1)} />
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
          className="font-heading hover:text-primary text-center text-sm font-semibold transition-colors"
        >
          {monthLabel}
        </button>
        <NavButton direction="next" onClick={() => navMonth(1)} />
      </div>

      {pickerOpen && (
        <div className="mt-3 flex justify-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Select month"
            className="border-border bg-background text-foreground rounded-lg border px-2 py-1 text-sm outline-none"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={m} value={i} className="bg-background text-foreground">
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Select year"
            className="border-border bg-background text-foreground rounded-lg border px-2 py-1 text-sm outline-none"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y} className="bg-background text-foreground">
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="text-foreground mt-4 grid grid-cols-7 gap-1 text-center text-sm font-medium">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const key = day ? toDateKey(year, month, day) : null;
          const event = key ? eventsByDate.get(key) : undefined;
          return (
            <div
              key={i}
              title={event ? `${event.title}: ${event.time}` : undefined}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg text-sm",
                day == null && "invisible",
                event
                  ? "bg-primary text-primary-foreground font-heading font-semibold"
                  : "text-foreground"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </GlowCard>
  );
}
