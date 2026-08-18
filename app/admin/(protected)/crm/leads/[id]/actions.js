"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function leadPath(leadId) {
  return `/admin/crm/leads/${leadId}`;
}

export async function updateLeadStatus(leadId, prevState, formData) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").update({ status: formData.get("status") }).eq("id", leadId);
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function updateLeadPriority(leadId, prevState, formData) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").update({ priority: formData.get("priority") }).eq("id", leadId);
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function assignLead(leadId, prevState, formData) {
  const supabase = createClient();
  const assignedTo = formData.get("assignedTo") || null;
  // enforce_lead_reassignment_trg raises its own readable exception for a
  // non-assign_leads holder trying to hand this lead to someone else — no
  // need to duplicate that permission check here.
  const { error } = await supabase.from("leads").update({ assigned_to: assignedTo }).eq("id", leadId);
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function addNote(leadId, prevState, formData) {
  const note = String(formData.get("note") || "").trim();
  if (!note) return { error: "Note cannot be empty." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("lead_notes").insert({ lead_id: leadId, author_id: user.id, note });
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function deleteNote(leadId, noteId) {
  const supabase = createClient();
  const { error } = await supabase.from("lead_notes").delete().eq("id", noteId);
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function toggleTag(leadId, tagId, assigned) {
  const supabase = createClient();
  const { error } = assigned
    ? await supabase.from("lead_tag_assignments").delete().eq("lead_id", leadId).eq("tag_id", tagId)
    : await supabase.from("lead_tag_assignments").insert({ lead_id: leadId, tag_id: tagId });
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function addFollowup(leadId, prevState, formData) {
  const scheduledAt = formData.get("scheduledAt");
  if (!scheduledAt) return { error: "Scheduled date/time is required." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("lead_followups").insert({
    lead_id: leadId,
    scheduled_at: new Date(scheduledAt).toISOString(),
    notes: formData.get("notes") || null,
    created_by: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function completeFollowup(leadId, followupId) {
  const supabase = createClient();
  const { error } = await supabase
    .from("lead_followups")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", followupId);
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function addTask(leadId, prevState, formData) {
  const type = formData.get("type");
  if (!type) return { error: "Task type is required." };

  const dueAt = formData.get("dueAt");
  if (!dueAt) return { error: "Due date/time is required." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("lead_tasks").insert({
    lead_id: leadId,
    type,
    due_at: new Date(dueAt).toISOString(),
    assigned_to: formData.get("assignedTo") || null,
    priority: formData.get("priority") || "medium",
    notes: formData.get("notes") || null,
    created_by: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}

export async function updateTaskStatus(leadId, taskId, status) {
  const supabase = createClient();
  const { error } = await supabase.from("lead_tasks").update({ status }).eq("id", taskId);
  if (error) return { error: error.message };
  revalidatePath(leadPath(leadId));
  return { error: null };
}
