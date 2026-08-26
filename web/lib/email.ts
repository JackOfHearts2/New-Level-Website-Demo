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
async function sendAdminNotification({
  subject,
  html,
}: {
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !to) {
    console.error(
      "sendAdminNotification: RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL not set — skipping email."
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);
    // Resend's own shared sending address — no custom domain verification
    // needed, since the recipient (ADMIN_NOTIFICATION_EMAIL) is the same
    // dedicated inbox the Resend account itself is registered under.
    await resend.emails.send({
      from: "New Level Notifications <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("sendAdminNotification failed:", err);
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
