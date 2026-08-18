"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const TAG_COLORS = ["gray", "blue", "indigo", "purple", "amber", "green", "red", "primary"];

export async function createTag(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Tag name is required." };

  const color = TAG_COLORS.includes(formData.get("color")) ? formData.get("color") : "gray";

  const supabase = createClient();
  const { error } = await supabase.from("lead_tags").insert({ name, color });

  if (error) {
    if (error.code === "23505") return { error: "A tag with this name already exists." };
    return { error: error.message };
  }

  revalidatePath("/admin/crm/tags");
  return { error: null };
}

export async function deleteTag(tagId) {
  const supabase = createClient();
  const { error } = await supabase.from("lead_tags").delete().eq("id", tagId);
  if (error) return { error: error.message };
  revalidatePath("/admin/crm/tags");
  return { error: null };
}

export async function createSource(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Source name is required." };

  const supabase = createClient();
  const { error } = await supabase.from("lead_sources").insert({ name });

  if (error) {
    if (error.code === "23505") return { error: "A source with this name already exists." };
    return { error: error.message };
  }

  revalidatePath("/admin/crm/tags");
  return { error: null };
}

export async function deleteSource(sourceId) {
  const supabase = createClient();
  const { error } = await supabase.from("lead_sources").delete().eq("id", sourceId);
  if (error) return { error: error.message };
  revalidatePath("/admin/crm/tags");
  return { error: null };
}
