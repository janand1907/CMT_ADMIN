"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LEAD_STATUSES } from "@/lib/crm/constants";

const PATH = "/admin/marketing/automation";

export async function updateAutomationRules(ruleId, prevState, formData) {
  const supabase = createClient();

  const eligibleLeadStatuses = LEAD_STATUSES.filter((s) => formData.get(`eligible_${s}`) === "on");
  if (eligibleLeadStatuses.length === 0) {
    return { error: "Select at least one eligible lead status." };
  }

  const { error } = await supabase
    .from("automation_rules")
    .update({
      status: formData.get("status"),
      morning_time: formData.get("morningTime"),
      evening_time: formData.get("eveningTime"),
      followup_duration_days: Number(formData.get("followupDurationDays")),
      max_messages: Number(formData.get("maxMessages")),
      eligible_lead_statuses: eligibleLeadStatuses,
    })
    .eq("id", ruleId);

  if (error) return { error: error.message, success: false };
  revalidatePath(PATH);
  return { error: null, success: true };
}

// enforce_automation_state_transition_trg raises its own readable exception for an
// invalid transition (e.g. trying to resume a stopped lead) — not re-checked here, same
// reliance-on-DB-constraint pattern as quotations' updateQuotationStatus.
export async function setLeadAutomationStatus(stateId, prevState, formData) {
  const supabase = createClient();
  const nextStatus = formData.get("status");

  const payload = { status: nextStatus };
  if (nextStatus === "stopped") payload.stop_reason = "admin_manual";

  const { error } = await supabase.from("lead_followup_automation_state").update(payload).eq("id", stateId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { error: null };
}
