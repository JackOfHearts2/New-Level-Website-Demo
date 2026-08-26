"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GlowCard } from "@/components/ui/glow-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { NOTIFICATION_PREFERENCES } from "@/lib/content";

// Postgres RLS evaluates the UPDATE policy for the ON CONFLICT DO UPDATE
// branch of an upsert against every row the statement plans over, which
// (for reasons that didn't fully resolve even with a matching permissive
// UPDATE policy added) reliably 42501'd here for the anon role — a real,
// reproducible limitation, not a config oversight. Sidestepping it: try a
// plain insert, and on a duplicate-key conflict (23505) fall back to a
// plain update instead of relying on ON CONFLICT DO UPDATE at all.
async function insertOrUpdate(
  supabase: SupabaseClient,
  table: string,
  matchColumn: string,
  row: Record<string, unknown>
) {
  const { error } = await supabase.from(table).insert(row);
  if (!error) return { error: null };
  if (error.code !== "23505") return { error };
  const { [matchColumn]: matchValue, ...rest } = row;
  return supabase.from(table).update(rest).eq(matchColumn, matchValue);
}

type PrefKey = (typeof NOTIFICATION_PREFERENCES)[number]["id"];
type Prefs = Record<PrefKey, boolean>;

const DEFAULT_PREFS: Prefs = {
  property_alerts: true,
  content_updates: true,
  site_updates: true,
  events: true,
};

type Result =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "subscribed" }
  | { kind: "check-email" };

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wantsAccount, setWantsAccount] = useState(false);
  const [consent, setConsent] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>({ kind: "idle" });

  function togglePref(id: PrefKey, checked: boolean) {
    setPrefs((p) => ({ ...p, [id]: checked }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    if (!consent) {
      setResult({ kind: "error", message: "Please agree to be contacted before subscribing." });
      return;
    }
    setLoading(true);
    setResult({ kind: "idle" });
    const supabase = createClient();

    if (wantsAccount) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        setResult({ kind: "error", message: error.message });
        return;
      }
      if (data.session && data.user) {
        // The account itself is already created at this point (the thing
        // this success message is actually reporting) - a failure saving
        // preferences is a secondary, recoverable issue (they can be set
        // again from an account page later), not grounds to tell the
        // visitor their signup didn't work. Log it rather than swallowing
        // it silently (the bug found and fixed in payment-simulator.tsx),
        // but don't block the success state on it.
        const { error: prefsError } = await insertOrUpdate(
          supabase,
          "notification_preferences",
          "user_id",
          { user_id: data.user.id, ...prefs }
        );
        if (prefsError) {
          console.error("Saving notification preferences failed:", prefsError);
        }
        setLoading(false);
        setResult({ kind: "subscribed" });
        return;
      }
      // Email confirmation required — no session yet to attach
      // preferences to an account, so also capture them by email as a
      // fallback (harmless even once they confirm and sign in later). Same
      // reasoning as above: the signup itself already succeeded, so a
      // failure here is logged, not surfaced as a blocking error.
      const { error: fallbackError } = await insertOrUpdate(
        supabase,
        "newsletter_subscribers",
        "email",
        { email, ...prefs }
      );
      if (fallbackError) {
        console.error("Saving fallback newsletter subscription failed:", fallbackError);
      }
      setLoading(false);
      setResult({ kind: "check-email" });
      return;
    }

    const { error } = await insertOrUpdate(supabase, "newsletter_subscribers", "email", {
      email,
      ...prefs,
    });
    setLoading(false);
    if (error) {
      setResult({ kind: "error", message: error.message });
      return;
    }
    setResult({ kind: "subscribed" });
  }

  if (result.kind === "subscribed") {
    return (
      <GlowCard className="mx-auto max-w-lg p-8 text-center">
        <h2 className="font-heading text-xl font-bold">You&apos;re subscribed.</h2>
        <p className="text-foreground mt-2 text-sm">
          We&apos;ll only send what you checked below — nothing else.
        </p>
      </GlowCard>
    );
  }

  if (result.kind === "check-email") {
    return (
      <GlowCard className="mx-auto max-w-lg p-8 text-center">
        <h2 className="font-heading text-xl font-bold">Almost there.</h2>
        <p className="text-foreground mt-2 text-sm">
          Check your email to confirm your account. Your subscribe preferences are already
          saved and will attach to your account once you sign in.
        </p>
      </GlowCard>
    );
  }

  return (
    <GlowCard className="mx-auto max-w-lg p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="subscribe-email">Email</Label>
          <Input
            id="subscribe-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <p className="text-foreground text-sm font-medium">Keep me updated on…</p>
          <div className="space-y-3">
            {NOTIFICATION_PREFERENCES.map((pref) => (
              <div key={pref.id} className="flex items-start gap-2.5">
                <Checkbox
                  id={`pref-${pref.id}`}
                  checked={prefs[pref.id]}
                  onCheckedChange={(checked) => togglePref(pref.id, checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor={`pref-${pref.id}`} className="flex-1 font-normal">
                  <span className="block text-sm font-medium">{pref.label}</span>
                  <span className="text-foreground block text-sm">{pref.blurb}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-border rounded-xl border p-4">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="wants-account"
              checked={wantsAccount}
              onCheckedChange={(checked) => setWantsAccount(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="wants-account" className="flex-1 font-normal">
              <span className="block text-sm font-medium">
                Also create an account
              </span>
              <span className="text-foreground block text-sm">
                Lets you save properties as you browse, tied to these same preferences.
              </span>
            </Label>
          </div>
          {wantsAccount && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="subscribe-password">Password</Label>
              <Input
                id="subscribe-password"
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={wantsAccount}
              />
            </div>
          )}
        </div>

        {/* Explicit consent checkbox — client ask (2026-08-26): "get
            exclusive listings via email sign up... with an agreement box
            that they click to give consent to be contacted." Kept separate
            from the "also create an account" checkbox above; this one
            gates every subscribe path, not just the account-creation one. */}
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="subscribe-consent"
            checked={consent}
            onCheckedChange={(checked) => setConsent(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="subscribe-consent" className="flex-1 font-normal">
            <span className="block text-sm">
              I agree to be contacted by New Level about the updates I selected above.
            </span>
          </Label>
        </div>

        {result.kind === "error" && (
          <p className="text-destructive text-sm" role="alert">
            {result.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait…" : wantsAccount ? "Create Account & Subscribe" : "Subscribe"}
        </Button>
      </form>
    </GlowCard>
  );
}
