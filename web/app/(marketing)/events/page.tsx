import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { EventCtaSection } from "@/components/sections/event-cta-section";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { cn } from "@/lib/utils";
import { PAGES, EVENTS_CALENDAR, EVENT_CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "Events · New Level",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

export default function EventsPage() {
  const page = PAGES.events;

  const eventsByDate = new Map(EVENTS_CALENDAR.map((e) => [e.date, e]));

  // Open on the first *upcoming* event's month, not always the first entry —
  // otherwise the calendar goes stale/empty once that entry's date passes.
  const todayKey = new Date().toISOString().slice(0, 10);
  const upcoming = EVENTS_CALENDAR.find((e) => e.date >= todayKey);
  const anchorDate = upcoming?.date ?? EVENTS_CALENDAR[0]?.date;
  const [anchorYear, anchorMonth] = (anchorDate ?? todayKey).split("-").map(Number);
  const year = anchorYear;
  const month = anchorMonth - 1;
  const cells = buildMonthGrid(year, month);
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} sub={page.sub} />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <GlowCard className="h-fit p-6">
          <h2 className="font-heading text-center font-semibold">{monthLabel}</h2>
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

        <div className="space-y-4">
          {EVENTS_CALENDAR.map((event) => (
            <GlowCard
              key={event.date + event.title}
              href="/contact"
              className="hover:border-primary/50 hover:-translate-y-1 block p-6 transition-all duration-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading font-semibold">{event.title}</h3>
                <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-3 py-1 text-sm font-semibold uppercase">
                  {event.type}
                </ShinePill>
              </div>
              <p className="text-foreground mt-2 text-sm">
                {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {event.time}
              </p>
              <p className="text-foreground mt-2 text-sm">{event.blurb}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <EventCtaSection eventCta={EVENT_CTA} />
      </section>

      <CrossNav current="events" />
    </>
  );
}
