import "server-only";
import { Resend } from "resend";

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
