"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlowRing } from "@/components/ui/glow-card";
import { RATE_TIERS, DEPOSIT_POLICY } from "@/lib/content";
import { minToTime, useBooking } from "./booking-context";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function QuoteSidebar() {
  const { state, quote } = useBooking();
  const [showTaxDetail, setShowTaxDetail] = useState(false);
  // Not GlowCard directly — its base classes force position:relative, which
  // would fight the sticky positioning this sidebar needs. sticky is a
  // valid containing block for the ring's absolute inset:0 span too, so
  // wiring the same glow-card classes/hook by hand keeps both.
  const ref = useGlowRing<HTMLDivElement>();

  return (
    <div ref={ref} className="glow-card sticky top-28 rounded-2xl border border-border bg-card p-6">
      <span className="glow-card__ring" aria-hidden />
      <h3 className="font-heading text-lg font-bold">Your quote</h3>

      {quote.status !== "ok" ? (
        <div className="mt-4">
          <p className="font-heading text-sm font-semibold">
            {quote.status === "no-tier" && "Select a rate type to begin"}
            {quote.status === "need-checkin" && "Select your check-in date."}
            {quote.status === "need-checkout" && "Select your check-out date."}
            {quote.status === "below-minimum" && "24-hour minimum not met"}
          </p>
          <p className="text-foreground mt-1 text-sm">
            {quote.status === "below-minimum"
              ? quote.message
              : "Choose a rate type above, then pick your date(s)."}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <p className="text-foreground text-sm">
            {fmtDate(quote.checkIn)} ({minToTime(state.checkinMin)}) →{" "}
            {fmtDate(quote.checkOut)} ({minToTime(state.checkoutMin)})
          </p>

          <div className="flex items-baseline justify-between text-sm">
            <span>
              {quote.tier === "event"
                ? `Venue: ${quote.hours}-hour event rental (flat)`
                : `${money(RATE_TIERS.stay.perNight)} × ${quote.nights} night${quote.nights !== 1 ? "s" : ""}`}
            </span>
            <span className="font-heading font-semibold">{money(quote.rentalBase)}</span>
          </div>

          {quote.pkg && (
            <div className="text-sm">
              <div className="flex items-baseline justify-between">
                <span>{quote.pkg.label} package</span>
                <span className="font-heading font-semibold">+{money(quote.pkg.price)}</span>
              </div>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setShowTaxDetail((v) => !v)}
              className="flex w-full items-center justify-between text-sm"
            >
              <span className="flex items-center gap-1">
                Taxes (13%)
                <ChevronDown
                  className={cn("size-3.5 transition-transform", showTaxDetail && "rotate-180")}
                />
              </span>
              <span className="font-heading font-semibold">{money(quote.taxTotal)}</span>
            </button>
            {showTaxDetail && (
              <div className="text-foreground mt-2 space-y-1 text-sm">
                {quote.taxLines.map((line) => (
                  <div key={line.key} className="flex justify-between">
                    <span>
                      {line.label} ({Math.round(line.rate * 100)}%)
                    </span>
                    <span>{money(line.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-foreground flex items-baseline justify-between text-sm">
            <span>{quote.cdtLabel} (3%)</span>
            <span>{money(quote.cdtAmount)}</span>
          </div>

          <div className="border-border flex items-baseline justify-between border-t pt-4">
            <span className="font-heading font-semibold">Total</span>
            <span className="font-heading text-xl font-bold">{money(quote.totalNumeric)}</span>
          </div>

          <p className="text-foreground text-sm">
            {quote.pkg
              ? "Estimate includes the selected New Level services. Rates are demo figures; total excludes the unresolved 3% CDT."
              : "Estimate only. Rates are placeholder; total excludes the unresolved 3% CDT."}
          </p>

          <div className="border-border space-y-2 border-t pt-3 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-foreground">
                Deposit to reserve ({Math.round(DEPOSIT_POLICY.percent * 100)}%)
              </span>
              <span className="font-heading font-semibold">{money(quote.depositAmount)}</span>
            </div>
            <div className="text-foreground flex items-baseline justify-between">
              <span>Balance, auto-charged {fmtDate(quote.cancelCutoff)}</span>
              <span>{money(quote.balanceAmount)}</span>
            </div>
          </div>

          <p className="text-foreground text-sm">
            You won&apos;t be charged to inquire — we confirm availability first, then you&apos;ll
            reserve with a deposit. Free cancellation with a full deposit refund any time before{" "}
            {fmtDate(quote.cancelCutoff)}. {DEPOSIT_POLICY.cancellation.afterFullCharge}
          </p>
        </div>
      )}
    </div>
  );
}
