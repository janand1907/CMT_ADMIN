import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp/provider";

export const dynamic = "force-dynamic";

const STATUS_TIMESTAMP_FIELD = {
  sent: "sent_at",
  delivered: "delivered_at",
  read: "read_at",
  failed: "failed_at",
};

// Substring match on a trimmed, lower-cased body — deliberately loose (WhatsApp
// customers type "stop", "Stop please", "unsubscribe me" etc.), covering master plan
// §6's "Customer requests stop" condition via whatsapp_consent_events(source='customer_reply').
const OPT_OUT_KEYWORDS = ["stop", "unsubscribe", "opt out", "optout"];

// Meta signs every webhook POST body with the app secret; this route writes through a
// service-role client that bypasses RLS, so an unverified request could forge delivery
// receipts or opt-out events — verifying this signature is not optional the way it
// might be on a lower-privileged endpoint.
function verifySignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(provided, "hex");
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

// Meta's one-time GET verification handshake when the webhook URL is registered/changed
// in the App Dashboard.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

async function handleStatus(supabase, status) {
  const update = { status: status.status };
  const field = STATUS_TIMESTAMP_FIELD[status.status];
  if (field) update[field] = new Date(Number(status.timestamp) * 1000).toISOString();
  if (status.status === "failed" && status.errors?.length) {
    update.error_message = status.errors.map((e) => e.title || e.message).filter(Boolean).join("; ");
  }

  const { error } = await supabase.from("whatsapp_messages").update(update).eq("provider_message_id", status.id);
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[webhook:whatsapp] status update failed:", error.message);
  }
}

async function handleInboundMessage(supabase, message) {
  const fromNumber = normalizeWhatsAppNumber(message.from);
  const bodyText = message.text?.body || "";

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .or(`whatsapp.eq.${fromNumber},phone.eq.${fromNumber}`)
    .maybeSingle();

  // A message from a number with no matching customer record can't satisfy
  // whatsapp_messages' not-null lead_id/customer_id — log and drop rather than guess.
  if (!customer) {
    // eslint-disable-next-line no-console
    console.warn("[webhook:whatsapp] inbound message from unrecognized number, skipping:", fromNumber);
    return;
  }

  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lead) return;

  const { error: insertError } = await supabase.from("whatsapp_messages").insert({
    lead_id: lead.id,
    customer_id: customer.id,
    message_type: "inbound",
    direction: "inbound",
    to_phone: fromNumber,
    body: bodyText,
    provider_message_id: message.id,
    status: "delivered",
    delivered_at: new Date(Number(message.timestamp) * 1000).toISOString(),
  });
  if (insertError) {
    // whatsapp_messages_provider_message_id_key makes this a duplicate delivery of an
    // already-processed inbound event (Meta retries webhooks) — expected and harmless,
    // not a real failure, so it's logged at info level rather than as an error.
    if (insertError.code === "23505") {
      // eslint-disable-next-line no-console
      console.info("[webhook:whatsapp] duplicate inbound message id, already recorded:", message.id);
    } else {
      // eslint-disable-next-line no-console
      console.error("[webhook:whatsapp] inbound message insert failed:", insertError.message);
    }
    return;
  }

  const normalized = bodyText.trim().toLowerCase();
  const isOptOut = OPT_OUT_KEYWORDS.some((kw) => normalized === kw || normalized.startsWith(`${kw} `));
  if (isOptOut) {
    const { error } = await supabase.rpc("apply_whatsapp_consent_event", {
      p_customer_id: customer.id,
      p_event_type: "opt_out",
      p_source: "customer_reply",
      p_note: `Customer replied "${bodyText}"`,
    });
    if (error) {
      // eslint-disable-next-line no-console
      console.error("[webhook:whatsapp] opt-out apply failed:", error.message);
    }
  }
}

export async function POST(request) {
  const rawBody = await request.text();
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) {
    // eslint-disable-next-line no-console
    console.error("[webhook:whatsapp] WHATSAPP_APP_SECRET is not configured — rejecting webhook.");
    return new Response("Not configured", { status: 500 });
  }
  if (!verifySignature(rawBody, request.headers.get("x-hub-signature-256"), appSecret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const supabase = createAdminClient();
  const changes = (payload.entry || []).flatMap((entry) => entry.changes || []);

  for (const change of changes) {
    const value = change.value || {};
    for (const status of value.statuses || []) {
      await handleStatus(supabase, status);
    }
    for (const message of value.messages || []) {
      await handleInboundMessage(supabase, message);
    }
  }

  // Always 200 once the signature checks out — a downstream DB error is logged above,
  // not surfaced to Meta, since a non-2xx here makes Meta retry and can eventually
  // get the webhook auto-disabled.
  return new Response("OK", { status: 200 });
}
