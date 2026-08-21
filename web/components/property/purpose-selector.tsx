"use client";

import { Briefcase, Users, PartyPopper, HeartHandshake, CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
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
        <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
          What brings you here?
        </span>
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
            <button
              key={id}
              type="button"
              onClick={() => dispatch({ type: "SET_AUDIENCE", audience: id })}
              aria-pressed={selected}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1",
                selected
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Icon
                className={cn("size-7", selected ? "text-primary" : "text-muted-foreground")}
              />
              <div>
                <div className="font-heading text-sm font-semibold">{a.navLabel}</div>
                <div className="text-muted-foreground mt-1 text-xs">{a.cardMeta}</div>
              </div>
            </button>
          );
        })}
      </div>

      {state.audience === "events" && (
        <div className="mx-auto mt-8 max-w-2xl">
          <p className="font-heading text-center text-xs font-medium tracking-wide uppercase">
            What kind of event?
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {EVENT_TYPES.map((type) => {
              const selected = state.eventType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => dispatch({ type: "SET_EVENT_TYPE", value: type })}
                  aria-pressed={selected}
                  className={cn(
                    "font-heading rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                    selected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {type}
                </button>
              );
            })}
          </div>
          <label className="mt-4 block text-sm">
            <span className="text-muted-foreground font-heading text-xs font-medium">
              Or describe it in your own words (optional)
            </span>
            <input
              type="text"
              value={state.eventTypeOther}
              onChange={(e) =>
                dispatch({ type: "SET_EVENT_TYPE_OTHER", value: e.target.value })
              }
              placeholder="e.g. Engagement dinner for 20"
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </label>
        </div>
      )}
    </section>
  );
}
