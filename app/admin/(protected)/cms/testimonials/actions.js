"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/admin/cms/testimonials";

export async function deleteTestimonial(testimonialId) {
  const supabase = createClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", testimonialId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { error: null };
}

export async function moveTestimonial(testimonialId, direction) {
  const supabase = createClient();
  const { data: rows, error: fetchError } = await supabase
    .from("testimonials")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (fetchError) return { error: fetchError.message };

  const index = rows.findIndex((r) => r.id === testimonialId);
  if (index === -1) return { error: "Testimonial not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= rows.length) return { error: null };

  const current = rows[index];
  const neighbor = rows[swapIndex];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabase.from("testimonials").update({ sort_order: neighbor.sort_order }).eq("id", current.id),
    supabase.from("testimonials").update({ sort_order: current.sort_order }).eq("id", neighbor.id),
  ]);
  if (e1 || e2) return { error: (e1 || e2).message };

  revalidatePath(PATH);
  return { error: null };
}
