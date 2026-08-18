"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function updateDestination(destinationId, prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const slug = slugify(String(formData.get("slug") || "").trim() || name);
  if (!slug) return { error: "Slug is required." };

  const supabase = createClient();

  const { error } = await supabase
    .from("destinations")
    .update({
      name,
      slug,
      description: formData.get("description") || null,
      status: formData.get("status") || "active",
    })
    .eq("id", destinationId);

  if (error) {
    if (error.code === "23505") return { error: "A destination with this slug already exists." };
    return { error: error.message };
  }

  revalidatePath(`/admin/inventory/destinations/${destinationId}`);
  return { error: null };
}

export async function deleteDestination(destinationId) {
  const supabase = createClient();
  const { error } = await supabase.from("destinations").delete().eq("id", destinationId);
  if (error) return { error: error.message };
  revalidatePath("/admin/inventory/destinations");
  return { error: null };
}
