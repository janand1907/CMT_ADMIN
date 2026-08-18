"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function completeFollowupFromInbox(followupId) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lead_followups")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", followupId);
  if (error) return { error: error.message };
  revalidatePath("/admin/crm/followups");
  return { error: null };
}
