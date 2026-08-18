"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPackage(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const slug = slugify(String(formData.get("slug") || "").trim() || name);
  if (!slug) return { error: "Slug is required." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const durationDaysRaw = formData.get("durationDays");
  const durationNightsRaw = formData.get("durationNights");

  const { data, error } = await supabase
    .from("packages")
    .insert({
      name,
      slug,
      destination_id: formData.get("destinationId") || null,
      category_id: formData.get("categoryId") || null,
      package_type: formData.get("packageType") || null,
      duration_days: durationDaysRaw ? parseInt(durationDaysRaw, 10) : null,
      duration_nights: durationNightsRaw ? parseInt(durationNightsRaw, 10) : null,
      short_description: formData.get("shortDescription") || null,
      status: formData.get("status") || "inactive",
      created_by: user?.id || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A package with this slug already exists." };
    return { error: error.message };
  }

  redirect(`/admin/inventory/packages/${data.id}`);
}
