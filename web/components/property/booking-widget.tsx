"use client";

import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/ui/glow-card";
import {
  EVENT_MIN_HOURS,
  EVENT_PACKAGES,
  EVENT_ADDONS,
  RATE_TIERS,
} from "@/lib/content";
import { isBlocked, useBooking, type Tier } from "./booking-context";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function minToTime(min: number) {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => i * 30);

function sameDay(a: Date | null, b: Date | null) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = new Date(year, month, 1).getDay();
  const cells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function MonthGrid({ monthDate }: { monthDate: Date }) {
  const { state, dispatch, today } = useBooking();
  const cells = buildMonthCells(monthDate);
  const label = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="font-heading text-center text-sm font-semibold">{label}</div>
      <div className="text-muted-foreground mt-3 grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="invisible" />;
          const blocked = isBlocked(date, today);
          const isStart = sameDay(date, state.start);
          const isEnd = sameDay(date, state.end);
          const inRange =
            !!state.start &&
            !!state.end &&
            date > state.start &&
            date < state.end;
          const isToday = sameDay(date, today);
          return (
            <button
              key={i}
              type="button"
              disabled={blocked || !state.tier}
              aria-label={blocked ? `${date.toDateString()} — unavailable` : date.toDateString()}
              onClick={() => dispatch({ type: "PICK_DATE", date, today })}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                blocked && "text-muted-foreground/40 cursor-not-allowed line-through",
                !blocked && !state.tier && "text-muted-foreground/60 cursor-not-allowed",
                !blocked && state.tier && !isStart && !isEnd && "hover:bg-muted cursor-pointer",
                (isStart || isEnd) && "bg-primary text-primary-foreground font-heading font-semibold",
                inRange && "bg-accent",
                isToday && !isStart && !isEnd && "ring-primary/50 ring-1"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BookingWidget() {
  const { state, dispatch } = useBooking();

  return (
    <GlowCard className="p-6">
      <h3 className="font-heading text-lg font-bold">Choose your rate</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(Object.values(RATE_TIERS) as (typeof RATE_TIERS)[keyof typeof RATE_TIERS][]).map((t) => {
          const selected = state.tier === t.id;
          return (
            <GlowCard
              key={t.id}
              onClick={() => dispatch({ type: "SET_TIER", tier: t.id as Tier })}
              aria-pressed={selected}
              className={cn(
                "rounded-xl p-4 text-left",
                selected && "border-primary bg-accent"
              )}
            >
              <div className="font-heading font-semibold">
                {"base" in t
                  ? `$${t.base.toLocaleString()} flat`
                  : `$${t.perNight.toLocaleString()} / night`}
              </div>
              <div className="text-muted-foreground text-sm">{t.label}</div>
              <div className="text-muted-foreground/80 mt-1 text-xs">{t.blurb}</div>
            </GlowCard>
          );
        })}
      </div>

      {state.tier && (
        <>
          <div className="mt-8">
            <h3 className="font-heading text-lg font-bold">
              {state.tier === "event" ? "Select your check-in & check-out" : "Select your dates"}
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {state.tier === "event"
                ? `Pick your check-in date, then your check-out date (${EVENT_MIN_HOURS}-hour minimum — usually the next day). Set the times below.`
                : "Pick a check-in date, then a check-out date. Ranges can't span an unavailable night."}
            </p>

            {state.tier === "event" && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="text-muted-foreground font-heading text-xs font-medium">
                    Check-in time
                  </span>
                  <select
                    value={state.checkinMin}
                    onChange={(e) =>
                      dispatch({ type: "SET_CHECKIN_MIN", value: Number(e.target.value) })
                    }
                    className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    {TIME_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {minToTime(m)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="text-muted-foreground font-heading text-xs font-medium">
                    Check-out time
                  </span>
                  <select
                    value={state.checkoutMin}
                    onChange={(e) =>
                      dispatch({ type: "SET_CHECKOUT_MIN", value: Number(e.target.value) })
                    }
                    className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    {TIME_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {minToTime(m)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => dispatch({ type: "NAV_MONTH", delta: -1 })}
                className="text-muted-foreground hover:text-foreground text-sm font-medium"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "NAV_MONTH", delta: 1 })}
                className="text-muted-foreground hover:text-foreground text-sm font-medium"
              >
                Next →
              </button>
            </div>
            <div className="mt-3 grid gap-6 sm:grid-cols-2">
              <MonthGrid monthDate={state.calendarView} />
              <MonthGrid
                monthDate={
                  new Date(state.calendarView.getFullYear(), state.calendarView.getMonth() + 1, 1)
                }
              />
            </div>
          </div>

          {state.tier === "event" && (
            <div className="mt-8">
              <h3 className="font-heading text-lg font-bold">Choose a package</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {EVENT_PACKAGES.map((pkg) => {
                  const selected = state.packageId === pkg.id;
                  return (
                    <GlowCard
                      key={pkg.id}
                      onClick={() => dispatch({ type: "SET_PACKAGE", id: pkg.id })}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-xl p-4 text-left",
                        selected && "border-primary bg-accent"
                      )}
                    >
                      {pkg.popular && (
                        <span className="bg-primary text-primary-foreground font-heading absolute -top-2 right-4 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                          Popular
                        </span>
                      )}
                      <div className="font-heading font-semibold">
                        {pkg.label} — {pkg.price ? `$${pkg.price.toLocaleString()}` : "Included"}
                      </div>
                      <div className="text-muted-foreground text-xs">{pkg.tagline}</div>
                      {pkg.includes.length > 0 && (
                        <div className="text-muted-foreground/80 mt-2 text-xs">
                          Includes:{" "}
                          {pkg.includes
                            .map((id) => EVENT_ADDONS.find((a) => a.id === id)?.label)
                            .join(", ")}
                        </div>
                      )}
                    </GlowCard>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </GlowCard>
  );
}
