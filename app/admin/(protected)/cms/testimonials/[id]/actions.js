"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateTestimonial(testimonialId, prevState, formData) {
  const customerName = String(formData.get("customerName") || "").trim();
  const review = String(formData.get("review") || "").trim();
  if (!customerName) return { error: "Customer name is required." };
  if (!review) return { error: "Review is required." };

  const rating = formData.get("rating") ? Number(formData.get("rating")) : null;
  if (rating !== null && (rating < 1 || rating > 5)) return { error: "Rating must be between 1 and 5." };

  const supabase = createClient();
  const { error } = await supabase
    .from("testimonials")
    .update({
      customer_name: customerName,
      review,
      rating,
      image_media_id: formData.get("imageMediaId") || null,
      status: formData.get("status") || "active",
    })
    .eq("id", testimonialId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/cms/testimonials/${testimonialId}`);
  revalidatePath("/admin/cms/testimonials");
  return { error: null, success: true };
}
