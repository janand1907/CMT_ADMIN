"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendCampaignRecipients } from "@/lib/whatsapp/campaigns";

const PATH = "/admin/marketing/campaigns";

export async function createCampaign(formData) {
  const supabase = createClient();

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      name: formData.name,
      template_id: formData.template_id,
      lead_status_filter: formData.lead_status_filter,
      scheduled_at: formData.scheduled_at,
      status: formData.scheduled_at ? "draft" : "draft",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  // Select recipients
  await selectCampaignRecipients(supabase, campaign.id, formData.lead_status_filter);

  revalidatePath(PATH);
  return { success: true, campaignId: campaign.id };
}

async function selectCampaignRecipients(supabase, campaignId, leadStatusFilter) {
  // Build the eligible-leads query. If a lead_status_filter is provided, use it;
  // otherwise use the active automation rule's eligible statuses.
  let eligibleStatuses = leadStatusFilter
    ? leadStatusFilter.split(",").map((s) => s.trim()).filter(Boolean)
    : ["new", "contacted", "follow_up"];

  const { data: leads } = await supabase
    .from("leads")
    .select("id, customer_id")
    .in("status", eligibleStatuses);

  const rows = (leads || []).map((l) => ({
    campaign_id: campaignId,
    lead_id: l.id,
    customer_id: l.customer_id,
    status: "pending",
  }));

  if (rows.length > 0) {
    await supabase
      .from("campaign_recipients")
      .upsert(rows, { onConflict: "campaign_id,lead_id" });
  }

  await supabase
    .from("campaigns")
    .update({ total_recipients: rows.length })
    .eq("id", campaignId);
}

export async function sendCampaign(campaignId) {
  const supabase = createClient();
  const result = await sendCampaignRecipients(supabase, campaignId);
  revalidatePath(PATH);
  return result;
}

export async function deactivateCampaign(campaignId) {
  const supabase = createClient();
  const { error } = await supabase
    .from("campaigns")
    .update({ status: "failed" })
    .eq("id", campaignId);
  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { success: true };
}
