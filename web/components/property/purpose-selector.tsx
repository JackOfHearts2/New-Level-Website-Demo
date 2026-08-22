"use client";

import { Briefcase, Users, PartyPopper, HeartHandshake, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowCard, useGlowRing } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { AUDIENCES, AUDIENCE_ORDER, EVENT_TYPES } from "@/lib/content";
import { useBooking, type AudienceId } from "./booking-context";

const ICONS: Record<AudienceId, React.ComponentType<{ className?: string }>> = {
  corporate: Briefcase,
  family: Users,
  events: PartyPopper,
  ministry: HeartHandshake,
  extended: CalendarRange,
};

export function PurposeSelector() {
  const { state, dispatch } = useBooking();

  return (
    <section id="purpose" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
          What brings you here?
        </ShinePill>
        <h2 className="font-heading mt-6 text-3xl font-bold text-balance md:text-4xl">
          Choose the moment you&apos;re planning for.
        </h2>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {AUDIENCE_ORDER.map((id) => {
          const a = AUDIENCES[id];
          const Icon = ICONS[id];
          const selected = state.audience === id;
          return (
            <GlowCard
              key={id}
              onClick={() => dispatch({ type: "SET_AUDIENCE", audience: id })}
              aria-pressed={selected}
              className={cn(
                "hover:-translate-y-1 flex flex-col items-center gap-3 p-6 text-center transition-transform duration-300",
                selected && "border-primary bg-accent"
              )}
            >
              <Icon
                className={cn("size-7", selected ? "text-primary" : "text-foreground")}
              />
              <div>
                <div className="font-heading text-sm font-semibold">{a.navLabel}</div>
                <div className="text-foreground mt-1 text-sm">{a.cardMeta}</div>
              </div>
            </GlowCard>
          );
        })}
      </div>

      {state.audience === "events" && (
        <div className="mx-auto mt-8 max-w-2xl">
          <p className="font-heading text-center text-sm font-medium tracking-wide uppercase">
            What kind of event?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {EVENT_TYPES.map((type) => (
              <EventTypeChip
                key={type}
                type={type}
                selected={state.eventType === type}
                onSelect={() => dispatch({ type: "SET_EVENT_TYPE", value: type })}
              />
            ))}
          </div>
          <label className="mt-4 block text-sm">
            <span className="text-foreground font-heading text-sm font-medium">
              Or describe it in your own words (optional)
            </span>
            <input
              type="text"
              value={state.eventTypeOther}
              onChange={(e) =>
                dispatch({ type: "SET_EVENT_TYPE_OTHER", value: e.target.value })
              }
              placeholder="e.g. Engagement dinner for 20"
              className="border-border placeholder:text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
        </div>
      )}
    </section>
  );
}

function EventTypeChip({
  type,
  selected,
  onSelect,
}: {
  type: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useGlowRing<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "shine-shape font-heading relative rounded-full border px-4 py-1.5 text-sm font-medium transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-0.5",
        selected
          ? "bg-primary border-primary text-primary-foreground"
          : "border-border text-foreground hover:border-primary/50 hover:text-foreground"
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {type}
    </button>
  );
}
