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

export async function createCategory(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };

  const slug = slugify(String(formData.get("slug") || "").trim() || name);
  if (!slug) return { error: "Slug is required." };

  const supabase = createClient();

  const { data, error } = await supabase
    .from("package_categories")
    .insert({
      name,
      slug,
      description: formData.get("description") || null,
      status: formData.get("status") || "active",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return { error: "A category with this slug already exists." };
    return { error: error.message };
  }

  redirect(`/admin/inventory/categories/${data.id}`);
}
