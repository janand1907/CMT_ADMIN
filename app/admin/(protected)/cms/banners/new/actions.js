"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createBanner(prevState, formData) {
  const startDate = formData.get("startDate") || null;
  const endDate = formData.get("endDate") || null;
  if (startDate && endDate && endDate < startDate) return { error: "End date must be on or after the start date." };

  const supabase = createClient();

  const { data: last } = await supabase.from("banners").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();

  const { data: banner, error } = await supabase
    .from("banners")
    .insert({
      heading: formData.get("heading") || null,
      description: formData.get("description") || null,
      cta_text: formData.get("ctaText") || null,
      cta_link: formData.get("ctaLink") || null,
      image_media_id: formData.get("imageMediaId") || null,
      status: formData.get("status") || "inactive",
      start_date: startDate,
      end_date: endDate,
      sort_order: (last?.sort_order ?? -1) + 1,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  redirect(`/admin/cms/banners/${banner.id}`);
}
