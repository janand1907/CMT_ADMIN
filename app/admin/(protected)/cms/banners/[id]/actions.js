"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateBanner(bannerId, prevState, formData) {
  const startDate = formData.get("startDate") || null;
  const endDate = formData.get("endDate") || null;
  if (startDate && endDate && endDate < startDate) return { error: "End date must be on or after the start date." };

  const supabase = createClient();
  const { error } = await supabase
    .from("banners")
    .update({
      heading: formData.get("heading") || null,
      description: formData.get("description") || null,
      cta_text: formData.get("ctaText") || null,
      cta_link: formData.get("ctaLink") || null,
      image_media_id: formData.get("imageMediaId") || null,
      status: formData.get("status") || "inactive",
      start_date: startDate,
      end_date: endDate,
    })
    .eq("id", bannerId);
  if (error) return { error: error.message };

  revalidatePath(`/admin/cms/banners/${bannerId}`);
  revalidatePath("/admin/cms/banners");
  return { error: null, success: true };
}
