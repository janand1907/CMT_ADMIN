"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCustomer(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name) return { error: "Name is required." };
  if (!phone) return { error: "Phone number is required." };

  const supabase = createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      name,
      phone,
      whatsapp: formData.get("whatsapp") || phone,
      email: formData.get("email") || null,
      location: formData.get("location") || null,
      notes: formData.get("notes") || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A customer with this phone number already exists." };
    return { error: error.message };
  }

  redirect(`/admin/crm/customers/${customer.id}`);
}
