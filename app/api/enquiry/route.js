import { sendEnquiryEmail } from "@/lib/email/enquiry-email";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";
import { createAnonClient } from "@/lib/supabase/anon";
import { createAdminClient } from "@/lib/supabase/admin";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map();

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

  const supabase = createAnonClient();
  const { data: enquiry, error: enquiryError } = await supabase
    .rpc("submit_enquiry", {
      p_name: name,
      p_phone: phone,
      p_email: email || null,
      p_departure_city: departureCity || null,
      p_travel_date: travelDate || null,
      p_persons: persons ? Number(persons) : null,
      p_package_interested: packageInterested || null,
      p_message: message || null,
      p_submitted_page: source || null,
    })
    .single();

  if (enquiryError) {
    // eslint-disable-next-line no-console
    console.error("[enquiry] failed to persist lead:", enquiryError.message);
    return Response.json(
      { ok: false, error: "We couldn't submit your enquiry right now. Please try WhatsApp instead." },
      { status: 502 }
    );
  }

  // The lead is safely in the CRM regardless of what happens next, so a failed
  // notification email no longer fails the request — it's only a best-effort ping.
  await sendEnquiryEmail({
    enquiryNumber: enquiry.enquiry_number,
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

  // Same best-effort contract as the email above — WhatsApp uses the service-role
  // admin client because this route has no staff session for RLS to key off.
  const adminClient = createAdminClient();

  // submit_enquiry() only returns (enquiry_number, lead_id) — customer_id isn't part of
  // its return shape — but whatsapp_messages.customer_id is NOT NULL, so it has to be
  // looked up here rather than left out of the sendWhatsAppMessage() call below.
  const { data: leadRow } = await adminClient.from("leads").select("customer_id").eq("id", enquiry.lead_id).maybeSingle();

  await sendWhatsAppMessage({
    supabase: adminClient,
    leadId: enquiry.lead_id,
    customerId: leadRow?.customer_id,
    toPhone: phone,
    purpose: "enquiry_confirmation",
    messageType: "enquiry_confirmation",
    params: [name, enquiry.enquiry_number],
  });

  return Response.json({ ok: true, enquiryNumber: enquiry.enquiry_number });
}
