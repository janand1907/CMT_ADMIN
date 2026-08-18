import { siteConfig } from "@/config/site";
import { getResendClient } from "./resend";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])
  );
}

function buildEnquiryEmail({ enquiryNumber, name, phone, email, departureCity, travelDate, persons, packageInterested, message, source, ip, userAgent }) {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows = [
    ["Enquiry Number", enquiryNumber || "-"],
    ["Name", name],
    ["Phone", phone],
    ["Email", email || "-"],
    ["Departure City", departureCity || "-"],
    ["Package Interested", packageInterested || "-"],
    ["Travel Date", travelDate || "-"],
    ["Number of Persons", persons || "-"],
    ["Message", message || "-"],
    ["Submitted Page", source || "-"],
    ["Timestamp", `${timestamp} IST`],
    ["IP Address", ip || "-"],
    ["User Agent", userAgent || "-"],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; background:#f7f5f3; padding:24px;">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,32,90,0.08);">
        <div style="background:#00205a; padding:20px 24px;">
          <h1 style="margin:0; color:#ffffff; font-size:18px;">New Enquiry — Connect My Tours</h1>
        </div>
        <div style="padding:24px;">
          <table style="width:100%; border-collapse:collapse; font-size:14px; color:#1f2937;">
            ${rows
              .map(
                ([label, value]) => `
              <tr>
                <td style="padding:8px 0; border-bottom:1px solid #eeebe7; color:#062a54; font-weight:600; width:40%; vertical-align:top;">${escapeHtml(label)}</td>
                <td style="padding:8px 0; border-bottom:1px solid #eeebe7; vertical-align:top;">${escapeHtml(value)}</td>
              </tr>`
              )
              .join("")}
          </table>
        </div>
      </div>
    </div>
  `;

  return { subject: `New Enquiry - Connect My Tours (${name})`, text, html };
}

// Labels a Resend failure for server-side logs without leaking provider details
// (API key hints, account state, etc.) anywhere the caller might expose them.
function categorizeSendError(err) {
  const status = err?.statusCode;
  if (status === 401 || status === 403) return "authentication failed";
  if (status === 429) return "rate limited";
  return "send failed";
}

// Sends the enquiry notification via Resend. Never throws — a failed email must not
// fail the enquiry, since the lead is already persisted by the time this runs.
export async function sendEnquiryEmail(data) {
  if (!process.env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.error("[enquiry] email configuration missing — set RESEND_API_KEY in .env.local");
    return { sent: false };
  }

  const { subject, text, html } = buildEnquiryEmail(data);
  const resend = getResendClient();

  try {
    const { error } = await resend.emails.send({
      from: `${siteConfig.enquirySenderName} <${siteConfig.enquirySenderEmail}>`,
      to: process.env.MAIL_TO || siteConfig.enquiryRecipientEmail,
      replyTo: data.email || undefined,
      subject,
      text,
      html,
    });
    if (error) throw error;
  } catch (err) {
    const logLabel = categorizeSendError(err);
    // eslint-disable-next-line no-console
    console.error(`[enquiry] ${logLabel}:`, err?.name || "", err?.message || err);
    return { sent: false };
  }

  return { sent: true };
}
