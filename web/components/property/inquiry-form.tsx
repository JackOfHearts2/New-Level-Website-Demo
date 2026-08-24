"use client";

import { useState } from "react";
import { GlowCard, useGlowRing } from "@/components/ui/glow-card";
import { AUDIENCES } from "@/lib/content";
import { useBooking } from "./booking-context";
import { PaymentSimulator } from "./payment-simulator";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Mode = "form" | "inquired" | "reserving";

// Two real paths, presented together rather than a hidden "simulate
// confirmation" step in between (that middle step read as a bug/conflict
// to the client, not a deliberate flow): "Send an Inquiry" stays free and
// non-committal — no dates are held. "Reserve These Dates" goes straight
// into the deposit flow, since committing with a deposit is the whole
// point of choosing it over an inquiry (it's what keeps someone else from
// reserving the same dates in the meantime).
export function InquiryForm() {
  const { state, quote } = useBooking();
  const [mode, setMode] = useState<Mode>("form");
  const [error, setError] = useState<string | null>(null);
  // Not GlowCard — it can't render as a <form>, and this needs to stay a
  // real form element for onSubmit — so the same glow-card classes/hook
  // are wired up by hand instead of via the component.
  const formRef = useGlowRing<HTMLFormElement>();

  const audience = state.audience ? AUDIENCES[state.audience] : null;

  const carried: { label: string; value: string }[] = [
    { label: "Purpose", value: audience?.cardLabel ?? "Choose a purpose" },
  ];
  if (state.audience === "events" && (state.eventType || state.eventTypeOther)) {
    carried.push({ label: "Type of event", value: state.eventTypeOther || state.eventType || "" });
  }
  carried.push({
    label: "Rate type",
    value: quote.status === "ok" ? quote.tierLabel : "Choose above",
  });
  if (quote.status === "ok") {
    carried.push({ label: "Check-in", value: fmtDate(quote.checkIn) });
    carried.push({ label: "Check-out", value: fmtDate(quote.checkOut) });
    if (quote.pkg) {
      carried.push({ label: "Services", value: `${quote.pkg.label} package (TBD)` });
    }
    carried.push({
      label: "Est. total",
      value: money(quote.totalNumeric) + (quote.pkg ? " + services (TBD)" : ""),
    });
  } else {
    carried.push({ label: "Check-in", value: "TBD" });
    carried.push({ label: "Check-out", value: "TBD" });
    carried.push({ label: "Est. total", value: "TBD" });
  }

  function validate(requireDates: boolean) {
    setError(null);
    if (!state.audience) {
      setError("Please choose a purpose first.");
      document.getElementById("purpose")?.scrollIntoView({ behavior: "smooth" });
      return false;
    }
    if (requireDates && quote.status !== "ok") {
      setError("Please choose a rate type and date(s) above.");
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
      return false;
    }
    if (!formRef.current?.reportValidity()) return false;
    return true;
  }

  function handleInquire(e: React.MouseEvent) {
    e.preventDefault();
    if (!validate(true)) return;
    // INQUIRY_ENDPOINT is empty on the old site too — this stays demo-only,
    // matching current behavior rather than adding a new backend.
    setMode("inquired");
  }

  function handleReserve(e: React.MouseEvent) {
    e.preventDefault();
    if (!validate(true)) return;
    setMode("reserving");
  }

  if (mode === "reserving" && quote.status === "ok") {
    return (
      <div id="inquiry">
        <PaymentSimulator onDone={() => setMode("form")} />
      </div>
    );
  }

  if (mode === "inquired") {
    return (
      <GlowCard id="inquiry" className="p-8 text-center">
        <h3 className="font-heading text-xl font-bold">Thanks, we&apos;ve got it.</h3>
        <p className="text-foreground mt-2 text-sm">
          We&apos;ll follow up to confirm availability and next steps. If you&apos;d rather lock in
          these dates right away instead of waiting to hear back, you can still reserve them with a
          deposit.
        </p>
        <p className="text-foreground mt-4 text-sm">
          Demo mode: this inquiry wasn&apos;t actually sent anywhere.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {quote.status === "ok" && (
            <button
              type="button"
              onClick={() => setMode("reserving")}
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              Reserve These Dates
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode("form")}
            className="font-heading text-primary text-sm font-semibold hover:underline"
          >
            Edit and resubmit
          </button>
        </div>
      </GlowCard>
    );
  }

  return (
    <div id="inquiry" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        className="glow-card relative space-y-4 rounded-2xl border border-border p-6"
      >
        <span className="glow-card__ring" aria-hidden />
        <h3 className="font-heading text-lg font-bold">Ask a question, or reserve these dates</h3>
        <p className="text-foreground text-sm">
          An inquiry is free and doesn&apos;t hold your dates. Reserving puts down a deposit so
          someone else can&apos;t book the same dates in the meantime.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-heading text-sm font-medium">Name</span>
            <input
              name="name"
              required
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-heading text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-heading text-sm font-medium">Phone</span>
            <input
              type="tel"
              name="phone"
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-heading text-sm font-medium">Preferred contact method</span>
            <select
              name="contact_method"
              className="border-border bg-background text-foreground mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option className="bg-background text-foreground">Email</option>
              <option className="bg-background text-foreground">Phone</option>
              <option className="bg-background text-foreground">WhatsApp</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-heading text-sm font-medium">Group size</span>
            <input
              type="number"
              name="group_size"
              min={1}
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-heading text-sm font-medium">Notes (optional)</span>
            <textarea
              name="notes"
              rows={3}
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
        </div>
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReserve}
            className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold"
          >
            Reserve These Dates
          </button>
          <button
            type="button"
            onClick={handleInquire}
            className="font-heading border-border hover:bg-muted rounded-xl border px-6 py-2.5 text-sm font-semibold"
          >
            Send an Inquiry
          </button>
        </div>
      </form>

      <GlowCard className="h-fit p-6">
        <h4 className="font-heading text-sm font-semibold">Summary</h4>
        <dl className="mt-4 space-y-2 text-sm">
          {carried.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-foreground">{row.label}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </GlowCard>
    </div>
  );
}
