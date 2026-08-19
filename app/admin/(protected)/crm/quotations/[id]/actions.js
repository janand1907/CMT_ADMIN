"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";
import { formatCurrency } from "@/lib/inventory/constants";
import { formatDateOnly } from "@/lib/crm/quotationConstants";

function quotationPath(quotationId) {
  return `/admin/crm/quotations/${quotationId}`;
}

export async function updateQuotationStatus(quotationId, prevState, formData) {
  const supabase = createClient();
  // enforce_quotation_status_transition_trg raises its own readable exception
  // for an invalid transition or a missing send_quotations grant — no need to
  // duplicate that check here.
  const { error } = await supabase.from("quotations").update({ status: formData.get("status") }).eq("id", quotationId);
  if (error) return { error: error.message };
  revalidatePath(quotationPath(quotationId));
  return { error: null };
}

export async function updateQuotationDetails(quotationId, prevState, formData) {
  const supabase = createClient();
  const discountAmount = formData.get("discountAmount");
  const { error } = await supabase
    .from("quotations")
    .update({
      valid_until: formData.get("validUntil") || null,
      notes: formData.get("notes") || null,
      terms_and_conditions: formData.get("termsAndConditions") || null,
      discount_amount: discountAmount === "" ? 0 : Number(discountAmount),
    })
    .eq("id", quotationId);
  if (error) return { error: error.message };
  revalidatePath(quotationPath(quotationId));
  return { error: null };
}

export async function createRevision(quotationId, prevState, formData) {
  const supabase = createClient();
  // create_quotation_revision() snapshots the current state into
  // quotation_revisions and reopens this same row as the next draft
  // version — see the Phase 3 migration for the full guard clauses.
  const { error } = await supabase.rpc("create_quotation_revision", {
    p_quotation_id: quotationId,
    p_change_note: formData.get("changeNote") || null,
  });
  if (error) return { error: error.message };
  revalidatePath(quotationPath(quotationId));
  return { error: null };
}

export async function addItem(quotationId, payload) {
  const supabase = createClient();
  const { error } = await supabase.from("quotation_items").insert({ quotation_id: quotationId, ...payload });
  if (error) return { error: error.message };
  revalidatePath(quotationPath(quotationId));
  return { error: null };
}

export async function updateItem(quotationId, itemId, payload) {
  const supabase = createClient();
  const { error } = await supabase.from("quotation_items").update(payload).eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath(quotationPath(quotationId));
  return { error: null };
}

export async function deleteItem(quotationId, itemId) {
  const supabase = createClient();
  const { error } = await supabase.from("quotation_items").delete().eq("id", itemId);
  if (error) return { error: error.message };
  revalidatePath(quotationPath(quotationId));
  return { error: null };
}

export async function addMessage(quotationId, prevState, formData) {
  const message = String(formData.get("message") || "").trim();
  if (!message) return { error: "Note cannot be empty." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("quotation_messages")
    .insert({ quotation_id: quotationId, channel: "note", message, created_by: user.id });
  if (error) return { error: error.message };
  revalidatePath(quotationPath(quotationId));
  return { error: null };
}

// send_quotations is enforced by whatsapp_messages_insert_scoped, not
// re-checked here — same reliance-on-RLS pattern as the rest of this file.
// Draft -> sent only happens on a successful provider send; a failed send
// leaves the quotation in draft/its current status so "sent" always means a
// message actually went out, and staff can just retry.
export async function sendQuotationWhatsApp(quotationId, prevState, formData) {
  const supabase = createClient();

  const { data: quotation, error: fetchError } = await supabase
    .from("quotations")
    .select("id, quotation_number, status, valid_until, total_amount, currency, lead_id, customer_id, customers(name, phone, whatsapp)")
    .eq("id", quotationId)
    .single();
  if (fetchError) return { error: fetchError.message };

  const { data: items } = await supabase
    .from("quotation_items")
    .select("package_name")
    .eq("quotation_id", quotationId)
    .order("sort_order");
  if (!items || items.length === 0) return { error: "Add at least one item before sending." };

  const toPhone = quotation.customers?.whatsapp || quotation.customers?.phone;
  if (!toPhone) return { error: "This customer has no phone/WhatsApp number on file." };

  const result = await sendWhatsAppMessage({
    supabase,
    leadId: quotation.lead_id,
    customerId: quotation.customer_id,
    toPhone,
    purpose: "quotation",
    messageType: "quotation",
    quotationId: quotation.id,
    params: [
      quotation.customers?.name || "there",
      quotation.quotation_number,
      items.map((i) => i.package_name).join(", "),
      formatCurrency(quotation.total_amount, quotation.currency),
      formatDateOnly(quotation.valid_until),
    ],
  });

  if (!result.success) return { error: result.error || "WhatsApp send failed." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("quotation_messages").insert({
    quotation_id: quotationId,
    channel: "whatsapp",
    message: `Quotation sent via WhatsApp to ${toPhone}.`,
    created_by: user.id,
  });

  if (quotation.status === "draft") {
    await supabase.from("quotations").update({ status: "sent" }).eq("id", quotationId);
  }

  revalidatePath(quotationPath(quotationId));
  return { error: null, sent: true };
}

export async function createBookingFromQuotation(quotationId, prevState, formData) {
  const travelStartDate = formData.get("travelStartDate");
  if (!travelStartDate) return { error: "Travel start date is required." };

  const supabase = createClient();
  // create_booking() re-checks status='accepted' and one-booking-per-quotation
  // itself (see the Phase 3.5 migration), so a stale page or double-submit
  // surfaces as a readable Postgres error rather than a duplicate booking.
  const { data: bookingId, error } = await supabase.rpc("create_booking", {
    p_quotation_id: quotationId,
    p_travel_start_date: travelStartDate,
    p_travel_end_date: formData.get("travelEndDate") || null,
    p_notes: formData.get("notes") || null,
  });
  if (error) return { error: error.message };
  revalidatePath(quotationPath(quotationId));
  redirect(`/admin/crm/bookings/${bookingId}`);
}
