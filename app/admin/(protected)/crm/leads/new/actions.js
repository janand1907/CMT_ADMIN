"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createLead(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name) return { error: "Customer name is required." };
  if (!phone) return { error: "Phone number is required." };

  const supabase = createClient();

  const { data: customerId, error: customerError } = await supabase.rpc("find_or_create_customer", {
    p_name: name,
    p_phone: phone,
    p_whatsapp: formData.get("whatsapp") || null,
    p_email: formData.get("email") || null,
    p_location: formData.get("location") || null,
  });

  if (customerError) return { error: customerError.message };

  const { data: enquiryNumber, error: idError } = await supabase.rpc("generate_business_id", {
    p_prefix: "CMT",
    p_entity_key: "enquiry",
  });

  if (idError) return { error: idError.message };

  const adults = Number(formData.get("adults")) || 0;
  const kids = Number(formData.get("kids")) || 0;
  const infants = Number(formData.get("infants")) || 0;
  const budget = formData.get("budget") ? Number(formData.get("budget")) : null;
  const assignedTo = formData.get("assignedTo") || null;
  const sourceId = formData.get("sourceId") || null;

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      enquiry_number: enquiryNumber,
      customer_id: customerId,
      destination: formData.get("destination") || null,
      departure_city: formData.get("departureCity") || null,
      travel_date: formData.get("travelDate") || null,
      return_date: formData.get("returnDate") || null,
      adults,
      kids,
      infants,
      package_interested: formData.get("packageInterested") || null,
      budget,
      message: formData.get("message") || null,
      source_id: sourceId,
      assigned_to: assignedTo,
      priority: formData.get("priority") || "medium",
    })
    .select("id")
    .single();

  if (leadError) return { error: leadError.message };

  redirect(`/admin/crm/leads/${lead.id}`);
}
