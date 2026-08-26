"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyNewInquiry } from "@/lib/email";
import type { InquirySource } from "@/lib/inquiries";

export type SubmitInquiryResult = { error?: string; ok?: boolean };

/** Public, unauthenticated submission — reached from the property inquiry
 *  form, the general contact form, and the careers form. All three used to
 *  be demo-only ("this wasn't actually sent anywhere") — this is the real
 *  backing table they now write to (migration 0021). Same pattern as
 *  components/report-problem/actions.ts's submitProblemReport: a plain
 *  Server Action using the RLS-bound client (inquiries_insert_public
 *  allows this without a session), not a direct client-side Supabase call,
 *  so the admin-notification email can go out without exposing the Resend
 *  key to the browser.
 *
 *  `metadata` carries whatever source-specific detail doesn't need its own
 *  column (property purpose/dates/quote summary, career role/license,
 *  etc.) — the caller builds it, this just stores it as-is. */
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

  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    source: input.source,
    name,
    email,
    phone: input.phone?.trim().slice(0, 50) || null,
    contact_method: input.contactMethod?.trim().slice(0, 50) || null,
    message: input.message?.trim().slice(0, 4000) || null,
    metadata: input.metadata ?? {},
  });
  if (error) {
    return { error: "Couldn't send that — please try again." };
  }

  await notifyNewInquiry({ source: input.source, name, email });

  return { ok: true };
}
