"use client";

import { createContext, useContext, useMemo, useReducer } from "react";
import {
  AUDIENCE_ORDER,
  EVENT_DEFAULT_CHECKIN_MIN,
  EVENT_DEFAULT_CHECKOUT_MIN,
  EVENT_MIN_HOURS,
  EVENT_PACKAGES,
  RATE_TIERS,
  SECURITY_DEPOSIT,
  TAX,
} from "@/lib/content";

export type AudienceId = (typeof AUDIENCE_ORDER)[number];
export type Tier = "event" | "stay";

const DAY_MS = 86400000;

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function nextDay(d: Date) {
  const n = new Date(d);
  n.setDate(n.getDate() + 1);
  return n;
}

// Deterministic per calendar day — not real availability data. Ported
// verbatim from the old site's buildAvailability(): a Knuth multiplicative
// hash of the epoch-day number, so the same date always blocks/unblocks
// the same way across reloads (roughly 19.6% of days come back blocked).
export function isBlocked(date: Date, today: Date) {
  if (date < today) return true;
  const seed = Math.floor(date.getTime() / DAY_MS);
  let h = (seed * 2654435761) % 97;
  if (h < 0) h += 97;
  return h < 19;
}

function rangeHasBlocked(start: Date, end: Date, today: Date) {
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    if (isBlocked(d, today)) return true;
  }
  return false;
}

export type BookingState = {
  audience: AudienceId | null;
  eventType: string | null;
  eventTypeOther: string;
  tier: Tier | null;
  start: Date | null;
  end: Date | null;
  checkinMin: number;
  checkoutMin: number;
  packageId: string;
  calendarView: Date;
};

export type BookingAction =
  | { type: "SET_AUDIENCE"; audience: AudienceId }
  | { type: "SET_EVENT_TYPE"; value: string | null }
  | { type: "SET_EVENT_TYPE_OTHER"; value: string }
  | { type: "SET_TIER"; tier: Tier }
  | { type: "PICK_DATE"; date: Date; today: Date }
  | { type: "SET_PACKAGE"; id: string }
  | { type: "NAV_MONTH"; delta: 1 | -1 }
  | { type: "SET_CHECKIN_MIN"; value: number }
  | { type: "SET_CHECKOUT_MIN"; value: number };

function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_AUDIENCE":
      return { ...state, audience: action.audience };
    case "SET_EVENT_TYPE":
      return { ...state, eventType: action.value };
    case "SET_EVENT_TYPE_OTHER":
      return { ...state, eventTypeOther: action.value };
    case "SET_TIER":
      return { ...state, tier: action.tier, start: null, end: null };
    case "SET_PACKAGE":
      return { ...state, packageId: action.id };
    case "SET_CHECKIN_MIN":
      return { ...state, checkinMin: action.value };
    case "SET_CHECKOUT_MIN":
      return { ...state, checkoutMin: action.value };
    case "NAV_MONTH": {
      const v = new Date(state.calendarView);
      v.setMonth(v.getMonth() + action.delta);
      return { ...state, calendarView: v };
    }
    case "PICK_DATE": {
      const { date, today } = action;
      if (!state.tier) return state;
      if (state.tier === "event") {
        if (!state.start) return { ...state, start: date, end: nextDay(date) };
        if (date > state.start && !rangeHasBlocked(state.start, date, today)) {
          return { ...state, end: date };
        }
        return { ...state, start: date, end: nextDay(date) };
      }
      // stay tier — classic two-click range picker
      if (!state.start || (state.start && state.end)) {
        return { ...state, start: date, end: null };
      }
      if (date <= state.start || rangeHasBlocked(state.start, date, today)) {
        return { ...state, start: date, end: null };
      }
      return { ...state, end: date };
    }
    default:
      return state;
  }
}

function initialState(): BookingState {
  const now = new Date();
  return {
    audience: null,
    eventType: null,
    eventTypeOther: "",
    tier: null,
    start: null,
    end: null,
    checkinMin: EVENT_DEFAULT_CHECKIN_MIN,
    checkoutMin: EVENT_DEFAULT_CHECKOUT_MIN,
    packageId: "self",
    calendarView: new Date(now.getFullYear(), now.getMonth(), 1),
  };
}

