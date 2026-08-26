"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { GlowCard } from "@/components/ui/glow-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CAREER_ROLES } from "@/lib/content";
import { submitInquiry } from "@/app/actions/inquiries";

// Same demo-only convention as ContactForm/InquiryForm — no live endpoint
// connected yet, so this confirms in place without actually sending
// anywhere. A dedicated intake, separate from the general Contact form's
// "Join Our Network" topic checkbox, since a career inquiry needs its own
// fields (role interested in, license status) that a general contact
// message doesn't.
export function CareersForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setError(null);
    const fd = new FormData(e.currentTarget);
    startSubmit(async () => {
      const result = await submitInquiry({
        source: "careers",
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
        metadata: {
          role: fd.get("role") ?? null,
          license: fd.get("license") ?? null,
        },
      });
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Application sent");
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <GlowCard className="mx-auto max-w-2xl p-8 text-center md:p-10">
        <h2 className="font-heading text-xl font-bold">Thanks for reaching out.</h2>
        <p className="text-foreground mt-2 text-sm">
          We&apos;ll follow up as soon as we can.
        </p>
        <Button className="mt-6" onClick={() => setSubmitted(false)}>
          Submit another inquiry
        </Button>
      </GlowCard>
    );
  }

  return (
    <GlowCard className="mx-auto max-w-2xl p-8 md:p-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="font-heading text-xl font-bold">Tell us about you</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="career-name">Your name</Label>
            <Input id="career-name" name="name" placeholder="Your name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="career-email">Email</Label>
            <Input id="career-email" name="email" type="email" placeholder="Email" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="career-role">What are you interested in?</Label>
          <select
            id="career-role"
            name="role"
            required
            defaultValue=""
            className="border-border bg-background focus-visible:ring-3 focus-visible:ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none"
          >
            <option value="" disabled>
              Choose one
            </option>
            {CAREER_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="career-license">Real Estate license status (if applicable)</Label>
          <Input
            id="career-license"
            name="license"
            placeholder="e.g. Licensed in FL since 2021, or Not yet licensed"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="career-message">Tell us a bit more</Label>
          <Textarea
            id="career-message"
            name="message"
            placeholder="Your experience, what you're looking for, or anything else worth knowing…"
            className="min-h-28"
            required
          />
        </div>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Sending…" : "Submit"}
        </Button>
      </form>
    </GlowCard>
  );
}
