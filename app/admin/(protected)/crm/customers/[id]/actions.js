"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateCustomer(customerId, prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!name) return { error: "Name is required." };
  if (!phone) return { error: "Phone number is required." };

  const supabase = createClient();

  const { error } = await supabase
    .from("customers")
    .update({
      name,
      phone,
      whatsapp: formData.get("whatsapp") || phone,
      email: formData.get("email") || null,
      location: formData.get("location") || null,
      notes: formData.get("notes") || null,
    })
    .eq("id", customerId);

  if (error) {
    if (error.code === "23505") return { error: "A customer with this phone number already exists." };
    return { error: error.message };
  }

  revalidatePath(`/admin/crm/customers/${customerId}`);
  return { error: null, success: true };
}
