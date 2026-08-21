"use client";

import { useState } from "react";
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

  const audience = state.audience ? AUDIENCES[state.audience] : null;

  const carried: { label: string; value: string }[] = [
    { label: "Purpose", value: audience?.cardLabel ?? "— choose a purpose —" },
  ];
  if (state.audience === "events" && (state.eventType || state.eventTypeOther)) {
    carried.push({ label: "Type of event", value: state.eventTypeOther || state.eventType || "" });
  }
  carried.push({
    label: "Rate type",
    value: quote.status === "ok" ? quote.tierLabel : "— choose above —",
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
    carried.push({ label: "Check-in", value: "—" });
    carried.push({ label: "Check-out", value: "—" });
    carried.push({ label: "Est. total", value: "—" });
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
      <div id="inquiry" className="border-border rounded-2xl border p-8 text-center shadow-sm">
        <h3 className="font-heading text-xl font-bold">Thanks — we&apos;ve got it.</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          We&apos;ll follow up to confirm availability and next steps.
        </p>
        <p className="text-muted-foreground/70 mt-4 text-xs">
          Demo mode: this inquiry wasn&apos;t actually sent anywhere.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="font-heading text-primary mt-4 text-sm font-semibold hover:underline"
        >
          Edit and resubmit
        </button>
      </div>
    );
  }

  return (
    <div id="inquiry" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
      <form onSubmit={handleSubmit} className="border-border space-y-4 rounded-2xl border p-6 shadow-sm">
        <h3 className="font-heading text-lg font-bold">Send an inquiry</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-heading text-xs font-medium">Name</span>
            <input
              name="name"
              required
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-heading text-xs font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-heading text-xs font-medium">Phone</span>
            <input
              type="tel"
              name="phone"
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-heading text-xs font-medium">Preferred contact method</span>
            <select
              name="contact_method"
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option>Email</option>
              <option>Phone</option>
              <option>WhatsApp</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-heading text-xs font-medium">Group size</span>
            <input
              type="number"
              name="group_size"
              min={1}
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-heading text-xs font-medium">Notes (optional)</span>
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

      <div className="border-border h-fit rounded-2xl border p-6 shadow-sm">
        <h4 className="font-heading text-sm font-semibold">Attached to your inquiry</h4>
        <dl className="mt-4 space-y-2 text-sm">
          {carried.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
