import { sendWhatsAppMessage } from "@/lib/whatsapp/send";

// Shared campaign send loop — used by the staff-triggered "Send" action
// (app/admin/(protected)/marketing/campaigns/actions.js, authenticated per-request
// client) and by the cron route's scheduled-campaign sweep (service-role client). Takes
// the client as an argument for the same reason sendWhatsAppMessage does: the right
// client differs by call site, this function has no opinion on which one is correct.
//
// Never marks a campaign "completed" unless every recipient actually succeeded — a
// partial failure is reported as `partially_failed`, a total failure as `failed`, so
// campaign status always reflects what the provider actually did.
export async function sendCampaignRecipients(supabase, campaignId) {
  const { data: campaign, error: fetchError } = await supabase
    .from("campaigns")
    .select("*, templates:template_id(id, name, provider_template_name, body_text, language)")
    .eq("id", campaignId)
    .single();
  if (fetchError) return { error: fetchError.message };

  if (!["draft", "partially_failed"].includes(campaign.status)) {
    return { error: `Campaign is already ${campaign.status}.` };
  }

  await supabase
    .from("campaigns")
    .update({ status: "sending", sent_at: new Date().toISOString() })
    .eq("id", campaignId);

  const { data: recipients } = await supabase
    .from("campaign_recipients")
    .select("*, leads(destination, package_interested), customers(name, phone, whatsapp)")
    .eq("campaign_id", campaignId)
    .eq("status", "pending");

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients || []) {
    if (recipient.customers?.whatsapp_opt_out) {
      await supabase
        .from("campaign_recipients")
        .update({ status: "skipped", skip_reason: "customer_opted_out" })
        .eq("id", recipient.id);
      continue;
    }

    const toPhone = recipient.customers?.whatsapp || recipient.customers?.phone;
    if (!toPhone) {
      await supabase
        .from("campaign_recipients")
        .update({ status: "skipped", skip_reason: "no_phone_number" })
        .eq("id", recipient.id);
      continue;
    }

    const lead = recipient.leads;
    const packageName = lead?.package_interested || null;
    const destination = lead?.destination || "";
    const customerName = recipient.customers?.name || "there";

    const bodyParams = [customerName, packageName || destination].filter(Boolean);

    const result = await sendWhatsAppMessage({
      supabase,
      leadId: recipient.lead_id,
      customerId: recipient.customer_id,
      toPhone,
      purpose: "campaign",
      messageType: "campaign",
      campaignId,
      params: bodyParams,
    });

    if (result.success) {
      sent += 1;
      await supabase
        .from("campaign_recipients")
        .update({ status: "sent", whatsapp_message_id: result.messageId })
        .eq("id", recipient.id);
    } else {
      failed += 1;
      await supabase
        .from("campaign_recipients")
        .update({ status: "failed", error_message: result.error })
        .eq("id", recipient.id);
    }
  }

  const finalStatus = failed > 0 && sent > 0 ? "partially_failed" : failed > 0 && sent === 0 ? "failed" : "completed";

  await supabase
    .from("campaigns")
    .update({
      status: finalStatus,
      sent_count: sent,
      failed_count: failed,
      completed_at: new Date().toISOString(),
    })
    .eq("id", campaignId);

  return { success: true, sent, failed };
}
