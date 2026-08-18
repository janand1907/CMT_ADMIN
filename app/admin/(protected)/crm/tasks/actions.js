"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateTaskStatusFromInbox(taskId, status) {
  const supabase = createClient();
  const { error } = await supabase.from("lead_tasks").update({ status }).eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath("/admin/crm/tasks");
  return { error: null };
}
