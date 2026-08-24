import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { EventCtaSection } from "@/components/sections/event-cta-section";
import { EventsCalendar } from "@/components/events-calendar";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { PAGES, EVENTS_CALENDAR, EVENT_CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "Events · New Level",
};

export default function EventsPage() {
  const page = PAGES.events;

  // Open on the first *upcoming* event's month, not always the first entry —
  // otherwise the calendar goes stale/empty once that entry's date passes.
  const todayKey = new Date().toISOString().slice(0, 10);
  const upcoming = EVENTS_CALENDAR.find((e) => e.date >= todayKey);
  const anchorDate = upcoming?.date ?? EVENTS_CALENDAR[0]?.date;
  const [anchorYear, anchorMonth] = (anchorDate ?? todayKey).split("-").map(Number);

  return (
    <>
      <PageHero eyebrow={page.eyebrow} heading={page.heading} sub={page.sub} />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <EventsCalendar
          events={EVENTS_CALENDAR}
          initialYear={anchorYear}
          initialMonth={anchorMonth - 1}
        />

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
