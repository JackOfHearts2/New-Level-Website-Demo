"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useBooking } from "./booking-context";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function StickyBookingBar() {
  const { state, quote } = useBooking();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const content = document.getElementById("audienceContent");
        const hero = document.getElementById("propertyHero");
        const booking = document.getElementById("booking");
        const tail = document.querySelector("footer");
        if (!content) {
          setVisible(false);
          return;
        }
        const vh = window.innerHeight;
        const heroPassed = hero ? hero.getBoundingClientRect().bottom < 40 : true;
        const bookingReached = booking ? booking.getBoundingClientRect().top < vh * 0.7 : false;
        const tailNear = tail ? tail.getBoundingClientRect().top < vh - 40 : false;
        setVisible(heroPassed && !bookingReached && !tailNear);
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    // lg:hidden — this replaces MobileDock on this page (see MobileDock's
    // own comment) and needs the same breakpoint, or it doubles up with
    // the already-sticky QuoteSidebar on desktop-width viewports, which
    // had no gate here at all before.
    <div
      className={cn(
        "fixed inset-x-0 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between gap-4 rounded-2xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur transition-all duration-300 lg:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <div>
        {quote.status === "ok" ? (
          <>
            <div className="font-heading font-bold">
              {money(quote.totalNumeric)}
              {quote.pkg && " + services"}
            </div>
            <div className="text-foreground text-sm">
              {quote.tierLabel} · {fmtDate(quote.checkIn)} → {fmtDate(quote.checkOut)}
            </div>
          </>
        ) : (
          <>
            <div className="font-heading font-bold">Availability & quote</div>
            <div className="text-foreground text-sm">
              {state.tier ? "Pick your dates" : "Select your rate & dates"}
            </div>
          </>
        )}
      </div>
      <a
        href="#booking"
        className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 shrink-0 rounded-xl px-4 py-2 text-sm font-semibold"
      >
        {quote.status === "ok" ? "Continue" : "Choose your dates"}
      </a>
    </div>
  );
}
