import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";
import { sendCampaignRecipients } from "@/lib/whatsapp/campaigns";
import { logServerError } from "@/lib/logging/logServerError";

export const dynamic = "force-dynamic";

// Same timing-safe comparison as the WhatsApp webhook's signature check
// (app/api/webhooks/whatsapp/route.js) — a plain !== leaks how many leading
// bytes matched via response-time differences; low practical risk over HTTPS
// for a bearer token, but there's no reason for this route to be the one
// inconsistent comparison in the codebase.
function isValidCronSecret(provided, expected) {
  if (!expected || !provided) return false;
  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(provided);
  if (expectedBuf.length !== providedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

// Hostinger Cron hits this route on a fixed schedule (see the crontab line documented
// on /admin/settings/whatsapp — every 15 minutes) rather than at the exact
// admin-configured morning/evening time, so "is a slot due right now" is decided here
// by bucketing the current Asia/Kolkata clock and automation_rules.morning_time/
// evening_time into the same SLOT_WINDOW_MINUTES window — that's what lets
// Automation Controls' configurable times actually govern behavior without needing a
// per-time-of-day crontab entry. get_eligible_followup_leads()/claim_followup_send()
// have no notion of time-of-day themselves; they only guard against sending the same
// lead twice in one slot on one day, however many times this route fires inside that
// window.
const SLOT_WINDOW_MINUTES = 15;

function parseTimeToMinutes(value) {
  const [h, m] = String(value).split(":").map(Number);
  return h * 60 + m;
}

function currentIstMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour").value);
  const minute = Number(parts.find((p) => p.type === "minute").value);
  return hour * 60 + minute;
}

function slotIsDue(ruleTime, nowMinutes) {
  const ruleMinutes = parseTimeToMinutes(ruleTime);
  return Math.floor(ruleMinutes / SLOT_WINDOW_MINUTES) === Math.floor(nowMinutes / SLOT_WINDOW_MINUTES);
}

// followup_morning params: [Customer Name, Destination, Package Name].
// followup_evening params: [Customer Name, Package Name, Destination] — the two
// seeded templates use a different param order for the same values, so this can't be
// deduped into one params array; get it wrong and the wrong word lands in the wrong
// blank of an already-approved Meta template.
function buildParams(slot, customerName, destination, packageName) {
  const name = customerName || "there";
  const dest = destination || "your destination";
  const pkg = packageName || "our packages";
  return slot === "morning" ? [name, dest, pkg] : [name, pkg, dest];
}

async function bestPackageName(supabase, leadId, fallback) {
  const { data: matches } = await supabase.rpc("match_packages_for_lead", { p_lead_id: leadId });
  return matches?.[0]?.name || fallback || null;
}

async function runSlot(supabase, slot) {
  const purpose = slot === "morning" ? "followup_morning" : "followup_evening";
  const { data: leads, error } = await supabase.rpc("get_eligible_followup_leads", { p_slot: slot });

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`[cron:whatsapp-followup] get_eligible_followup_leads(${slot}) failed:`, error.message);
    await logServerError("cron", error, { stage: "get_eligible_followup_leads", slot });
    return { slot, attempted: 0, sent: 0, failed: 0, error: error.message };
  }

  let sent = 0;
  let failed = 0;

  for (const lead of leads || []) {
    // Claim-then-send: only send if the claim succeeds, so a provider failure after a
    // successful claim is simply one fewer message this lead ever gets, never a
    // duplicate — see claim_followup_send()'s own comment in the Phase 4 migration.
    const { data: claimed, error: claimError } = await supabase.rpc("claim_followup_send", {
      p_lead_id: lead.lead_id,
      p_slot: slot,
    });
    if (claimError || !claimed) continue;

    const { data: customer } = await supabase
      .from("customers")
      .select("name, phone, whatsapp")
      .eq("id", lead.customer_id)
      .maybeSingle();
    const toPhone = customer?.whatsapp || customer?.phone;
    if (!toPhone) {
      failed += 1;
      continue;
    }

    const packageName = await bestPackageName(supabase, lead.lead_id, lead.package_interested);

    const result = await sendWhatsAppMessage({
      supabase,
      leadId: lead.lead_id,
      customerId: lead.customer_id,
      toPhone,
      purpose,
      messageType: purpose,
      params: buildParams(slot, customer?.name, lead.destination, packageName),
    });

    if (result.success) sent += 1;
    else failed += 1;
  }

  return { slot, attempted: (leads || []).length, sent, failed };
}

// Scheduled campaigns are a separate concern from the morning/evening follow-up engine
// above — a campaign's own `scheduled_at` governs it, not automation_rules.status — so
// this runs on every cron hit regardless of whether follow-up automation is
// active/paused. Only ever picks up `draft` campaigns whose schedule has arrived; a
// campaign with no `scheduled_at` is unaffected and still requires a manual "Send".
async function runScheduledCampaigns(supabase) {
  const { data: dueCampaigns, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("status", "draft")
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", new Date().toISOString());

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[cron:whatsapp-followup] scheduled campaign lookup failed:", error.message);
    await logServerError("cron", error, { stage: "scheduled_campaign_lookup" });
    return [];
  }

  const results = [];
  for (const campaign of dueCampaigns || []) {
    const result = await sendCampaignRecipients(supabase, campaign.id);
    results.push({ campaignId: campaign.id, ...result });
  }
  return results;
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!isValidCronSecret(providedSecret, process.env.CRON_SECRET)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Service-role client — this route has no staff session for RLS to key off, same
  // reasoning as the public enquiry route's WhatsApp send.
  const supabase = createAdminClient();

  const campaignResults = await runScheduledCampaigns(supabase);

  const { data: rules } = await supabase
    .from("automation_rules")
    .select("status, morning_time, evening_time")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!rules || rules.status !== "active") {
    return Response.json({ ok: true, skipped: "automation not active", campaignResults });
  }

  const nowMinutes = currentIstMinutes();
  const results = [];
  if (slotIsDue(rules.morning_time, nowMinutes)) results.push(await runSlot(supabase, "morning"));
  if (slotIsDue(rules.evening_time, nowMinutes)) results.push(await runSlot(supabase, "evening"));

  return Response.json({ ok: true, results, campaignResults });
}
