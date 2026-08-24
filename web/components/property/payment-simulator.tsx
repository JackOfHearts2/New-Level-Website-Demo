"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { DEPOSIT_POLICY } from "@/lib/content";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/use-session";
import { useBooking, minToTime } from "./booking-context";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Formats as the guest types: groups of 4 digits, max 16.
function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

// A genuinely simulated payment step, per the client's explicit ask: no
// real card processor is wired up (no Stripe, no network charge) - this
// only validates input shape and, on "submit," writes a demo reservation
// row to Supabase so the flow leaves a real trace without moving real
// money. Reached from InquiryForm after the (also simulated, since there's
// no real staff-confirmation workflow yet) "availability confirmed" step.
export function PaymentSimulator({ onDone }: { onDone: () => void }) {
  const { state, quote } = useBooking();
  const { user } = useSession();
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  if (quote.status !== "ok") return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 15 || digits.length > 16) {
      setError("Enter a valid card number.");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Enter expiry as MM/YY.");
      return;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      setError("Enter a valid CVC.");
      return;
    }

    setProcessing(true);
    // Simulated processing delay — no real network charge happens here.
    await new Promise((r) => setTimeout(r, 1200));

    const supabase = createClient();
    await supabase.from("reservations").insert({
      user_id: user?.id ?? null,
      property_slug: "nw-87th-street",
      tier: quote.tier,
      check_in: quote.checkIn.toISOString().slice(0, 10),
      check_out: quote.checkOut.toISOString().slice(0, 10),
      deposit_amount: quote.depositAmount,
      total_amount: quote.totalNumeric,
      guest_name: cardName || null,
      guest_email: user?.email ?? null,
    });

    setProcessing(false);
    setDone(true);
  };

  if (done) {
    return (
      <GlowCard className="p-8 text-center">
        <div className="bg-primary text-primary-foreground mx-auto flex size-12 items-center justify-center rounded-full">
          <ShieldCheck className="size-6" />
        </div>
        <h3 className="font-heading mt-4 text-xl font-bold">Deposit received</h3>
        <p className="text-foreground mt-2 text-sm">
          You&apos;re reserved for {fmtDate(quote.checkIn)} ({minToTime(state.checkinMin)}) through{" "}
          {fmtDate(quote.checkOut)} ({minToTime(state.checkoutMin)}).
        </p>
        <div className="border-border mx-auto mt-6 max-w-sm space-y-2 border-t pt-4 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-foreground">Deposit paid today</span>
            <span className="font-heading font-semibold">{money(quote.depositAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground">
              Balance, auto-charged {fmtDate(quote.cancelCutoff)}
            </span>
            <span className="font-heading font-semibold">{money(quote.balanceAmount)}</span>
          </div>
        </div>
        <p className="text-foreground mx-auto mt-4 max-w-sm text-sm">
          Full deposit refund if you cancel before {fmtDate(quote.cancelCutoff)}.{" "}
          {DEPOSIT_POLICY.cancellation.afterFullCharge}
        </p>
        <p className="text-foreground mt-4 text-sm">
          Demo mode: no real card was charged; this is a simulated payment.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold"
        >
          Done
        </button>
      </GlowCard>
    );
  }

  return (
    <GlowCard className="p-8">
      <div className="flex items-center gap-2">
        <CreditCard className="text-primary size-5" />
        <h3 className="font-heading text-lg font-bold">Pay your deposit</h3>
      </div>
      <p className="text-foreground mt-2 text-sm">
        Simulated payment — no card processor is actually connected, and no real charge happens.
      </p>

      <div className="border-border mt-6 space-y-2 rounded-xl border p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-foreground">Deposit due now</span>
          <span className="font-heading font-semibold">{money(quote.depositAmount)}</span>
        </div>
        <div className="text-foreground flex justify-between">
          <span>Balance, auto-charged {fmtDate(quote.cancelCutoff)}</span>
          <span>{money(quote.balanceAmount)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="font-heading text-sm font-medium">Name on card</span>
          <input
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
            className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-heading text-sm font-medium">Card number</span>
          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            required
            className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="font-heading text-sm font-medium">Expiry</span>
            <input
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              inputMode="numeric"
              placeholder="MM/YY"
              required
              className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="font-heading text-sm font-medium">CVC</span>
            <input
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="123"
              required
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
          disabled={processing}
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-60"
        >
          {processing ? "Processing…" : `Pay ${money(quote.depositAmount)} deposit`}
        </button>
      </form>
    </GlowCard>
  );
}
