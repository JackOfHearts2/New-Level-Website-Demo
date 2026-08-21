"use client";

import { NEIGHBORHOOD } from "@/lib/content";
import { useBooking } from "./booking-context";

export function NearbyList() {
  const { state } = useBooking();
  const items = state.audience ? NEIGHBORHOOD.nearby[state.audience] : NEIGHBORHOOD.nearby.extended;

  return (
    <ul className="text-muted-foreground mt-3 space-y-2 text-sm">
      {items.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  );
}
