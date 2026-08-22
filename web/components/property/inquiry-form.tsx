"use client";

import { useState } from "react";
import { GlowCard, useGlowRing } from "@/components/ui/glow-card";
import { AUDIENCES } from "@/lib/content";
import { useBooking } from "./booking-context";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function InquiryForm() {
  const { state, quote } = useBooking();
  const [submitted, setSubmitted] = useState(false);
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!state.audience) {
      setError("Please choose a purpose first.");
      document.getElementById("purpose")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (quote.status !== "ok") {
      setError("Please choose a rate type and date(s) above.");
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!e.currentTarget.reportValidity()) return;
    // INQUIRY_ENDPOINT is empty on the old site too — this stays demo-only,
    // matching current behavior rather than adding a new backend.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <GlowCard id="inquiry" className="p-8 text-center">
        <h3 className="font-heading text-xl font-bold">Thanks, we&apos;ve got it.</h3>
        <p className="text-foreground mt-2 text-sm">
          We&apos;ll follow up to confirm availability and next steps.
        </p>
        <p className="text-foreground mt-4 text-sm">
          Demo mode: this inquiry wasn&apos;t actually sent anywhere.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="font-heading text-primary mt-4 text-sm font-semibold hover:underline"
        >
          Edit and resubmit
        </button>
      </GlowCard>
    );
  }

  return (
    <div id="inquiry" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="glow-card relative space-y-4 rounded-2xl border border-border p-6"
      >
        <span className="glow-card__ring" aria-hidden />
        <h3 className="font-heading text-lg font-bold">Send an inquiry</h3>
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
        <button
          type="submit"
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold"
        >
          Send Inquiry
        </button>
      </form>

      <GlowCard className="h-fit p-6">
        <h4 className="font-heading text-sm font-semibold">Attached to your inquiry</h4>
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
