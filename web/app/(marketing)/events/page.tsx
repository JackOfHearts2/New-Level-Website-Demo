import type { Metadata } from "next";
import { EventsHero } from "@/components/events-hero";
import { CrossNav } from "@/components/cross-nav";
import { EventCtaSection } from "@/components/sections/event-cta-section";
import { EventsFilterableSection } from "@/components/events-filterable";
import { PAGES, EVENTS_CALENDAR, EVENT_CTA } from "@/lib/content";

export const metadata: Metadata = {
  title: "Events · New Level",
};

export default function EventsPage() {
  const page = PAGES.events;

  return (
    <>
      <EventsHero eyebrow={page.eyebrow} heading={page.heading} sub={page.sub} />

      <EventsFilterableSection events={EVENTS_CALENDAR} />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <EventCtaSection eventCta={EVENT_CTA} />
      </section>

      <CrossNav current="events" />
    </>
  );
}
