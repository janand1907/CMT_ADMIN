"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createQuotation(prevState, formData) {
  const leadId = formData.get("leadId");
  if (!leadId) return { error: "A lead is required." };

  let items;
  try {
    items = JSON.parse(formData.get("items") || "[]");
  } catch {
    return { error: "Invalid item data." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one package to the quotation." };
  }

  const supabase = createClient();

  // create_quotation() is atomic (quotation + all items in one transaction) —
  // see supabase/migrations/20260818090000_phase3_quotations.sql — so there's
  // no partial-quotation state to clean up here on failure.
  const { data: quotationId, error } = await supabase.rpc("create_quotation", {
    p_lead_id: leadId,
    p_valid_until: formData.get("validUntil") || null,
    p_notes: formData.get("notes") || null,
    p_terms_and_conditions: formData.get("termsAndConditions") || null,
    p_discount_amount: Number(formData.get("discountAmount")) || 0,
    p_items: items,
  });

  if (error) return { error: error.message };

  redirect(`/admin/crm/quotations/${quotationId}`);
}
