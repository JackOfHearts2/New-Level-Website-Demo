"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RATE_TIERS } from "@/lib/content";
import { useBooking } from "./booking-context";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function QuoteSidebar() {
  const { quote } = useBooking();
  const [showTaxDetail, setShowTaxDetail] = useState(false);

  return (
    <div className="border-border sticky top-28 rounded-2xl border p-6 shadow-sm">
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
            {fmtDate(quote.checkIn)} → {fmtDate(quote.checkOut)}
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

          {quote.deposit && (
            <p className="text-foreground border-border border-t pt-3 text-sm">
              Plus a refundable{" "}
              <span className="text-foreground font-semibold">
                ${quote.deposit.amount}
              </span>{" "}
              security deposit, a hold placed before your date and released after check-out, not
              a charge today.
            </p>
          )}

          <p className="text-foreground text-sm">
            You won&apos;t be charged to inquire. Free cancellation until{" "}
            {fmtDate(quote.cancelCutoff)}, 1 day before check-in.
          </p>
        </div>
      )}
    </div>
  );
}
