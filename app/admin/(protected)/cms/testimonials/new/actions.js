"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createTestimonial(prevState, formData) {
  const customerName = String(formData.get("customerName") || "").trim();
  const review = String(formData.get("review") || "").trim();
  if (!customerName) return { error: "Customer name is required." };
  if (!review) return { error: "Review is required." };

  const rating = formData.get("rating") ? Number(formData.get("rating")) : null;
  if (rating !== null && (rating < 1 || rating > 5)) return { error: "Rating must be between 1 and 5." };

  const supabase = createClient();

  const { data: last } = await supabase
    .from("testimonials")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: testimonial, error } = await supabase
    .from("testimonials")
    .insert({
      customer_name: customerName,
      review,
      rating,
      image_media_id: formData.get("imageMediaId") || null,
      status: formData.get("status") || "active",
      sort_order: (last?.sort_order ?? -1) + 1,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  redirect(`/admin/cms/testimonials/${testimonial.id}`);
}