export type Quote =
  | { status: "no-tier" }
  | { status: "need-checkin" }
  | { status: "need-checkout" }
  | { status: "below-minimum"; message: string }
  | {
      status: "ok";
      tier: Tier;
      tierLabel: string;
      checkIn: Date;
      checkOut: Date;
      nights?: number;
      hours?: number;
      rentalBase: number;
      taxLines: { key: string; label: string; rate: number; amount: number }[];
      taxTotal: number;
      cdtAmount: number;
      cdtLabel: string;
      pkg: (typeof EVENT_PACKAGES)[number] | null;
      addonsTotal: number;
      totalNumeric: number;
      deposit: typeof SECURITY_DEPOSIT | null;
      cancelCutoff: Date;
    };

export function computeQuote(state: BookingState): Quote {
  if (!state.tier) return { status: "no-tier" };

  let rentalBase: number;
  let nights: number | undefined;
  let hours: number | undefined;

  if (state.tier === "event") {
    if (!state.start) return { status: "need-checkin" };
    if (!state.end) return { status: "need-checkout" };
    const ciDT = new Date(state.start);
    ciDT.setHours(0, state.checkinMin, 0, 0);
    const coDT = new Date(state.end);
    coDT.setHours(0, state.checkoutMin, 0, 0);
    hours = Math.round((coDT.getTime() - ciDT.getTime()) / 3600000);
    if (hours < EVENT_MIN_HOURS) {
      return {
        status: "below-minimum",
        message: `Event rentals are a ${EVENT_MIN_HOURS}-hour minimum — pick a check-out at least ${EVENT_MIN_HOURS} hours after check-in (e.g. 3:00 PM to 3:00 PM the next day).`,
      };
    }
    rentalBase = RATE_TIERS.event.base;
  } else {
    if (!state.start) return { status: "need-checkin" };
    if (!state.end) return { status: "need-checkout" };
    nights = Math.round((state.end.getTime() - state.start.getTime()) / DAY_MS);
    rentalBase = RATE_TIERS.stay.perNight * nights;
  }

  const taxLines = TAX.lines.map((t) => ({ ...t, amount: rentalBase * t.rate }));
  const taxTotal = taxLines.reduce((a, t) => a + t.amount, 0);
  const cdtAmount = rentalBase * TAX.cdt.rate;
  const pkg =
    state.tier === "event"
      ? (EVENT_PACKAGES.find((p) => p.id === state.packageId) ?? null)
      : null;
  const addonsTotal = pkg ? pkg.price : 0;
  const totalNumeric = rentalBase + taxTotal + addonsTotal;
  const cancelCutoff = new Date(state.start!);
  cancelCutoff.setDate(cancelCutoff.getDate() - 1);

  return {
    status: "ok",
    tier: state.tier,
    tierLabel: RATE_TIERS[state.tier].label,
    checkIn: state.start!,
    checkOut: state.end!,
    nights,
    hours,
    rentalBase,
    taxLines,
    taxTotal,
    cdtAmount,
    cdtLabel: TAX.cdt.label,
    pkg: pkg && pkg.price > 0 ? pkg : null,
    addonsTotal,
    totalNumeric,
    deposit: state.tier === "event" ? SECURITY_DEPOSIT : null,
    cancelCutoff,
  };
}

type BookingContextValue = {
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  today: Date;
  quote: Quote;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function PropertyBookingProvider({
  initialAudience,
  children,
}: {
  initialAudience: AudienceId | null;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...initialState(),
    audience: initialAudience,
  }));
  const today = useMemo(() => startOfDay(new Date()), []);
  const quote = useMemo(() => computeQuote(state), [state]);

  return (
    <BookingContext.Provider value={{ state, dispatch, today, quote }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside PropertyBookingProvider");
  return ctx;
}
