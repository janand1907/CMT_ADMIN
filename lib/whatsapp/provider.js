const DEFAULT_API_VERSION = "v21.0";
const REQUEST_TIMEOUT_MS = 15000;

function getConfig() {
  return {
    accessToken: process.env.WHATSAPP_CLOUD_API_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_API_VERSION || DEFAULT_API_VERSION,
  };
}

// India-biased normalization since ConnectMyTours' customer base is Indian; a bare
// 10-digit number is assumed local and gets the +91 country code prepended. Numbers
// that already carry a country code (11+ digits, or a leading 0 trunk prefix) are
// normalized without guessing further.
export function normalizeWhatsAppNumber(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

// Mirrors lib/email/enquiry-email.js's categorizeSendError so both providers behave
// the same way in server logs, without leaking the access token or raw response body
// anywhere a caller might display it.
function categorizeError(status, body) {
  const apiMessage = body?.error?.message;
  if (status === 401 || status === 403) return apiMessage ? `authentication failed: ${apiMessage}` : "authentication failed";
  if (status === 429) return "rate limited";
  if (apiMessage) return apiMessage;
  return `send failed (HTTP ${status})`;
}

// Low-level Cloud API call — sends one WhatsApp Business template message. Templates
// are the only supported message type because the Cloud API rejects free-form
// business-initiated messages outside a customer's 24-hour session window; every
// automated send in this codebase (confirmation, quotation, follow-up, campaign) goes
// through an approved template, per master plan §6.
//
// Never throws — returns { success: true, providerMessageId } only on a confirmed
// provider accept (a real message id in the response), or { success: false, error }
// for every other outcome, including a 2xx response with no message id. Every caller
// inserts a whatsapp_messages row reflecting this outcome directly — see lib/whatsapp/send.js.
export async function sendWhatsAppTemplate({ to, templateName, languageCode = "en", bodyParams = [] }) {
  const { accessToken, phoneNumberId, apiVersion } = getConfig();

  if (!accessToken || !phoneNumberId) {
    return { success: false, error: "WhatsApp is not configured (missing WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID)." };
  }

  const toNumber = normalizeWhatsAppNumber(to);
  if (!toNumber) {
    return { success: false, error: "Recipient has no usable WhatsApp number." };
  }
  if (!templateName) {
    return { success: false, error: "No provider template name configured for this template." };
  }

  const payload = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(bodyParams.length > 0
        ? { components: [{ type: "body", parameters: bodyParams.map((value) => ({ type: "text", text: String(value ?? "") })) }] }
        : {}),
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  let body;
  try {
    response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    body = await response.json().catch(() => ({}));
  } catch (err) {
    const reason = err?.name === "AbortError" ? "request timed out" : err?.message || "network error";
    // eslint-disable-next-line no-console
    console.error("[whatsapp] provider request failed:", reason);
    return { success: false, error: `send failed: ${reason}` };
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const reason = categorizeError(response.status, body);
    // eslint-disable-next-line no-console
    console.error("[whatsapp] provider rejected send:", reason);
    return { success: false, error: reason };
  }

  const providerMessageId = body?.messages?.[0]?.id;
  if (!providerMessageId) {
    return { success: false, error: "Provider returned success without a message id." };
  }

  return { success: true, providerMessageId };
}
