import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map();

// Sensible defaults so only SMTP_USER / SMTP_PASS are required to go live.
const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 587;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

function isValidPhone(phone) {
  return /^\d{7,15}$/.test(String(phone).replace(/[\s()-]/g, "").replace(/^\+/, ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(body) {
  const errors = [];
  if (!body.name || !String(body.name).trim()) errors.push("name is required");
  if (!body.phone || !isValidPhone(body.phone)) errors.push("a valid phone number is required");
  if (body.email && !isValidEmail(String(body.email))) errors.push("email is invalid");
  return errors;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || DEFAULT_SMTP_PORT);
  const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : port === 465;
  return { host, port, secure };
}

// Classifies a nodemailer failure into a safe, user-facing category without
// leaking host/credential details from err.message or err.response.
function categorizeSendError(err) {
  if (err.code === "EAUTH") {
    return {
      status: 502,
      logLabel: "authentication failed",
      error: "We couldn't authenticate with the mail server. Please try WhatsApp instead.",
    };
  }
  if (["ECONNECTION", "ETIMEDOUT", "ESOCKET", "EDNS", "ECONNREFUSED"].includes(err.code)) {
    return {
      status: 502,
      logLabel: "SMTP connection failed",
      error: "We couldn't connect to the mail server. Please try WhatsApp instead.",
    };
  }
  return {
    status: 502,
    logLabel: "send failed",
    error: "We couldn't send your enquiry right now. Please try WhatsApp instead.",
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])
  );
}

function buildEmail({ name, phone, email, departureCity, travelDate, persons, packageInterested, message, source, ip, userAgent }) {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows = [
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

export async function POST(request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return Response.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: real users never see or fill this field, so a non-empty value means a bot.
  // Report fake success so bots don't adapt and retry.
  if (body.website) {
    return Response.json({ ok: true });
  }

  const errors = validate(body);
  if (errors.length > 0) {
    return Response.json({ ok: false, error: errors.join(", ") }, { status: 400 });
  }

  const { name, phone, email, departureCity, travelDate, persons, packageInterested, message, source } = body;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // eslint-disable-next-line no-console
    console.error("[enquiry] email configuration missing — set SMTP_USER and SMTP_PASS in .env.local");
    return Response.json(
      { ok: false, error: "Email service is not configured yet. Please reach us on WhatsApp instead." },
      { status: 503 }
    );
  }

  const { host, port, secure } = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const { subject, text, html } = buildEmail({
    name,
    phone,
    email,
    departureCity,
    travelDate,
    persons,
    packageInterested,
    message,
    source,
    ip,
    userAgent: request.headers.get("user-agent") || "",
  });

  try {
    await transporter.sendMail({
      from: `"Connect My Tours Website" <${process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO || siteConfig.enquiryRecipientEmail,
      replyTo: email || undefined,
      subject,
      text,
      html,
    });
  } catch (err) {
    const { status, logLabel, error } = categorizeSendError(err);
    // eslint-disable-next-line no-console
    console.error(`[enquiry] ${logLabel}:`, err.code || "", err.message);
    return Response.json({ ok: false, error }, { status });
  }

  return Response.json({ ok: true, message: "Email sent successfully" });
}
