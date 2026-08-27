import "server-only";
import { Resend } from "resend";
import { getSettings } from "@/lib/settings";

/**
 * Admin notification emails (a pending change to review, a new bug report).
 * Deliberately fail-soft: if RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL
 * isn't set yet (the client hasn't finished setting up their dedicated
 * Resend inbox), this logs and returns rather than throwing — the
 * triggering action (submitting a change, filing a report) must still
 * succeed even if the email never goes out. Same "log secondary failures,
 * don't block the user" philosophy as the notification-preferences
 * fallback writes in app/(marketing)/subscribe/subscribe-form.tsx.
 */
// Returns whether the email actually went out — most callers ignore this
// (fail-soft: a routine notification failing shouldn't matter to them),
// but notifyInquiryFallback below needs to know, since it's the last line
// of defense for an inquiry whose DB write already failed.
async function sendAdminNotification({
  subject,
  html,
}: {
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !to) {
    console.error(
      "sendAdminNotification: RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL not set — skipping email."
    );
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    // Resend's own shared sending address — no custom domain verification
    // needed, since the recipient (ADMIN_NOTIFICATION_EMAIL) is the same
    // dedicated inbox the Resend account itself is registered under.
    const { error } = await resend.emails.send({
      from: "New Level Notifications <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    if (error) {
      console.error("sendAdminNotification failed:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendAdminNotification failed:", err);
    return false;
  }
}

export async function notifyPendingChangeRequest(request: {
  targetType: "content" | "image";
  submitterEmail: string;
  imageSlot?: string;
}) {
  // Fail-open: if Settings can't be read, send anyway — matches the
  // always-on behavior this toggle is layered on top of.
  const settings = await getSettings().catch(() => null);
  if (settings && !settings.notifyOnSubmission) return;

  const what =
    request.targetType === "image"
      ? `an image update (${request.imageSlot})`
      : "a content update";
  await sendAdminNotification({
    subject: "New Level: a change is waiting for your review",
    html: `
      <p><strong>${escapeHtml(request.submitterEmail)}</strong> submitted ${what} for approval.</p>
      <p>Review it in the admin dashboard under "Approvals."</p>
    `,
  });
}

export async function notifyPendingProperty(listing: {
  title: string;
  submitterEmail: string;
}) {
  const settings = await getSettings().catch(() => null);
  if (settings && !settings.notifyOnSubmission) return;

  await sendAdminNotification({
    subject: "New Level: a new listing is waiting for your review",
    html: `
      <p><strong>${escapeHtml(listing.submitterEmail)}</strong> submitted a new listing, "${escapeHtml(listing.title)}," for approval.</p>
      <p>Review it in the admin dashboard under "Properties."</p>
    `,
  });
}

/** Same fail-soft Resend send as sendAdminNotification, but to an
 *  arbitrary staff member's own address rather than the fixed
 *  ADMIN_NOTIFICATION_EMAIL inbox — used for "you were assigned/escalated
 *  an inquiry" notices, which need to reach whichever staff member it is,
 *  not always the same admin inbox.
 *
 *  Known limitation (see sendSecurityCode's own note): Resend's shared
 *  sandbox sender (onboarding@resend.dev, no custom domain verified yet)
 *  can only deliver to the Resend account's OWN registered address
 *  (today, jackcoquillon@gmail.com). Assigning an inquiry to any OTHER
 *  staff member will call this and fail silently (caught below, logged,
 *  never blocks the assignment itself) until a domain is verified — flag
 *  this to the client if assignment notifications are reported as not
 *  arriving. */
async function sendStaffNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("sendStaffNotification: RESEND_API_KEY not set — skipping email.");
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "New Level Notifications <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("sendStaffNotification failed:", err);
  }
}

export async function notifyInquiryAssigned(assignee: { email: string; inquiryName: string; inquiryId: string }) {
  await sendStaffNotification({
    to: assignee.email,
    subject: `New Level: an inquiry was assigned to you`,
    html: `
      <p>You were assigned an inquiry from <strong>${escapeHtml(assignee.inquiryName)}</strong>.</p>
      <p>Review it in the admin dashboard under "Inquiries."</p>
    `,
  });
}

/** The literal reply an inquirer sees when staff check "also email them" on
 *  a note — not fail-soft the way notifications are, since the caller
 *  (addInquiryNote) needs to tell the staff member if it didn't actually
 *  go out, same reasoning as sendSecurityCode. */
export async function sendInquiryReply(to: string, body: string): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("sendInquiryReply: RESEND_API_KEY not set — cannot send.");
    return { ok: false };
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "New Level <onboarding@resend.dev>",
      to,
      subject: "Re: your inquiry to New Level",
      html: `<p>${escapeHtml(body).replace(/\n/g, "<br>")}</p>`,
    });
    if (error) {
      console.error("sendInquiryReply failed:", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendInquiryReply failed:", err);
    return { ok: false };
  }
}

