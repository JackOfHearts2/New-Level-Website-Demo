"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyProblemReport } from "@/lib/email";

export type ReportResult = { error?: string; ok?: boolean };

const ISSUE_TYPES = ["Incorrect info", "Bug or broken feature", "Something else"] as const;

export async function submitProblemReport(
  _prevState: ReportResult | undefined,
  formData: FormData
): Promise<ReportResult> {
  const issueType = String(formData.get("issueType") ?? "");
  const details = String(formData.get("details") ?? "").trim().slice(0, 2000);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const pageUrl = String(formData.get("pageUrl") ?? "").trim().slice(0, 500);

  if (!ISSUE_TYPES.includes(issueType as (typeof ISSUE_TYPES)[number])) {
    return { error: "Choose what kind of issue this is." };
  }
  if (!details) {
    return { error: "Tell us what you noticed." };
  }

  // Done server-side (rather than a direct client->Supabase insert, the
  // pattern subscribe-form.tsx uses) specifically so the notification email
  // can go out without exposing the Resend key to the browser.
  const supabase = await createClient();
  const { error } = await supabase.from("problem_reports").insert({
    issue_type: issueType,
    details,
    reporter_email: email || null,
    page_url: pageUrl || "unknown",
  });
  if (error) {
    return { error: "Couldn't send that — please try again." };
  }

  await notifyProblemReport({ issueType, details, pageUrl: pageUrl || "unknown" });

  return { ok: true };
}
