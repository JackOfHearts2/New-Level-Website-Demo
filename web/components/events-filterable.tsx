"use client";

import { useMemo, useState } from "react";
import { Camera } from "lucide-react";
import { EventsCalendar } from "@/components/events-calendar";
import { GlowCard, useGlowRing } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { cn } from "@/lib/utils";
import type { EVENTS_CALENDAR } from "@/lib/content";

// Same filter-tab visual as ContentLibraryGrid/TeamRoster/TestimonialRoster
// — client ask (2026-08-27): "add the filters" everywhere with multiple
// items, "as the company grows." Filtering by type narrows the calendar's
// marked days along with both lists below it, so the whole section stays
// in sync with one control rather than three separate ones.
function TypeFilterTab({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  const ref = useGlowRing<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "shine-shape font-heading relative rounded-full px-4 py-2 text-sm font-semibold transition-[color,background-color,transform] duration-300 hover:-translate-y-0.5",
        selected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {label}
    </button>
  );
}

export function EventsFilterableSection({ events }: { events: typeof EVENTS_CALENDAR }) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const types = useMemo(() => Array.from(new Set(events.map((e) => e.type))), [events]);
  const filtered = activeType ? events.filter((e) => e.type === activeType) : events;

  // Open on the first *upcoming* event's month, not always the first entry
  // — otherwise the calendar goes stale/empty once that entry's date
  // passes. Recomputed from the filtered set so switching the filter jumps
  // the calendar to wherever that type's next event actually is.
  const todayKey = new Date().toISOString().slice(0, 10);
  const upcoming = filtered.find((e) => e.date >= todayKey);
  const anchorDate = upcoming?.date ?? filtered[0]?.date ?? todayKey;
  const [anchorYear, anchorMonth] = anchorDate.split("-").map(Number);

  const upcomingEvents = filtered.filter((event) => event.date >= todayKey);
  const pastEvents = filtered
    .filter((event) => event.date < todayKey)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      {types.length > 1 && (
        <div className="mx-auto max-w-6xl px-6">
          <div role="tablist" aria-label="Filter by event type" className="flex flex-wrap justify-center gap-2">
            <TypeFilterTab label="All" selected={activeType === null} onSelect={() => setActiveType(null)} />
            {types.map((type) => (
              <TypeFilterTab key={type} label={type} selected={activeType === type} onSelect={() => setActiveType(type)} />
            ))}
          </div>
        </div>
      )}

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-8 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <EventsCalendar events={filtered} initialYear={anchorYear} initialMonth={anchorMonth - 1} />

        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming events in this category right now.</p>
          ) : (
            upcomingEvents.map((event) => (
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
            ))
          )}
        </div>
      </section>

      {pastEvents.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="font-heading text-center text-2xl font-bold">Past Events</h2>
          <p className="text-foreground mx-auto mt-2 max-w-xl text-center text-sm">
            A look back at what we&apos;ve hosted. Photo albums for past events are added as they
            come in.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((event) => (
              <GlowCard key={event.date + event.title} className="overflow-hidden p-0">
                {event.photoAlbumPending ? (
                  <div className="bg-muted flex aspect-video flex-col items-center justify-center gap-2">
                    <Camera className="text-muted-foreground size-6" aria-hidden />
                    <span className="text-muted-foreground text-xs font-medium">Photos coming soon</span>
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-heading font-semibold">{event.title}</h3>
                    <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-3 py-1 text-xs font-semibold uppercase">
                      {event.type}
                    </ShinePill>
                  </div>
                  <p className="text-foreground mt-2 text-sm">
                    {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-foreground mt-2 text-sm">{event.blurb}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
