"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PATH = "/admin/cms/blog/categories";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createBlogCategory(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };
  const slug = slugify(name);

  const supabase = createClient();
  const { error } = await supabase.from("blog_categories").insert({ name, slug });
  if (error) {
    if (error.code === "23505") return { error: "A category with this name already exists." };
    return { error: error.message };
  }

  revalidatePath(PATH);
  return { error: null };
}

export async function deleteBlogCategory(categoryId) {
  const supabase = createClient();
  const { error } = await supabase.from("blog_categories").delete().eq("id", categoryId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { error: null };
}

export async function createBlogTag(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Name is required." };
  const slug = slugify(name);

  const supabase = createClient();
  const { error } = await supabase.from("blog_tags").insert({ name, slug });
  if (error) {
    if (error.code === "23505") return { error: "A tag with this name already exists." };
    return { error: error.message };
  }

  revalidatePath(PATH);
  return { error: null };
}

export async function deleteBlogTag(tagId) {
  const supabase = createClient();
  const { error } = await supabase.from("blog_tags").delete().eq("id", tagId);
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { error: null };
}
