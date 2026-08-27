"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyNewInquiry, notifyInquiryFallback } from "@/lib/email";
import { POINT_OF_CONTACT } from "@/lib/content";
import type { InquirySource } from "@/lib/inquiries";

export type SubmitInquiryResult = { error?: string; ok?: boolean };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Public, unauthenticated submission — reached from the property inquiry
 *  form, the general contact form, the careers form, and the "Ask the
 *  Broker" modal. All three used to be demo-only ("this wasn't actually
 *  sent anywhere") — this is the real backing table they now write to
 *  (migration 0021). Same pattern as components/report-problem/actions.ts's
 *  submitProblemReport: a plain Server Action using the RLS-bound client
 *  (inquiries_insert_public allows this without a session), not a direct
 *  client-side Supabase call, so the admin-notification email can go out
 *  without exposing the Resend key to the browser.
 *
 *  `metadata` carries whatever source-specific detail doesn't need its own
 *  column (property purpose/dates/quote summary, career role/license,
 *  etc.) — the caller builds it, this just stores it as-is.
 *
 *  This is the site's one real lead-capture path, so a single failed DB
 *  write can't just lose the message — three layers, each only kicking in
 *  if the one before it failed:
 *   1. Insert into `inquiries` (the source of truth — feeds the admin
 *      dashboard). A transient blip gets one immediate retry before this
 *      counts as failed.
 *   2. If the write still fails, email the full submission directly to
 *      the admin inbox (notifyInquiryFallback) — it won't show up in the
 *      dashboard, but it isn't lost, and the email says so explicitly.
 *   3. If THAT also fails, both layers are down at once — a real, bigger
 *      problem worth knowing about, not just a one-off blip. Say so
 *      plainly and hand the visitor New Level's direct email/phone
 *      instead of a dead-end "try again." */
export async function submitInquiry(input: {
  source: InquirySource;
  name: string;
  email: string;
  phone?: string;
  contactMethod?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}): Promise<SubmitInquiryResult> {
  const name = input.name.trim().slice(0, 200);
  const email = input.email.trim().slice(0, 200);
  if (!name) return { error: "Enter your name." };
  if (!email || !email.includes("@")) return { error: "Enter a valid email." };

  const row = {
    source: input.source,
    name,
    email,
    phone: input.phone?.trim().slice(0, 50) || null,
    contact_method: input.contactMethod?.trim().slice(0, 50) || null,
    message: input.message?.trim().slice(0, 4000) || null,
    metadata: input.metadata ?? {},
  };

  const supabase = await createClient();
  let { error } = await supabase.from("inquiries").insert(row);
  if (error) {
    console.error("submitInquiry: insert failed, retrying once:", error);
    await sleep(400);
    ({ error } = await supabase.from("inquiries").insert(row));
  }

  if (error) {
    console.error("submitInquiry: insert failed twice, falling back to a direct email:", error);
    const emailed = await notifyInquiryFallback({
      source: input.source,
      name,
      email,
      phone: row.phone ?? undefined,
      contactMethod: row.contact_method ?? undefined,
      message: row.message ?? undefined,
      metadata: input.metadata,
      dbErrorMessage: error.message,
    });
    if (emailed) {
      // The visitor's message made it to a human, just not through the
      // usual path — from their side, this is a success.
      return { ok: true };
    }
    console.error(
      "submitInquiry: BOTH the DB insert and the fallback email failed for an inquiry from",
      email,
      "— this is bigger than one bad request, check Supabase and Resend."
    );
    return {
      error: `We couldn't submit that through the site right now. Please reach us directly at ${POINT_OF_CONTACT.email} or ${POINT_OF_CONTACT.phone} and we'll take it from there.`,
    };
  }

  await notifyNewInquiry({ source: input.source, name, email });

  return { ok: true };
}