export async function notifyNewInquiry(inquiry: {
  source: "property" | "contact" | "careers";
  name: string;
  email: string;
}) {
  const settings = await getSettings().catch(() => null);
  if (settings && !settings.notifyOnSubmission) return;

  const sourceLabel =
    inquiry.source === "property" ? "the property page" : inquiry.source === "careers" ? "the careers page" : "the contact page";
  await sendAdminNotification({
    subject: `New Level: a new inquiry from ${inquiry.name}`,
    html: `
      <p><strong>${escapeHtml(inquiry.name)}</strong> (${escapeHtml(inquiry.email)}) submitted an inquiry via ${sourceLabel}.</p>
      <p>Review it in the admin dashboard under "Inquiries."</p>
    `,
  });
}

/** Last line of defense for submitInquiry (app/actions/inquiries.ts) when
 *  the `inquiries` table insert itself fails (outage, RLS misconfig,
 *  transient network error) — the visitor's message would otherwise just
 *  be gone, with nothing in the dashboard and no notification. Unlike
 *  notifyNewInquiry, this carries the FULL submission (this email is the
 *  only surviving copy of it, not just a heads-up pointing at a dashboard
 *  row) and ignores the notifyOnSubmission preference — that toggle means
 *  "don't bother me for routine inquiries," not "it's fine to lose one
 *  that never made it into the database." Returns whether it actually
 *  sent, so the caller knows whether this redundancy path itself worked
 *  or whether both layers failed together. */
export async function notifyInquiryFallback(inquiry: {
  source: "property" | "contact" | "careers";
  name: string;
  email: string;
  phone?: string;
  contactMethod?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  dbErrorMessage: string;
}): Promise<boolean> {
  const sourceLabel =
    inquiry.source === "property" ? "the property page" : inquiry.source === "careers" ? "the careers page" : "the contact page";
  const metadataRows = Object.entries(inquiry.metadata ?? {})
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding-right:12px;color:#6a6a6a">${escapeHtml(k)}</td><td>${escapeHtml(String(v))}</td></tr>`)
    .join("");

  return sendAdminNotification({
    subject: `New Level: an inquiry from ${inquiry.name} couldn't be saved — action needed`,
    html: `
      <p><strong>The site's database write for this inquiry failed</strong> (${escapeHtml(inquiry.dbErrorMessage)}),
      so it will NOT appear in the admin dashboard under "Inquiries." This email is the only
      record of it — please follow up directly and check why the database write is failing.</p>
      <p>Submitted via ${sourceLabel}.</p>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="padding-right:12px;color:#6a6a6a">Name</td><td>${escapeHtml(inquiry.name)}</td></tr>
        <tr><td style="padding-right:12px;color:#6a6a6a">Email</td><td>${escapeHtml(inquiry.email)}</td></tr>
        ${inquiry.phone ? `<tr><td style="padding-right:12px;color:#6a6a6a">Phone</td><td>${escapeHtml(inquiry.phone)}</td></tr>` : ""}
        ${inquiry.contactMethod ? `<tr><td style="padding-right:12px;color:#6a6a6a">Preferred contact</td><td>${escapeHtml(inquiry.contactMethod)}</td></tr>` : ""}
        ${metadataRows}
      </table>
      ${inquiry.message ? `<p><strong>Message:</strong><br>${escapeHtml(inquiry.message).replace(/\n/g, "<br>")}</p>` : ""}
    `,
  });
}

export async function notifyProblemReport(report: {
  issueType: string;
  details: string;
  pageUrl: string;
}) {
  const settings = await getSettings().catch(() => null);
  if (settings && !settings.notifyOnReport) return;

  await sendAdminNotification({
    subject: `New Level: a visitor reported a problem (${report.issueType})`,
    html: `
      <p><strong>Issue type:</strong> ${escapeHtml(report.issueType)}</p>
      <p><strong>Page:</strong> ${escapeHtml(report.pageUrl)}</p>
      <p><strong>Details:</strong></p>
      <p>${escapeHtml(report.details)}</p>
      <p>Review it in the admin dashboard under "Reports."</p>
    `,
  });
}

/** Sends a password-change verification code directly to the account's
 *  own email — unlike sendAdminNotification, this is NOT fail-soft: if
 *  the code doesn't send, the caller can't complete the security step,
 *  so the action needs to know and tell the user, not silently continue.
 *
 *  Known limitation (flag to the user if this ever surfaces as a real
 *  failure): Resend's shared sandbox sender (onboarding@resend.dev, used
 *  here since no custom domain is verified yet — see project_domain_
 *  sequencing) can only deliver to the Resend account's OWN registered
 *  address. Today that's jackcoquillon@gmail.com, the only real admin
 *  account, so this works for them — but it will silently fail to reach
 *  any other staff member's inbox until a domain is verified. */
export async function sendSecurityCode(to: string, code: string): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("sendSecurityCode: RESEND_API_KEY not set — cannot send.");
    return { ok: false };
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "New Level Security <onboarding@resend.dev>",
      to,
      subject: "Your New Level password-change code",
      html: `
        <p>Use this code to confirm your password change:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can ignore it — your
        password won't change without the code.</p>
      `,
    });
    if (error) {
      console.error("sendSecurityCode failed:", error);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("sendSecurityCode failed:", err);
    return { ok: false };
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
